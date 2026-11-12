#!/usr/bin/env node
/**
 * FrameLeads controlled smoke test, without copying or pasting an API key.
 * Reads ONLY the named Supabase secret key through the owner's authenticated
 * Supabase CLI session, inside this local process. Does not print credentials.
 * Never enables public feedback or deploys to Vercel.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const projectRef = "campgoqhyvniokwvjvtb";
const keyName = "frameleads-feedback-ingest";
const cliVersion = "3.1.0";
const maxCaptureBytes = 512 * 1024;
const win = process.platform === "win32";

function commandLine(argumentsList) {
  // Arguments are fixed, developer-authored literals; no secrets in the command line.
  if (win) {
    return { executable: "cmd.exe", args: ["/d", "/s", "/c", "npx.cmd --yes supabase@" + cliVersion + " " + argumentsList.join(" ")] };
  }
  return { executable: "npx", args: ["--yes", "supabase@" + cliVersion, ...argumentsList] };
}

function runInherit(executable, args, env) {
  return new Promise((resolve, reject) => {
    const proc = spawn(executable, args, { stdio: "inherit", env, windowsHide: false });
    proc.on("error", reject);
    proc.on("close", code => resolve(code ?? 1));
  });
}

function runCaptured(executable, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(executable, args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, SUPABASE_TELEMETRY_DISABLED: "1" },
      windowsHide: true,
    });
    let output = "";
    let overflow = false;
    let totalBytes = 0;
    const consume = part => {
      totalBytes += part.byteLength;
      if (totalBytes > maxCaptureBytes) {
        overflow = true;
        proc.kill();
      }
    };
    proc.stdout.on("data", chunk => {
      consume(chunk);
      if (!overflow) output += chunk.toString("utf8");
    });
    // Deliberately suppress stderr: never expose secret-bearing tool output.
    proc.stderr.on("data", consume);
    proc.on("error", reject);
    proc.on("close", code => {
      if (overflow) reject(new Error("Supabase CLI response exceeded safe size limit."));
      else resolve({ code: code ?? 1, output });
    });
  });
}

function findNamedKey(node, depth = 0) {
  if (!node || depth > 8 || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const value of node) {
      const found = findNamedKey(value, depth + 1);
      if (found) return found;
    }
    return null;
  }
  // Supabase CLI may report a key "type" using a version-specific label.
  // The actual sb_secret_ prefix, not the metadata type string, is authoritative.
  if (typeof node.name === "string" && node.name.trim().toLowerCase() === keyName) {
    const key = node.api_key || node.apiKey || node.value;
    if (typeof key === "string" && key.startsWith("sb_secret_") && key.length >= 30) return key;
  }
  for (const [field, value] of Object.entries(node)) {
    if (["api_key", "apiKey", "value"].includes(field)) continue;
    const found = findNamedKey(value, depth + 1);
    if (found) return found;
  }
  return null;
}

// Emits ONLY safe metadata; no key prefixes beyond the fixed type "secret",
// and never stdout or any portion of a credential.
function safeKeyInventory(node, depth = 0, entries = []) {
  if (!node || depth > 8 || typeof node !== "object" || entries.length >= 30) return entries;
  if (Array.isArray(node)) {
    for (const item of node) safeKeyInventory(item, depth + 1, entries);
    return entries;
  }
  if (typeof node.name === "string") {
    const name = /^[a-zA-Z0-9_-]{1,64}$/.test(node.name) ? node.name : "[unrecognized name]";
    const value = node.api_key || node.apiKey || node.value;
    const status = typeof value === "string" && value.startsWith("sb_secret_")
      ? "secret, revealed" : typeof value === "string" && value.startsWith("sb_publishable_")
      ? "publishable" : typeof value === "string" && value.startsWith("eyJ")
      ? "legacy JWT" : "not revealed or unknown";
    entries.push({ name, status });
  }
  for (const [field, value] of Object.entries(node)) {
    if (["api_key", "apiKey", "value"].includes(field)) continue;
    safeKeyInventory(value, depth + 1, entries);
  }
  return entries;
}

async function main() {
  if (!existsSync(join(process.cwd(), "scripts", "feedback-hosted-http-smoke.mjs"))) {
    throw new Error("Run this from the FrameLeads PR #42 repository folder.");
  }
  console.log("FrameLeads one-shot feedback test — NO copy/paste of API keys.");
  console.log("Public collection remains disabled and no production deployment will occur.");

  // Never allow a secret into npm build/install scripts.
  const nextBin = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  if (!existsSync(nextBin)) {
    console.log("Installing existing application dependencies without any secret...");
    const install = await runInherit(win ? "npm.cmd" : "npm", ["ci"], {
      ...process.env, NEXT_PUBLIC_FEEDBACK_COLLECTION_ENABLED: "false", NEXT_PUBLIC_FEEDBACK_PREVIEW: "false",
      FEEDBACK_SUPABASE_SECRET_KEY: "", FEEDBACK_COLLECTION_ENABLED: "false",
      FEEDBACK_PRODUCTION_RELEASE_APPROVED: "false"
    });
    if (install !== 0) throw new Error("npm ci failed. No database request sent.");
  }
  if (!existsSync(join(process.cwd(), ".next"))) {
    console.log("Building local Next.js app with collection OFF...");
    const built = await runInherit(win ? "npm.cmd" : "npm", ["run", "build"], {
      ...process.env, NEXT_PUBLIC_FEEDBACK_COLLECTION_ENABLED: "false", NEXT_PUBLIC_FEEDBACK_PREVIEW: "false",
      FEEDBACK_SUPABASE_SECRET_KEY: "", FEEDBACK_COLLECTION_ENABLED: "false",
      FEEDBACK_PRODUCTION_RELEASE_APPROVED: "false"
    });
    if (built !== 0) throw new Error("Local build failed. No database request sent.");
  }

  // Supabase CLI v3.1.0 supports remote key reveal through authenticated access.
  // Capture stdout IN MEMORY; never print or write the JSON containing secrets.
  console.log("Reading the dedicated key privately via authenticated Supabase CLI...");
  const cli = commandLine([
    "projects", "api-keys",
    "--remote=" + projectRef, "--reveal", "--output-format=json"
  ]);
  const reply = await runCaptured(cli.executable, cli.args);
  if (reply.code !== 0) {
    throw new Error(
      "Supabase CLI could not authenticate or reveal this project's keys. " +
      "Run this ONCE in PowerShell: npx.cmd --yes supabase@" + cliVersion + " login " +
      "Then rerun the feedback test. No API key needs to be copied."
    );
  }
  let parsed;
  try {
    parsed = JSON.parse(reply.output);
  } catch {
    throw new Error("Supabase CLI did not return parseable JSON. No request sent. " +
      "Check the installed CLI and run: npx.cmd --yes supabase@" + cliVersion + " projects api-keys --help " +
      "(Do NOT run --reveal alone in a visible terminal.)");
  }
  const key = findNamedKey(parsed);
  if (!key) {
    const inventory = safeKeyInventory(parsed);
    // Only approved key names and generic type categories are printed.
    console.log("Supabase key inventory (names/types only; credentials hidden):");
    if (!inventory.length) console.log("  No key entries were returned.");
    for (const item of inventory) console.log("  - " + item.name + " — " + item.status);
    const target = inventory.find(entry => entry.name.toLowerCase() === keyName);
    parsed = null;
    throw new Error(
      target
        ? "The named key exists but is not revealed as an sb_secret_* value. Check Supabase CLI secret-read permissions; no request sent."
        : "No Supabase secret key is named " + keyName + " in Brand Brain. The configured Vercel environment variable NAME is not the same as the Supabase API key NAME. Create/rename a dedicated key in the Supabase dashboard; no request sent."
    );
  }
  parsed = null;
  console.log("Named secret key obtained in process memory; value never displayed.");
  const runnerEnv = {
    ...process.env,
    FEEDBACK_SUPABASE_SECRET_KEY: key,
    FEEDBACK_SMOKE_ALLOW_PRODUCTION_DB: "YES",
    FEEDBACK_RATE_HMAC_SECRET: "",
    FEEDBACK_COLLECTION_ENABLED: "false",
    FEEDBACK_PRODUCTION_RELEASE_APPROVED: "false",
    NEXT_PUBLIC_FEEDBACK_COLLECTION_ENABLED: "false",
  };
  const exit = await runInherit(process.execPath,
    [join(process.cwd(), "scripts", "feedback-hosted-http-smoke.mjs")], runnerEnv);
  if (exit !== 0) throw new Error("The one-shot HTTP test did not pass. Keep any synthetic marker printed above for exact cleanup.");
}

try {
  await main();
} catch (error) {
  // Errors only contain authored text; NEVER include raw CLI stdout or secrets.
  console.error("STOP: " + (error instanceof Error ? error.message : "Unknown error."));
  process.exitCode = 1;
}
