const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Stockmaster Backend running");
});


/* =============== Middleware ==================*/
const authenticate = require("./middleware/authenticate");

/* =============== Routes ==================*/
const authRoutes = require("./routes/auth");
const otpRoutes = require("./routes/otp");
const productRoutes = require("./routes/products");

app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/products", authenticate, productRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
