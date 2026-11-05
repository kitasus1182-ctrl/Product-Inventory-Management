import { useState } from 'react';

// Used for both create and edit. `initial` is {} for a new product.
export default function ProductForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name ?? '',
    sku: initial.sku ?? '',
    category: initial.category ?? '',
    price: initial.price ?? '',
    min_stock: initial.min_stock ?? 0,
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, price: Number(form.price), min_stock: Number(form.min_stock) });
  };

  return (
    <form className="panel" onSubmit={submit}>
      <input required placeholder="Name" value={form.name} onChange={set('name')} />
      <input required placeholder="SKU" value={form.sku} onChange={set('sku')} />
      <input required placeholder="Category" value={form.category} onChange={set('category')} />
      <input required type="number" step="0.01" placeholder="Price" value={form.price} onChange={set('price')} />
      <input required type="number" min="0" placeholder="Min stock" value={form.min_stock} onChange={set('min_stock')} />
      <button className="primary">{initial.id ? 'Save changes' : 'Create product'}</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}