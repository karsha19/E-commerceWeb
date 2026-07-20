const pool = require('../config/db');

// @route GET /api/products
// Supports: ?search=&category=&brand=&minPrice=&maxPrice=&sort=price_asc|price_desc|rating|newest&page=&limit=
exports.getProducts = async (req, res) => {
  try {
    const {
      search, category, brand, minPrice, maxPrice,
      sort = 'newest', page = 1, limit = 12
    } = req.query;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      conditions.push('p.category_id = ?');
      params.push(category);
    }
    if (brand) {
      conditions.push('p.brand = ?');
      params.push(brand);
    }
    if (minPrice) {
      conditions.push('p.price >= ?');
      params.push(minPrice);
    }
    if (maxPrice) {
      conditions.push('p.price <= ?');
      params.push(maxPrice);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sortMap = {
      price_asc: 'p.price ASC',
      price_desc: 'p.price DESC',
      rating: 'p.rating DESC',
      newest: 'p.created_at DESC'
    };
    const orderClause = `ORDER BY ${sortMap[sort] || sortMap.newest}`;

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(Math.max(parseInt(limit), 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const dataQuery = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;
    const countQuery = `SELECT COUNT(*) AS total FROM products p ${whereClause}`;

    const [rows] = await pool.query(dataQuery, [...params, limitNum, offset]);
    const [countRows] = await pool.query(countQuery, params);
    const total = countRows[0].total;

    res.json({
      products: rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// @route GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching product' });
  }
};

// @route GET /api/products/:id/related
exports.getRelatedProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const [[product]] = await pool.query('SELECT category_id FROM products WHERE id = ?', [id]);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const [rows] = await pool.query(
      `SELECT * FROM products WHERE category_id = ? AND id != ? LIMIT 8`,
      [product.category_id, id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching related products' });
  }
};

// @route POST /api/products   (admin only)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, discount, brand, stock, category_id } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, discount, brand, stock, category_id, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, price, discount || 0, brand || null, stock || 0, category_id || null, image]
    );

    res.status(201).json({ message: 'Product created', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// @route PUT /api/products/:id   (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, discount, brand, stock, category_id } = req.body;

    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : existing[0].image;

    await pool.query(
      `UPDATE products SET name=?, description=?, price=?, discount=?, brand=?, stock=?, category_id=?, image=?
       WHERE id=?`,
      [
        name ?? existing[0].name,
        description ?? existing[0].description,
        price ?? existing[0].price,
        discount ?? existing[0].discount,
        brand ?? existing[0].brand,
        stock ?? existing[0].stock,
        category_id ?? existing[0].category_id,
        image,
        id
      ]
    );

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// @route DELETE /api/products/:id   (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};
