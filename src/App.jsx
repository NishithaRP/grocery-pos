import { HashRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/shared/Sidebar";
import Dashboard from "./pages/Dashboard";
import ItemsPage from "./pages/ItemsPage";
import BillingPage from "./pages/BillingPage";
import ReportsPage from "./pages/ReportsPage";

export default function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <Sidebar />
        <div className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}
