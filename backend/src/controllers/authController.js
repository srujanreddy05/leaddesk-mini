const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours, matches JWT expiry
};

/**
 * POST /api/auth/login
 * Public. Verifies credentials against the seeded admin account and,
 * on success, sets a signed JWT in an httpOnly cookie. The frontend
 * never sees or stores the raw token, which is what lets this survive
 * a fresh/incognito browser test.
 */
async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username: username.toLowerCase() });

    // Same generic error whether the username or password is wrong,
    // so we don't leak which one was incorrect.
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: "Logged in",
      data: { username: admin.username },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Protected. Clears the auth cookie.
 */
function logout(req, res) {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.status(200).json({ success: true, message: "Logged out" });
}

/**
 * GET /api/auth/me
 * Protected. Lets the frontend check "am I still logged in?" on page
 * load without storing anything client-side.
 */
function getMe(req, res) {
  res.status(200).json({ success: true, data: req.admin });
}

module.exports = { login, logout, getMe };
