const express = require("express");
const rateLimit = require("express-rate-limit");
const { login, logout, getMe } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const {
  loginValidationRules,
  handleValidationErrors,
} = require("../utils/validators");

const router = express.Router();

// Login attempts are rate-limited to slow down brute-force guessing
// against the single admin account.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/login",
  loginLimiter,
  loginValidationRules,
  handleValidationErrors,
  login
);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getMe);

module.exports = router;
