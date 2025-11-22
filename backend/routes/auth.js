const express = require("express");
const router = express.Router();
const { db, auth } = require("../firebase");

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

module.exports = router;
