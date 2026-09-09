import { useEffect, useState } from "react";
import ItemSearchBar from "../components/billing/ItemSearchBar";
import CartPanel from "../components/billing/CartPanel";
import BillReceipt from "../components/billing/BillReceipt";
import Loader from "../components/shared/Loader";
import { getItems } from "../firebase/items";
import { createBill, getBillWithItems } from "../firebase/bills";

export default function BillingPage() {
  const [items, setItems] = useState(null);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [checkingOut, setCheckingOut] = useState(false);
  const [completedBill, setCompletedBill] = useState(null);

  useEffect(() => {
    getItems().then(setItems);
  }, []);

  function addToCart(item) {
    setCart((prev) => {
      const existing = prev.find((l) => l.item_id === item.id);
      if (existing) {
        if (existing.qty >= item.stock_qty) return prev; // already at max available stock
        return prev.map((l) => (l.item_id === item.id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [
        ...prev,
        {
          item_id: item.id,
          name: item.name,
          unit: item.unit,
          unit_price: item.selling_price,
          qty: 1,
          max_qty: item.stock_qty,
        },
      ];
    });
  }

  function changeQty(itemId, qty) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((l) => l.item_id !== itemId));
      return;
    }
    setCart((prev) =>
      prev.map((l) =>
        l.item_id === itemId ? { ...l, qty: Math.min(qty, l.max_qty) } : l
      )
    );
  }

  function removeLine(itemId) {
    setCart((prev) => prev.filter((l) => l.item_id !== itemId));
  }

  async function handleCheckout() {
    setCheckingOut(true);
    try {
      const billId = await createBill(cart, { discount });
      const fullBill = await getBillWithItems(billId);
      setCompletedBill(fullBill);
      setCart([]);
      setDiscount(0);
    } catch (err) {
      alert("Couldn't complete the sale — please try again.\n" + err.message);
    } finally {
      setCheckingOut(false);
    }
  }

  if (completedBill) {
    return (
      <>
        <div className="topbar no-print">
          <div>
            <h1>Bill complete</h1>
            <div className="topbar-sub">Bill No. {completedBill.bill_number}</div>
          </div>
          <button className="btn" onClick={() => setCompletedBill(null)}>
            Start new bill
          </button>
        </div>
        <div className="content">
          <BillReceipt bill={completedBill} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>New bill</h1>
          <div className="topbar-sub">Add items and complete the sale</div>
        </div>
      </div>
      <div className="content">
        {items === null ? (
          <Loader label="Loading items…" />
        ) : (
          <div className="billing-layout">
            <ItemSearchBar items={items} onAdd={addToCart} />
            <CartPanel
              cart={cart}
              onQtyChange={changeQty}
              onRemove={removeLine}
              discount={discount}
              onDiscountChange={setDiscount}
              onCheckout={handleCheckout}
              checkingOut={checkingOut}
            />
          </div>
        )}
      </div>
    </>
  );
}
