import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";

const billsCol = collection(db, "bills");

// cartItems: [{ item_id, name, unit_price, qty }]
// Stock decrement + daily summary update happen server-side via the
// onBillCreated Cloud Function - the client only writes the bill itself.
export async function createBill(cartItems, meta = {}) {
  const total = cartItems.reduce((sum, l) => sum + l.unit_price * l.qty, 0);
  const discount = Number(meta.discount) || 0;

  const billRef = await addDoc(billsCol, {
    bill_number: `B-${Date.now()}`,
    date: serverTimestamp(),
    customer_name: meta.customer_name || "",
    payment_method: meta.payment_method || "cash",
    discount,
    total: total - discount,
    created_by: meta.created_by || "unknown",
  });

  const batch = writeBatch(db);
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
  });
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
