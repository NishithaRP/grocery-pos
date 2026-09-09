export default function LowStockReport({ items }) {
  if (items.length === 0) {
    return <div className="empty-state">Nothing is low on stock right now.</div>;
  }

  return (
    <div className="panel" style={{ overflow: "hidden" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Item</th>
            <th className="num">In stock</th>
            <th className="num">Threshold</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td className="num">
                {item.stock_qty} {item.unit} <span className="tag-low">low</span>
              </td>
              <td className="num">{item.low_stock_threshold}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
