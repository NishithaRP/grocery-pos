import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  increment,
} from "firebase/firestore";
import { db } from "./config";

const billsCol = collection(db, "bills");

// LOCAL calendar date, matching the same logic in reports.js - keeps the
// write-side key and read-side key always in agreement regardless of time zone.
function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// cartItems: [{ item_id, name, unit_price, qty, unit }]
// Everything - the bill, its line items, the stock decrement on each item,
// and today's rolled-up sales summary - is written in ONE atomic batch.
// (This replaces the Cloud Function approach, since that needs the paid
// Blaze plan. The trade-off: two people billing the exact same instant
// could theoretically race on stock counts - fine for single-user use,
// worth revisiting if this grows into a multi-cashier setup.)
export async function createBill(cartItems, meta = {}) {
  const total = cartItems.reduce((sum, l) => sum + l.unit_price * l.qty, 0);
  const discount = Number(meta.discount) || 0;
  const finalTotal = total - discount;

  const batch = writeBatch(db);

  const billRef = doc(billsCol);
  batch.set(billRef, {
    bill_number: `B-${Date.now()}`,
    date: serverTimestamp(),
    customer_name: meta.customer_name || "",
    payment_method: meta.payment_method || "cash",
    discount,
    total: finalTotal,
    created_by: meta.created_by || "unknown",
  });

  cartItems.forEach((line) => {
    const lineRef = doc(collection(db, `bills/${billRef.id}/bill_items`));
    batch.set(lineRef, {
      item_id: line.item_id,
      item_name: line.name,
      unit: line.unit || "",
      qty: line.qty,
      unit_price_at_sale: line.unit_price,
      subtotal: line.unit_price * line.qty,
    });

    const itemRef = doc(db, "items", line.item_id);
    batch.update(itemRef, { stock_qty: increment(-line.qty) });
  });

  const summaryRef = doc(db, "daily_summaries", todayKey());
  batch.set(
    summaryRef,
    {
      total_sales: increment(finalTotal),
      bill_count: increment(1),
      updated_at: serverTimestamp(),
    },
    { merge: true }
  );

  await batch.commit();
  return billRef.id;
}

export async function getBillWithItems(billId) {
  const billSnap = await getDoc(doc(db, "bills", billId));
  if (!billSnap.exists()) return null;
  const linesSnap = await getDocs(collection(db, `bills/${billId}/bill_items`));
  return {
    id: billSnap.id,
    ...billSnap.data(),
    lines: linesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
  };
}

// startDate / endDate: JS Date objects (inclusive start, exclusive end)
export async function getBillsInRange(startDate, endDate) {
  const q = query(
    billsCol,
    where("date", ">=", startDate),
    where("date", "<", endDate),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
