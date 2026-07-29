const express = require("express");
const { createLead, getLeads, updateLeadStatus } = require("../controllers/leadController");
const { requireAuth } = require("../middleware/auth");
const {
  leadValidationRules,
  handleValidationErrors,
} = require("../utils/validators");

const router = express.Router();

// Public - anyone can submit a lead from the landing page.
router.post("/", leadValidationRules, handleValidationErrors, createLead);

// Protected - only logged-in admins can view or update leads.
router.get("/", requireAuth, getLeads);
router.put("/:id/status", requireAuth, updateLeadStatus);

module.exports = router;
