import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./config";

const itemsCol = collection(db, "items");

export async function getItems() {
  const snap = await getDocs(query(itemsCol, orderBy("name")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addItem(item) {
  return addDoc(itemsCol, {
    name: item.name,
    category: item.category || "",
    unit: item.unit,
    cost_price: Number(item.cost_price) || 0,
    selling_price: Number(item.selling_price) || 0,
    stock_qty: Number(item.stock_qty) || 0,
    low_stock_threshold: Number(item.low_stock_threshold) || 5,
    updated_at: serverTimestamp(),
  });
}

export async function updateItem(itemId, fields) {
  const itemRef = doc(db, "items", itemId);
  return updateDoc(itemRef, { ...fields, updated_at: serverTimestamp() });
}

// Updates selling price AND logs the change to price_history in one batch,
// so the two never fall out of sync.
export async function updateItemPrice(itemId, oldPrice, newPrice) {
  const batch = writeBatch(db);
  const itemRef = doc(db, "items", itemId);
  const historyRef = doc(collection(db, `items/${itemId}/price_history`));

  batch.update(itemRef, {
    selling_price: Number(newPrice),
    updated_at: serverTimestamp(),
  });
  batch.set(historyRef, {
    old_price: Number(oldPrice),
    new_price: Number(newPrice),
    changed_at: serverTimestamp(),
  });

  return batch.commit();
}

export async function deleteItem(itemId) {
  return deleteDoc(doc(db, "items", itemId));
}
