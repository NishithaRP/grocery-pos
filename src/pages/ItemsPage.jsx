import { useEffect, useState } from "react";
import ItemList from "../components/items/ItemList";
import ItemForm from "../components/items/ItemForm";
import PriceEditModal from "../components/items/PriceEditModal";
import Loader from "../components/shared/Loader";
import { getItems, addItem, updateItem, deleteItem } from "../firebase/items";

export default function ItemsPage() {
  const [items, setItems] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);

  async function refresh() {
    setItems(await getItems());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleDelete(item) {
    if (!confirm(`Delete "${item.name}"? This can't be undone.`)) return;
    await deleteItem(item.id);
    refresh();
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Items & Prices</h1>
          <div className="topbar-sub">Manage your item catalog and pricing</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add item
        </button>
      </div>

      <div className="content">
        {items === null ? (
          <Loader label="Loading items…" />
        ) : (
          <ItemList
            items={items}
            onEdit={setEditing}
            onEditPrice={setEditingPrice}
            onDelete={handleDelete}
          />
        )}
      </div>

      {showAdd && (
        <ItemForm
          onSave={async (data) => {
            await addItem(data);
            refresh();
          }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {editing && (
        <ItemForm
          initial={editing}
          onSave={async (data) => {
            await updateItem(editing.id, data);
            refresh();
          }}
          onClose={() => setEditing(null)}
        />
      )}

      {editingPrice && (
        <PriceEditModal item={editingPrice} onClose={() => setEditingPrice(null)} onSaved={refresh} />
      )}
    </>
  );
}
