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
const operationRoutes = require("./routes/operations");
const dashboardRoutes = require("./routes/dashboard");


app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/products", authenticate, productRoutes);
app.use("/api/operations", authenticate, operationRoutes);
app.use("/api/dashboard", authenticate, dashboardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
