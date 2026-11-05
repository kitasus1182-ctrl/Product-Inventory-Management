export default function ProductTable({ products, onStock, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th><th>SKU</th><th>Category</th><th>Price</th>
            <th>Stock</th><th>Min</th><th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const low = p.stock < p.min_stock;
            return (
              <tr key={p.id} className={low ? 'low' : ''}>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.category}</td>
                <td>{p.price.toFixed(2)}</td>
                <td>{p.stock}{low && ' (low)'}</td>
                <td>{p.min_stock}</td>
                <td className="actions">
                  <button onClick={() => onStock(p)}>Stock</button>
                  <button onClick={() => onEdit(p)}>Edit</button>
                  <button onClick={() => onDelete(p)}>Delete</button>
                </td>
              </tr>
            );
          })}
          {!products.length && (
            <tr><td colSpan="7">No products found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}