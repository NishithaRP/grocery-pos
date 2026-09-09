const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const admin = require("firebase-admin");

admin.initializeApp();
const db = getFirestore();

// Fires the moment a bill document is created from the client.
// The client NEVER writes to items.stock_qty or daily_summaries directly -
// this function does both atomically, so two simultaneous sales can't
// corrupt stock counts or sales totals.
exports.onBillCreated = onDocumentCreated("bills/{billId}", async (event) => {
  const billId = event.params.billId;
  const billItemsSnap = await db.collection(`bills/${billId}/bill_items`).get();

  if (billItemsSnap.empty) return;

  const today = new Date().toISOString().split("T")[0]; // e.g. "2026-09-09"
  const summaryRef = db.doc(`daily_summaries/${today}`);

  let dailyTotal = 0;
  const lineItems = billItemsSnap.docs.map((d) => d.data());
  lineItems.forEach((line) => {
    dailyTotal += line.subtotal;
  });

  await db.runTransaction(async (tx) => {
    // Decrement stock for every item in this bill
    for (const line of lineItems) {
      const itemRef = db.doc(`items/${line.item_id}`);
      tx.update(itemRef, { stock_qty: FieldValue.increment(-line.qty) });
    }

    // Roll the sale into today's summary doc (created on first sale of the day)
    tx.set(
      summaryRef,
      {
        total_sales: FieldValue.increment(dailyTotal),
        bill_count: FieldValue.increment(1),
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });
});
