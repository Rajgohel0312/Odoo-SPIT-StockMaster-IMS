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
    api
      .post("/otp/reset-password", { email, code, newPassword: newPass })
      .then(() => {
        alert("Password updated. Login now.");
        window.location.href = "/";
      });
  };

  return (
    <div className="auth-box">
      <h2>Reset Password</h2>

      {step === 1 && (
        <>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={requestOTP}>Request OTP</button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            placeholder="Enter OTP"
            onChange={(e) => setCode(e.target.value)}
          />
          <input
            type="password"
            placeholder="New Password"
            onChange={(e) => setNewPass(e.target.value)}
          />
          <button onClick={resetPass}>Reset Password</button>
        </>
      )}
    </div>
  );
}
