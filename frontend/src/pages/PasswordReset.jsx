import { useState } from "react";
import api from "../api";
import { toast } from "react-toastify";
import {
  FaEnvelope,
  FaLock,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaUndo,
} from "react-icons/fa";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [timer, setTimer] = useState(0);

  const requestOTP = async () => {
    if (!email) return toast.warning("Please enter your email!");
    setLoading(true);
    try {
      await api.post("/otp/request-reset", { email });
      toast.success("OTP sent to your email.");
      setStep(2);

      // Start 30-sec timer to prevent repeated OTP requests
      setTimer(30);
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) clearInterval(countdown);
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      toast.error("Failed to send OTP. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!code || !newPass)
      return toast.warning("Enter OTP and new password.");
    setLoading(true);
    try {
      await api.post("/otp/reset-password", {
        email,
        code,
        newPassword: newPass,
      });
      toast.success("Password successfully updated!");
      window.location.href = "/";
    } catch (err) {
      toast.error("Invalid OTP or error updating password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Reset Password 🔐
        </h2>

        {step === 1 && (
          <div className="space-y-4">
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-3 text-gray-500" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-10 p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-blue-200 outline-none"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              onClick={requestOTP}
              disabled={loading || timer > 0}
              className={`w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow transition ${
                loading || timer > 0 ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Sending OTP..." : "Request OTP"}
            </button>

            {timer > 0 && (
              <p className="text-center text-gray-600 text-sm">
                You can request again in <b>{timer}s</b>
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="relative">
              <FaKey className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Enter OTP"
                className="w-full pl-10 p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-green-200 outline-none"
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div className="relative">
              <FaLock className="absolute left-3 top-3 text-gray-500" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="New Password"
                className="w-full pl-10 p-3 border rounded-lg bg-gray-50 focus:ring focus:ring-green-200 outline-none"
                onChange={(e) => setNewPass(e.target.value)}
              />
              <div
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>

            <button
              onClick={resetPassword}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg shadow transition ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        )}

        <div className="mt-4 text-center">
          <a href="/" className="text-blue-600 hover:underline flex items-center justify-center gap-1">
            <FaUndo /> Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
