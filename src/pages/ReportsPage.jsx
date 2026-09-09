import { useEffect, useState } from "react";
import DailySalesReport from "../components/reports/DailySalesReport";
import LowStockReport from "../components/reports/LowStockReport";
import Loader from "../components/shared/Loader";
import { getDailySummary, getItemSalesForDay, getLowStockItems } from "../firebase/reports";

function toInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ReportsPage() {
  const [dateStr, setDateStr] = useState(toInputValue(new Date()));
  const [summary, setSummary] = useState(null);
  const [itemSales, setItemSales] = useState(null);
  const [lowStock, setLowStock] = useState(null);

  useEffect(() => {
    const date = new Date(dateStr + "T00:00:00");
    setSummary(null);
    setItemSales(null);
    Promise.all([getDailySummary(date), getItemSalesForDay(date)]).then(([s, items]) => {
      setSummary(s);
      setItemSales(items);
    });
  }, [dateStr]);

  useEffect(() => {
    getLowStockItems().then(setLowStock);
  }, []);

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Reports</h1>
          <div className="topbar-sub">Sales performance and stock levels</div>
        </div>
        <input
          type="date"
          value={dateStr}
          max={toInputValue(new Date())}
          onChange={(e) => setDateStr(e.target.value)}
          style={{ padding: "8px 10px", border: "1px solid var(--border-strong)", borderRadius: "3px" }}
        />
      </div>

      <div className="content">
        {summary === null || itemSales === null ? (
          <Loader label="Loading report…" />
        ) : (
          <DailySalesReport summary={summary} itemSales={itemSales} />
        )}

        <div className="section-head" style={{ marginTop: 30 }}>
          <h3 style={{ fontSize: 15 }}>Low stock</h3>
        </div>
        {lowStock === null ? <Loader label="Checking stock…" /> : <LowStockReport items={lowStock} />}
      </div>
    </>
  );
}
