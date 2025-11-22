import { useState } from "react";
import api from "../api";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPass, setNewPass] = useState("");
  const [step, setStep] = useState(1);

  const requestOTP = () => {
    api.post("/otp/request-reset", { email }).then(() => setStep(2));
  };

  const resetPass = () => {
    api.post("/otp/reset-password", { email, code, newPassword: newPass }).then(() => {
      alert("Password updated. Login now.");
      window.location.href = "/";
    });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Reset Password
        </h2>

        {step === 1 && (
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              onClick={requestOTP}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow transition"
            >
              Request OTP
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
              onChange={(e) => setCode(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="New Password"
              className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-200 outline-none"
              onChange={(e) => setNewPass(e.target.value)}
              required
            />

            <button
              onClick={resetPass}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg shadow transition"
            >
              Reset Password
            </button>
          </div>
        )}

        <div className="mt-4 text-center">
          <a href="/" className="text-blue-600 hover:underline">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
