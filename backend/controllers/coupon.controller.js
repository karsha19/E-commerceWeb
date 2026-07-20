const pool = require('../config/db');

// @route GET /api/coupons   (admin only)
exports.getCoupons = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM coupons ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching coupons' });
  }
};

// @route POST /api/coupons   (admin only)  body: { code, discount_percent, expires_at }
exports.createCoupon = async (req, res) => {
  try {
    const { code, discount_percent, expires_at } = req.body;
    if (!code || !discount_percent) {
      return res.status(400).json({ message: 'code and discount_percent are required' });
    }
    if (discount_percent <= 0 || discount_percent > 100) {
      return res.status(400).json({ message: 'discount_percent must be between 1 and 100' });
    }

    const [result] = await pool.query(
      'INSERT INTO coupons (code, discount_percent, expires_at) VALUES (?, ?, ?)',
      [code.toUpperCase(), discount_percent, expires_at || null]
    );
    res.status(201).json({ message: 'Coupon created', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'A coupon with this code already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error creating coupon' });
  }
};

// @route PUT /api/coupons/:id   (admin only)
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { discount_percent, expires_at, active } = req.body;

    const [existing] = await pool.query('SELECT * FROM coupons WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Coupon not found' });

    await pool.query(
      'UPDATE coupons SET discount_percent = ?, expires_at = ?, active = ? WHERE id = ?',
      [
        discount_percent ?? existing[0].discount_percent,
        expires_at ?? existing[0].expires_at,
        active ?? existing[0].active,
        id
      ]
    );
    res.json({ message: 'Coupon updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating coupon' });
  }
};

// @route DELETE /api/coupons/:id   (admin only)
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting coupon' });
  }
};

// @route POST /api/coupons/validate   (protected, any logged-in user)  body: { code }
// Used at checkout to check a coupon before placing the order.
exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required' });

    const [rows] = await pool.query(
      'SELECT * FROM coupons WHERE code = ? AND active = TRUE',
      [code.toUpperCase()]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Invalid or inactive coupon code' });
    }

    const coupon = rows[0];
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ message: 'This coupon has expired' });
    }

    res.json({ code: coupon.code, discount_percent: Number(coupon.discount_percent) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error validating coupon' });
  }
};
