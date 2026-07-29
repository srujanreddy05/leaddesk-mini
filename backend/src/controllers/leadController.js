const Lead = require("../models/Lead");
const { STATUS_OPTIONS } = require("../models/Lead");

/**
 * POST /api/leads
 * Public. Creates a new lead from the landing page form.
 */
async function createLead(req, res, next) {
  try {
    const { name, email, budget, message } = req.body;

    const lead = await Lead.create({ name, email, budget, message });

    res.status(201).json({
      success: true,
      message: "Thanks! We'll be in touch soon.",
      data: lead,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/leads
 * Protected. Lists leads with optional search (name/email), status
 * filter, and pagination for the admin dashboard.
 * Query params: search, status, page (default 1), limit (default 10)
 */
async function getLeads(req, res, next) {
  try {
    const { search = "", status = "", page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (status && STATUS_OPTIONS.includes(status)) {
      query.status = status;
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    const [leads, total] = await Promise.all([
      Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Lead.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: leads,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/leads/:id/status
 * Protected. Updates a single lead's status.
 */
async function updateLeadStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!STATUS_OPTIONS.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be one of: " + STATUS_OPTIONS.join(", "),
      });
    }

    const lead = await Lead.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated",
      data: lead,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { createLead, getLeads, updateLeadStatus };
