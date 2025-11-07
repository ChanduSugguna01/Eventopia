const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");

// Load environment variables FIRST before importing passport
dotenv.config();

// Import passport AFTER env variables are loaded
const passport = require("./config/passport");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3001",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      process.env.JWT_SECRET ||
      "your_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Import routes AFTER passport is configured
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const bookingRoutes = require("./routes/bookings");
const qrcodeRoutes = require("./routes/qrcode");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/qrcode", qrcodeRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, connected: true, message:"Welcome to Eventopia API" });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Eventopia API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// Database connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://chandusugguna_db_user:Jfgerq1GYaGVfIaU@cluster0.zpmhd9n.mongodb.net/event_booking?appName=Cluster0";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
