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

// Route imports
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const candidateRoutes = require("./routes/candidate.routes");
const employerRoutes = require("./routes/employer.routes");
const assessmentRoutes = require("./routes/assessment.routes");
const skillRoutes = require("./routes/skill.routes");
const blogRoutes = require("./routes/blog.routes");
const uploadRoutes = require("./routes/upload.routes");
const contactRoutes = require("./routes/contact.routes");
const otpRoutes = require("./routes/otp.routes");
const examBookingRoutes = require("./routes/examBooking.routes");

// CREATE APP
const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet());

// Rate limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Auth-specific stricter rate limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many authentication attempts. Please try again later." },
});

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SkillKwiz API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/employers", employerRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/exam-bookings", examBookingRoutes); '


// Add this before the 404 handler
app.get('/debug', (req, res) => {
  res.json({
    success: true,
    message: "Debug endpoint working",
    routes: app._router.stack.filter(layer => layer.route).map(layer => ({
      path: layer.route?.path,
      methods: Object.keys(layer.route?.methods || {})
    }))
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 SkillKwiz API running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  console.log(`📋 Health check: http://localhost:${PORT}/health\n`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err.message);
  server.close(() => process.exit(1));
});

module.exports = app;