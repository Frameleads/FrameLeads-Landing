#!/usr/bin/env node
/**
 * One-time, owner-authenticated transfer of a named SUPABASE secret to an
 * EXISTING Vercel Production-only Secret environment variable.
 *
 * Never writes/prints key values, uses OS clipboard, or passes keys as
 * command-line arguments. Reads key JSON in process memory and passes only
 * the selected sb_secret_* value to "vercel env update" through stdin.
 *
 * Deliberately does NOT deploy, revoke/rotate keys, or enable feedback.
 * Requires separate owner login to both Supabase CLI and Vercel CLI.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const EXPECTED = Object.freeze({
  supabaseRef: "campgoqhyvniokwvjvtb",
  supabaseKeyName: "frameleads_feedback_server_v1",
  vercelOrgId: "team_jX56ywj76j7NPQT2CaY19x6u",
  vercelProjectId: "prj_RZK6ci9krd8EQPzpFF2vNHI7S3tV",
  vercelProjectName: "frameleads-landing",
  vercelVariable: "FEEDBACK_SUPABASE_SECRET_KEY",
  target: "production",
});
const IS_WINDOWS = process.platform === "win32";
const SUPABASE_VERSION = "3.1.0";
const VERCEL_VERSION = "65.12.1";
const OUTPUT_LIMIT = 512 * 1024;

function fixedNpx(packageName, args) {
  // All command and argument strings are authored constants; no user input
  // and NO credentials are placed in command arguments or the process list.
  const command = "npx.cmd --yes " + packageName + " " + args.join(" ");
  return IS_WINDOWS
    ? { program: "cmd.exe", args: ["/d", "/s", "/c", command] }
    : { program: "npx", args: ["--yes", packageName, ...args] };
}

async function runSuppressed(spec, { cwd, input, capture = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(spec.program, spec.args, {
      cwd: cwd || process.cwd(),
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1", DO_NOT_TRACK: "1" },
    });
    let stdout = "";
    let bytes = 0;
    let exceeded = false;
    const receive = (chunk, fromStdout) => {
      bytes += chunk.byteLength;
      if (bytes > OUTPUT_LIMIT) {
        exceeded = true;
        child.kill();
        return;
      }
      if (capture && fromStdout) stdout += chunk.toString("utf8");
    };
    child.stdout.on("data", chunk => receive(chunk, true));
    child.stderr.on("data", chunk => receive(chunk, false));
    child.stdin.on("error", () => { /* May close after a failed auth or CLI exit. */ });
    child.on("error", () => reject(new Error("Could not launch CLI process.")));
    child.on("close", status => {
      if (exceeded) reject(new Error("CLI response exceeded safe size limit."));
      else resolve({ status: status ?? 1, stdout });
    });
    child.stdin.end(input === undefined ? "" : input);
  });
}

function collectKeyEntries(node, found = [], depth = 0) {
  if (!node || typeof node !== "object" || depth > 10) return found;
  if (Array.isArray(node)) {
    for (const item of node) collectKeyEntries(item, found, depth + 1);
    return found;
  }
  if (typeof node.name === "string") {
    found.push({ name: node.name, type: node.type, value: node.api_key ?? node.apiKey ?? node.value });
  }
  for (const [field, child] of Object.entries(node)) {
    if (["api_key", "apiKey", "value", "hash", "secret_jwt_template"].includes(field)) continue;
    collectKeyEntries(child, found, depth + 1);
  }
  return found;
}

async function main() {
  console.log("FrameLeads — authorized one-time Supabase → Vercel secret transfer");
  console.log("Source: Brand Brain / frameleads_feedback_server_v1 (Secret API key only)");
  console.log("Target: frameleads-landing / FEEDBACK_SUPABASE_SECRET_KEY / Production only");
  console.log("No secret is copied, printed, written to disk, or placed on a command line.");
  console.log("No public feedback flags, deployment, or other API keys will be changed.");

  const tmp = mkdtempSync(join(tmpdir(), "frameleads-vercel-credential-"));
  try {
    // An isolated CLI project link containing only nonsecret team and project IDs.
    // Never changes the owner's existing repo, .vercel folder, or project files.
    mkdirSync(join(tmp, ".vercel"), { recursive: true });
    writeFileSync(join(tmp, ".vercel", "project.json"), JSON.stringify({
      orgId: EXPECTED.vercelOrgId,
      projectId: EXPECTED.vercelProjectId,
    }), { mode: 0o600 });

    const vercel = args => fixedNpx("vercel@" + VERCEL_VERSION, args);
    const supabase = args => fixedNpx("supabase@" + SUPABASE_VERSION, args);
    console.log("Checking Vercel CLI access to the exact linked project...");
    const whoami = await runSuppressed(vercel(["whoami"]), { cwd: tmp });
    if (whoami.status !== 0) {
      throw new Error("Vercel CLI is not authenticated. Run once: npx.cmd --yes vercel@" +
        VERCEL_VERSION + " login. Then rerun this helper.");
    }
    const existing = await runSuppressed(vercel(["env", "ls", "production"]), { cwd: tmp, capture: true });
    if (existing.status !== 0) {
      throw new Error("Could not access Vercel Production environment in the authorized project; stopped without changes.");
    }
    if (!existing.stdout.includes(EXPECTED.vercelVariable)) {
      throw new Error("Required existing Production-only Vercel variable was not found. No variable created; stopped.");
    }
    if (!existing.stdout.includes("FEEDBACK_COLLECTION_ENABLED") ||
        !existing.stdout.includes("FEEDBACK_PRODUCTION_RELEASE_APPROVED") ||
        !existing.stdout.includes("NEXT_PUBLIC_FEEDBACK_COLLECTION_ENABLED")) {
      throw new Error("The expected production activation gates were not all listed. Stopped without changes.");
    }

    console.log("Retrieving ONLY the new named secret from authenticated Supabase CLI...");
    const keys = await runSuppressed(supabase([
      "projects", "api-keys", "--remote=" + EXPECTED.supabaseRef,
      "--reveal", "--output-format=json",
    ]), { capture: true });
    if (keys.status !== 0) {
      throw new Error("Supabase CLI cannot reveal project keys. Authenticate with: npx.cmd --yes supabase@" +
        SUPABASE_VERSION + " login. Then rerun this helper.");
    }
    let parsed;
    try { parsed = JSON.parse(keys.stdout); }
    catch {
      throw new Error("Supabase CLI returned unexpected output; stopped without changes.");
    }
    const matches = collectKeyEntries(parsed).filter(item =>
      item.name === EXPECTED.supabaseKeyName &&
      typeof item.value === "string" &&
      item.value.startsWith("sb_secret_") &&
      item.value.length >= 30
    );
    parsed = null;
    if (matches.length !== 1) {
      throw new Error("Expected exactly one revealed sb_secret_* key named frameleads_feedback_server_v1. " +
        "Publishable keys, default secrets, and ambiguous entries are rejected. No changes made.");
    }
    let secret = matches[0].value;
    if (secret.includes("\n") || secret.includes("\r") || /\s/.test(secret)) {
      throw new Error("Supabase secret contains unexpected whitespace. Stopped.");
    }
    // Release reference ASAP after selecting the approved key.
    matches.length = 0;
    console.log("Found the correct key format and name. Transferring through Vercel CLI stdin.");
    const updated = await runSuppressed(vercel([
      "env", "update", EXPECTED.vercelVariable, EXPECTED.target,
      "--yes", "--type", "secret", "--no-color",
    ]), { cwd: tmp, input: secret + "\n" });
    secret = "";
    if (updated.status !== 0) {
      throw new Error("Vercel CLI did not confirm the update. No success claim. " +
        "No secret was displayed; check Vercel settings privately.");
    }
    console.log("SUCCESS: Vercel CLI accepted Production-only Secret environment variable update.");
    console.log("No deployment occurred. Existing live deployments do not automatically receive new env values.");
    console.log("NEXT: independently verify the variable type/scope and all three OFF flags in Vercel.");
  } finally {
    // On Windows, npx/cmd.exe descendants or antivirus can briefly keep a
    // handle open on a temporary working directory. Cleanup is best-effort:
    // it must never hide the actual CLI error or a successful update.
    // The directory contains ONLY non-secret Vercel project/org IDs.
    try {
      rmSync(tmp, { recursive: true, force: true, maxRetries: 12, retryDelay: 250 });
    } catch (cleanupError) {
      console.warn("NOTICE: Windows could not remove the temporary project-link directory yet. " +
        "It contains only Vercel project/org IDs, never a secret. " +
        "The CLI authentication/update result above is the authoritative status.");
    }
  }
}
try { await main(); }
catch (error) {
  console.error("STOP: " + (error instanceof Error ? error.message : "Unknown failure."));
  process.exitCode = 1;
}
