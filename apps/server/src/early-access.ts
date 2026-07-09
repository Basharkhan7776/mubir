import express from "express";
import { getDb } from "./auth.js";

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/early-access
 * Public endpoint: store early-access app request (full name + email) in MongoDB.
 */
router.post("/", async (req, res) => {
  try {
    const fullName =
      typeof req.body?.fullName === "string" ? req.body.fullName.trim() : "";
    const emailRaw =
      typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const email = emailRaw.toLowerCase();

    if (!fullName || fullName.length < 2) {
      res.status(400).json({
        error: "invalid_name",
        message: "Full name is required (at least 2 characters).",
      });
      return;
    }

    if (!email || !EMAIL_RE.test(email)) {
      res.status(400).json({
        error: "invalid_email",
        message: "A valid email address is required.",
      });
      return;
    }

    if (fullName.length > 120) {
      res.status(400).json({
        error: "invalid_name",
        message: "Full name is too long.",
      });
      return;
    }

    const db = await getDb();
    const collection = db.collection("early_access_requests");

    // Ensure unique index on email (idempotent)
    await collection.createIndex({ email: 1 }, { unique: true });

    const existing = await collection.findOne({ email });
    if (existing) {
      res.status(200).json({
        ok: true,
        alreadyRegistered: true,
        message: "You're already on the early access list.",
      });
      return;
    }

    const doc = {
      fullName,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(doc);

    console.log("[EarlyAccess] new request", { email, fullName });

    res.status(201).json({
      ok: true,
      alreadyRegistered: false,
      message: "Thanks! You're on the early access list.",
    });
  } catch (err: any) {
    // Duplicate key from race condition
    if (err?.code === 11000) {
      res.status(200).json({
        ok: true,
        alreadyRegistered: true,
        message: "You're already on the early access list.",
      });
      return;
    }
    console.error("[EarlyAccess] failed to save request", err);
    res.status(500).json({
      error: "server_error",
      message: "Could not save your request. Please try again.",
    });
  }
});

export default router;
