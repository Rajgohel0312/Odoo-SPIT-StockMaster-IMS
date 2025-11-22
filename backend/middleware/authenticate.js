const { auth } = require("../index");

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth error:", err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};


module.exports = authenticate;
