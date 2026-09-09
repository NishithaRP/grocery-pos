import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/shared/Loader";
import { getDailySummary, getLowStockItems } from "../firebase/reports";
import { getItems } from "../firebase/items";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [lowStock, setLowStock] = useState(null);
  const [itemCount, setItemCount] = useState(null);

  useEffect(() => {
    getDailySummary().then(setSummary);
    getLowStockItems().then(setLowStock);
    getItems().then((items) => setItemCount(items.length));
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Dashboard</h1>
          <div className="topbar-sub">Today at a glance</div>
        </div>
        <Link to="/billing" className="btn btn-primary">
          + New bill
        </Link>
      </div>

      <div className="content">
        {summary === null || lowStock === null || itemCount === null ? (
          <Loader />
        ) : (
          <div className="stat-grid">
            <div className="stat">
              <div className="stat-label">Sales today</div>
              <div className="stat-value">Rs. {Number(summary.total_sales || 0).toFixed(2)}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Bills today</div>
              <div className="stat-value">{summary.bill_count || 0}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Items in catalog</div>
              <div className="stat-value">{itemCount}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Low stock alerts</div>
              <div className="stat-value" style={lowStock.length > 0 ? { color: "var(--danger)" } : undefined}>
                {lowStock.length}
              </div>
            </div>
          </div>
        )}

        {lowStock && lowStock.length > 0 && (
          <div className="panel" style={{ padding: "14px 16px", marginTop: 4 }}>
            <strong style={{ fontSize: 13.5 }}>Running low: </strong>
            <span style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
              {lowStock.map((i) => i.name).join(", ")}
            </span>
            {" — "}
            <Link to="/items" style={{ fontSize: 13.5, color: "var(--primary)" }}>
              review items
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
