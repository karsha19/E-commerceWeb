const pool = require('../config/db');

async function refreshProductRating(conn, productId) {
  const [[{ avgRating }]] = await conn.query(
    'SELECT COALESCE(AVG(rating), 0) AS avgRating FROM reviews WHERE product_id = ?',
    [productId]
  );
  await conn.query('UPDATE products SET rating = ? WHERE id = ?', [Number(avgRating).toFixed(2), productId]);
}


exports.getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const [rows] = await pool.query(
      `SELECT r.*, u.name AS user_name
       FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
};

// @route POST /api/products/:productId/reviews   (protected)  body: { rating, comment }
// One review per user per product (enforced by unique key). Only allows reviewing
// products the user has actually received in a delivered order.
exports.addReview = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      conn.release();
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const [purchased] = await conn.query(
      `SELECT oi.id FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'
       LIMIT 1`,
      [req.user.id, productId]
    );
    if (purchased.length === 0) {
      conn.release();
      return res.status(403).json({ message: 'You can only review products from delivered orders' });
    }

    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`,
      [req.user.id, productId, rating, comment || null]
    );

    await refreshProductRating(conn, productId);

    await conn.commit();
    conn.release();
    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error(err);
    res.status(500).json({ message: 'Server error submitting review' });
  }
};

// @route DELETE /api/products/:productId/reviews/:reviewId   (protected - owner or admin)
exports.deleteReview = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { productId, reviewId } = req.params;

    const [[review]] = await conn.query('SELECT * FROM reviews WHERE id = ?', [reviewId]);
    if (!review) {
      conn.release();
      return res.status(404).json({ message: 'Review not found' });
    }
    if (review.user_id !== req.user.id && req.user.role !== 'admin') {
      conn.release();
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await conn.beginTransaction();
    await conn.query('DELETE FROM reviews WHERE id = ?', [reviewId]);
    await refreshProductRating(conn, productId);
    await conn.commit();
    conn.release();

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error(err);
    res.status(500).json({ message: 'Server error deleting review' });
  }
};
