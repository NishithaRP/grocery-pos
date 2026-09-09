import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./config";
import { getBillsInRange } from "./bills";

// Uses LOCAL calendar date (not UTC) so "today" means today in the shop's
// own time zone. toISOString() converts to UTC first, which silently shifts
// the date back a day for time zones ahead of UTC (like Sri Lanka, UTC+5:30)
// whenever the key is built from a local midnight Date object - that was
// causing Reports to look up the wrong day's summary.
function toDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Reads the pre-aggregated daily_summaries/{date} doc that the
// onBillCreated Cloud Function maintains - one read instead of scanning bills.
export async function getDailySummary(date = new Date()) {
  const key = toDateKey(date);
  const snap = await getDoc(doc(db, "daily_summaries", key));
  return snap.exists()
    ? { date: key, ...snap.data() }
    : { date: key, total_sales: 0, total_cost: 0, bill_count: 0 };
}

// For a longer range, just fetch the relevant daily_summaries docs by id.
export async function getSummaryRange(startDate, endDate) {
  const days = [];
  const cursor = new Date(startDate);
  while (cursor < endDate) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  const summaries = await Promise.all(days.map((d) => getDailySummary(d)));
  return summaries;
}

// Item-wise sales for a given day - aggregated client-side from bill_items.
// Fine at small-shop volume; move to a maintained item_sales doc if volume grows.
export async function getItemSalesForDay(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const bills = await getBillsInRange(start, end);
  const totals = {};

  for (const bill of bills) {
    const linesSnap = await getDocs(collection(db, `bills/${bill.id}/bill_items`));
    linesSnap.docs.forEach((d) => {
      const line = d.data();
      if (!totals[line.item_id]) {
        totals[line.item_id] = { item_name: line.item_name, qty: 0, revenue: 0, cost: 0 };
      }
      totals[line.item_id].qty += line.qty;
      totals[line.item_id].revenue += line.subtotal;
      totals[line.item_id].cost += (line.cost_price_at_sale || 0) * line.qty;
    });
  }

  return Object.entries(totals)
    .map(([item_id, v]) => ({ item_id, ...v, profit: v.revenue - v.cost }))
    .sort((a, b) => b.revenue - a.revenue);
}

export async function getLowStockItems() {
  const snap = await getDocs(collection(db, "items"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((item) => item.stock_qty <= (item.low_stock_threshold ?? 5));
}
