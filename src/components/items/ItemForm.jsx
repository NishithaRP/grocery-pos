import { useState } from "react";

const UNITS = ["kg", "g", "L", "ml", "pc"];

export default function ItemForm({ initial, categories = [], onSave, onClose }) {
  const [form, setForm] = useState(
    initial || {
      name: "",
      category: "",
      unit: "kg",
      cost_price: "",
      selling_price: "",
      stock_qty: "",
      low_stock_threshold: "5",
    }
  );
  const [saving, setSaving] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{initial ? "Edit item" : "Add item"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Item name</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Basmati Rice"
              required
              autoFocus
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Category</label>
              <input
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="e.g. Grains"
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="field">
              <label>Unit</label>
              <select value={form.unit} onChange={(e) => set("unit", e.target.value)}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Cost price (Rs.)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.cost_price}
                onChange={(e) => set("cost_price", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Selling price (Rs.)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.selling_price}
                onChange={(e) => set("selling_price", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Stock quantity</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.stock_qty}
                onChange={(e) => set("stock_qty", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Low stock alert below</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.low_stock_threshold}
                onChange={(e) => set("low_stock_threshold", e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : initial ? "Save changes" : "Add item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
