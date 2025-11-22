import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PasswordReset from "./pages/PasswordReset";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Receipts from "./pages/Receipts";
import Delivery from "./pages/Delivery";
import Transfer from "./pages/Transfer";
import Adjustment from "./pages/Adjustment";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Warehouses from "./pages/Warehouses";
import OperationDetail from "./pages/OperationDetail";
import "./App.css";
import AIChat from "./pages/AIChat";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      {!user ? (
        // 🔹 Auth Pages: No Sidebar
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset" element={<PasswordReset />} />
        </Routes>
      ) : (
        // 🔹 Logged-in Pages: Sidebar + Content Wrapper
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar />

          {/* Content Area */}
          <div className="flex-grow p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/receipts" element={<Receipts />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/transfer" element={<Transfer />} />
              <Route path="/adjustment" element={<Adjustment />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/warehouses" element={<Warehouses />} />
              <Route path="/ai" element={<AIChat />} />
              <Route path="/operations/:id" element={<OperationDetail />} />
            </Routes>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
