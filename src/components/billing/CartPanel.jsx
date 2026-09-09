export default function CartPanel({
  cart,
  onQtyChange,
  onRemove,
  discount,
  onDiscountChange,
  onCheckout,
  checkingOut,
}) {
  const subtotal = cart.reduce((sum, l) => sum + l.unit_price * l.qty, 0);
  const total = Math.max(subtotal - (Number(discount) || 0), 0);

  return (
    <div className="cart-panel">
      <div className="cart-header">
        <h3>Current bill</h3>
      </div>

      <div className="cart-lines">
        {cart.length === 0 && <div className="cart-empty">Tap an item on the left to add it here.</div>}
        {cart.map((line) => (
          <div className="cart-line" key={line.item_id}>
            <div className="cart-line-name">
              <div className="n">{line.name}</div>
              <div className="p">Rs. {line.unit_price.toFixed(2)} / {line.unit}</div>
            </div>
            <div className="qty-control">
              <button type="button" onClick={() => onQtyChange(line.item_id, line.qty - 1)}>
                −
              </button>
              <input
                value={line.qty}
                onChange={(e) => onQtyChange(line.item_id, Number(e.target.value) || 0)}
              />
              <button type="button" onClick={() => onQtyChange(line.item_id, line.qty + 1)}>
                +
              </button>
            </div>
            <div className="cart-line-total">Rs. {(line.unit_price * line.qty).toFixed(2)}</div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ padding: "2px 6px" }}
              onClick={() => onRemove(line.item_id)}
              aria-label={`Remove ${line.name}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>Rs. {subtotal.toFixed(2)}</span>
        </div>
        <div className="field" style={{ marginBottom: 8 }}>
          <label>Discount (Rs.)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={discount}
            onChange={(e) => onDiscountChange(e.target.value)}
          />
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>
        <button
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
          disabled={cart.length === 0 || checkingOut}
          onClick={onCheckout}
        >
          {checkingOut ? "Completing sale…" : "Complete sale"}
        </button>
      </div>
    </div>
  );
}
