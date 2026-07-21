const pool = require('../config/db');

// @route GET /api/cart   
exports.getCart = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id AS cart_id, c.quantity, p.id AS product_id, p.name, p.price,
              p.discount, p.image, p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.user.id]
    );

    let subtotal = 0;
    const items = rows.map(item => {
      const effectivePrice = item.price - (item.price * (item.discount || 0)) / 100;
      const lineTotal = effectivePrice * item.quantity;
      subtotal += lineTotal;
      return { ...item, effective_price: Number(effectivePrice.toFixed(2)), line_total: Number(lineTotal.toFixed(2)) };
    });

    res.json({ items, subtotal: Number(subtotal.toFixed(2)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
};

// @route POST /api/cart
exports.addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return res.status(400).json({ message: 'product_id is required' });

    const [[product]] = await pool.query('SELECT stock FROM products WHERE id = ?', [product_id]);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Not enough stock available' });

    await pool.query(
      `INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, product_id, quantity]
    );

    res.status(201).json({ message: 'Item added to cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
};

// @route PUT /api/cart/:productId   
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const [[product]] = await pool.query('SELECT stock FROM products WHERE id = ?', [productId]);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Not enough stock available' });

    const [result] = await pool.query(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, req.user.id, productId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Cart item updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating cart item' });
  }
};

// @route DELETE /api/cart/:productId   
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const [result] = await pool.query(
      'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error removing cart item' });
  }
};

// @route DELETE /api/cart  
exports.clearCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error clearing cart' });
  }
};
