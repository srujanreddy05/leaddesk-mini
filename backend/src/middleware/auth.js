const jwt = require("jsonwebtoken");

/**
 * Protects a route by requiring a valid JWT.
 * The token is read from an httpOnly cookie (not a header), so this
 * works from a fresh browser with no localStorage/sessionStorage state —
 * the cookie is set once at login and sent automatically by the browser.
 */
function requireAuth(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated. Please log in.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = { id: decoded.id, username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid. Please log in again.",
    });
  }
}

module.exports = { requireAuth };
