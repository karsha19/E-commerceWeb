const pool = require('../config/db');

//admin only 
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};


exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['customer', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Role must be 'customer' or 'admin'" });
    }
    if (Number(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating user role' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (Number(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};
