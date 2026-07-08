import "dotenv/config";
import express from "express";
import { fileURLToPath } from "url";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import syncRouter from "./sync.js";
import os from "os";
import cors from "cors";

const app = express();

// Trust proxy headers (X-Forwarded-Proto etc.) so better-auth correctly detects HTTPS
// when the app is deployed behind a reverse proxy / load balancer (common in prod).
app.set('trust proxy', 1);

app.use(express.json());

// CORS is required because the web frontend (running on localhost:3000 or mudir.basharkhan.com)
// makes cross-origin requests to the auth server (localhost:3001 or apimudir...).
// The login flow from the landing page does a fetch/POST to /api/auth/sign-in/social.
// better-auth uses cookies for auth, so we must allow credentials and the web origin.
// Without this, you get exactly: "No 'Access-Control-Allow-Origin' header is present on the requested resource."
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:8080',
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://mudir.basharkhan.com',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow mobile, curl, same-origin, etc.
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Dev helper: allow any localhost (ports 3000, 8080, etc.)
    if (process.env.NODE_ENV !== 'production' && origin && /localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true, // must be true for better-auth session cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// The @better-auth/expo plugin handles mobile OAuth flows automatically
app.all(/^\/api\/auth/, toNodeHandler(auth));

// Mount sync routes under /api/sync
// - GET  /api/sync/status   → check remote data status
// - GET  /api/sync/download → download data from server
// - POST /api/sync/upload   → upload data to server
app.use("/api/sync", syncRouter);

app.get("/", (_req, res) => {
  res.status(301).redirect("https://mudir.basharkhan.com");
});

// Health check
app.get("/healthz", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT || 3001;
  app.listen(Number(port), "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
    console.log(`\nLocal URLs for development:`);
    console.log(`  http://localhost:${port}`);

    // Log local IP addresses
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]!) {
        if (iface.family === "IPv4" && !iface.internal) {
          console.log(`  http://${iface.address}:${port}`);
        }
      }
    }
    console.log();
  });
}
