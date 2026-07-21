const pool = require('../config/db');


exports.getWishlist = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT w.id AS wishlist_id, p.id AS product_id, p.name, p.price, p.discount, p.image, p.stock
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching wishlist' });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ message: 'product_id is required' });

    const [[product]] = await pool.query('SELECT id FROM products WHERE id = ?', [product_id]);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await pool.query(
      `INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE product_id = product_id`,
      [req.user.id, product_id]
    );

    res.status(201).json({ message: 'Item added to wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error adding to wishlist' });
  }
};


exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const [result] = await pool.query(
      'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
      [req.user.id, productId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }
    res.json({ message: 'Item removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error removing wishlist item' });
  }
};
