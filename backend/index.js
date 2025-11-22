const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config();

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();
const auth = admin.auth();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Stockmaster Backend running");
});

const authenticate = require('./middleware/authenticate')

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
module.exports = { db, auth };
