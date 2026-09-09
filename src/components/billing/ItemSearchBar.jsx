import { useMemo, useState } from "react";

export default function ItemSearchBar({ items, onAdd }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div>
      <input
        className="search-input"
        placeholder="Search items to add…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus
      />
      <div className="item-grid">
        {filtered.map((item) => {
          const outOfStock = item.stock_qty <= 0;
          return (
            <button
              key={item.id}
              className="item-card"
              disabled={outOfStock}
              onClick={() => onAdd(item)}
              style={outOfStock ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
            >
              <span className="item-card-name">{item.name}</span>
              <span className="item-card-meta">
                {outOfStock ? (
                  "Out of stock"
                ) : (
                  <span className={item.stock_qty <= (item.low_stock_threshold ?? 5) ? "item-card-stock-low" : ""}>
                    {item.stock_qty} {item.unit} left
                  </span>
                )}
              </span>
              <span className="item-card-price">Rs. {Number(item.selling_price).toFixed(2)}</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
            No items match “{search}”.
          </div>
        )}
      </div>
    </div>
  );
}
