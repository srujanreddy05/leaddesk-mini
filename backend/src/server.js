require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const leadRoutes = require("./routes/leadRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

connectDB();

// CORS is locked to a single allowed origin (the deployed frontend) so
// credentials (the auth cookie) can be sent cross-site safely.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "LeadDesk Mini API is running" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "OK" });
});

app.use("/api/leads", leadRoutes);
app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`LeadDesk Mini API listening on port ${PORT}`);
});
