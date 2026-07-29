/**
 * Run with: npm run seed:admin
 *
 * Creates (or updates the password of) a single admin account using
 * credentials from environment variables. This is the ONLY way an
 * admin account gets created — there is no signup UI, and no
 * credentials are ever hardcoded in source.
 */
require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Admin = require("../src/models/Admin");

async function seedAdmin() {
  const username = process.env.ADMIN_SEED_USERNAME;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!username || !password) {
    console.error(
      "ADMIN_SEED_USERNAME and ADMIN_SEED_PASSWORD must be set in .env before seeding."
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("ADMIN_SEED_PASSWORD should be at least 8 characters.");
    process.exit(1);
  }

  await connectDB();

  const passwordHash = await bcrypt.hash(password, 10);
  const normalizedUsername = username.toLowerCase();

  const existing = await Admin.findOne({ username: normalizedUsername });

  if (existing) {
    existing.passwordHash = passwordHash;
    await existing.save();
    console.log(`Admin "${normalizedUsername}" already existed — password updated.`);
  } else {
    await Admin.create({ username: normalizedUsername, passwordHash });
    console.log(`Admin "${normalizedUsername}" created successfully.`);
  }

  await mongoose.connection.close();
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Failed to seed admin:", err.message);
  process.exit(1);
});
