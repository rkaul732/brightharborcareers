import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const requiredFiles = [
  "public/index.html",
  "public/styles.css",
  "public/app.js",
  "public/assets/brand-mark.svg",
  "netlify.toml",
  "netlify/functions/request-account.mjs",
  "netlify/functions/review-account-request.mjs",
  "supabase/migrations/20260729160000_bright_harbor_careers.sql"
];

const root = process.cwd();

for (const file of requiredFiles) {
  await stat(path.join(root, file));
}

const html = await readFile(path.join(root, "public/index.html"), "utf8");
const app = await readFile(path.join(root, "public/app.js"), "utf8");

const checks = [
  [html.includes("Welcome to Bright Harbor Careers."), "Landing chooser"],
  [html.includes("Applicant"), "Applicant entry"],
  [html.includes("Hiring Team"), "Hiring Team entry"],
  [html.includes("Request a Hiring Team Account"), "Account request link"],
  [html.includes('name="username"') && html.includes('name="password"'), "Hiring-team credentials form"],
  [html.includes("role-button"), "Role switcher"],
  [app.includes("handleAccountRequestSubmit"), "Account request handler"],
  [app.includes("supabaseInsert"), "Supabase insert wiring"],
  [app.includes("/auth/v1/token?grant_type=password"), "Supabase password auth"],
  [app.includes("recruiter") && app.includes("hiring_manager") && app.includes("admin"), "HR roles"]
];

const failed = checks.filter(([passed]) => !passed);
if (failed.length) {
  for (const [, label] of failed) {
    console.error(`Missing ${label}.`);
  }
  process.exit(1);
}

console.log("Validation checks passed.");
