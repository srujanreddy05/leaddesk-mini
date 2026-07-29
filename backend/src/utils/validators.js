const { body, validationResult } = require("express-validator");
const { BUDGET_OPTIONS } = require("../models/Lead");

const leadValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("budget")
    .trim()
    .notEmpty()
    .withMessage("Budget range is required")
    .isIn(BUDGET_OPTIONS)
    .withMessage("Budget must be one of: " + BUDGET_OPTIONS.join(", ")),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 1000 })
    .withMessage("Message must be under 1000 characters"),
];

const loginValidationRules = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

/**
 * Runs after a validation chain. If express-validator collected any
 * errors, responds 400 with all of them; otherwise passes through.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors
        .array()
        .map((e) => e.msg)
        .join(", "),
    });
  }
  next();
}

module.exports = {
  leadValidationRules,
  loginValidationRules,
  handleValidationErrors,
};
