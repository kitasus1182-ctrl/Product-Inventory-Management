import { useState } from 'react';
import ProductsPage from './pages/ProductsPage.jsx';
import MovementsPage from './pages/MovementsPage.jsx';

export default function App() {
  const [tab, setTab] = useState('products');

  return (
    <div className="app">
      <h1>Inventory Manager</h1>

      <nav>
        <button className={tab === 'products' ? 'on' : ''} onClick={() => setTab('products')}>
          Products
        </button>
        <button className={tab === 'history' ? 'on' : ''} onClick={() => setTab('history')}>
          Stock history
        </button>
      </nav>

      {tab === 'products' ? <ProductsPage /> : <MovementsPage />}
    </div>
  );
}