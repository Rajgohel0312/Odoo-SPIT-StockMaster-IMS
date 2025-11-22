import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PasswordReset from "./pages/PasswordReset";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
function App() {
  const { user } = useContext(AuthContext);
  return (
    <>
      <BrowserRouter>
        {user && <Sidebar />}
        <Routes>
          {!user ? (
            <>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset" element={<PasswordReset />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
