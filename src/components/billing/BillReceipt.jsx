export default function BillReceipt({ bill }) {
  if (!bill) return null;

  const dateStr = bill.date?.toDate
    ? bill.date.toDate().toLocaleString()
    : new Date().toLocaleString();

  return (
    <div>
      <div className="receipt" id="receipt-print-area">
        <div className="receipt-head">
          <h2>Govi Mart</h2>
          <p>{dateStr}</p>
          <p>Bill No. {bill.bill_number}</p>
          {bill.customer_name && <p>Customer: {bill.customer_name}</p>}
        </div>
        <hr />
        {bill.lines.map((line) => (
          <div className="receipt-line" key={line.id}>
            <span className="name">
              {line.item_name} × {line.qty}
            </span>
            <span>Rs. {line.subtotal.toFixed(2)}</span>
          </div>
        ))}
        <hr />
        {bill.discount > 0 && (
          <div className="receipt-line">
            <span className="name">Discount</span>
            <span>− Rs. {bill.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="receipt-line" style={{ fontWeight: 700, fontSize: "14px" }}>
          <span className="name">Total</span>
          <span>Rs. {bill.total.toFixed(2)}</span>
        </div>
        <hr />
        <p style={{ textAlign: "center", color: "var(--muted)" }}>Thank you — come again!</p>
      </div>

      <div className="no-print" style={{ textAlign: "center", marginTop: 14 }}>
        <button className="btn btn-primary" onClick={() => window.print()}>
          Print receipt
        </button>
      </div>
    </div>
  );
}
