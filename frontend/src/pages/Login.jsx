import { useState, useContext } from "react";
import { AuthContext } from "../AuthProvider";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt } from "react-icons/fa";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Login successful!");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Welcome Back 👋
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email Field */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-gray-500" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-10 p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 outline-none"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-500" />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 outline-none"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div
              className="absolute right-3 top-3 text-gray-500 cursor-pointer"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow transition font-medium ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            <FaSignInAlt />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Bottom Links */}
        <div className="mt-4 text-center text-sm">
          <Link
            to="/signup"
            className="text-blue-600 hover:underline mr-4"
          >
            Create Account
          </Link>

          <Link
            to="/reset"
            className="text-gray-600 hover:text-gray-800 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}
