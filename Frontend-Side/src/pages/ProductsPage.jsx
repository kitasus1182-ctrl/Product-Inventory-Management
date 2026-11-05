import { useEffect, useState } from 'react';
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  changeStock,
} from '../services/api.js';
import ProductForm from '../components/ProductForm.jsx';
import StockForm from '../components/StockForm.jsx';
import ProductTable from '../components/ProductTable.jsx';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState(null);   // null = closed, {} = new, product = edit
  const [stockFor, setStockFor] = useState(null); // product getting a stock change
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const [p, c] = await Promise.all([getProducts(search, category), getCategories()]);
      setProducts(p.products);
      setCategories(c.categories);
      // selected category may have disappeared (e.g. its last product was deleted)
      if (category && !c.categories.includes(category)) setCategory('');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => { load(); }, [search, category]);

  // run an action, show its message, then refresh the list
  const run = async (action, closeForms = true) => {
    setError('');
    setSuccess('');
    try {
      const data = await action();
      setSuccess(data.message);
      if (closeForms) { setEditing(null); setStockFor(null); }
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveProduct = (values) =>
    run(() => (editing.id ? updateProduct(editing.id, values) : createProduct(values)));

  const handleStock = (values) => run(() => changeStock(stockFor.id, values));

  const handleDelete = (product) => {
    if (confirm(`Delete "${product.name}"? Its stock history will be deleted too.`)) {
      run(() => deleteProduct(product.id));
    }
  };

  const openNew = () => { setStockFor(null); setEditing({}); };
  const openEdit = (product) => { setStockFor(null); setEditing(product); };
  const openStock = (product) => { setEditing(null); setStockFor(product); };

  return (
    <>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      <div className="bar">
        <input
          placeholder="Search name or SKU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="primary" onClick={openNew}>Add product</button>
      </div>

      {editing && (
        <ProductForm
          key={editing.id || 'new'}
          initial={editing}
          onSubmit={handleSaveProduct}
          onCancel={() => setEditing(null)}
        />
      )}

      {stockFor && (
        <StockForm
          key={stockFor.id}
          product={stockFor}
          onSubmit={handleStock}
          onCancel={() => setStockFor(null)}
        />
      )}

      <ProductTable
        products={products}
        onStock={openStock}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
    </>
  );
}