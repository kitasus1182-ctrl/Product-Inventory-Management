// AI GEERATED PORTION OF THE FILE.
import assert from 'node:assert/strict';
import test from 'node:test';
import pool from '../config/db.js';
import { createProduct, getCategories, getProducts } from './product.controller.js';
import { validateProduct } from '../middleware/validate.js';

const validProduct = {
    name: 'Widget',
    sku: 'WIDGET-1',
    category: 'Tools',
    price: 12.5,
    min_stock: 2,
};

const createResponse = () => ({
    statusCode: undefined,
    body: undefined,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(body) {
        this.body = body;
        return this;
    },
});

test('validation middleware rejects invalid product input without querying the database', async (t) => {
    const query = t.mock.method(pool, 'query');
    const response = createResponse();
    const next = t.mock.fn();

    validateProduct({ body: { ...validProduct, price: -1 } }, response, next);

    assert.equal(response.statusCode, 400);
    assert.equal(query.mock.callCount(), 0);
    assert.equal(next.mock.callCount(), 0);
});

test('creates a product with five matching SQL parameters', async (t) => {
    const createdProduct = { id: 1, ...validProduct };
    const query = t.mock.method(pool, 'query', async () => ({ rows: [createdProduct] }));
    const response = createResponse();

    await createProduct({ body: validProduct }, response, t.mock.fn());

    assert.equal(response.statusCode, 201);
    assert.deepEqual(response.body.product, createdProduct);
    assert.deepEqual(query.mock.calls[0].arguments[1], [
        validProduct.name,
        validProduct.sku,
        validProduct.category,
        validProduct.price,
        validProduct.min_stock,
    ]);
    assert.equal((query.mock.calls[0].arguments[0].match(/\$\d+/g) ?? []).length, 5);
});

test('returns conflict when a product violates a unique constraint', async (t) => {
    t.mock.method(pool, 'query', async () => {
        const error = new Error('duplicate key');
        error.code = '23505';
        throw error;
    });
    const response = createResponse();
    const next = t.mock.fn();

    await createProduct({ body: validProduct }, response, next);

    assert.equal(response.statusCode, 409);
    assert.equal(next.mock.callCount(), 0);
});

test('returns products in the response shape expected by the frontend', async (t) => {
    const products = [{ id: 1, ...validProduct, stock: 5 }];
    t.mock.method(pool, 'query', async () => ({ rows: products }));
    const response = createResponse();

    await getProducts({ query: { search: '', category: '' } }, response, t.mock.fn());

    assert.deepEqual(response.body.products, products);
});

test('returns categories in the response shape expected by the frontend', async (t) => {
    t.mock.method(pool, 'query', async () => ({ rows: [{ category: 'Tools' }] }));
    const response = createResponse();

    await getCategories({}, response, t.mock.fn());

    assert.deepEqual(response.body.categories, ['Tools']);
});
