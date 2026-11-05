import pool from '../config/db.js';

// POST /api/products/:id/stock   body: { type: 'add' | 'remove', quantity, reason }
export const changeStock = async (req, res, next) => {
    const { id } = req.params;
    const { type, quantity, reason } = req.body;
    const qty = Number(quantity);

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // lock the product row so two requests can't remove the same stock together
        const product = await client.query(
            'SELECT id FROM products WHERE id = $1 FOR UPDATE',
            [id]
        );

        if (product.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Product not found' });
        }

        const current = await client.query(
            'SELECT COALESCE(SUM(quantity), 0)::int AS stock FROM stock_movements WHERE product_id = $1',
            [id]
        );
        const currentStock = current.rows[0].stock;

        const change = type === 'remove' ? -qty : qty;

        if (currentStock + change < 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: `Only ${currentStock} in stock, cannot remove ${qty}`,
            });
        }

        const result = await client.query(
            `INSERT INTO stock_movements (product_id, quantity, reason)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [id, change, reason.trim()]
        );

        await client.query('COMMIT');

        return res.status(201).json({
            message: type === 'add' ? 'Stock added successfully' : 'Stock removed successfully',
            movement: result.rows[0],
            stock: currentStock + change,
        });
    } catch (err) {
        await client.query('ROLLBACK');
        return next(err);
    } finally {
        client.release();
    }
};

// GET /api/movements
export const getMovements = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT m.id, m.product_id, m.quantity, m.reason, m.created_at, p.name, p.sku
             FROM stock_movements m
             JOIN products p ON p.id = m.product_id
             ORDER BY m.created_at DESC, m.id DESC
             LIMIT 200`
        );

        return res.status(200).json({
            message: 'Stock movements fetched successfully',
            movements: result.rows,
        });
    } catch (err) {
        return next(err);
    }
};