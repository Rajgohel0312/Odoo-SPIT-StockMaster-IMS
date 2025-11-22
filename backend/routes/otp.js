const express = require("express");
const router = express.Router();
const { db, auth } = require("../firebase"); 
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/* =============== Request OTP  ==================*/
router.post("/request-reset", async (req, res) => {
    try {
        const { email } = req.body;
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000;
        
    await db.collection("otp_resets").doc(email).set({
        code,
      expiresAt,
      used: false,
    });
    
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "StockMaster Password Reset OTP",
        text: `Your OTP is ${code}. It is valid for 10 minutes.`,
    });
    
    res.json({ message: "OTP sent" });
} catch (err) {
    console.error("OTP SEND ERROR:", err.message);
    res.status(400).json({ error: err.message });
}
});
/* =============== Reset Password  ==================*/

router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const doc = await db.collection("otp_resets").doc(email).get();
    if (!doc.exists) return res.status(400).json({ error: "Invalid request" });

    const data = doc.data();
    if (data.used || data.code !== code || Date.now() > data.expiresAt) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password: newPassword });
    await db.collection("otp_resets").doc(email).update({ used: true });

    res.json({ message: "Password updated" });
  } catch (err) {
    console.error("RESET ERROR:", err.message);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
