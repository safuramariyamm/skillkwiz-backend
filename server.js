const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Route imports - ADD THOSE BACK ONE BY ONE
const authRoutes = require("./routes/auth.routes");
// const userRoutes = require("./routes/user.routes");
// const candidateRoutes = require("./routes/candidate.routes");
// const employerRoutes = require("./routes/employer.routes");
// const assessmentRoutes = require("./routes/assessment.routes");
// const skillRoutes = require("./routes/skill.routes");
// const blogRoutes = require("./routes/blog.routes");
// const uploadRoutes = require("./routes/upload.routes");
// const contactRoutes = require("./routes/contact.routes");
const otpRoutes = require("./routes/otp.routes");
// const examBookingRoutes = require("./routes/examBooking.routes");

const app = express();

// Connect to MongoDB (if you want database)
// connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ success: true, message: "SkillKwiz API is running", timestamp: new Date().toISOString() });
});

// Test route
app.get("/test", (req, res) => {
  res.json({ success: true, message: "Test route works!" });
});

// API test route
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API test route works!" });
});

// AUTH ROUTES
app.use("/api/auth", authRoutes);

// OTP ROUTES
app.use("/api/otp", otpRoutes);

// Simple test OTP endpoint (as backup)
app.post("/api/otp/send-test", (req, res) => {
  console.log("Test OTP received:", req.body);
  res.json({
    success: true,
    message: "Test OTP would be sent to " + req.body.identifier,
    otp: "123456"
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: `Route ${req.url} not found` });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 Test: http://localhost:${PORT}/test`);
  console.log(`📍 API Test: http://localhost:${PORT}/api/test`);
  console.log(`📍 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`📍 OTP: http://localhost:${PORT}/api/otp`);
});