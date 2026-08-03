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
  "netlify/functions/send-communication.mjs",
  "netlify/functions/run-communication-automations.mjs",
  "netlify/functions/process-communication-queue.mjs",
  "supabase/migrations/20260729160000_bright_harbor_careers.sql",
  "supabase/migrations/20260730170000_job_board_settings.sql",
  "supabase/migrations/20260730183000_departments.sql",
  "supabase/migrations/20260730190000_profile_avatar.sql",
  "supabase/migrations/20260730200000_pipeline_settings.sql",
  "supabase/migrations/20260730210000_job_content_sections.sql",
  "supabase/migrations/20260731120000_communications.sql",
  "supabase/migrations/20260731130000_workflows.sql",
  "supabase/migrations/20260731133000_application_requirement_levels.sql",
  "supabase/migrations/20260731140000_job_status_options.sql",
  "supabase/migrations/20260731150000_communication_template_type.sql",
  "supabase/migrations/20260803120000_onboarding.sql"
];

const root = process.cwd();

for (const file of requiredFiles) {
  await stat(path.join(root, file));
}

const html = await readFile(path.join(root, "public/index.html"), "utf8");
const app = await readFile(path.join(root, "public/app.js"), "utf8");
const css = await readFile(path.join(root, "public/styles.css"), "utf8");
const automationFunction = await readFile(
  path.join(root, "netlify/functions/run-communication-automations.mjs"),
  "utf8"
);
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
const pipelineSql = await readFile(
  path.join(root, "supabase/migrations/20260730200000_pipeline_settings.sql"),
  "utf8"
);
const jobContentSql = await readFile(
  path.join(root, "supabase/migrations/20260730210000_job_content_sections.sql"),
  "utf8"
);
const communicationsSql = await readFile(
  path.join(root, "supabase/migrations/20260731120000_communications.sql"),
  "utf8"
);
const workflowsSql = await readFile(
  path.join(root, "supabase/migrations/20260731130000_workflows.sql"),
  "utf8"
);
const requirementLevelsSql = await readFile(
  path.join(root, "supabase/migrations/20260731133000_application_requirement_levels.sql"),
  "utf8"
);
const jobStatusesSql = await readFile(
  path.join(root, "supabase/migrations/20260731140000_job_status_options.sql"),
  "utf8"
);
const templateTypeSql = await readFile(
  path.join(root, "supabase/migrations/20260731150000_communication_template_type.sql"),
  "utf8"
);
const onboardingSql = await readFile(
  path.join(root, "supabase/migrations/20260803120000_onboarding.sql"),
  "utf8"
);
const netlifyFunctionsIncludeNameMergeFields =
  automationFunction.includes("candidate_first_name") && automationFunction.includes("candidate_last_name");

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
  [
    html.includes("authLoadingPanel") &&
      app.includes("setAuthLoading") &&
      app.includes("fetchWithTimeout") &&
      app.includes("refreshHrDataAfterSignIn") &&
      app.includes("Opening Hiring Team home"),
    "Non-blocking hiring-team login"
  ],
  [html.includes('data-hr-section="home"') && html.includes("hrHomeSection") && app.includes("renderHomeDashboard"), "HR home dashboard"],
  [
    html.includes("profileSignOutButton") &&
      app.includes("signOutHrUser") &&
      css.includes(".app-shell.is-hr-session .public-tabs") &&
      html.includes("hr-header-menu") &&
      html.includes("hrSubheaderTitle") &&
      app.includes("renderHrSubheader") &&
      !html.includes("HR backend") &&
      !html.includes("hrHeading"),
    "Signed-in HR navigation cleanup"
  ],
  [html.includes('data-hr-section="jobs"') && app.includes("pipeline-chip"), "HR jobs top navigation"],
  [html.includes("hrJobSearch") && html.includes("showJobCreate") && app.includes("hrJobQuery"), "HR jobs search and create control"],
  [
    html.includes("hrJobStatusFilter") &&
      html.includes("hrJobDepartmentFilter") &&
      html.includes("hrJobWorkTypeFilter") &&
      app.includes("hrJobFilters") &&
      app.includes("renderHrJobFilters"),
    "HR jobs filter controls"
  ],
  [
    !html.includes("<th scope=\"col\">Owner</th>") &&
      app.includes('colspan="3"') &&
      app.includes("hr-job-title") &&
      app.includes("job-status-pill") &&
      app.includes("status-cell"),
    "Ownerless framed jobs preview"
  ],
  [
    css.includes(".jobs-list-panel .hr-job-row td") &&
      css.includes(".hr-job-title") &&
      css.includes(".job-status-pill"),
    "Framed job preview styling"
  ],
  [html.includes("showJobPreview") && html.includes("jobPreviewPanel") && app.includes("openJobPreview"), "On-demand job preview"],
  [html.includes('value="internal"') && html.includes('value="confidential"'), "Internal and confidential job status options"],
  [app.includes("normalizeJobStatus") && app.includes("jobStatusOptions"), "Job status normalization"],
  [
    jobStatusesSql.includes("'internal'") &&
      jobStatusesSql.includes("'confidential'") &&
      jobStatusesSql.includes("jobs_status_current_options_check"),
    "Job status persistence"
  ],
  [html.includes("job-create-subnav") && html.includes('data-job-create-tab="description"'), "Create-job section navigation"],
  [html.includes('data-job-create-tab="application"') && html.includes("application-requirement-list"), "Create-job application settings"],
  [html.includes('value="mandatory"') && html.includes('value="not_required"'), "Three-state application requirements"],
  [html.includes('data-job-create-tab="team"') && html.includes('name="team_members"'), "Create-job team members settings"],
  [html.includes('data-job-create-tab="workflow"') && html.includes("jobWorkflowSelect"), "Create-job workflow selection"],
  [css.includes(".jobs-list-panel .pipeline-cell .pipeline-chip-row") && css.includes("repeat(4, minmax"), "Equal-width job pipeline preview"],
  [html.includes('name="salary_min"') && html.includes('name="salary_max"'), "Salary range fields"],
  [html.includes('name="job_description"') && html.includes('name="requirements"') && html.includes('name="benefits"'), "Sectioned job content fields"],
  [html.includes('name="seo_keywords"') && app.includes("parseKeywords"), "SEO keyword entry"],
  [html.includes('data-hr-section="candidates"') && html.includes("candidatesTable") && app.includes("renderCandidatesTable"), "HR candidates view"],
  [html.includes('data-hr-section="reports"') && html.includes("pipelineBoard"), "HR reports view"],
  [
    html.includes('data-hr-section="onboarding"') &&
      html.includes("hrOnboardingSection") &&
      html.includes("onboardingView") &&
      app.includes('status === "hired"') &&
      app.includes("renderHrOnboarding") &&
      app.includes("renderEmployeeOnboarding"),
    "Dual onboarding interfaces"
  ],
  [
    html.includes("onboardingDocumentUpload") &&
      app.includes("scanOnboardingFile") &&
      app.includes("matched_type_ids") &&
      app.includes("saveOnboardingDocument") &&
      app.includes("printOnboardingDocument") &&
      app.includes("renderOnboardingDocumentPreview"),
    "Onboarding document scanning and review"
  ],
  [
    onboardingSql.includes("onboarding_records") &&
      onboardingSql.includes("onboarding_documents") &&
      onboardingSql.includes("onboarding-documents") &&
      app.includes("loadOnboardingData") &&
      app.includes("saveOnboardingUpload") &&
      app.includes("onboarding_hierarchy_updated"),
    "Onboarding Supabase persistence"
  ],
  [
    app.includes('const pipelineStages = ["new", "screening", "interview", "offer", "hired"]') &&
      html.includes('name="hired"') &&
      app.includes("candidate_hired"),
    "Hired pipeline stage"
  ],
  [html.includes("profileMenuButton") && html.includes("profileDropdown"), "HR profile dropdown"],
  [html.includes("profileForm") && app.includes("handleProfileSubmit"), "HR profile editor"],
  [
    html.includes("settings-layout") &&
      html.includes("settings-content") &&
      html.includes("settings-nav") &&
      html.includes("settings-link") &&
      !html.includes("settings-tile") &&
      css.includes(".settings-link"),
    "Plain left settings navigation"
  ],
  [
    html.includes("department-list-widget") &&
      html.includes("departmentListCount") &&
      app.includes("handleDepartmentRowSave") &&
      app.includes("handleDepartmentDelete") &&
      app.includes("renderDepartmentParentOptions") &&
      app.includes("data-save-department") &&
      app.includes("data-delete-department"),
    "Editable department list"
  ],
  [html.includes("pipelineSettingsForm") && app.includes("handlePipelineSettingsSubmit"), "Pipeline settings form"],
  [html.includes("workflowSettingsButton") && app.includes("handleWorkflowSubmit"), "Admin workflow settings"],
  [workflowsSql.includes("create table if not exists public.workflows") && workflowsSql.includes("workflow_id"), "Workflow persistence"],
  [requirementLevelsSql.includes("resume_requirement") && app.includes("normalizeRequirement"), "Application requirement level persistence"],
  [html.includes("communicationsSettingsButton") && html.includes("communicationTemplateForm"), "Communications settings module"],
  [html.includes("templatesTable") && app.includes("handleCommunicationTemplateSubmit"), "Communication template library"],
  [
    html.includes('name="template_type"') &&
      app.includes("template-list-card") &&
      app.includes("template-content-details") &&
      templateTypeSql.includes("template_type"),
    "Expandable communication template types"
  ],
  [
    app.includes("candidate_first_name") &&
      app.includes("candidate_last_name") &&
      netlifyFunctionsIncludeNameMergeFields,
    "Candidate first and last name merge fields"
  ],
  [html.includes("automationRulesTable") && app.includes("handleAutomationRuleSubmit"), "Communication automation rules"],
  [html.includes("candidateProfilePanel") && app.includes("manualCommunicationForm"), "Candidate communications tab"],
  [app.includes("dispatchAutomationEvent") && app.includes("run-communication-automations") && app.includes("candidate_stage_changed"), "Communication automation dispatch"],
  [communicationsSql.includes("communication_templates") && communicationsSql.includes("automation_rules"), "Communication persistence tables"],
  [communicationsSql.includes("communication_events") && communicationsSql.includes("send_after"), "Communication queue and audit log"],
  [app.includes("handleAccountRequestSubmit"), "Account request handler"],
  [app.includes("supabaseInsert"), "Supabase insert wiring"],
  [app.includes("job_board_settings") && settingsSql.includes("job_board_settings"), "Job board settings persistence"],
  [app.includes("departments") && departmentsSql.includes("public.departments"), "Department persistence"],
  [app.includes("avatar_url") && profileSql.includes("avatar_url"), "Profile avatar persistence"],
  [app.includes("pipeline_settings") && pipelineSql.includes("pipeline_settings"), "Pipeline settings persistence"],
  [app.includes("job_description") && jobContentSql.includes("seo_keywords"), "Job content section persistence"],
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
