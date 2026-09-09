# Govi Mart — Grocery Shop POS (Foundation)

A React + Firebase foundation for a grocery shop system: manage items and
prices, bill customers, print receipts, and view daily sales / low-stock
reports. Built to be extended with user roles and permissions next.

## What's included

- **Items & Prices** — add/edit items, update prices (every price change is
  logged to a `price_history` subcollection so nothing is silently
  overwritten).
- **Billing** — a POS-style screen: search/tap items into a running cart,
  adjust quantities, apply a discount, complete the sale, print a receipt.
- **Reports** — today's total sales, bill count, item-wise sales breakdown,
  and a low-stock list. Pick any past date to see that day's numbers.
- **Cloud Function** (`functions/index.js`) — the moment a bill is created,
  it atomically decrements stock and rolls the sale into a
  `daily_summaries/{date}` document, so reports are a single read instead of
  scanning every bill. This also means two cashiers billing at the same time
  can't corrupt stock counts.
- **Firestore security rules** (`firestore.rules`) — a starting point: any
  signed-in user can read/write for now; the comments mark exactly where to
  tighten things once you add roles.

## Setup

1. **Create a Firebase project** at https://console.firebase.google.com,
   enable **Firestore** and **Authentication** (Email/Password is enough to
   start).
2. Copy your web app config into `src/firebase/config.js` (replace the
   `YOUR_...` placeholders — find these under Project Settings → Your apps).
3. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```
4. Deploy the Cloud Function (requires the Firebase CLI):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init functions   # point it at the functions/ folder, choose your project
   firebase deploy --only functions
   ```
5. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Data model

```
items/{itemId}
  name, category, unit, cost_price, selling_price,
  stock_qty, low_stock_threshold, updated_at

items/{itemId}/price_history/{entryId}
  old_price, new_price, changed_at

bills/{billId}
  bill_number, date, customer_name, discount, total,
  payment_method, created_by

bills/{billId}/bill_items/{lineId}
  item_id, item_name, unit, qty, unit_price_at_sale, subtotal

daily_summaries/{date}        (maintained by the Cloud Function)
  total_sales, bill_count, updated_at
```

Prices and item names are **snapshotted onto each bill line at sale time** —
a bill never changes even if you later edit the item's price or rename it.

## Next steps (when you're ready for roles)

- Add a `users/{uid}` doc with a `role` field ("admin" | "cashier").
- Set that role as a **custom claim** on the Firebase Auth user (via a small
  Cloud Function) so it's available in security rules as
  `request.auth.token.role`.
- Tighten `firestore.rules`: item writes → `admin` only; bill creation → any
  authenticated cashier; reports → both.
- Add `created_by` (already on bills) to per-cashier sales reports.
- Gate sidebar links / buttons in the UI based on the signed-in user's role
  (cosmetic only — the real enforcement is in the rules above).

No schema changes are needed for this — it's purely an access-control layer
on top of what's already here.
