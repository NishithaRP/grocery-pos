export default function DailySalesReport({ summary, itemSales }) {
  const grossIncome = Number(summary.total_sales || 0) - Number(summary.total_cost || 0);

  return (
    <div>
      <div className="stat-grid">
        <div className="stat">
          <div className="stat-label">Total sales today</div>
          <div className="stat-value">Rs. {Number(summary.total_sales || 0).toFixed(2)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Gross income today</div>
          <div className="stat-value" style={{ color: grossIncome < 0 ? "var(--danger)" : undefined }}>
            Rs. {grossIncome.toFixed(2)}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Bills today</div>
          <div className="stat-value">{summary.bill_count || 0}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Avg. bill value</div>
          <div className="stat-value">
            Rs.{" "}
            {summary.bill_count
              ? (Number(summary.total_sales) / summary.bill_count).toFixed(2)
              : "0.00"}
          </div>
        </div>
      </div>

      <div className="section-head">
        <h3 style={{ fontSize: 15 }}>Item-wise sales today</h3>
      </div>

      {itemSales.length === 0 ? (
        <div className="empty-state">No sales recorded yet today.</div>
      ) : (
        <div className="panel" style={{ overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th className="num">Qty sold</th>
                <th className="num">Revenue</th>
                <th className="num">Profit</th>
              </tr>
            </thead>
            <tbody>
              {itemSales.map((row) => (
                <tr key={row.item_id}>
                  <td>{row.item_name}</td>
                  <td className="num">{row.qty}</td>
                  <td className="num">Rs. {row.revenue.toFixed(2)}</td>
                  <td className="num">Rs. {row.profit.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
