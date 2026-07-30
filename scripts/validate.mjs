import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const requiredFiles = [
  "public/index.html",
  "public/styles.css",
  "public/app.js",
  "public/assets/brand-mark.svg",
  "public/assets/job-board-hero.png",
  "netlify.toml",
  "netlify/functions/request-account.mjs",
  "netlify/functions/review-account-request.mjs",
  "supabase/migrations/20260729160000_bright_harbor_careers.sql",
  "supabase/migrations/20260730170000_job_board_settings.sql",
  "supabase/migrations/20260730183000_departments.sql",
  "supabase/migrations/20260730190000_profile_avatar.sql"
];

const root = process.cwd();

for (const file of requiredFiles) {
  await stat(path.join(root, file));
}

const html = await readFile(path.join(root, "public/index.html"), "utf8");
const app = await readFile(path.join(root, "public/app.js"), "utf8");
const settingsSql = await readFile(
  path.join(root, "supabase/migrations/20260730170000_job_board_settings.sql"),
  "utf8"
);
const departmentsSql = await readFile(
  path.join(root, "supabase/migrations/20260730183000_departments.sql"),
  "utf8"
);
const profileSql = await readFile(
  path.join(root, "supabase/migrations/20260730190000_profile_avatar.sql"),
  "utf8"
);

const checks = [
  [html.includes("Welcome to Bright Harbor Careers."), "Landing chooser"],
  [html.includes("Applicant"), "Applicant entry"],
  [html.includes("Hiring Team"), "Hiring Team entry"],
  [html.includes("jobBoardHero") && html.includes("filtersToggle"), "Job board hero and filters"],
  [html.includes("departmentCards") && app.includes("departmentOpeningCounts"), "Applicant department cards"],
  [html.includes("showApplicationButton") && app.includes("data-apply-job"), "Job detail apply flow"],
  [html.includes('data-profile-destination="settings"') && html.includes("departmentsSettingsButton"), "HR settings menu"],
  [html.includes("departmentForm") && app.includes("handleDepartmentSubmit"), "Department management form"],
  [html.includes("jobDepartmentSelect") && html.includes("jobSubdepartmentSelect"), "Job department selectors"],
  [html.includes("boardSettingsForm") && app.includes("handleBoardSettingsSubmit"), "Admin job board editor"],
  [html.includes("Request a Hiring Team Account"), "Account request link"],
  [html.includes('name="username"') && html.includes('name="password"'), "Hiring-team credentials form"],
  [html.includes('data-hr-section="jobs"') && app.includes("pipeline-chip"), "HR jobs top navigation"],
  [html.includes('data-hr-section="candidates"') && html.includes("candidatesTable") && app.includes("renderCandidatesTable"), "HR candidates view"],
  [html.includes('data-hr-section="reports"') && html.includes("pipelineBoard"), "HR reports view"],
  [html.includes("profileMenuButton") && html.includes("profileDropdown"), "HR profile dropdown"],
  [html.includes("profileForm") && app.includes("handleProfileSubmit"), "HR profile editor"],
  [app.includes("handleAccountRequestSubmit"), "Account request handler"],
  [app.includes("supabaseInsert"), "Supabase insert wiring"],
  [app.includes("job_board_settings") && settingsSql.includes("job_board_settings"), "Job board settings persistence"],
  [app.includes("departments") && departmentsSql.includes("public.departments"), "Department persistence"],
  [app.includes("avatar_url") && profileSql.includes("avatar_url"), "Profile avatar persistence"],
  [app.includes("localeCompare"), "Alphabetical job sorting"],
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
