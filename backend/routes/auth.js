const express = require("express");
const router = express.Router();
const { db, auth } = require("../firebase");
const authenticate = require("../middleware/authenticate");
/* =============== Register User ==================*/
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    await db
      .collection("users")
      .doc(userRecord.uid)
      .set({
        name,
        email,
        role: role || "inventory management",
        createdAt: new Date(),
      });

    return res.status(201).json({
      success: true,
      uid: userRecord.uid,
      name,
      email,
      role,
    });
  } catch (error) {
    console.error("Signup Error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.get("/profile/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    // 1️⃣ Get Firebase Auth Data
    const userRecord = await auth.getUser(uid);

    // 2️⃣ Get Firestore user data
    const userSnap = await db.collection("users").doc(uid).get();
    const userData = userSnap.data();

    if (!userData) {
      return res.status(404).json({ error: "User not found in Firestore" });
    }

    res.json({
      uid: userRecord.uid,
      name: userData.name || userRecord.displayName,
      email: userRecord.email,
      role: userData.role || "inventory management",
      createdAt: userData.createdAt,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.get("/profile", authenticate, async (req, res) => {
  try {
    const uid = req.user.uid; // Get UID from Firebase token

    // Get user data from Firestore
    const userSnap = await db.collection("users").doc(uid).get();
    if (!userSnap.exists) {
      return res.status(404).json({ error: "User not found in Firestore" });
    }

    const userData = userSnap.data();

    res.json({
      uid,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      createdAt: userData.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
