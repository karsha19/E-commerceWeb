const pool = require('../config/db');

// @route POST /api/recently-viewed/:productId   (protected) - call when a user opens a product page
exports.recordView = async (req, res) => {
  try {
    const { productId } = req.params;

    const [[product]] = await pool.query('SELECT id FROM products WHERE id = ?', [productId]);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await pool.query(
      'INSERT INTO recently_viewed (user_id, product_id) VALUES (?, ?)',
      [req.user.id, productId]
    );

    // Keep only the most recent 20 entries per user to avoid unbounded growth
    await pool.query(
      `DELETE FROM recently_viewed
       WHERE user_id = ? AND id NOT IN (
         SELECT id FROM (
           SELECT id FROM recently_viewed WHERE user_id = ? ORDER BY viewed_at DESC LIMIT 20
         ) AS keep_ids
       )`,
      [req.user.id, req.user.id]
    );

    res.status(201).json({ message: 'View recorded' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error recording view' });
  }
};

// @route GET /api/recently-viewed   (protected)
exports.getRecentlyViewed = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.price, p.discount, p.image, p.rating, rv.viewed_at
       FROM recently_viewed rv
       JOIN products p ON rv.product_id = p.id
       WHERE rv.user_id = ?
       ORDER BY rv.viewed_at DESC
       LIMIT 20`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching recently viewed products' });
  }
};
