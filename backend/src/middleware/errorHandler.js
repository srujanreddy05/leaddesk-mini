/**
 * Catches errors thrown or passed via next(err) anywhere in the app and
 * returns a consistent JSON shape instead of leaking stack traces or
 * crashing the process.
 */
function errorHandler(err, req, res, next) {
  console.error(err.stack);

  // Mongoose validation errors -> 400 with readable messages
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages.join(", "),
    });
  }

  // Mongoose bad ObjectId -> 400
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
  }

  // Duplicate key (e.g. duplicate admin username) -> 409
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A record with that value already exists",
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
  });
}

/**
 * Catches requests to routes that don't exist and forwards a 404
 * into the error handler above, instead of Express's default HTML page.
 */
function notFound(req, res, next) {
  const err = new Error(`Route not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}

module.exports = { errorHandler, notFound };
