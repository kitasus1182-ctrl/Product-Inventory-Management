import { useState } from 'react';

export default function StockForm({ product, onSubmit, onCancel }) {
  const [form, setForm] = useState({ type: 'add', quantity: '', reason: '' });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, quantity: Number(form.quantity) });
  };

  return (
    <form className="panel" onSubmit={submit}>
      <b>{product.name}</b> (in stock: {product.stock})
      <select value={form.type} onChange={set('type')}>
        <option value="add">Add stock</option>
        <option value="remove">Remove stock</option>
      </select>
      <input required type="number" min="1" placeholder="Quantity" value={form.quantity} onChange={set('quantity')} />
      <input required placeholder="Reason (e.g. Sold, Restock)" value={form.reason} onChange={set('reason')} />
      <button className="primary">Save</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}