import { useMemo, useState } from "react";

export default function ItemList({ items, onEdit, onEditPrice, onDelete }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) => i.name.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q)
    );
  }, [items, search]);

  if (items.length === 0) {
    return <div className="empty-state">No items yet — add your first item to get started.</div>;
  }

  return (
    <div>
      <input
        className="search-input"
        placeholder="Search items by name or category…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 14 }}
      />
      <div className="panel" style={{ overflow: "hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Unit</th>
              <th className="num">Cost</th>
              <th className="num">Price</th>
              <th className="num">Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const low = item.stock_qty <= (item.low_stock_threshold ?? 5);
              return (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.category || "—"}</td>
                  <td>{item.unit}</td>
                  <td className="num">Rs. {Number(item.cost_price).toFixed(2)}</td>
                  <td className="num">Rs. {Number(item.selling_price).toFixed(2)}</td>
                  <td className="num">
                    {item.stock_qty} {low && <span className="tag-low">low</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => onEditPrice(item)}>
                        Update price
                      </button>
                      <button className="btn btn-sm btn-ghost" onClick={() => onEdit(item)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => onDelete(item)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
