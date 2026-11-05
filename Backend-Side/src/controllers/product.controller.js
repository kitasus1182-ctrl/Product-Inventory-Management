import pool from "../config/db.js";

//POST /api/products
export const createProduct = async (req, res, next) => {
  const body = req.body;

  const { name, sku, category, price, min_stock } = body;

  try {
    const result = await pool.query(
      "INSERT INTO products (name, sku, category, price, min_stock) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name.trim(), sku.trim(), category.trim(), price, min_stock],
    );

    return res.status(201).json({
      message: "Product created successfully",
      product: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        message: "A product with the provided unique value already exists",
      });
    }

    return next(err);
  }
};

//PUT /api/products/:id
export const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const { name, sku, category, price, min_stock } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products SET name = $1, sku = $2, category = $3, price = $4, min_stock = $5 WHERE id = $6 RETURNING *`,
      [name.trim(), sku.trim(), category.trim(), price, min_stock, id],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({
      message: "Product updated successfully",
      product: result.rows[0],
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        message: "A product with the provided unique value already exists",
      });
    }
    return next(err);
  }
};

//DELETE /api/products/:id
export const deleteProduct = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM products WHERE id = $1 RETURNING *`,
      [id],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
      product: result.rows[0],
    });
  } catch (err) {
    return next(err);
  }
};

//GET /api/products/categories

export const getCategories = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT category FROM products ORDER BY category`,
    );

    return res.status(200).json({
      message: "Products retrieved successfully",
      categories: result.rows.map((row) => row.category),
    });
  } catch (err) {
    return next(err);
  }
};

//GET /api/products?search

export const getProducts = async (req, res, next) => {
  try {
    const { search = "", category = "" } = req.query;
    const { rows } = await pool.query(
      `SELECT p.id, p.name, p.sku, p.category, p.price::float AS price, p.min_stock,
              COALESCE(SUM(m.quantity), 0)::int AS stock
       FROM products p
       LEFT JOIN stock_movements m ON m.product_id = p.id
       WHERE ($1 = '' OR p.name ILIKE '%' || $1 || '%'
                OR p.sku ILIKE '%' || $1 || '%'
                OR p.category ILIKE '%' || $1 || '%')
      AND ($2 = '' OR p.category = $2)
       GROUP BY p.id
       ORDER BY p.name`,
      [search, category],
    );
    res.json({
      message: "Products retrieved successfully",
      products: rows,
    });
  } catch (err) {
    next(err);
  }
};
