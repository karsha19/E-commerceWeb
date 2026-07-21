const pool = require('../config/db');
const { sendOrderConfirmationEmail } = require('../utils/sendEmail');
const generateInvoicePDF = require('../utils/generateInvoice');


exports.placeOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      shipping_name, shipping_phone, shipping_address, shipping_city,
      shipping_state, shipping_pincode, coupon_code
    } = req.body;

    if (!shipping_name || !shipping_phone || !shipping_address || !shipping_city || !shipping_pincode) {
      conn.release();
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }

    await conn.beginTransaction();


    let couponDiscountPercent = 0;
    if (coupon_code) {
      const [couponRows] = await conn.query(
        'SELECT * FROM coupons WHERE code = ? AND active = TRUE',
        [coupon_code.toUpperCase()]
      );
      if (couponRows.length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ message: 'Invalid or inactive coupon code' });
      }
      const coupon = couponRows[0];
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ message: 'This coupon has expired' });
      }
      couponDiscountPercent = Number(coupon.discount_percent);
    }

    const [cartItems] = await conn.query(
      `SELECT c.product_id, c.quantity, p.price, p.discount, p.stock, p.name
       FROM cart c JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ? FOR UPDATE`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ message: `Insufficient stock for "${item.name}"` });
      }
    }

    let subtotal = 0;
    for (const item of cartItems) {
      const effectivePrice = item.price - (item.price * (item.discount || 0)) / 100;
      subtotal += effectivePrice * item.quantity;
    }
    const total = Number((subtotal - (subtotal * couponDiscountPercent) / 100).toFixed(2));

    const [orderResult] = await conn.query(
      `INSERT INTO orders
        (user_id, total, status, payment_method, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode)
       VALUES (?, ?, 'pending', 'cod', ?, ?, ?, ?, ?, ?)`,
      [req.user.id, total, shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state || null, shipping_pincode]
    );
    const orderId = orderResult.insertId;

    const emailItems = [];
    for (const item of cartItems) {
      const effectivePrice = Number((item.price - (item.price * (item.discount || 0)) / 100).toFixed(2));
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, effectivePrice]
      );
      await conn.query(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
      emailItems.push({ name: item.name, quantity: item.quantity, price: effectivePrice });
    }

    await conn.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

    const [[userRow]] = await conn.query('SELECT name, email FROM users WHERE id = ?', [req.user.id]);

    await conn.commit();
    conn.release();

    
    sendOrderConfirmationEmail({
      to: userRow.email,
      name: userRow.name,
      orderId,
      total,
      items: emailItems
    }).catch(err => console.error('Order confirmation email failed:', err.message));

    res.status(201).json({ message: 'Order placed successfully', order_id: orderId, total });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error(err);
    res.status(500).json({ message: 'Server error placing order' });
  }
};


exports.downloadInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    const [items] = await pool.query(
      `SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`,
      [id]
    );

    generateInvoicePDF(order, items, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating invoice' });
  }
};


exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.image
       FROM order_items oi JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    res.json({ ...order, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};


exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('o.status = ?');
      params.push(status);
    }
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(Math.max(parseInt(limit), 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o JOIN users u ON o.user_id = u.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM orders o ${whereClause}`, params
    );

    res.json({ orders, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};


exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating order status' });
  }
};


exports.getSalesAnalytics = async (req, res) => {
  try {
    const [[totals]] = await pool.query(
      `SELECT COUNT(*) AS total_orders, COALESCE(SUM(total), 0) AS total_revenue
       FROM orders WHERE status != 'cancelled'`
    );

    const [byStatus] = await pool.query(
      `SELECT status, COUNT(*) AS count FROM orders GROUP BY status`
    );

    const [dailySales] = await pool.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue
       FROM orders
       WHERE status != 'cancelled' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    const [topProducts] = await pool.query(
      `SELECT p.id, p.name, SUM(oi.quantity) AS units_sold, SUM(oi.quantity * oi.price) AS revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status != 'cancelled'
       GROUP BY p.id, p.name
       ORDER BY units_sold DESC
       LIMIT 5`
    );

    res.json({ totals, byStatus, dailySales, topProducts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};
