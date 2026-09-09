import { useState } from "react";
import { updateItemPrice } from "../../firebase/items";

export default function PriceEditModal({ item, onClose, onSaved }) {
  const [price, setPrice] = useState(item.selling_price);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (Number(price) === Number(item.selling_price)) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      await updateItemPrice(item.id, item.selling_price, price);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Update price — {item.name}</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Current price</label>
            <input value={`Rs. ${Number(item.selling_price).toFixed(2)}`} disabled />
          </div>
          <div className="field">
            <label>New selling price (Rs.)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Update price"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
