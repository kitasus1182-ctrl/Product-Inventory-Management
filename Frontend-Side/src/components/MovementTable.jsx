export default function MovementTable({ movements }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Date</th><th>Product</th><th>SKU</th><th>Change</th><th>Reason</th></tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m.id}>
              <td>{new Date(m.created_at).toLocaleString()}</td>
              <td>{m.name}</td>
              <td>{m.sku}</td>
              <td className={m.quantity > 0 ? 'plus' : 'minus'}>
                {m.quantity > 0 ? '+' : ''}{m.quantity}
              </td>
              <td>{m.reason}</td>
            </tr>
          ))}
          {!movements.length && (
            <tr><td colSpan="5">No stock movements yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}