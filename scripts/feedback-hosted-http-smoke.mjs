#!/usr/bin/env node
/**
 * CONTROLLED LOCAL HTTP SMOKE TEST. Does not enable the deployed public form.
 *
 * Prerequisites:
 * - Existing production build (.next)
 * - FEEDBACK_SUPABASE_SECRET_KEY: dedicated sb_secret_* Supabase key, server-only
 * - FEEDBACK_RATE_HMAC_SECRET: optional; a fresh local-only value is generated if absent
 * - FEEDBACK_SMOKE_ALLOW_PRODUCTION_DB=YES: explicit local one-test opt-in
 *
 * This makes ONE POST to a loopback Next.js server which writes to the existing
 * Brand Brain Supabase RPC. Keep the printed synthetic marker for authorized
 * admin readback and deletion of the single test row after the HTTP test.
 * Never use an unrelated app-wide legacy service_role JWT.
 */
import { spawn } from "node:child_process";
import { createHmac, randomBytes, randomInt, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { join } from "node:path";

const targetRef = "campgoqhyvniokwvjvtb";
const secret = process.env.FEEDBACK_SUPABASE_SECRET_KEY || "";
const hmacSecret = process.env.FEEDBACK_RATE_HMAC_SECRET || randomBytes(48).toString("hex");
const port = process.env.FEEDBACK_SMOKE_PORT ? Number(process.env.FEEDBACK_SMOKE_PORT) : randomInt(30000, 50000);
function blocked(reason) {
  console.error("STOP (no request sent): " + reason);
  process.exitCode = 2;
}

if (process.env.FEEDBACK_SMOKE_ALLOW_PRODUCTION_DB !== "YES") {
  blocked("Explicit local database test opt-in required.");
} else if (!secret.startsWith("sb_secret_") || secret.length < 30) {
  blocked("Requires a dedicated server-only Supabase sb_secret_* key.");
} else if (hmacSecret.length < 32) {
  blocked("Requires a private rate-limit HMAC secret (at least 32 chars).");
} else if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  blocked("Invalid loopback port.");
} else if (!existsSync(join(process.cwd(), "node_modules", "next", "dist", "bin", "next")) ||
  !existsSync(join(process.cwd(), ".next"))) {
  blocked("Build first with public collection disabled: npm ci && npm run build.");
} else {
  const origin = "http://127.0.0.1:" + port;
  const marker = "FRAMELEADS_SYNTHETIC_HTTP_" + randomUUID();
  const testIp = "198.51.100." + randomInt(1, 255);
  const fingerprint = createHmac("sha256", hmacSecret)
    .update(new Date().toISOString().slice(0, 10) + ":" + testIp)
    .digest("hex");
  const child = spawn(process.execPath,
    [join(process.cwd(), "node_modules", "next", "dist", "bin", "next"),
      "start", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: process.cwd(),
      stdio: "ignore",
      env: {
        ...process.env,
        VERCEL_ENV: "production",
        FEEDBACK_SUPABASE_PROJECT_REF: targetRef,
        FEEDBACK_RATE_HMAC_SECRET: hmacSecret,
        FEEDBACK_COLLECTION_ENABLED: "true",
        FEEDBACK_PRODUCTION_RELEASE_APPROVED: "true",
        NEXT_PUBLIC_FEEDBACK_COLLECTION_ENABLED: "false",
      },
    });
  console.log("Synthetic marker for readback and cleanup: " + marker);
  console.log("Synthetic rate-limit fingerprint for cleanup: " + fingerprint);
  try {
    let ready = false;
    for (let i = 0; i < 45; i++) {
      if (child.exitCode !== null) break;
      try {
        const r = await fetch(origin + "/api/feedback");
        if (r.status === 405 && (await r.json().catch(() => null))?.error === "Method not allowed.") {
          ready = true; break;
        }
      } catch { /* Next.js is starting */ }
      await delay(300);
    }
    if (!ready) throw new Error("Local Next.js server not ready.");
    const res = await fetch(origin + "/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        Referer: origin + "/checkout/core",
        "Sec-Fetch-Site": "same-origin",
        "x-vercel-forwarded-for": testIp,
      },
      body: JSON.stringify({
        reason: "offer_clarity",
        optional_message: marker,
        plan_context: "core",
      }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json().catch(() => null);
    if (res.status !== 201 || data?.saved !== true) {
      throw new Error("Expected 201 saved acknowledgment, received HTTP " + res.status + ".");
    }
    console.log("PASS: genuine Next.js HTTP request stored in hosted Brand Brain database.");
    console.log("NEXT: admin readback using the exact marker, then delete that single test row.");
  } catch (e) {
    console.error("FAIL: " + (e instanceof Error ? e.message : "Unknown error"));
    console.error("Check for partially saved test entry using the marker above and clean it up.");
    process.exitCode = 1;
  } finally {
    child.kill();
  }
}
