const env = window.BHC_ENV || {};
const hasSupabase =
  Boolean(env.supabaseUrl && env.supabaseAnonKey) &&
  !env.supabaseUrl.includes("your-project-ref") &&
  !env.supabaseAnonKey.includes("your-public");

const roleProfiles = {
  recruiter: {
    label: "Recruiter",
    summary:
      "Owns requisitions, publishes roles, screens candidates, and keeps the pipeline moving.",
    capabilities: ["Create jobs", "Publish jobs", "Move candidates", "Add screening notes"]
  },
  hiring_manager: {
    label: "Hiring manager",
    summary:
      "Reviews shortlists, evaluates interviews, and gives structured hiring feedback.",
    capabilities: ["Review candidates", "Advance interviews", "Submit scorecards", "Approve offers"]
  },
  admin: {
    label: "Admin",
    summary:
      "Controls role permissions, compliance settings, integrations, and workspace governance.",
    capabilities: ["Manage users", "Configure workflows", "Audit activity", "Archive jobs"]
  }
};

const pipelineStages = ["new", "screening", "interview", "offer"];

const defaultPipelineLabels = {
  new: "New",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer"
};

const defaultBoardSettings = {
  id: "default",
  hero_image_url: "/assets/job-board-hero.png",
  hero_eyebrow: "Bright Harbor Careers",
  hero_title: "Find your next role at Bright Harbor.",
  hero_subtitle: "Explore current openings and apply to the role that fits your next chapter.",
  overlay_opacity: 55
};

const communicationMergeFields = [
  { key: "candidate_name", label: "Candidate name" },
  { key: "candidate_email", label: "Candidate email" },
  { key: "job_title", label: "Job title" },
  { key: "department", label: "Department" },
  { key: "job_location", label: "Job location" },
  { key: "company_name", label: "Company name" },
  { key: "recruiter_name", label: "Recruiter name" },
  { key: "hiring_manager", label: "Hiring manager" },
  { key: "application_stage", label: "Pipeline stage" },
  { key: "interview_date_time", label: "Interview date/time" },
  { key: "offer_details", label: "Offer details" },
  { key: "sender_email", label: "Sender email" },
  { key: "reply_to", label: "Reply-to email" }
];

const communicationTriggerEvents = [
  { id: "candidate_applies", label: "Candidate applies" },
  { id: "candidate_imported", label: "Candidate imported" },
  { id: "candidate_stage_changed", label: "Candidate moved to pipeline stage", usesStage: true },
  { id: "candidate_rejected", label: "Candidate rejected" },
  { id: "candidate_withdrawn", label: "Candidate withdrawn" },
  { id: "interview_scheduled", label: "Interview scheduled" },
  { id: "interview_rescheduled", label: "Interview rescheduled" },
  { id: "interview_canceled", label: "Interview canceled" },
  { id: "offer_created", label: "Offer created" },
  { id: "offer_sent", label: "Offer sent" },
  { id: "offer_accepted", label: "Offer accepted" },
  { id: "offer_declined", label: "Offer declined" },
  { id: "candidate_hired", label: "Candidate hired" },
  { id: "candidate_archived", label: "Candidate archived" }
];

const communicationDelayOptions = [
  { value: 0, label: "Immediately" },
  { value: 15, label: "15 minutes" },
  { value: 60, label: "1 hour" },
  { value: 1440, label: "1 day" },
  { value: 4320, label: "3 days" }
];

const defaultSenderAccounts = [
  {
    id: "sender-bright-harbor-hr",
    name: "Bright Harbor HR",
    email: "hr@brightharbor.org",
    reply_to: "hr@brightharbor.org",
    provider: "outlook_dns",
    status: "active",
    dns_status: "pending"
  }
];

const defaultCommunicationTemplates = [
  {
    id: "tmpl-application-received",
    name: "Application received",
    subject: "We received your application for {{job_title}}",
    body:
      "Hello {{candidate_name}},\n\nThank you for applying for {{job_title}} at {{company_name}}. Our hiring team has received your application and will review your experience soon.\n\nIf your background aligns with the role, {{recruiter_name}} will contact you with next steps.\n\nThank you,\n{{company_name}} Careers",
    category: "Application",
    status: "active",
    archived_at: ""
  },
  {
    id: "tmpl-interview-stage",
    name: "Interview stage follow-up",
    subject: "Next steps for {{job_title}}",
    body:
      "Hello {{candidate_name}},\n\nWe are glad to move you forward for {{job_title}}. The next step is an interview with our team.\n\nInterview timing: {{interview_date_time}}\n\nPlease reply to {{reply_to}} with any scheduling questions.\n\nThank you,\n{{recruiter_name}}",
    category: "Interview",
    status: "active",
    archived_at: ""
  },
  {
    id: "tmpl-offer-sent",
    name: "Offer sent",
    subject: "Offer details for {{job_title}}",
    body:
      "Hello {{candidate_name}},\n\nWe are excited to share offer details for {{job_title}} with {{company_name}}.\n\n{{offer_details}}\n\nPlease review and reply to {{reply_to}} with any questions.\n\nWarmly,\n{{recruiter_name}}",
    category: "Offer",
    status: "active",
    archived_at: ""
  },
  {
    id: "tmpl-status-update",
    name: "Candidate status update",
    subject: "Update from {{company_name}} Careers",
    body:
      "Hello {{candidate_name}},\n\nThank you for your interest in {{job_title}}. We wanted to share that your current application stage is {{application_stage}}.\n\nWe appreciate your time and interest in {{company_name}}.\n\nThank you,\n{{company_name}} Careers",
    category: "Status update",
    status: "active",
    archived_at: ""
  }
];

const defaultAutomationRules = [
  {
    id: "rule-application-received",
    name: "Application confirmation",
    trigger_event: "candidate_applies",
    pipeline_stage: "",
    template_id: "tmpl-application-received",
    sender_account_id: "sender-bright-harbor-hr",
    sender_email: "hr@brightharbor.org",
    reply_to: "hr@brightharbor.org",
    delay_minutes: 0,
    status: "active",
    action_type: "send_email",
    action_config: { actions: ["send_email"] }
  },
  {
    id: "rule-interview-stage",
    name: "Interview stage message",
    trigger_event: "candidate_stage_changed",
    pipeline_stage: "interview",
    template_id: "tmpl-interview-stage",
    sender_account_id: "sender-bright-harbor-hr",
    sender_email: "hr@brightharbor.org",
    reply_to: "hr@brightharbor.org",
    delay_minutes: 15,
    status: "active",
    action_type: "send_email",
    action_config: { actions: ["send_email"] }
  }
];

const demoDepartments = [
  { id: "dept-people", name: "People Operations", parent_id: null, status: "active" },
  { id: "dept-recruiting", name: "Recruiting", parent_id: "dept-people", status: "active" },
  { id: "dept-client", name: "Client Experience", parent_id: null, status: "active" },
  { id: "dept-analytics", name: "Analytics", parent_id: null, status: "active" },
  { id: "dept-clinical", name: "Clinical Services", parent_id: null, status: "active" },
  { id: "dept-programs", name: "Program Coordination", parent_id: "dept-clinical", status: "active" }
];

const demoJobs = [
  {
    id: "job-101",
    title: "Senior Talent Partner",
    department_id: "dept-people",
    subdepartment_id: "dept-recruiting",
    department: "People Operations",
    subdepartment: "Recruiting",
    location: "Boston, MA",
    work_type: "Full Time",
    status: "published",
    hiring_manager: "Maya Rivera",
    summary:
      "Lead recruiting strategy for clinical and operations roles while building a thoughtful candidate experience across every touchpoint.",
    salary_range: "$96k - $118k",
    review_days: 5,
    remote: true,
    skills: ["Recruiting strategy", "ATS operations", "Stakeholder management"],
    applicants: 18,
    interviews: 5,
    posted_at: "2026-07-15"
  },
  {
    id: "job-102",
    title: "Client Success Manager",
    department_id: "dept-client",
    subdepartment_id: null,
    department: "Client Experience",
    subdepartment: "",
    location: "Providence, RI",
    work_type: "Full Time",
    status: "published",
    hiring_manager: "Noah Chen",
    summary:
      "Support employer partners, track service quality, and turn hiring insights into smoother client operations.",
    salary_range: "$74k - $88k",
    review_days: 4,
    remote: false,
    skills: ["Account management", "Reporting", "Hiring operations"],
    applicants: 24,
    interviews: 7,
    posted_at: "2026-07-18"
  },
  {
    id: "job-103",
    title: "Workforce Data Analyst",
    department_id: "dept-analytics",
    subdepartment_id: null,
    department: "Analytics",
    subdepartment: "",
    location: "Remote",
    work_type: "Full Time",
    status: "published",
    hiring_manager: "Priya Shah",
    summary:
      "Build dashboards for recruiting funnels, capacity planning, and equitable hiring outcomes across the organization.",
    salary_range: "$90k - $110k",
    review_days: 6,
    remote: true,
    skills: ["SQL", "Dashboarding", "People analytics"],
    applicants: 31,
    interviews: 6,
    posted_at: "2026-07-11"
  },
  {
    id: "job-104",
    title: "Clinical Program Coordinator",
    department_id: "dept-clinical",
    subdepartment_id: "dept-programs",
    department: "Clinical Services",
    subdepartment: "Program Coordination",
    location: "New Haven, CT",
    work_type: "Part Time",
    status: "published",
    hiring_manager: "Elena Brooks",
    summary:
      "Coordinate candidate onboarding, licensing milestones, and program staffing for a growing clinical team.",
    salary_range: "$38 - $44/hr",
    review_days: 3,
    remote: false,
    skills: ["Program coordination", "Licensing", "Scheduling"],
    applicants: 12,
    interviews: 3,
    posted_at: "2026-07-21"
  },
  {
    id: "job-105",
    title: "HR Systems Administrator",
    department_id: "dept-people",
    subdepartment_id: null,
    department: "People Operations",
    subdepartment: "",
    location: "Hybrid",
    work_type: "Full Time",
    status: "draft",
    hiring_manager: "Avery Stone",
    summary:
      "Configure HR systems, maintain permissions, and keep recruiting data clean across integrations.",
    salary_range: "$86k - $103k",
    review_days: 5,
    remote: true,
    skills: ["System admin", "Data hygiene", "Compliance"],
    applicants: 0,
    interviews: 0,
    posted_at: "2026-07-29"
  }
];

const demoApplications = [
  {
    id: "app-201",
    job_id: "job-101",
    full_name: "Jordan Ellis",
    email: "jordan.ellis@example.com",
    status: "screening",
    score: 86,
    source: "Referral",
    applied_at: "2026-07-22",
    recruiter: "Sam Lee"
  },
  {
    id: "app-202",
    job_id: "job-102",
    full_name: "Amara Okafor",
    email: "amara.okafor@example.com",
    status: "interview",
    score: 91,
    source: "LinkedIn",
    applied_at: "2026-07-20",
    recruiter: "Sam Lee"
  },
  {
    id: "app-203",
    job_id: "job-103",
    full_name: "Miles Bennett",
    email: "miles.bennett@example.com",
    status: "new",
    score: 78,
    source: "Career site",
    applied_at: "2026-07-27",
    recruiter: "Rina Patel"
  },
  {
    id: "app-204",
    job_id: "job-101",
    full_name: "Sophia Nguyen",
    email: "sophia.nguyen@example.com",
    status: "offer",
    score: 94,
    source: "Indeed",
    applied_at: "2026-07-16",
    recruiter: "Rina Patel"
  },
  {
    id: "app-205",
    job_id: "job-104",
    full_name: "Ethan Murphy",
    email: "ethan.murphy@example.com",
    status: "screening",
    score: 82,
    source: "Career site",
    applied_at: "2026-07-25",
    recruiter: "Sam Lee"
  }
];

const demoCommunications = [
  {
    id: "comm-301",
    application_id: "app-201",
    job_id: "job-101",
    candidate_name: "Jordan Ellis",
    candidate_email: "jordan.ellis@example.com",
    template_id: "tmpl-application-received",
    automation_rule_id: "rule-application-received",
    trigger_event: "candidate_applies",
    direction: "outbound",
    send_type: "automated",
    subject: "We received your application for Senior Talent Partner",
    body:
      "Hello Jordan Ellis,\n\nThank you for applying for Senior Talent Partner at Bright Harbor. Our hiring team has received your application and will review your experience soon.\n\nIf your background aligns with the role, Sam Lee will contact you with next steps.\n\nThank you,\nBright Harbor Careers",
    sender_email: "hr@brightharbor.org",
    reply_to: "hr@brightharbor.org",
    status: "sent",
    delivery_status: "sent",
    created_at: "2026-07-22T14:30:00.000Z",
    queued_at: "2026-07-22T14:30:00.000Z",
    sent_at: "2026-07-22T14:31:00.000Z",
    send_after: "2026-07-22T14:30:00.000Z",
    error_message: ""
  },
  {
    id: "comm-302",
    application_id: "app-202",
    job_id: "job-102",
    candidate_name: "Amara Okafor",
    candidate_email: "amara.okafor@example.com",
    template_id: "tmpl-interview-stage",
    automation_rule_id: "rule-interview-stage",
    trigger_event: "candidate_stage_changed",
    direction: "outbound",
    send_type: "automated",
    subject: "Next steps for Client Success Manager",
    body:
      "Hello Amara Okafor,\n\nWe are glad to move you forward for Client Success Manager. The next step is an interview with our team.\n\nInterview timing: Scheduling to be confirmed\n\nPlease reply to hr@brightharbor.org with any scheduling questions.\n\nThank you,\nSam Lee",
    sender_email: "hr@brightharbor.org",
    reply_to: "hr@brightharbor.org",
    status: "queued",
    delivery_status: "queued",
    created_at: "2026-07-20T16:20:00.000Z",
    queued_at: "2026-07-20T16:20:00.000Z",
    sent_at: "",
    send_after: "2026-07-20T16:35:00.000Z",
    error_message: ""
  }
];

const initialProfile = readLocalProfile();

const state = {
  currentView: "landing",
  jobs: [...demoJobs],
  applications: [...demoApplications],
  selectedJobId: "job-101",
  role: initialProfile.role,
  hrSection: "jobs",
  settingsSection: "departments",
  hrJobQuery: "",
  jobCreateOpen: false,
  session: readInitialSession(),
  profile: initialProfile,
  boardSettings: readLocalBoardSettings(),
  departments: readLocalDepartments(),
  pipelineSettings: readLocalPipelineSettings(),
  communicationTemplates: readLocalCommunicationTemplates(),
  automationRules: readLocalAutomationRules(),
  senderAccounts: readLocalSenderAccounts(),
  communications: readLocalCommunications(),
  selectedTemplateId: "",
  selectedAutomationRuleId: "",
  selectedCandidateId: demoApplications[0]?.id || "",
  candidateProfileTab: "communications",
  communicationQuery: "",
  manualTemplateId: "",
  manualSubject: "",
  manualBody: "",
  jobDetailOpen: false,
  applicationOpen: false,
  filters: {
    query: "",
    department: "All",
    location: "All",
    status: "All"
  }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function supabaseHeaders(prefer = "return=representation", useAuth = false) {
  const bearer = useAuth && state.session?.accessToken ? state.session.accessToken : env.supabaseAnonKey;
  const headers = {
    apikey: env.supabaseAnonKey,
    Authorization: `Bearer ${bearer}`,
    "Content-Type": "application/json"
  };
  if (prefer) headers.Prefer = prefer;
  return headers;
}

async function supabaseSelect(table, params, useAuth = false) {
  const url = `${env.supabaseUrl}/rest/v1/${table}?${params}`;
  const response = await fetch(url, { headers: supabaseHeaders("", useAuth) });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

async function supabaseInsert(table, payload, useAuth = false) {
  const response = await fetch(`${env.supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: supabaseHeaders("return=representation", useAuth),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

async function supabasePatch(table, query, payload, useAuth = false) {
  const response = await fetch(`${env.supabaseUrl}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: supabaseHeaders("return=representation", useAuth),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

async function supabaseDelete(table, query, useAuth = false) {
  const response = await fetch(`${env.supabaseUrl}/rest/v1/${table}?${query}`, {
    method: "DELETE",
    headers: supabaseHeaders("return=representation", useAuth)
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

async function supabaseUpsert(table, payload, useAuth = false, onConflict = "id") {
  const response = await fetch(`${env.supabaseUrl}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
    method: "POST",
    headers: supabaseHeaders("resolution=merge-duplicates,return=representation", useAuth),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

function normalizeBoardSettings(settings = {}) {
  const overlayValue = Number(settings.overlay_opacity ?? defaultBoardSettings.overlay_opacity);
  const overlay_opacity = Math.min(80, Math.max(20, Number.isFinite(overlayValue) ? overlayValue : 55));
  return {
    ...defaultBoardSettings,
    ...settings,
    hero_image_url: String(settings.hero_image_url || defaultBoardSettings.hero_image_url).trim(),
    hero_eyebrow: String(settings.hero_eyebrow || defaultBoardSettings.hero_eyebrow).trim(),
    hero_title: String(settings.hero_title || defaultBoardSettings.hero_title).trim(),
    hero_subtitle: String(settings.hero_subtitle || defaultBoardSettings.hero_subtitle).trim(),
    overlay_opacity
  };
}

function readLocalBoardSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("bhc-board-settings") || "null");
    return normalizeBoardSettings(saved || defaultBoardSettings);
  } catch (error) {
    return normalizeBoardSettings(defaultBoardSettings);
  }
}

function saveLocalBoardSettings(settings) {
  try {
    localStorage.setItem("bhc-board-settings", JSON.stringify(settings));
  } catch (error) {
    return;
  }
}

function normalizePipelineSettings(settings = {}) {
  const sourceStages = settings.stages || settings;
  const stages = pipelineStages.reduce((labels, stage) => {
    const value = String(sourceStages?.[stage] || "").trim();
    return {
      ...labels,
      [stage]: value || defaultPipelineLabels[stage]
    };
  }, {});

  return {
    id: "default",
    stages
  };
}

function readLocalPipelineSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("bhc-pipeline-settings") || "null");
    return normalizePipelineSettings(saved || { stages: defaultPipelineLabels });
  } catch (error) {
    return normalizePipelineSettings({ stages: defaultPipelineLabels });
  }
}

function saveLocalPipelineSettings(settings) {
  try {
    localStorage.setItem("bhc-pipeline-settings", JSON.stringify(settings));
  } catch (error) {
    return;
  }
}

function pipelineLabels() {
  return state.pipelineSettings?.stages || defaultPipelineLabels;
}

function pipelineEntries() {
  const labels = pipelineLabels();
  return pipelineStages.map((stage) => [stage, labels[stage] || defaultPipelineLabels[stage]]);
}

function pipelineLabel(stage) {
  return pipelineLabels()[stage] || formatStatus(stage);
}

function normalizeDepartment(department = {}) {
  return {
    id: String(department.id || `dept-${Date.now()}`),
    name: String(department.name || "").trim(),
    parent_id: department.parent_id || null,
    status: department.status || "active"
  };
}

function normalizeDepartments(departments = []) {
  return departments
    .map(normalizeDepartment)
    .filter((department) => department.id && department.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function readLocalDepartments() {
  try {
    const saved = JSON.parse(localStorage.getItem("bhc-departments") || "null");
    return normalizeDepartments(Array.isArray(saved) && saved.length ? saved : demoDepartments);
  } catch (error) {
    return normalizeDepartments(demoDepartments);
  }
}

function saveLocalDepartments(departments) {
  try {
    localStorage.setItem("bhc-departments", JSON.stringify(departments));
  } catch (error) {
    return;
  }
}

function normalizeProfile(profile = {}) {
  const role = roleProfiles[profile.role] ? profile.role : "recruiter";
  return {
    full_name: String(profile.full_name || "").trim(),
    email: String(profile.email || "").trim(),
    title: String(profile.title || "").trim(),
    department: String(profile.department || "").trim(),
    avatar_url: String(profile.avatar_url || "").trim(),
    role
  };
}

function readLocalProfile() {
  try {
    return normalizeProfile(JSON.parse(localStorage.getItem("bhc-profile") || "null") || {});
  } catch (error) {
    return normalizeProfile({});
  }
}

function saveLocalProfile(profile) {
  try {
    localStorage.setItem("bhc-profile", JSON.stringify(profile));
  } catch (error) {
    return;
  }
}

function newClientId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeCommunicationTemplate(template = {}) {
  return {
    id: String(template.id || newClientId("tmpl")),
    name: String(template.name || "").trim(),
    subject: String(template.subject || "").trim(),
    body: String(template.body || "").trim(),
    category: String(template.category || "General").trim() || "General",
    status: template.status === "inactive" ? "inactive" : "active",
    archived_at: template.archived_at || "",
    created_at: template.created_at || "",
    updated_at: template.updated_at || ""
  };
}

function normalizeCommunicationTemplates(templates = []) {
  return templates
    .map(normalizeCommunicationTemplate)
    .filter((template) => template.id && template.name)
    .sort((a, b) => {
      if (Boolean(a.archived_at) !== Boolean(b.archived_at)) return a.archived_at ? 1 : -1;
      return a.name.localeCompare(b.name);
    });
}

function readLocalCommunicationTemplates() {
  try {
    const saved = JSON.parse(localStorage.getItem("bhc-communication-templates") || "null");
    return normalizeCommunicationTemplates(Array.isArray(saved) && saved.length ? saved : defaultCommunicationTemplates);
  } catch (error) {
    return normalizeCommunicationTemplates(defaultCommunicationTemplates);
  }
}

function saveLocalCommunicationTemplates(templates) {
  try {
    localStorage.setItem("bhc-communication-templates", JSON.stringify(templates));
  } catch (error) {
    return;
  }
}

function normalizeSenderAccount(account = {}) {
  return {
    id: String(account.id || newClientId("sender")),
    name: String(account.name || "Company email").trim(),
    email: String(account.email || "hr@brightharbor.org").trim(),
    reply_to: String(account.reply_to || account.email || "hr@brightharbor.org").trim(),
    provider: String(account.provider || "outlook_dns").trim(),
    status: account.status === "inactive" ? "inactive" : "active",
    dns_status: String(account.dns_status || "pending").trim(),
    created_at: account.created_at || "",
    updated_at: account.updated_at || ""
  };
}

function normalizeSenderAccounts(accounts = []) {
  return accounts
    .map(normalizeSenderAccount)
    .filter((account) => account.id && account.email)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function readLocalSenderAccounts() {
  try {
    const saved = JSON.parse(localStorage.getItem("bhc-sender-accounts") || "null");
    return normalizeSenderAccounts(Array.isArray(saved) && saved.length ? saved : defaultSenderAccounts);
  } catch (error) {
    return normalizeSenderAccounts(defaultSenderAccounts);
  }
}

function saveLocalSenderAccounts(accounts) {
  try {
    localStorage.setItem("bhc-sender-accounts", JSON.stringify(accounts));
  } catch (error) {
    return;
  }
}

function normalizeAutomationRule(rule = {}) {
  const trigger = communicationTriggerEvents.some((event) => event.id === rule.trigger_event)
    ? rule.trigger_event
    : "candidate_applies";
  const delay = Number(rule.delay_minutes || 0);
  return {
    id: String(rule.id || newClientId("rule")),
    name: String(rule.name || "").trim(),
    trigger_event: trigger,
    pipeline_stage: pipelineStages.includes(rule.pipeline_stage || rule.stage) ? rule.pipeline_stage || rule.stage : "",
    template_id: String(rule.template_id || ""),
    sender_account_id: String(rule.sender_account_id || defaultSenderAccounts[0].id),
    sender_email: String(rule.sender_email || defaultSenderAccounts[0].email).trim(),
    reply_to: String(rule.reply_to || rule.sender_email || defaultSenderAccounts[0].reply_to).trim(),
    delay_minutes: Number.isFinite(delay) && delay > 0 ? delay : 0,
    status: rule.status === "inactive" ? "inactive" : "active",
    action_type: String(rule.action_type || "send_email").trim(),
    action_config: rule.action_config || { actions: ["send_email"] },
    created_at: rule.created_at || "",
    updated_at: rule.updated_at || ""
  };
}

function normalizeAutomationRules(rules = []) {
  return rules
    .map(normalizeAutomationRule)
    .filter((rule) => rule.id && rule.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function readLocalAutomationRules() {
  try {
    const saved = JSON.parse(localStorage.getItem("bhc-automation-rules") || "null");
    return normalizeAutomationRules(Array.isArray(saved) && saved.length ? saved : defaultAutomationRules);
  } catch (error) {
    return normalizeAutomationRules(defaultAutomationRules);
  }
}

function saveLocalAutomationRules(rules) {
  try {
    localStorage.setItem("bhc-automation-rules", JSON.stringify(rules));
  } catch (error) {
    return;
  }
}

function normalizeCommunication(record = {}) {
  const createdAt = record.created_at || new Date().toISOString();
  return {
    id: String(record.id || newClientId("comm")),
    application_id: String(record.application_id || ""),
    job_id: String(record.job_id || ""),
    candidate_name: String(record.candidate_name || "").trim(),
    candidate_email: String(record.candidate_email || record.to || "").trim(),
    template_id: String(record.template_id || ""),
    automation_rule_id: String(record.automation_rule_id || ""),
    trigger_event: String(record.trigger_event || "manual_send").trim(),
    direction: String(record.direction || "outbound").trim(),
    send_type: String(record.send_type || "manual").trim(),
    subject: String(record.subject || "").trim(),
    body: String(record.body || "").trim(),
    sender_email: String(record.sender_email || record.from || defaultSenderAccounts[0].email).trim(),
    reply_to: String(record.reply_to || defaultSenderAccounts[0].reply_to).trim(),
    status: String(record.status || "queued").trim(),
    delivery_status: String(record.delivery_status || record.status || "queued").trim(),
    provider: String(record.provider || "resend").trim(),
    provider_message_id: String(record.provider_message_id || "").trim(),
    error_message: String(record.error_message || "").trim(),
    queued_at: record.queued_at || createdAt,
    send_after: record.send_after || record.queued_at || createdAt,
    sent_at: record.sent_at || "",
    delay_minutes: Number(record.delay_minutes || 0),
    created_at: createdAt
  };
}

function normalizeCommunications(records = []) {
  return records
    .map(normalizeCommunication)
    .filter((record) => record.id && record.subject)
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

function readLocalCommunications() {
  try {
    const saved = JSON.parse(localStorage.getItem("bhc-communications") || "null");
    return normalizeCommunications(Array.isArray(saved) && saved.length ? saved : demoCommunications);
  } catch (error) {
    return normalizeCommunications(demoCommunications);
  }
}

function saveLocalCommunications(records) {
  try {
    localStorage.setItem("bhc-communications", JSON.stringify(records));
  } catch (error) {
    return;
  }
}

function numberOrNull(value) {
  const number = Number(String(value || "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(number) && number > 0 ? number : null;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function normalizeSalaryValues(min, max) {
  if (min && max && max < min) return [max, min];
  return [min, max];
}

function buildSalaryRange(min, max) {
  [min, max] = normalizeSalaryValues(min, max);
  if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  if (min) return `From ${formatCurrency(min)}`;
  if (max) return `Up to ${formatCurrency(max)}`;
  return "Shared during screening";
}

function parseKeywords(value) {
  if (Array.isArray(value)) {
    return value.map((keyword) => String(keyword).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(/[,\n]/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function summarizeText(value) {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  if (!clean) return "";
  return clean.length > 180 ? `${clean.slice(0, 177).trim()}...` : clean;
}

function renderTextBlock(value, fallback) {
  const lines = String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return `<p class="summary">${escapeHtml(fallback)}</p>`;
  return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

function renderEmailBody(value) {
  return renderTextBlock(value, "No message content recorded.");
}

function formatDateTime(value) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function communicationTriggerLabel(trigger) {
  return communicationTriggerEvents.find((event) => event.id === trigger)?.label || formatStatus(trigger);
}

function communicationDelayLabel(minutes) {
  const option = communicationDelayOptions.find((item) => item.value === Number(minutes));
  if (option) return option.label;
  return minutes ? `${minutes} minutes` : "Immediately";
}

function activeCommunicationTemplates() {
  return state.communicationTemplates.filter((template) => !template.archived_at);
}

function communicationTemplateById(id) {
  return state.communicationTemplates.find((template) => template.id === id) || null;
}

function senderAccountById(id) {
  return state.senderAccounts.find((account) => account.id === id) || state.senderAccounts[0] || defaultSenderAccounts[0];
}

function applicationById(id) {
  return state.applications.find((application) => application.id === id) || null;
}

function jobById(id) {
  return state.jobs.find((job) => job.id === id) || null;
}

function communicationContext(application = {}, details = {}) {
  const job = jobById(application.job_id) || {};
  const sender = details.sender || senderAccountById(details.sender_account_id);
  return {
    candidate_name: application.full_name || details.candidate_name || "Candidate",
    candidate_email: application.email || details.candidate_email || "",
    job_title: job.title || details.job_title || "the role",
    department: job.department || details.department || "Bright Harbor",
    job_location: job.location || details.job_location || "Location to be confirmed",
    company_name: details.company_name || "Bright Harbor",
    recruiter_name: application.recruiter || state.profile.full_name || profileDisplayName(),
    hiring_manager: job.hiring_manager || details.hiring_manager || "Hiring team",
    application_stage: pipelineLabel(application.status || details.application_stage || "new"),
    interview_date_time: details.interview_date_time || "Scheduling to be confirmed",
    offer_details: details.offer_details || job.salary_range || "Offer details will be shared by the hiring team.",
    sender_email: details.sender_email || sender.email,
    reply_to: details.reply_to || sender.reply_to || sender.email
  };
}

function renderTemplateString(value, context) {
  return String(value || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(context, key) ? context[key] : match
  );
}

function profileDisplayName() {
  return state.profile.full_name || state.session?.email || state.profile.email || "Hiring Team";
}

function profileInitials() {
  const source = profileDisplayName();
  const parts = source.includes("@") ? source.split("@")[0].split(/[._-]+/) : source.split(/\s+/);
  return parts
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "BH";
}

function activeDepartments() {
  return state.departments.filter((department) => department.status === "active");
}

function parentDepartments() {
  return activeDepartments()
    .filter((department) => !department.parent_id)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function childDepartments(parentId) {
  return activeDepartments()
    .filter((department) => department.parent_id === parentId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function getDepartmentById(id) {
  return activeDepartments().find((department) => department.id === id) || null;
}

function findParentDepartmentForJob(job) {
  const byId = getDepartmentById(job.department_id);
  if (byId && !byId.parent_id) return byId;

  const byName = parentDepartments().find((department) => department.name === job.department);
  if (byName) return byName;

  return job.department
    ? { id: `legacy-${job.department}`, name: job.department, parent_id: null, status: "active" }
    : null;
}

function findSubdepartmentForJob(job) {
  return getDepartmentById(job.subdepartment_id) || null;
}

async function loadSupabaseData() {
  if (!hasSupabase) return;

  try {
    await loadJobBoardSettings();
    await loadDepartments();
    if (state.session?.accessToken) await loadPipelineSettings();

    let jobs = [];
    try {
      jobs = await supabaseSelect(
        "jobs",
        "select=id,title,department,department_id,subdepartment,subdepartment_id,location,work_type,status,hiring_manager,summary,salary_range,salary_min,salary_max,job_description,requirements,benefits,seo_title,seo_description,seo_keywords,review_days,remote,skills,posted_at&order=posted_at.desc"
      );
    } catch (error) {
      try {
        jobs = await supabaseSelect(
          "jobs",
          "select=id,title,department,department_id,subdepartment,subdepartment_id,location,work_type,status,hiring_manager,summary,salary_range,review_days,remote,skills,posted_at&order=posted_at.desc"
        );
      } catch (fallbackError) {
        jobs = await supabaseSelect(
          "jobs",
          "select=id,title,department,location,work_type,status,hiring_manager,summary,salary_range,review_days,remote,skills,posted_at&order=posted_at.desc"
        );
      }
    }
    setConnection(true, "Supabase connected");

    if (Array.isArray(jobs) && jobs.length) {
      state.jobs = jobs.map((job) => ({
        ...job,
        job_description: job.job_description || job.summary || "",
        requirements: job.requirements || "",
        benefits: job.benefits || "",
        seo_keywords: parseKeywords(job.seo_keywords || job.skills || []),
        skills: Array.isArray(job.skills) ? job.skills : parseKeywords(job.skills),
        applicants: demoApplications.filter((application) => application.job_id === job.id).length,
        interviews: demoApplications.filter(
          (application) => application.job_id === job.id && application.status === "interview"
        ).length
      }));
      state.selectedJobId = state.jobs.find((job) => job.status === "published")?.id || state.jobs[0].id;
      setConnection(true, "Supabase public data");
    }

    if (state.session?.accessToken) {
      const applications = await supabaseSelect(
        "applications",
        "select=id,job_id,full_name,email,status,score,source,applied_at&order=applied_at.desc",
        true
      );
      if (Array.isArray(applications)) {
        state.applications = applications.map((application) => ({
          ...application,
          applied_at: application.applied_at?.slice(0, 10),
          recruiter: "Assigned"
        }));
        setConnection(true, "Supabase HR connected");
      }
      await loadCommunicationData();
      await loadCurrentProfile();
    }
  } catch (error) {
    setConnection(Boolean(state.session?.accessToken), state.session?.accessToken ? "HR session limited" : "Demo data");
  }
}

async function loadCurrentProfile() {
  if (!state.session?.userId) return;

  try {
    let profiles = [];
    try {
      profiles = await supabaseSelect(
        "profiles",
        `select=full_name,email,role,title,department,avatar_url&id=eq.${encodeURIComponent(state.session.userId)}&limit=1`,
        true
      );
    } catch (error) {
      profiles = await supabaseSelect(
        "profiles",
        `select=full_name,email,role,title,department&id=eq.${encodeURIComponent(state.session.userId)}&limit=1`,
        true
      );
    }

    if (profiles[0]) {
      state.profile = normalizeProfile({ ...state.profile, ...profiles[0] });
      state.role = state.profile.role;
      saveLocalProfile(state.profile);
    }
  } catch (error) {
    return;
  }
}

async function loadDepartments() {
  try {
    const departments = await supabaseSelect(
      "departments",
      "select=id,name,parent_id,status&order=name.asc"
    );
    if (Array.isArray(departments) && departments.length) {
      state.departments = normalizeDepartments(departments);
      saveLocalDepartments(state.departments);
    }
  } catch (error) {
    return;
  }
}

async function loadJobBoardSettings() {
  try {
    const [settings] = await supabaseSelect(
      "job_board_settings",
      "select=id,hero_image_url,hero_eyebrow,hero_title,hero_subtitle,overlay_opacity&id=eq.default&limit=1"
    );
    if (settings) {
      state.boardSettings = normalizeBoardSettings(settings);
      saveLocalBoardSettings(state.boardSettings);
    }
  } catch (error) {
    return;
  }
}

async function loadPipelineSettings() {
  try {
    const [settings] = await supabaseSelect(
      "pipeline_settings",
      "select=id,stages&limit=1",
      true
    );
    if (settings) {
      state.pipelineSettings = normalizePipelineSettings(settings);
      saveLocalPipelineSettings(state.pipelineSettings);
    }
  } catch (error) {
    return;
  }
}

async function loadCommunicationData() {
  if (!hasSupabase || !state.session?.accessToken) return;

  try {
    const [templates, rules, accounts, communications] = await Promise.all([
      supabaseSelect(
        "communication_templates",
        "select=id,name,subject,body,category,status,archived_at,created_at,updated_at&order=name.asc",
        true
      ),
      supabaseSelect(
        "automation_rules",
        "select=id,name,trigger_event,pipeline_stage,template_id,sender_account_id,sender_email,reply_to,delay_minutes,status,action_type,action_config,created_at,updated_at&order=name.asc",
        true
      ),
      supabaseSelect(
        "sender_accounts",
        "select=id,name,email,reply_to,provider,status,dns_status,created_at,updated_at&order=name.asc",
        true
      ),
      supabaseSelect(
        "communication_events",
        "select=id,application_id,job_id,candidate_name,candidate_email,template_id,automation_rule_id,trigger_event,direction,send_type,subject,body,sender_email,reply_to,status,delivery_status,provider,provider_message_id,error_message,queued_at,send_after,sent_at,created_at&order=created_at.desc&limit=500",
        true
      )
    ]);

    if (Array.isArray(templates) && templates.length) {
      state.communicationTemplates = normalizeCommunicationTemplates(templates);
      saveLocalCommunicationTemplates(state.communicationTemplates);
    }
    if (Array.isArray(rules) && rules.length) {
      state.automationRules = normalizeAutomationRules(rules);
      saveLocalAutomationRules(state.automationRules);
    }
    if (Array.isArray(accounts) && accounts.length) {
      state.senderAccounts = normalizeSenderAccounts(accounts);
      saveLocalSenderAccounts(state.senderAccounts);
    }
    if (Array.isArray(communications)) {
      state.communications = normalizeCommunications(communications);
      saveLocalCommunications(state.communications);
    }
  } catch (error) {
    return;
  }
}

function readInitialSession() {
  const hashParams = new URLSearchParams(location.hash.startsWith("#") ? location.hash.slice(1) : "");
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");

  if (accessToken) {
    const session = {
      accessToken,
      refreshToken,
      email: "",
      expiresAt: hashParams.get("expires_at") || ""
    };
    sessionStorage.setItem("bhc-session", JSON.stringify(session));
    history.replaceState(null, "", "#hr");
    return session;
  }

  try {
    return JSON.parse(sessionStorage.getItem("bhc-session") || "null");
  } catch (error) {
    return null;
  }
}

function saveSession(session) {
  state.session = session;
  if (session) sessionStorage.setItem("bhc-session", JSON.stringify(session));
  else sessionStorage.removeItem("bhc-session");
}

async function refreshCurrentUser() {
  if (!hasSupabase || !state.session?.accessToken) return;

  const response = await fetch(`${env.supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: env.supabaseAnonKey,
      Authorization: `Bearer ${state.session.accessToken}`
    }
  });

  if (!response.ok) {
    saveSession(null);
    return;
  }

  const user = await response.json();
  saveSession({ ...state.session, userId: user.id || state.session.userId || "", email: user.email || state.session.email || "" });
  state.profile = normalizeProfile({
    ...state.profile,
    email: user.email || state.profile.email,
    full_name: state.profile.full_name || user.user_metadata?.full_name || ""
  });
  saveLocalProfile(state.profile);
}

function setConnection(isLive, label) {
  const status = $("#connectionStatus");
  status.classList.toggle("is-live", isLive);
  $("span:last-child", status).textContent = label;
}

function showView(view, updateHash = true) {
  const targetView = view === "hr" && !state.session?.accessToken ? "login" : view;
  state.currentView = targetView;

  $$(".view").forEach((section) => section.classList.remove("is-active"));
  $(`#${targetView}View`)?.classList.add("is-active");

  $$(".tab").forEach((tab) => {
    const tabView = tab.dataset.view;
    const isActive =
      tabView === targetView ||
      (targetView === "hr" && tabView === "login");
    tab.classList.toggle("is-active", isActive);
  });

  if (updateHash) {
    history.replaceState(null, "", `#${targetView}`);
  }
}

function uniqueOptions(field, sourceJobs = state.jobs) {
  return ["All", ...new Set(sourceJobs.map((job) => job[field]).filter(Boolean))];
}

function populateFilters() {
  const publishedJobs = state.jobs.filter((job) => job.status === "published");
  fillSelect($("#departmentFilter"), uniqueOptions("department", publishedJobs), state.filters.department);
  fillSelect($("#locationFilter"), uniqueOptions("location", publishedJobs), state.filters.location);
  fillSelect($("#statusFilter"), uniqueOptions("work_type", publishedJobs), state.filters.status);
}

function fillSelect(select, options, selected) {
  select.innerHTML = options
    .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
    .join("");
  select.value = options.includes(selected) ? selected : "All";
}

function filteredJobs() {
  const query = state.filters.query.trim().toLowerCase();
  return state.jobs
    .filter((job) => {
      if (job.status !== "published") return false;
      const matchesQuery =
        !query ||
        [
          job.title,
          job.department,
          job.location,
          job.summary,
          job.job_description,
          job.requirements,
          job.benefits,
          job.seo_title,
          job.seo_description,
          ...(job.skills || []),
          ...parseKeywords(job.seo_keywords)
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesDepartment =
        state.filters.department === "All" || job.department === state.filters.department;
      const matchesLocation = state.filters.location === "All" || job.location === state.filters.location;
      const matchesStatus = state.filters.status === "All" || job.work_type === state.filters.status;
      return matchesQuery && matchesDepartment && matchesLocation && matchesStatus;
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

function resetApplicantDrilldown() {
  state.jobDetailOpen = false;
  state.applicationOpen = false;
}

function sanitizeCssUrl(value) {
  return String(value || defaultBoardSettings.hero_image_url).replaceAll("\\", "").replaceAll('"', "").trim();
}

function renderJobBoardHero() {
  const settings = normalizeBoardSettings(state.boardSettings);
  const hero = $("#jobBoardHero");
  hero.style.setProperty("--job-board-hero-image", `url("${sanitizeCssUrl(settings.hero_image_url)}")`);
  hero.style.setProperty("--job-board-overlay", (settings.overlay_opacity / 100).toFixed(2));
  $("#jobBoardEyebrow").textContent = settings.hero_eyebrow;
  $("#applicantHeading").textContent = settings.hero_title;
  $("#jobBoardSubtitle").textContent = settings.hero_subtitle;
}

function departmentOpeningCounts() {
  const counts = new Map();
  state.jobs
    .filter((job) => job.status === "published")
    .forEach((job) => {
      const department = findParentDepartmentForJob(job);
      if (!department) return;
      counts.set(department.name, (counts.get(department.name) || 0) + 1);
    });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function renderDepartmentCards() {
  const cards = departmentOpeningCounts();
  const selected = state.filters.department;
  $("#departmentCards").innerHTML = cards.length
    ? cards
        .map(
          (department) => `
            <button class="department-filter-card${selected === department.name ? " is-selected" : ""}" type="button" data-department-card="${escapeHtml(department.name)}">
              <strong>${escapeHtml(department.name)}</strong>
              <span>${department.count} ${department.count === 1 ? "job" : "jobs"}</span>
            </button>
          `
        )
        .join("")
    : `<div class="empty-state compact">No departments have published openings yet.</div>`;
}

function renderApplicantPortal() {
  const jobs = filteredJobs();
  if (!jobs.some((job) => job.id === state.selectedJobId)) {
    state.selectedJobId = jobs[0]?.id || state.jobs.find((job) => job.status === "published")?.id;
    state.jobDetailOpen = false;
    state.applicationOpen = false;
  }

  renderJobBoardHero();
  renderDepartmentCards();
  $("#jobBoardCount").textContent = `${jobs.length} ${jobs.length === 1 ? "job" : "jobs"}`;

  const list = $("#jobList");
  if (!jobs.length) {
    list.innerHTML = `<div class="empty-state">No open roles match those filters.</div>`;
  } else {
    list.innerHTML = jobs.map(renderJobCard).join("");
  }

  const selectedJob = state.jobs.find((job) => job.id === state.selectedJobId);
  $("#jobDetail").innerHTML = selectedJob ? renderJobDetail(selectedJob) : renderNoJobDetail();
  $("#jobDetailPage").hidden = !state.jobDetailOpen || !selectedJob;
  $("#applicationPanel").hidden = !state.applicationOpen || !selectedJob;
}

function renderJobCard(job) {
  const selected = state.jobDetailOpen && job.id === state.selectedJobId ? " is-selected" : "";
  return `
    <article class="job-row${selected}">
      <div class="job-row-main">
        <h3>${escapeHtml(job.title)}</h3>
        <p>${escapeHtml(job.location)}</p>
      </div>
      <span class="job-row-status">${escapeHtml(job.work_type || "Full Time")}</span>
      <div class="job-row-action">
        <button class="primary-action small" type="button" data-apply-job="${escapeHtml(job.id)}">Apply</button>
      </div>
    </article>
  `;
}

function renderJobDetail(job) {
  const keywords = parseKeywords(job.seo_keywords);
  const skills = job.skills?.length ? job.skills : keywords;
  const subdepartment = findSubdepartmentForJob(job)?.name || job.subdepartment || "";
  const description = job.job_description || job.summary;
  const requirementsMarkup = job.requirements
    ? renderTextBlock(job.requirements, "")
    : `<ul>${
        skills.length
          ? skills.map((skill) => `<li>${escapeHtml(skill)}</li>`).join("")
          : "<li>Relevant experience, attention to detail, and a collaborative working style.</li>"
      }</ul>`;
  const benefitsMarkup = job.benefits
    ? renderTextBlock(job.benefits, "")
    : `<p>Bright Harbor offers a supportive team environment, thoughtful onboarding, and role-specific benefits shared during screening.</p>`;
  return `
    <header>
      <p class="eyebrow">Full job description</p>
      <h2>${escapeHtml(job.title)}</h2>
      <div class="job-meta">
        <span>${escapeHtml(job.department)}</span>
        ${subdepartment ? `<span>${escapeHtml(subdepartment)}</span>` : ""}
        <span>${escapeHtml(job.location)}</span>
        <span>${escapeHtml(job.work_type)}</span>
      </div>
    </header>
    ${job.summary && job.summary !== description ? `<p class="summary">${escapeHtml(job.summary)}</p>` : ""}
    <section class="description-block">
      <h3>Job Description</h3>
      ${renderTextBlock(description, "Details will be shared during screening.")}
    </section>
    <section class="description-block">
      <h3>Requirements</h3>
      ${requirementsMarkup}
    </section>
    <section class="description-block">
      <h3>Benefits</h3>
      ${benefitsMarkup}
    </section>
    <dl>
      <div>
        <dt>Compensation</dt>
        <dd>${escapeHtml(job.salary_range || "Shared during screening")}</dd>
      </div>
      <div>
        <dt>Review time</dt>
        <dd>${escapeHtml(String(job.review_days || 5))} days</dd>
      </div>
      <div>
        <dt>Hiring manager</dt>
        <dd>${escapeHtml(job.hiring_manager || "People team")}</dd>
      </div>
      <div>
        <dt>Remote</dt>
        <dd>${job.remote ? "Remote-friendly" : "On-site or hybrid"}</dd>
      </div>
    </dl>
    <div class="tag-row">
      ${[...new Set([...skills, ...keywords])].map((keyword) => `<span class="tag">${escapeHtml(keyword)}</span>`).join("")}
    </div>
  `;
}

function renderNoJobDetail() {
  return `<div class="empty-state">Select a published role to view details.</div>`;
}

function renderHrWorkspace() {
  renderHrSections();
  renderProfileMenu();
  renderJobsToolbar();
  renderSettingsSections();
  renderRoleCard();
  renderAuthPanel();
  syncRoleControls();
  populateJobDepartmentControls();
  renderJobDraftPreview();
  renderMetrics();
  renderJobsTable();
  renderCandidatesTable();
  renderCandidateProfile();
  renderPipeline();
  renderBoardSettingsForm();
  renderDepartmentSettings();
  renderPipelineSettingsForm();
  renderCommunicationSettings();
  renderProfileForm();
  renderPermissions();
  syncRoleControls();
}

function renderHrSections() {
  $$(".hr-menu-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.hrSection === state.hrSection);
  });
  $("#hrJobsSection").hidden = state.hrSection !== "jobs";
  $("#hrCandidatesSection").hidden = state.hrSection !== "candidates";
  $("#hrReportsSection").hidden = state.hrSection !== "reports";
  $("#hrSettingsSection").hidden = state.hrSection !== "settings";
  $("#hrProfileSection").hidden = state.hrSection !== "profile";
}

function renderProfileMenu() {
  const avatar = $("#profileAvatar");
  const photoUrl = state.profile.avatar_url;
  if (photoUrl) {
    avatar.innerHTML = `<img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(profileDisplayName())}">`;
  } else {
    avatar.textContent = profileInitials();
  }
}

function renderAuthPanel() {
  const signedIn = Boolean(state.session?.accessToken);
  const sessionMarkup = signedIn
    ? `
      <span class="status-pill">Signed in</span>
      <strong>${escapeHtml(state.session.email || "HR user")}</strong>
    `
    : "";

  $("#authUsernameField").hidden = signedIn;
  $("#authPasswordField").hidden = signedIn;
  $("#authForm button[type='submit']").hidden = signedIn;
  $("#showRequestAccount").hidden = signedIn;
  if (signedIn) {
    $("#requestAccountPanel").hidden = true;
    $("#showRequestAccount").textContent = "Request a Hiring Team Account";
  }
  $("#continueToWorkspace").hidden = !signedIn;
  $("#loginSessionPanel").hidden = !signedIn;
  $("#loginSessionPanel").innerHTML = sessionMarkup;
  $("#signOutButton").hidden = !signedIn;
  $("#hrSessionPanel").innerHTML = signedIn
    ? sessionMarkup
    : `<p class="summary">Sign in from the Hiring Team page to open this workspace.</p>`;
}

function syncRoleControls() {
  const canManageJobs = state.role === "recruiter" || state.role === "admin";
  const canManageBoard = state.role === "admin";
  const canManageCommunications = state.role === "admin";
  const canSendCandidateEmail = state.role === "recruiter" || state.role === "admin";
  $("#showJobCreate").disabled = !canManageJobs;
  $$("#jobForm input, #jobForm select, #jobForm textarea, #jobForm button").forEach((control) => {
    control.disabled = !canManageJobs;
  });
  $$("#boardSettingsForm input, #boardSettingsForm textarea, #boardSettingsForm button").forEach((control) => {
    control.disabled = !canManageBoard;
  });
  $$("#departmentForm input, #departmentForm select, #departmentForm button").forEach((control) => {
    control.disabled = !canManageBoard;
  });
  $$("#pipelineSettingsForm input, #pipelineSettingsForm button").forEach((control) => {
    control.disabled = !canManageBoard;
  });
  $$("#communicationTemplateForm input, #communicationTemplateForm select, #communicationTemplateForm textarea, #communicationTemplateForm button, #automationRuleForm input, #automationRuleForm select, #automationRuleForm button").forEach((control) => {
    control.disabled = !canManageCommunications;
  });
  $$("#manualCommunicationForm input, #manualCommunicationForm select, #manualCommunicationForm textarea, #manualCommunicationForm button").forEach((control) => {
    control.disabled = !canSendCandidateEmail;
  });
  $("#adminPanel").hidden = state.role !== "admin";
}

function renderJobsToolbar() {
  const search = $("#hrJobSearch");
  const createPanel = $("#jobCreatePanel");
  const tableWrap = $("#jobsTableWrap");
  const createButton = $("#showJobCreate");
  const searchField = search?.closest(".job-search-field");
  if (search && document.activeElement !== search) search.value = state.hrJobQuery;
  createPanel.hidden = !state.jobCreateOpen;
  tableWrap.hidden = state.jobCreateOpen;
  if (searchField) searchField.hidden = state.jobCreateOpen;
  createButton.hidden = state.jobCreateOpen;
  createButton.setAttribute("aria-expanded", String(state.jobCreateOpen));
}

function renderSettingsSections() {
  $$("[data-settings-section]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.settingsSection === state.settingsSection);
  });
  $$("[data-settings-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.settingsPanel !== state.settingsSection;
  });
}

function currentJobDraft() {
  const form = $("#jobForm");
  if (!form) {
    return {
      title: "Untitled job",
      department: "Department pending",
      subdepartment: "",
      location: "Location pending",
      work_type: "Full Time",
      status: "draft",
      hiring_manager: "Hiring manager pending",
      salary_min: null,
      salary_max: null,
      salary_range: "Shared during screening",
      job_description: "",
      requirements: "",
      benefits: "",
      seo_title: "",
      seo_description: "",
      seo_keywords: []
    };
  }

  const data = Object.fromEntries(new FormData(form));
  const department = getDepartmentById(data.department_id);
  const subdepartment = getDepartmentById(data.subdepartment_id);
  const [salaryMin, salaryMax] = normalizeSalaryValues(numberOrNull(data.salary_min), numberOrNull(data.salary_max));
  const jobDescription = String(data.job_description || "").trim();

  return {
    title: String(data.title || "").trim() || "Untitled job",
    department: department?.name || "Department pending",
    subdepartment: subdepartment?.name || "",
    location: String(data.location || "").trim() || "Location pending",
    work_type: data.work_type || "Full Time",
    status: data.status || "draft",
    hiring_manager: String(data.hiring_manager || "").trim() || "Hiring manager pending",
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_range: buildSalaryRange(salaryMin, salaryMax),
    summary: summarizeText(jobDescription),
    job_description: jobDescription,
    requirements: String(data.requirements || "").trim(),
    benefits: String(data.benefits || "").trim(),
    seo_title: String(data.seo_title || "").trim(),
    seo_description: String(data.seo_description || "").trim(),
    seo_keywords: parseKeywords(data.seo_keywords)
  };
}

function renderJobDraftPreview() {
  const preview = $("#jobDraftPreview");
  if (!preview) return;

  const draft = currentJobDraft();
  const keywordMarkup = draft.seo_keywords.length
    ? draft.seo_keywords.map((keyword) => `<span class="tag">${escapeHtml(keyword)}</span>`).join("")
    : `<span class="tag">Add SEO keywords</span>`;

  preview.innerHTML = `
    <div class="job-preview-content">
      <h3>${escapeHtml(draft.title)}</h3>
      <div class="job-meta">
        <span>${escapeHtml(draft.department)}</span>
        ${draft.subdepartment ? `<span>${escapeHtml(draft.subdepartment)}</span>` : ""}
        <span>${escapeHtml(draft.location)}</span>
        <span>${escapeHtml(draft.work_type)}</span>
      </div>
      <dl>
        <div>
          <dt>Status</dt>
          <dd>${escapeHtml(formatStatus(draft.status))}</dd>
        </div>
        <div>
          <dt>Salary range</dt>
          <dd>${escapeHtml(draft.salary_range)}</dd>
        </div>
        <div>
          <dt>Hiring manager</dt>
          <dd>${escapeHtml(draft.hiring_manager)}</dd>
        </div>
      </dl>
      <section class="description-block">
        <h4>Job Description</h4>
        ${renderTextBlock(draft.job_description, "Start writing the job description.")}
      </section>
      <section class="description-block">
        <h4>Requirements</h4>
        ${renderTextBlock(draft.requirements, "Add required experience, credentials, and skills.")}
      </section>
      <section class="description-block">
        <h4>Benefits</h4>
        ${renderTextBlock(draft.benefits, "Add benefits and employment details.")}
      </section>
      <section class="description-block">
        <h4>SEO keywords</h4>
        <div class="tag-row">${keywordMarkup}</div>
      </section>
    </div>
  `;
}

function openJobPreview() {
  renderJobDraftPreview();
  $("#jobPreviewPanel").hidden = false;
  $("#closeJobPreview").focus();
}

function closeJobPreview() {
  $("#jobPreviewPanel").hidden = true;
  $("#showJobPreview").focus();
}

function renderRoleCard() {
  const profile = roleProfiles[state.role];
  const card = $("#roleCard");
  if (!card || !profile) return;
  $("#roleCard").innerHTML = `
    <h3>${escapeHtml(profile.label)} access</h3>
    <p>${escapeHtml(profile.summary)}</p>
    <ul class="role-list">
      ${profile.capabilities.map((capability) => `<li>${escapeHtml(capability)}</li>`).join("")}
    </ul>
  `;
}

function renderMetrics() {
  const labels = pipelineLabels();
  const openJobs = state.jobs.filter((job) => job.status === "published").length;
  const draftJobs = state.jobs.filter((job) => job.status === "draft").length;
  const activeApplicants = state.applications.filter((application) => application.status !== "archived").length;
  const interviews = state.applications.filter((application) => application.status === "interview").length;
  const metrics = [
    ["Open jobs", openJobs, `${draftJobs} drafts waiting`],
    ["Applicants", activeApplicants, "Across active pipelines"],
    ["Interviews", interviews, "Ready for manager review"],
    [`${labels.offer} stage`, state.applications.filter((application) => application.status === "offer").length, "Final decisions"]
  ];

  $("#metricGrid").innerHTML = metrics
    .map(
      ([label, value, note]) => `
        <article class="metric-card">
          <strong>${escapeHtml(String(value))}</strong>
          <span>${escapeHtml(label)}</span>
          <b>${escapeHtml(note)}</b>
        </article>
      `
    )
    .join("");
}

function renderJobsTable() {
  const query = state.hrJobQuery.trim().toLowerCase();
  const jobs = state.jobs
    .slice()
    .filter((job) => {
      if (!query) return true;
      return [
        job.title,
        job.department,
        job.subdepartment,
        job.location,
        job.work_type,
        job.status,
        job.hiring_manager
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  if (!jobs.length) {
    $("#jobsTable").innerHTML = `
      <tr>
        <td colspan="4">
          <div class="empty-state compact">No jobs match this search.</div>
        </td>
      </tr>
    `;
    return;
  }

  $("#jobsTable").innerHTML = jobs
    .map((job) => {
      const applications = state.applications.filter((application) => application.job_id === job.id);
      const pipelineMarkup = pipelineEntries()
        .map(([stage, label]) => {
          const count = applications.filter((application) => application.status === stage).length;
          return `<span class="pipeline-chip">${escapeHtml(label)} <b>${count}</b></span>`;
        })
        .join("");
      return `
        <tr>
          <td>
            <strong>${escapeHtml(job.title)}</strong>
            <div class="table-meta">
              <span>${escapeHtml(job.department)}</span>
              ${job.subdepartment ? `<span>${escapeHtml(job.subdepartment)}</span>` : ""}
              <span>${escapeHtml(job.location)}</span>
            </div>
          </td>
          <td>${escapeHtml(job.hiring_manager || "Unassigned")}</td>
          <td><span class="status-pill ${escapeHtml(job.status)}">${escapeHtml(formatStatus(job.status))}</span></td>
          <td><div class="pipeline-chip-row">${pipelineMarkup}</div></td>
        </tr>
      `;
    })
    .join("");
}

function renderCandidatesTable() {
  const candidates = state.applications
    .slice()
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  if (!candidates.length) {
    $("#candidatesTable").innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state compact">No candidates have applied yet.</div>
        </td>
      </tr>
    `;
    return;
  }

  $("#candidatesTable").innerHTML = candidates
    .map((application) => {
      const job = state.jobs.find((item) => item.id === application.job_id);
      const selected = state.selectedCandidateId === application.id ? " is-selected" : "";
      return `
        <tr class="${selected}">
          <td>
            <strong>${escapeHtml(application.full_name)}</strong>
            <div class="table-meta">
              <span>${escapeHtml(application.email)}</span>
            </div>
          </td>
          <td>${escapeHtml(job?.title || "General application")}</td>
          <td><span class="stage-pill">${escapeHtml(pipelineLabel(application.status))}</span></td>
          <td>${escapeHtml(application.source || "Career site")}</td>
          <td>${escapeHtml(application.applied_at || "Not recorded")}</td>
          <td>
            <button class="table-action" type="button" data-view-candidate="${escapeHtml(application.id)}">
              View profile
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderCandidateProfile() {
  const panel = $("#candidateProfilePanel");
  if (!panel) return;

  const application = applicationById(state.selectedCandidateId);
  if (!application) {
    panel.hidden = true;
    return;
  }

  const job = jobById(application.job_id);
  panel.hidden = false;
  $("#candidateProfileName").textContent = application.full_name;
  $("#candidateProfileMeta").textContent = `${job?.title || "General application"} · ${pipelineLabel(application.status)}`;
  $$("#candidateProfilePanel [data-candidate-tab]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.candidateTab === state.candidateProfileTab);
  });

  $("#candidateProfileBody").innerHTML =
    state.candidateProfileTab === "communications"
      ? renderCandidateCommunications(application)
      : renderCandidateOverview(application, job);
}

function renderCandidateOverview(application, job) {
  return `
    <div class="candidate-overview-grid">
      <article class="candidate-detail-card">
        <span>Candidate</span>
        <strong>${escapeHtml(application.full_name)}</strong>
        <p>${escapeHtml(application.email || "No email recorded")}</p>
      </article>
      <article class="candidate-detail-card">
        <span>Role</span>
        <strong>${escapeHtml(job?.title || "General application")}</strong>
        <p>${escapeHtml(job?.department || "Department pending")}</p>
      </article>
      <article class="candidate-detail-card">
        <span>Pipeline</span>
        <strong>${escapeHtml(pipelineLabel(application.status))}</strong>
        <p>${escapeHtml(application.source || "Career site")}</p>
      </article>
      <article class="candidate-detail-card">
        <span>Applied</span>
        <strong>${escapeHtml(application.applied_at || "Not recorded")}</strong>
        <p>${escapeHtml(application.recruiter || "Unassigned")}</p>
      </article>
    </div>
  `;
}

function ensureManualMessage(application) {
  const templates = activeCommunicationTemplates().filter((template) => template.status === "active");
  const selectedTemplate =
    communicationTemplateById(state.manualTemplateId) ||
    templates[0] ||
    activeCommunicationTemplates()[0];
  if (!selectedTemplate) return;

  if (!state.manualTemplateId || !state.manualSubject || !state.manualBody) {
    setManualMessageFromTemplate(application, selectedTemplate.id);
  }
}

function setManualMessageFromTemplate(application, templateId) {
  const template = communicationTemplateById(templateId);
  if (!template) return;
  const sender = senderAccountById(state.senderAccounts[0]?.id);
  const context = communicationContext(application, {
    sender,
    sender_email: sender.email,
    reply_to: sender.reply_to
  });
  state.manualTemplateId = template.id;
  state.manualSubject = renderTemplateString(template.subject, context);
  state.manualBody = renderTemplateString(template.body, context);
}

function renderCandidateCommunications(application) {
  ensureManualMessage(application);
  const templates = activeCommunicationTemplates().filter((template) => template.status === "active");
  const sender = senderAccountById(state.senderAccounts[0]?.id);
  const templateOptions = templates.length
    ? templates
        .map(
          (template) => `<option value="${escapeHtml(template.id)}"${template.id === state.manualTemplateId ? " selected" : ""}>${escapeHtml(template.name)}</option>`
        )
        .join("")
    : `<option value="">No active templates</option>`;
  const senderOptions = state.senderAccounts
    .map(
      (account) => `<option value="${escapeHtml(account.id)}">${escapeHtml(account.name)} · ${escapeHtml(account.email)}</option>`
    )
    .join("");

  return `
    <div class="communications-workspace">
      <section class="manual-email-panel">
        <div class="section-header compact">
          <div>
            <p class="eyebrow">Manual email</p>
            <h2>Send message</h2>
          </div>
        </div>
        <form class="manual-message-form" id="manualCommunicationForm">
          <div class="form-grid">
            <label class="field">
              <span>Template</span>
              <select name="template_id" id="manualTemplateSelect">${templateOptions}</select>
            </label>
            <label class="field">
              <span>Sender account</span>
              <select name="sender_account_id" id="manualSenderAccountSelect">${senderOptions}</select>
            </label>
            <label class="field">
              <span>Reply-to</span>
              <input name="reply_to" value="${escapeHtml(sender.reply_to)}">
            </label>
            <label class="field wide">
              <span>Subject</span>
              <input name="subject" id="manualCommunicationSubject" required value="${escapeHtml(state.manualSubject)}">
            </label>
            <label class="field wide">
              <span>Message</span>
              <textarea name="body" id="manualCommunicationBody" required rows="7">${escapeHtml(state.manualBody)}</textarea>
            </label>
          </div>
          <button class="primary-action small" type="submit">
            <svg><use href="#icon-send"></use></svg>
            Send email
          </button>
          <p class="form-message" id="manualCommunicationMessage" role="status"></p>
        </form>
      </section>

      <section class="communication-history-panel">
        <div class="section-header compact">
          <div>
            <p class="eyebrow">Communications</p>
            <h2>Email history</h2>
          </div>
          <label class="field compact-field communication-search">
            <span>Search history</span>
            <input id="communicationSearch" type="search" value="${escapeHtml(state.communicationQuery)}" placeholder="Subject or message">
          </label>
        </div>
        <div class="communication-history" id="communicationHistory">
          ${renderCommunicationHistory(application)}
        </div>
      </section>
    </div>
  `;
}

function renderCommunicationHistory(application) {
  const query = state.communicationQuery.trim().toLowerCase();
  const records = state.communications
    .filter((record) => record.application_id === application.id)
    .filter((record) => {
      if (!query) return true;
      return [record.subject, record.body, record.sender_email, record.reply_to, record.status, record.delivery_status]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

  if (!records.length) {
    return `<div class="empty-state compact">No matching communications yet.</div>`;
  }

  return records
    .map(
      (record) => `
        <article class="communication-card">
          <div class="communication-card-header">
            <div>
              <strong>${escapeHtml(record.subject)}</strong>
              <span>${escapeHtml(formatDateTime(record.created_at))} · ${escapeHtml(record.send_type)}</span>
            </div>
            <span class="status-pill ${escapeHtml(record.status)}">${escapeHtml(formatStatus(record.delivery_status || record.status))}</span>
          </div>
          <div class="communication-meta-row">
            <span>From ${escapeHtml(record.sender_email)}</span>
            <span>Reply-to ${escapeHtml(record.reply_to || record.sender_email)}</span>
          </div>
          ${
            record.error_message
              ? `<p class="form-message is-error">${escapeHtml(record.error_message)}</p>`
              : ""
          }
          <details>
            <summary>View email content</summary>
            <div class="email-preview-body">${renderEmailBody(record.body)}</div>
          </details>
          <button class="table-action" type="button" data-resend-communication="${escapeHtml(record.id)}">
            Resend
          </button>
        </article>
      `
    )
    .join("");
}

function renderCommunicationSettings() {
  renderTemplateLibrary();
  renderAutomationRules();
  renderSenderAccounts();
}

function renderTemplateLibrary() {
  const table = $("#templatesTable");
  const form = $("#communicationTemplateForm");
  if (!table || !form) return;

  const templates = activeCommunicationTemplates();
  const selected =
    communicationTemplateById(state.selectedTemplateId) ||
    templates[0] ||
    normalizeCommunicationTemplate({
      id: "",
      name: "",
      subject: "",
      body: "",
      category: "General",
      status: "active"
    });
  if (!state.selectedTemplateId && selected.id) state.selectedTemplateId = selected.id;

  table.innerHTML = templates.length
    ? templates
        .map(
          (template) => `
            <tr class="${template.id === state.selectedTemplateId ? "is-selected" : ""}">
              <td>
                <strong>${escapeHtml(template.name)}</strong>
                <div class="table-meta">
                  <span>${escapeHtml(template.category)}</span>
                </div>
              </td>
              <td>${escapeHtml(template.subject)}</td>
              <td><span class="status-pill ${escapeHtml(template.status)}">${escapeHtml(formatStatus(template.status))}</span></td>
              <td>
                <button class="table-action" type="button" data-select-template="${escapeHtml(template.id)}">
                  Edit
                </button>
              </td>
            </tr>
          `
        )
        .join("")
    : `
      <tr>
        <td colspan="4">
          <div class="empty-state compact">No active templates.</div>
        </td>
      </tr>
    `;

  form.elements.template_id.value = selected.id || "";
  form.elements.name.value = selected.name || "";
  form.elements.category.value = selected.category || "General";
  form.elements.status.value = selected.status || "active";
  form.elements.subject.value = selected.subject || "";
  form.elements.body.value = selected.body || "";

  $("#mergeFieldChips").innerHTML = communicationMergeFields
    .map(
      (field) => `
        <button class="merge-field-chip" type="button" data-merge-field="${escapeHtml(field.key)}" title="${escapeHtml(field.label)}">
          {{${escapeHtml(field.key)}}}
        </button>
      `
    )
    .join("");

  renderTemplatePreview();
}

function renderTemplatePreview() {
  const preview = $("#templatePreview");
  const form = $("#communicationTemplateForm");
  if (!preview || !form) return;

  const data = Object.fromEntries(new FormData(form));
  const context = communicationContext(state.applications[0] || {}, {
    interview_date_time: "Tuesday, August 18 at 10:00 AM",
    offer_details: "Base compensation, benefits, and start date will be confirmed in the written offer."
  });
  const subject = renderTemplateString(data.subject, context);
  const body = renderTemplateString(data.body, context);

  preview.innerHTML = `
    <div class="preview-subject">
      <span>Subject</span>
      <strong>${escapeHtml(subject || "Template subject preview")}</strong>
    </div>
    <div class="email-preview-body">
      ${renderEmailBody(body || "Template message preview")}
    </div>
  `;
}

function renderAutomationRules() {
  const table = $("#automationRulesTable");
  const form = $("#automationRuleForm");
  if (!table || !form) return;

  const selected =
    state.automationRules.find((rule) => rule.id === state.selectedAutomationRuleId) ||
    state.automationRules[0] ||
    normalizeAutomationRule({
      id: "",
      name: "",
      trigger_event: "candidate_applies",
      template_id: activeCommunicationTemplates()[0]?.id || "",
      status: "active"
    });
  if (!state.selectedAutomationRuleId && selected.id) state.selectedAutomationRuleId = selected.id;

  table.innerHTML = state.automationRules.length
    ? state.automationRules
        .map((rule) => {
          const template = communicationTemplateById(rule.template_id);
          return `
            <tr class="${rule.id === state.selectedAutomationRuleId ? "is-selected" : ""}">
              <td>
                <strong>${escapeHtml(rule.name)}</strong>
                <div class="table-meta">
                  <span>${escapeHtml(rule.action_type || "send_email")}</span>
                </div>
              </td>
              <td>${escapeHtml(communicationTriggerLabel(rule.trigger_event))}</td>
              <td>${escapeHtml(rule.pipeline_stage ? pipelineLabel(rule.pipeline_stage) : "Any")}</td>
              <td>${escapeHtml(template?.name || "Template missing")}</td>
              <td>${escapeHtml(communicationDelayLabel(rule.delay_minutes))}</td>
              <td><span class="status-pill ${escapeHtml(rule.status)}">${escapeHtml(formatStatus(rule.status))}</span></td>
              <td>
                <button class="table-action" type="button" data-select-automation-rule="${escapeHtml(rule.id)}">
                  Edit
                </button>
              </td>
            </tr>
          `;
        })
        .join("")
    : `
      <tr>
        <td colspan="7">
          <div class="empty-state compact">No automation rules yet.</div>
        </td>
      </tr>
    `;

  form.elements.rule_id.value = selected.id || "";
  form.elements.name.value = selected.name || "";
  form.elements.trigger_event.innerHTML = communicationTriggerEvents
    .map(
      (event) => `<option value="${escapeHtml(event.id)}"${event.id === selected.trigger_event ? " selected" : ""}>${escapeHtml(event.label)}</option>`
    )
    .join("");
  form.elements.pipeline_stage.innerHTML = [
    `<option value="">Any stage or not applicable</option>`,
    ...pipelineEntries().map(
      ([stage, label]) => `<option value="${escapeHtml(stage)}"${stage === selected.pipeline_stage ? " selected" : ""}>${escapeHtml(label)}</option>`
    )
  ].join("");
  form.elements.template_id.innerHTML = activeCommunicationTemplates()
    .map(
      (template) => `<option value="${escapeHtml(template.id)}"${template.id === selected.template_id ? " selected" : ""}>${escapeHtml(template.name)}</option>`
    )
    .join("");
  form.elements.sender_account_id.innerHTML = state.senderAccounts
    .map(
      (account) => `<option value="${escapeHtml(account.id)}"${account.id === selected.sender_account_id ? " selected" : ""}>${escapeHtml(account.name)} · ${escapeHtml(account.email)}</option>`
    )
    .join("");
  form.elements.delay_minutes.innerHTML = communicationDelayOptions
    .map(
      (option) => `<option value="${option.value}"${option.value === selected.delay_minutes ? " selected" : ""}>${escapeHtml(option.label)}</option>`
    )
    .join("");
  form.elements.sender_email.value = selected.sender_email || senderAccountById(selected.sender_account_id).email;
  form.elements.reply_to.value = selected.reply_to || senderAccountById(selected.sender_account_id).reply_to;
  form.elements.status.value = selected.status || "active";

  renderStageAutomationMatrix();
  renderPipelineAutomationPreview();
}

function renderStageAutomationMatrix() {
  const matrix = $("#stageAutomationMatrix");
  if (!matrix) return;

  matrix.innerHTML = pipelineEntries()
    .map(([stage, label]) => {
      const rules = state.automationRules.filter(
        (rule) => rule.trigger_event === "candidate_stage_changed" && rule.pipeline_stage === stage
      );
      return `
        <article class="stage-automation-card">
          <div>
            <strong>${escapeHtml(label)}</strong>
            <span>${rules.length} ${rules.length === 1 ? "rule" : "rules"}</span>
          </div>
          ${
            rules.length
              ? `<ul>${rules.map((rule) => `<li>${escapeHtml(rule.name)}</li>`).join("")}</ul>`
              : `<p class="summary">No stage automations attached.</p>`
          }
        </article>
      `;
    })
    .join("");
}

function renderSenderAccounts() {
  const list = $("#senderAccountList");
  if (!list) return;

  list.innerHTML = state.senderAccounts
    .map(
      (account) => `
        <article class="sender-account-card">
          <div>
            <strong>${escapeHtml(account.name)}</strong>
            <span>${escapeHtml(account.email)}</span>
          </div>
          <span class="status-pill ${escapeHtml(account.dns_status)}">${escapeHtml(formatStatus(account.dns_status))}</span>
        </article>
      `
    )
    .join("");
}

function renderPipeline() {
  $("#pipelineBoard").innerHTML = pipelineEntries()
    .map(([stage, label]) => {
      const applications = state.applications.filter((application) => application.status === stage);
      return `
        <section class="pipeline-column">
          <h3>${escapeHtml(label)} <span>${applications.length}</span></h3>
          ${applications.length ? applications.map(renderCandidateCard).join("") : `<div class="empty-state">No candidates</div>`}
        </section>
      `;
    })
    .join("");
}

function renderCandidateCard(application) {
  const job = state.jobs.find((item) => item.id === application.job_id);
  const nextStage = state.role === "hiring_manager" ? getManagerStage(application.status) : getNextStage(application.status);
  const actionLabel =
    state.role === "hiring_manager"
      ? nextStage
        ? "Submit scorecard"
        : "View profile"
      : nextStage
        ? `Move to ${pipelineLabel(nextStage)}`
        : "Keep warm";
  return `
    <article class="candidate-card">
      <div>
        <h4>${escapeHtml(application.full_name)}</h4>
        <div class="candidate-meta">
          <span>${escapeHtml(job?.title || "General application")}</span>
          <span>${escapeHtml(application.source || "Career site")}</span>
        </div>
      </div>
      <div class="tag-row">
        <span class="stage-pill">${escapeHtml(pipelineLabel(application.status))}</span>
        <span class="tag">${escapeHtml(String(application.score || 72))} match</span>
      </div>
      <div class="candidate-actions">
        <button class="candidate-action" type="button" data-candidate-action="${escapeHtml(application.id)}">
          ${escapeHtml(actionLabel)}
        </button>
      </div>
    </article>
  `;
}

function renderPermissions() {
  const permissions = [
    ["Recruiter", ["Create and edit requisitions", "Screen and move candidates", "Send interview packets"]],
    ["Hiring manager", ["Review assigned candidates", "Submit scorecards", "Approve offer recommendations"]],
    ["Admin", ["Manage users and roles", "Configure stages and policies", "View audit-ready reports"]]
  ];

  $("#permissionsGrid").innerHTML = permissions
    .map(
      ([role, items]) => `
        <article class="permission-item">
          <h3>${escapeHtml(role)}</h3>
          <ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </article>
      `
    )
    .join("");
}

function renderBoardSettingsForm() {
  const form = $("#boardSettingsForm");
  if (!form) return;

  const settings = normalizeBoardSettings(state.boardSettings);
  form.elements.hero_image_url.value = settings.hero_image_url;
  form.elements.hero_eyebrow.value = settings.hero_eyebrow;
  form.elements.hero_title.value = settings.hero_title;
  form.elements.hero_subtitle.value = settings.hero_subtitle;
  form.elements.overlay_opacity.value = settings.overlay_opacity;
}

function renderPipelineSettingsForm() {
  const form = $("#pipelineSettingsForm");
  if (!form) return;

  const labels = pipelineLabels();
  pipelineStages.forEach((stage) => {
    form.elements[stage].value = labels[stage] || defaultPipelineLabels[stage];
  });
  $("#pipelineSettingsPreview").innerHTML = pipelineEntries()
    .map(
      ([stage, label], index) => `
        <span class="pipeline-settings-chip">
          <b>${index + 1}</b>
          ${escapeHtml(label)}
        </span>
      `
    )
    .join("");
  renderPipelineAutomationPreview();
}

function renderPipelineAutomationPreview() {
  const preview = $("#pipelineAutomationPreview");
  if (!preview) return;

  preview.innerHTML = pipelineEntries()
    .map(([stage, label]) => {
      const rules = state.automationRules.filter(
        (rule) => rule.trigger_event === "candidate_stage_changed" && rule.pipeline_stage === stage
      );
      return `
        <article>
          <strong>${escapeHtml(label)}</strong>
          <span>${rules.length ? rules.map((rule) => rule.name).join(", ") : "No communication rules"}</span>
        </article>
      `;
    })
    .join("");
}

function renderProfileForm() {
  const form = $("#profileForm");
  if (!form) return;

  form.elements.avatar_url.value = state.profile.avatar_url;
  form.elements.full_name.value = state.profile.full_name || profileDisplayName();
  form.elements.email.value = state.profile.email || state.session?.email || "";
  form.elements.title.value = state.profile.title;
  form.elements.department.value = state.profile.department;
}

function populateJobDepartmentControls() {
  const departmentSelect = $("#jobDepartmentSelect");
  const subdepartmentSelect = $("#jobSubdepartmentSelect");
  const parents = parentDepartments();
  const currentDepartment = departmentSelect.value;
  const selectedDepartment = parents.some((department) => department.id === currentDepartment)
    ? currentDepartment
    : parents[0]?.id || "";

  departmentSelect.innerHTML = parents.length
    ? parents
        .map((department) => `<option value="${escapeHtml(department.id)}">${escapeHtml(department.name)}</option>`)
        .join("")
    : `<option value="">Create a department in Settings first</option>`;
  departmentSelect.value = selectedDepartment;
  subdepartmentSelect.disabled = !selectedDepartment || departmentSelect.disabled;
  populateSubdepartmentControls(selectedDepartment, subdepartmentSelect.value);
}

function populateSubdepartmentControls(parentId, selectedChildId = "") {
  const subdepartmentSelect = $("#jobSubdepartmentSelect");
  const children = childDepartments(parentId);
  subdepartmentSelect.innerHTML = [
    `<option value="">None</option>`,
    ...children.map((department) => `<option value="${escapeHtml(department.id)}">${escapeHtml(department.name)}</option>`)
  ].join("");
  subdepartmentSelect.value = children.some((department) => department.id === selectedChildId) ? selectedChildId : "";
}

function populateParentDepartmentSelect() {
  const select = $("#parentDepartmentSelect");
  const selected = select.value;
  const parents = parentDepartments();
  select.innerHTML = [
    `<option value="">None - create agency department</option>`,
    ...parents.map((department) => `<option value="${escapeHtml(department.id)}">${escapeHtml(department.name)}</option>`)
  ].join("");
  select.value = parents.some((department) => department.id === selected) ? selected : "";
}

function renderDepartmentSettings() {
  populateParentDepartmentSelect();
  const parents = parentDepartments();
  const counts = new Map(departmentOpeningCounts().map((department) => [department.name, department.count]));

  $("#departmentTree").innerHTML = parents.length
    ? parents
        .map((department) => {
          const children = childDepartments(department.id);
          return `
            <article class="department-group">
              <div>
                <h3>${escapeHtml(department.name)}</h3>
                <span>${counts.get(department.name) || 0} open ${counts.get(department.name) === 1 ? "job" : "jobs"}</span>
              </div>
              ${
                children.length
                  ? `<ul class="subdepartment-list">${children
                      .map((child) => `<li>${escapeHtml(child.name)}</li>`)
                      .join("")}</ul>`
                  : `<p class="summary">No subdepartments yet.</p>`
              }
            </article>
          `;
        })
        .join("")
    : `<div class="empty-state compact">No departments have been created yet.</div>`;
}

function getNextStage(status) {
  const index = pipelineStages.indexOf(status);
  return index >= 0 && index < pipelineStages.length - 1 ? pipelineStages[index + 1] : null;
}

function getManagerStage(status) {
  return status === "interview" ? "offer" : null;
}

function formatStatus(status = "") {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showMessage(selector, message) {
  const element = $(selector);
  if (!element) return;
  element.textContent = message;
  window.setTimeout(() => {
    if (element.textContent === message) element.textContent = "";
  }, 5000);
}

function accountRequestErrorMessage(message = "") {
  if (message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
    return "Account requests need one more setup step: add SUPABASE_SERVICE_ROLE_KEY to Netlify environment variables.";
  }
  if (message.includes("RESEND_API_KEY")) {
    return "Account request emails need one more setup step: add RESEND_API_KEY to Netlify environment variables.";
  }
  if (message.includes("Missing server environment variables")) {
    return "Account requests are not fully set up yet. Check the server environment variables in Netlify.";
  }
  return message || "Request could not be sent.";
}

function communicationErrorMessage(message = "") {
  if (message.includes("RESEND_API_KEY")) {
    return "Email sending needs RESEND_API_KEY in Netlify environment variables.";
  }
  if (message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
    return "Email logging needs SUPABASE_SERVICE_ROLE_KEY in Netlify environment variables.";
  }
  if (message.includes("Sign in")) {
    return "Sign in as a hiring-team user before sending email.";
  }
  return message || "Email could not be sent.";
}

function replaceCommunication(record) {
  const normalized = normalizeCommunication(record);
  const index = state.communications.findIndex((item) => item.id === normalized.id);
  if (index >= 0) state.communications[index] = normalized;
  else state.communications.unshift(normalized);
  state.communications = normalizeCommunications(state.communications);
  saveLocalCommunications(state.communications);
  return normalized;
}

async function postCommunication(record) {
  const response = await fetch("/.netlify/functions/send-communication", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(state.session?.accessToken ? { Authorization: `Bearer ${state.session.accessToken}` } : {})
    },
    body: JSON.stringify(record)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || "Email could not be sent.");
    error.record = result.record;
    throw error;
  }
  return result;
}

async function sendCommunicationRecord(record) {
  const pending = replaceCommunication({
    ...record,
    status: record.delay_minutes > 0 ? "queued" : "queued",
    delivery_status: "queued"
  });

  const isDemoRecord = pending.application_id.startsWith("app-");
  if (!hasSupabase || !state.session?.accessToken || isDemoRecord) {
    const localStatus = record.delay_minutes > 0 ? "queued" : "sent";
    return replaceCommunication({
      ...pending,
      status: localStatus,
      delivery_status: localStatus,
      sent_at: localStatus === "sent" ? new Date().toISOString() : pending.sent_at
    });
  }

  try {
    const result = await postCommunication(pending);
    return replaceCommunication(result.record || { ...pending, status: result.status, delivery_status: result.delivery_status });
  } catch (error) {
    return replaceCommunication({
      ...(error.record || pending),
      status: "failed",
      delivery_status: "failed",
      error_message: communicationErrorMessage(error.message)
    });
  }
}

async function runServerAutomationEvent(triggerEvent, application, details = {}) {
  try {
    const response = await fetch("/.netlify/functions/run-communication-automations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(state.session?.accessToken ? { Authorization: `Bearer ${state.session.accessToken}` } : {})
      },
      body: JSON.stringify({
        trigger_event: triggerEvent,
        application_id: application.id,
        details
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return null;
    return Array.isArray(result.records) ? result.records.map(normalizeCommunication) : [];
  } catch (error) {
    return null;
  }
}

function matchingAutomationRules(triggerEvent, application, details = {}) {
  return state.automationRules.filter((rule) => {
    if (rule.status !== "active") return false;
    if (rule.trigger_event !== triggerEvent) return false;
    if (rule.action_type !== "send_email") return false;
    if (triggerEvent === "candidate_stage_changed" && rule.pipeline_stage && rule.pipeline_stage !== application.status) {
      return false;
    }
    if (details.pipeline_stage && rule.pipeline_stage && rule.pipeline_stage !== details.pipeline_stage) {
      return false;
    }
    const template = communicationTemplateById(rule.template_id);
    return template && template.status === "active" && !template.archived_at;
  });
}

async function dispatchAutomationEvent(triggerEvent, application, details = {}) {
  const isDemoApplication = application.id.startsWith("app-");
  if (hasSupabase && !isDemoApplication) {
    const serverRecords = await runServerAutomationEvent(triggerEvent, application, details);
    if (serverRecords) {
      serverRecords.forEach(replaceCommunication);
      renderCandidateProfile();
      return serverRecords;
    }
    if (!state.session?.accessToken) return [];
  }

  const rules = matchingAutomationRules(triggerEvent, application, details);
  if (!rules.length) return [];

  const sentRecords = [];
  for (const rule of rules) {
    const template = communicationTemplateById(rule.template_id);
    const sender = senderAccountById(rule.sender_account_id);
    const context = communicationContext(application, {
      ...details,
      sender,
      sender_email: rule.sender_email || sender.email,
      reply_to: rule.reply_to || sender.reply_to
    });
    const now = new Date();
    const sendAfter = new Date(now.getTime() + Number(rule.delay_minutes || 0) * 60 * 1000);
    const record = normalizeCommunication({
      id: newClientId("comm"),
      application_id: application.id,
      job_id: application.job_id,
      candidate_name: application.full_name,
      candidate_email: application.email,
      template_id: template.id,
      automation_rule_id: rule.id,
      trigger_event: triggerEvent,
      direction: "outbound",
      send_type: "automated",
      subject: renderTemplateString(template.subject, context),
      body: renderTemplateString(template.body, context),
      sender_email: rule.sender_email || sender.email,
      reply_to: rule.reply_to || sender.reply_to,
      status: "queued",
      delivery_status: "queued",
      queued_at: now.toISOString(),
      send_after: sendAfter.toISOString(),
      created_at: now.toISOString()
    });
    record.delay_minutes = Number(rule.delay_minutes || 0);
    sentRecords.push(await sendCommunicationRecord(record));
  }

  renderCandidateProfile();
  return sentRecords;
}

async function handleCommunicationTemplateSubmit(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const template = normalizeCommunicationTemplate({
    id: data.template_id || newClientId("tmpl"),
    name: data.name,
    category: data.category,
    status: data.status,
    subject: data.subject,
    body: data.body,
    archived_at: ""
  });

  const index = state.communicationTemplates.findIndex((item) => item.id === template.id);
  if (index >= 0) state.communicationTemplates[index] = template;
  else state.communicationTemplates.push(template);
  state.communicationTemplates = normalizeCommunicationTemplates(state.communicationTemplates);
  state.selectedTemplateId = template.id;
  saveLocalCommunicationTemplates(state.communicationTemplates);
  renderCommunicationSettings();

  try {
    if (hasSupabase && state.session?.accessToken) {
      const [saved] = await supabaseUpsert("communication_templates", template, true);
      if (saved) {
        state.communicationTemplates = normalizeCommunicationTemplates(
          state.communicationTemplates.map((item) => (item.id === template.id ? saved : item))
        );
        saveLocalCommunicationTemplates(state.communicationTemplates);
        renderCommunicationSettings();
      }
      showMessage("#templateMessage", "Template saved.");
      return;
    }
    showMessage("#templateMessage", "Template saved for this preview.");
  } catch (error) {
    showMessage("#templateMessage", "Template saved locally. Supabase save needs admin access.");
  }
}

async function archiveSelectedTemplate() {
  const template = communicationTemplateById(state.selectedTemplateId);
  if (!template) return;
  const archived = normalizeCommunicationTemplate({ ...template, archived_at: new Date().toISOString(), status: "inactive" });
  state.communicationTemplates = normalizeCommunicationTemplates(
    state.communicationTemplates.map((item) => (item.id === template.id ? archived : item))
  );
  state.selectedTemplateId = activeCommunicationTemplates()[0]?.id || "";
  saveLocalCommunicationTemplates(state.communicationTemplates);
  renderCommunicationSettings();

  try {
    if (hasSupabase && state.session?.accessToken) {
      await supabasePatch(
        "communication_templates",
        `id=eq.${encodeURIComponent(template.id)}`,
        { archived_at: archived.archived_at, status: "inactive" },
        true
      );
      showMessage("#templateMessage", "Template archived.");
    } else {
      showMessage("#templateMessage", "Template archived for this preview.");
    }
  } catch (error) {
    showMessage("#templateMessage", "Template archived locally. Supabase archive needs admin access.");
  }
}

async function deleteSelectedTemplate() {
  const template = communicationTemplateById(state.selectedTemplateId);
  if (!template) return;
  state.communicationTemplates = state.communicationTemplates.filter((item) => item.id !== template.id);
  state.selectedTemplateId = activeCommunicationTemplates()[0]?.id || "";
  saveLocalCommunicationTemplates(state.communicationTemplates);
  renderCommunicationSettings();

  try {
    if (hasSupabase && state.session?.accessToken) {
      await supabaseDelete("communication_templates", `id=eq.${encodeURIComponent(template.id)}`, true);
      showMessage("#templateMessage", "Template deleted.");
    } else {
      showMessage("#templateMessage", "Template deleted for this preview.");
    }
  } catch (error) {
    showMessage("#templateMessage", "Template deleted locally. Supabase delete needs admin access.");
  }
}

function duplicateSelectedTemplate() {
  const template = communicationTemplateById(state.selectedTemplateId);
  if (!template) return;
  const copy = normalizeCommunicationTemplate({
    ...template,
    id: newClientId("tmpl"),
    name: `Copy of ${template.name}`,
    archived_at: ""
  });
  state.communicationTemplates.push(copy);
  state.communicationTemplates = normalizeCommunicationTemplates(state.communicationTemplates);
  state.selectedTemplateId = copy.id;
  saveLocalCommunicationTemplates(state.communicationTemplates);
  renderCommunicationSettings();
  showMessage("#templateMessage", "Template duplicated.");
}

async function sendTemplateTestEmail() {
  const form = $("#communicationTemplateForm");
  const data = Object.fromEntries(new FormData(form));
  const to = String(data.test_email || state.profile.email || state.session?.email || "").trim();
  if (!to) {
    showMessage("#templateMessage", "Add a test email address first.");
    return;
  }

  const sender = senderAccountById(state.senderAccounts[0]?.id);
  const context = communicationContext(state.applications[0] || {}, {
    sender,
    sender_email: sender.email,
    reply_to: sender.reply_to,
    interview_date_time: "Tuesday, August 18 at 10:00 AM"
  });
  const record = {
    id: newClientId("comm"),
    mode: "test",
    to,
    candidate_email: to,
    candidate_name: profileDisplayName(),
    subject: renderTemplateString(data.subject, context),
    body: renderTemplateString(data.body, context),
    sender_email: sender.email,
    reply_to: sender.reply_to,
    template_id: data.template_id || "",
    trigger_event: "test_email",
    send_type: "test",
    status: "queued",
    delivery_status: "queued",
    delay_minutes: 0
  };

  try {
    const result = await postCommunication(record);
    showMessage("#templateMessage", result.message || "Test email sent.");
  } catch (error) {
    showMessage("#templateMessage", communicationErrorMessage(error.message));
  }
}

async function handleAutomationRuleSubmit(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const rule = normalizeAutomationRule({
    id: data.rule_id || newClientId("rule"),
    name: data.name,
    trigger_event: data.trigger_event,
    pipeline_stage: data.pipeline_stage,
    template_id: data.template_id,
    sender_account_id: data.sender_account_id,
    sender_email: data.sender_email,
    reply_to: data.reply_to,
    delay_minutes: data.delay_minutes,
    status: data.status,
    action_type: "send_email",
    action_config: { actions: ["send_email"] }
  });

  const index = state.automationRules.findIndex((item) => item.id === rule.id);
  if (index >= 0) state.automationRules[index] = rule;
  else state.automationRules.push(rule);
  state.automationRules = normalizeAutomationRules(state.automationRules);
  state.selectedAutomationRuleId = rule.id;
  saveLocalAutomationRules(state.automationRules);
  renderCommunicationSettings();

  try {
    if (hasSupabase && state.session?.accessToken) {
      const [saved] = await supabaseUpsert("automation_rules", rule, true);
      if (saved) {
        state.automationRules = normalizeAutomationRules(
          state.automationRules.map((item) => (item.id === rule.id ? saved : item))
        );
        saveLocalAutomationRules(state.automationRules);
        renderCommunicationSettings();
      }
      showMessage("#automationRuleMessage", "Automation rule saved.");
      return;
    }
    showMessage("#automationRuleMessage", "Automation rule saved for this preview.");
  } catch (error) {
    showMessage("#automationRuleMessage", "Rule saved locally. Supabase save needs admin access.");
  }
}

function duplicateSelectedAutomationRule() {
  const rule = state.automationRules.find((item) => item.id === state.selectedAutomationRuleId);
  if (!rule) return;
  const copy = normalizeAutomationRule({
    ...rule,
    id: newClientId("rule"),
    name: `Copy of ${rule.name}`
  });
  state.automationRules.push(copy);
  state.automationRules = normalizeAutomationRules(state.automationRules);
  state.selectedAutomationRuleId = copy.id;
  saveLocalAutomationRules(state.automationRules);
  renderCommunicationSettings();
  showMessage("#automationRuleMessage", "Automation rule duplicated.");
}

async function deleteSelectedAutomationRule() {
  const rule = state.automationRules.find((item) => item.id === state.selectedAutomationRuleId);
  if (!rule) return;
  state.automationRules = state.automationRules.filter((item) => item.id !== rule.id);
  state.selectedAutomationRuleId = state.automationRules[0]?.id || "";
  saveLocalAutomationRules(state.automationRules);
  renderCommunicationSettings();

  try {
    if (hasSupabase && state.session?.accessToken) {
      await supabaseDelete("automation_rules", `id=eq.${encodeURIComponent(rule.id)}`, true);
      showMessage("#automationRuleMessage", "Automation rule deleted.");
    } else {
      showMessage("#automationRuleMessage", "Automation rule deleted for this preview.");
    }
  } catch (error) {
    showMessage("#automationRuleMessage", "Rule deleted locally. Supabase delete needs admin access.");
  }
}

async function handleManualCommunicationSubmit(event) {
  event.preventDefault();
  const application = applicationById(state.selectedCandidateId);
  if (!application) return;
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const sender = senderAccountById(data.sender_account_id);
  const now = new Date().toISOString();
  const record = normalizeCommunication({
    id: newClientId("comm"),
    application_id: application.id,
    job_id: application.job_id,
    candidate_name: application.full_name,
    candidate_email: application.email,
    template_id: data.template_id,
    trigger_event: "manual_send",
    direction: "outbound",
    send_type: "manual",
    subject: data.subject,
    body: data.body,
    sender_email: sender.email,
    reply_to: data.reply_to || sender.reply_to,
    status: "queued",
    delivery_status: "queued",
    queued_at: now,
    send_after: now,
    created_at: now
  });
  record.delay_minutes = 0;

  const sent = await sendCommunicationRecord(record);
  renderCandidateProfile();
  showMessage(
    "#manualCommunicationMessage",
    sent.status === "failed" ? communicationErrorMessage(sent.error_message) : "Email recorded and sent."
  );
}

async function resendCommunication(id) {
  const original = state.communications.find((record) => record.id === id);
  const application = original ? applicationById(original.application_id) : null;
  if (!original || !application) return;

  const now = new Date().toISOString();
  const record = normalizeCommunication({
    ...original,
    id: newClientId("comm"),
    send_type: "manual_resend",
    trigger_event: "manual_resend",
    status: "queued",
    delivery_status: "queued",
    provider_message_id: "",
    error_message: "",
    queued_at: now,
    send_after: now,
    sent_at: "",
    created_at: now
  });
  record.delay_minutes = 0;
  await sendCommunicationRecord(record);
  renderCandidateProfile();
}

function bindEvents() {
  $$(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      showView(button.dataset.view);
    });
  });

  $$("[data-go-view]").forEach((button) => {
    button.addEventListener("click", () => {
      showView(button.dataset.goView);
    });
  });

  $$(".hr-menu-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.hrSection = button.dataset.hrSection;
      if (state.hrSection === "jobs") state.jobCreateOpen = false;
      $("#profileDropdown").hidden = true;
      $("#profileMenuButton").setAttribute("aria-expanded", "false");
      renderHrWorkspace();
    });
  });

  $("#profileMenuButton").addEventListener("click", () => {
    const dropdown = $("#profileDropdown");
    const isOpening = dropdown.hidden;
    dropdown.hidden = !isOpening;
    $("#profileMenuButton").setAttribute("aria-expanded", String(isOpening));
  });

  $("#profileDropdown").addEventListener("click", (event) => {
    const button = event.target.closest("[data-profile-destination]");
    if (!button) return;
    state.hrSection = button.dataset.profileDestination;
    $("#profileDropdown").hidden = true;
    $("#profileMenuButton").setAttribute("aria-expanded", "false");
    renderHrWorkspace();
  });

  $("#hrJobSearch").addEventListener("input", (event) => {
    state.hrJobQuery = event.target.value;
    renderJobsTable();
  });

  $("#showJobCreate").addEventListener("click", () => {
    state.jobCreateOpen = true;
    renderJobsToolbar();
    populateJobDepartmentControls();
    renderJobDraftPreview();
    $("#jobForm input[name='title']").focus();
  });

  $("#showJobPreview").addEventListener("click", openJobPreview);

  $("#closeJobPreview").addEventListener("click", closeJobPreview);

  $("#jobPreviewPanel").addEventListener("click", (event) => {
    if (event.target === event.currentTarget) closeJobPreview();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !$("#jobPreviewPanel").hidden) {
      closeJobPreview();
    }
  });

  $("#cancelJobCreate").addEventListener("click", () => {
    state.jobCreateOpen = false;
    $("#jobPreviewPanel").hidden = true;
    renderJobsToolbar();
  });

  $$("[data-settings-section]").forEach((button) => {
    button.addEventListener("click", () => {
      state.settingsSection = button.dataset.settingsSection;
      renderHrWorkspace();
    });
  });

  $("#communicationTemplateForm").addEventListener("submit", handleCommunicationTemplateSubmit);
  $("#communicationTemplateForm").addEventListener("input", renderTemplatePreview);
  $("#communicationTemplateForm").addEventListener("change", renderTemplatePreview);
  $("#templatesTable").addEventListener("click", (event) => {
    const button = event.target.closest("[data-select-template]");
    if (!button) return;
    state.selectedTemplateId = button.dataset.selectTemplate;
    renderCommunicationSettings();
  });
  $("#newTemplateButton").addEventListener("click", () => {
    state.selectedTemplateId = "";
    renderCommunicationSettings();
    $("#communicationTemplateForm input[name='name']").focus();
  });
  $("#duplicateTemplateButton").addEventListener("click", duplicateSelectedTemplate);
  $("#archiveTemplateButton").addEventListener("click", archiveSelectedTemplate);
  $("#deleteTemplateButton").addEventListener("click", deleteSelectedTemplate);
  $("#sendTemplateTestButton").addEventListener("click", sendTemplateTestEmail);
  $("#mergeFieldChips").addEventListener("click", (event) => {
    const button = event.target.closest("[data-merge-field]");
    if (!button) return;
    const textarea = $("#communicationTemplateForm textarea[name='body']");
    const token = `{{${button.dataset.mergeField}}}`;
    const start = textarea.selectionStart || textarea.value.length;
    const end = textarea.selectionEnd || textarea.value.length;
    textarea.value = `${textarea.value.slice(0, start)}${token}${textarea.value.slice(end)}`;
    textarea.focus();
    textarea.setSelectionRange(start + token.length, start + token.length);
    renderTemplatePreview();
  });

  $("#automationRuleForm").addEventListener("submit", handleAutomationRuleSubmit);
  $("#automationRuleForm").addEventListener("change", (event) => {
    if (event.target.name === "sender_account_id") {
      const account = senderAccountById(event.target.value);
      event.currentTarget.elements.sender_email.value = account.email;
      event.currentTarget.elements.reply_to.value = account.reply_to;
    }
  });
  $("#automationRulesTable").addEventListener("click", (event) => {
    const button = event.target.closest("[data-select-automation-rule]");
    if (!button) return;
    state.selectedAutomationRuleId = button.dataset.selectAutomationRule;
    renderCommunicationSettings();
  });
  $("#newAutomationRuleButton").addEventListener("click", () => {
    state.selectedAutomationRuleId = "";
    renderCommunicationSettings();
    $("#automationRuleForm input[name='name']").focus();
  });
  $("#duplicateAutomationRuleButton").addEventListener("click", duplicateSelectedAutomationRule);
  $("#deleteAutomationRuleButton").addEventListener("click", deleteSelectedAutomationRule);

  $("#jobSearch").addEventListener("input", (event) => {
    state.filters.query = event.target.value;
    resetApplicantDrilldown();
    renderApplicantPortal();
  });

  $("#departmentFilter").addEventListener("change", (event) => {
    state.filters.department = event.target.value;
    resetApplicantDrilldown();
    renderApplicantPortal();
  });

  $("#locationFilter").addEventListener("change", (event) => {
    state.filters.location = event.target.value;
    resetApplicantDrilldown();
    renderApplicantPortal();
  });

  $("#statusFilter").addEventListener("change", (event) => {
    state.filters.status = event.target.value;
    resetApplicantDrilldown();
    renderApplicantPortal();
  });

  $("#filtersToggle").addEventListener("click", () => {
    const panel = $("#jobFiltersPanel");
    const isOpening = panel.hidden;
    panel.hidden = !isOpening;
    $("#filtersToggle").setAttribute("aria-expanded", String(isOpening));
  });

  $("#resetFilters").addEventListener("click", () => {
    state.filters = { query: "", department: "All", location: "All", status: "All" };
    $("#jobSearch").value = "";
    populateFilters();
    resetApplicantDrilldown();
    renderApplicantPortal();
  });

  $("#departmentCards").addEventListener("click", (event) => {
    const button = event.target.closest("[data-department-card]");
    if (!button) return;
    state.filters.department = button.dataset.departmentCard;
    populateFilters();
    resetApplicantDrilldown();
    renderApplicantPortal();
  });

  $("#jobList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-apply-job]");
    if (!button) return;
    state.selectedJobId = button.dataset.applyJob;
    state.jobDetailOpen = true;
    state.applicationOpen = false;
    renderApplicantPortal();
    $("#jobDetailPage").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("#applicationForm").addEventListener("submit", handleApplicationSubmit);
  $("#jobForm").addEventListener("input", renderJobDraftPreview);
  $("#jobForm").addEventListener("change", renderJobDraftPreview);
  $("#jobForm").addEventListener("submit", handleJobSubmit);
  $("#jobDepartmentSelect").addEventListener("change", (event) => {
    populateSubdepartmentControls(event.target.value);
    renderJobDraftPreview();
  });
  $("#departmentForm").addEventListener("submit", handleDepartmentSubmit);
  $("#boardSettingsForm").addEventListener("submit", handleBoardSettingsSubmit);
  $("#pipelineSettingsForm").addEventListener("submit", handlePipelineSettingsSubmit);
  $("#profileForm").addEventListener("submit", handleProfileSubmit);
  $("#showApplicationButton").addEventListener("click", () => {
    state.applicationOpen = true;
    renderApplicantPortal();
    $("#applicationPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("#authForm").addEventListener("submit", handleAuthSubmit);
  $("#requestAccountForm").addEventListener("submit", handleAccountRequestSubmit);
  $("#showRequestAccount").addEventListener("click", () => {
    const requestPanel = $("#requestAccountPanel");
    const isOpening = requestPanel.hidden;
    requestPanel.hidden = !isOpening;
    $("#showRequestAccount").textContent = isOpening
      ? "Hide account request"
      : "Request a Hiring Team Account";
    if (isOpening) {
      $("#requestAccountForm input[name='full_name']").focus();
    }
  });
  $("#continueToWorkspace").addEventListener("click", () => showView("hr"));
  $("#signOutButton").addEventListener("click", () => {
    saveSession(null);
    setConnection(false, "Demo data");
    renderAuthPanel();
    renderHrWorkspace();
    showView("login");
  });

  $("#pipelineBoard").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-candidate-action]");
    if (!button) return;
    const id = button.dataset.candidateAction;
    let nextStatus = null;
    let previousStatus = null;
    let movedApplication = null;
    state.applications = state.applications.map((application) => {
      if (application.id !== id) return application;
      const next =
        state.role === "hiring_manager"
          ? getManagerStage(application.status)
          : getNextStage(application.status);
      nextStatus = next;
      previousStatus = application.status;
      movedApplication = next ? { ...application, status: next } : application;
      return movedApplication;
    });
    renderHrWorkspace();
    if (hasSupabase && state.session?.accessToken && nextStatus && !id.startsWith("app-")) {
      await supabasePatch("applications", `id=eq.${encodeURIComponent(id)}`, { status: nextStatus }, true).catch(
        () => null
      );
    }
    if (nextStatus && movedApplication) {
      await dispatchAutomationEvent("candidate_stage_changed", movedApplication, {
        previous_stage: previousStatus,
        pipeline_stage: nextStatus
      });
      renderHrWorkspace();
    }
  });

  $("#candidatesTable").addEventListener("click", (event) => {
    const button = event.target.closest("[data-view-candidate]");
    if (!button) return;
    state.selectedCandidateId = button.dataset.viewCandidate;
    state.candidateProfileTab = "communications";
    state.communicationQuery = "";
    state.manualTemplateId = "";
    state.manualSubject = "";
    state.manualBody = "";
    renderHrWorkspace();
    $("#candidateProfilePanel").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("#candidateProfilePanel").addEventListener("click", async (event) => {
    const closeButton = event.target.closest("#closeCandidateProfile");
    if (closeButton) {
      state.selectedCandidateId = "";
      renderHrWorkspace();
      return;
    }

    const tabButton = event.target.closest("[data-candidate-tab]");
    if (tabButton) {
      state.candidateProfileTab = tabButton.dataset.candidateTab;
      renderCandidateProfile();
      syncRoleControls();
      return;
    }

    const resendButton = event.target.closest("[data-resend-communication]");
    if (resendButton) {
      await resendCommunication(resendButton.dataset.resendCommunication);
    }
  });

  $("#candidateProfilePanel").addEventListener("change", (event) => {
    const application = applicationById(state.selectedCandidateId);
    if (!application) return;
    if (event.target.id === "manualTemplateSelect") {
      setManualMessageFromTemplate(application, event.target.value);
      renderCandidateProfile();
      syncRoleControls();
    }
    if (event.target.id === "manualSenderAccountSelect") {
      const account = senderAccountById(event.target.value);
      const form = $("#manualCommunicationForm");
      form.elements.reply_to.value = account.reply_to;
    }
  });

  $("#candidateProfilePanel").addEventListener("input", (event) => {
    if (event.target.id === "communicationSearch") {
      state.communicationQuery = event.target.value;
      const application = applicationById(state.selectedCandidateId);
      if (application) $("#communicationHistory").innerHTML = renderCommunicationHistory(application);
    }
    if (event.target.id === "manualCommunicationSubject") state.manualSubject = event.target.value;
    if (event.target.id === "manualCommunicationBody") state.manualBody = event.target.value;
  });

  $("#candidateProfilePanel").addEventListener("submit", (event) => {
    if (event.target.id === "manualCommunicationForm") handleManualCommunicationSubmit(event);
  });
}

async function handleProfileSubmit(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const profile = normalizeProfile({
    ...state.profile,
    avatar_url: data.avatar_url,
    full_name: data.full_name,
    email: data.email,
    title: data.title,
    department: data.department
  });

  state.profile = profile;
  saveLocalProfile(profile);
  renderProfileMenu();
  renderProfileForm();

  try {
    if (hasSupabase && state.session?.accessToken && state.session?.userId) {
      const query = `id=eq.${encodeURIComponent(state.session.userId)}`;
      const payload = {
        full_name: profile.full_name,
        email: profile.email || null,
        title: profile.title || null,
        department: profile.department || null,
        avatar_url: profile.avatar_url || null
      };
      try {
        await supabasePatch("profiles", query, payload, true);
      } catch (error) {
        const { avatar_url: _avatarUrl, ...fallbackPayload } = payload;
        await supabasePatch("profiles", query, fallbackPayload, true);
      }
      showMessage("#profileMessage", "Profile saved.");
      return;
    }

    showMessage("#profileMessage", "Profile saved for this preview.");
  } catch (error) {
    showMessage("#profileMessage", "Profile saved locally. Supabase profile save needs your signed-in account.");
  }
}

async function handleDepartmentSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  const name = String(data.department_name || "").trim();
  const parentId = data.parent_id || null;
  if (!name) return;

  const duplicate = activeDepartments().some(
    (department) =>
      department.parent_id === parentId &&
      department.name.toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    showMessage("#departmentMessage", "That department already exists.");
    return;
  }

  let department = {
    id: `dept-${Date.now()}`,
    name,
    parent_id: parentId,
    status: "active"
  };

  try {
    if (hasSupabase && state.session?.accessToken) {
      const [created] = await supabaseInsert(
        "departments",
        {
          name: department.name,
          parent_id: department.parent_id || null,
          status: department.status
        },
        true
      );
      if (created?.id) department = normalizeDepartment(created);
      showMessage("#departmentMessage", department.parent_id ? "Subdepartment created." : "Department created.");
    } else if (hasSupabase) {
      throw new Error("Missing admin session");
    } else {
      showMessage("#departmentMessage", "Department created for this preview.");
    }
  } catch (error) {
    showMessage("#departmentMessage", "Department created locally. Supabase save requires an admin account.");
  }

  state.departments = normalizeDepartments([...state.departments, department]);
  saveLocalDepartments(state.departments);
  form.reset();
  populateFilters();
  renderApplicantPortal();
  renderHrWorkspace();
}

async function handleBoardSettingsSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  const settings = normalizeBoardSettings({
    id: "default",
    hero_image_url: data.hero_image_url,
    hero_eyebrow: data.hero_eyebrow,
    hero_title: data.hero_title,
    hero_subtitle: data.hero_subtitle,
    overlay_opacity: data.overlay_opacity
  });

  state.boardSettings = settings;
  saveLocalBoardSettings(settings);
  renderApplicantPortal();
  renderBoardSettingsForm();

  try {
    if (hasSupabase && state.session?.accessToken) {
      const [saved] = await supabaseUpsert(
        "job_board_settings",
        {
          id: "default",
          hero_image_url: settings.hero_image_url,
          hero_eyebrow: settings.hero_eyebrow,
          hero_title: settings.hero_title,
          hero_subtitle: settings.hero_subtitle,
          overlay_opacity: settings.overlay_opacity
        },
        true
      );
      if (saved) {
        state.boardSettings = normalizeBoardSettings(saved);
        saveLocalBoardSettings(state.boardSettings);
      }
      showMessage("#boardSettingsMessage", "Job board layout saved.");
      return;
    }

    showMessage("#boardSettingsMessage", "Preview updated. Supabase sign-in is needed to save live.");
  } catch (error) {
    showMessage("#boardSettingsMessage", "Preview updated. Supabase save requires an admin account.");
  }
}

async function handlePipelineSettingsSubmit(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const settings = normalizePipelineSettings({
    id: "default",
    stages: pipelineStages.reduce(
      (labels, stage) => ({
        ...labels,
        [stage]: data[stage]
      }),
      {}
    )
  });

  state.pipelineSettings = settings;
  saveLocalPipelineSettings(settings);
  renderHrWorkspace();

  try {
    if (hasSupabase && state.session?.accessToken) {
      const [saved] = await supabaseUpsert(
        "pipeline_settings",
        {
          id: "default",
          stages: settings.stages
        },
        true
      );
      if (saved) {
        state.pipelineSettings = normalizePipelineSettings(saved);
        saveLocalPipelineSettings(state.pipelineSettings);
        renderHrWorkspace();
      }
      showMessage("#pipelineSettingsMessage", "Pipeline saved.");
      return;
    }

    showMessage("#pipelineSettingsMessage", "Preview updated. Supabase sign-in is needed to save live.");
  } catch (error) {
    showMessage("#pipelineSettingsMessage", "Preview updated. Supabase save requires an admin account.");
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  if (!hasSupabase) {
    showMessage("#authMessage", "Add Supabase environment values first.");
    return;
  }

  const formData = new FormData(event.currentTarget);
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!username || !password) return;

  showMessage("#authMessage", "Signing in...");

  const response = await fetch(`${env.supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: env.supabaseAnonKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: username,
      password
    })
  });

  let responseBody = {};
  try {
    responseBody = await response.json();
  } catch (error) {
    responseBody = {};
  }

  if (!response.ok) {
    showMessage(
      "#authMessage",
      `Supabase error: ${responseBody.error_description || responseBody.msg || responseBody.message || "invalid username or password"}`
    );
    return;
  }

  saveSession({
    accessToken: responseBody.access_token,
    refreshToken: responseBody.refresh_token,
    userId: responseBody.user?.id || "",
    email: responseBody.user?.email || username,
    expiresAt: responseBody.expires_at || ""
  });
  event.currentTarget.reset();
  renderAuthPanel();
  await loadSupabaseData();
  renderApplicantPortal();
  renderHrWorkspace();
  showView("hr");
}

async function handleAccountRequestSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submitButton = $("button[type='submit']", form);
  const data = Object.fromEntries(new FormData(form));

  submitButton.disabled = true;
  showMessage("#requestAccountMessage", "Sending request...");

  try {
    const response = await fetch("/.netlify/functions/request-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        full_name: data.full_name?.trim(),
        email: data.email?.trim(),
        requested_role: data.requested_role,
        department: data.department?.trim(),
        message: data.message?.trim()
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || "Request could not be sent.");
    }

    form.reset();
    showMessage("#requestAccountMessage", result.message || "Request sent to HR.");
  } catch (error) {
    showMessage("#requestAccountMessage", accountRequestErrorMessage(error.message));
  } finally {
    submitButton.disabled = false;
  }
}

async function handleApplicationSubmit(event) {
  event.preventDefault();
  const selectedJob = state.jobs.find((job) => job.id === state.selectedJobId);
  if (!selectedJob) return;

  const data = Object.fromEntries(new FormData(event.currentTarget));
  const application = {
    id: `app-${Date.now()}`,
    job_id: selectedJob.id,
    full_name: data.full_name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    resume_url: data.resume_url.trim(),
    cover_note: data.cover_note.trim(),
    status: "new",
    source: "Career site",
    score: 74,
    applied_at: new Date().toISOString().slice(0, 10),
    recruiter: "Unassigned"
  };

  try {
    if (hasSupabase) {
      const [created] = await supabaseInsert("applications", {
        job_id: application.job_id,
        full_name: application.full_name,
        email: application.email,
        phone: application.phone,
        resume_url: application.resume_url,
        cover_note: application.cover_note,
        status: application.status,
        source: application.source
      });
      if (created?.id) application.id = created.id;
    }
    state.applications.unshift(application);
    event.currentTarget.reset();
    showMessage("#applicationMessage", "Application submitted.");
    await dispatchAutomationEvent("candidate_applies", application);
    renderHrWorkspace();
  } catch (error) {
    showMessage("#applicationMessage", "Saved locally. Supabase write needs project permissions.");
    state.applications.unshift(application);
    await dispatchAutomationEvent("candidate_applies", application);
    renderHrWorkspace();
  }
}

async function handleJobSubmit(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const department = getDepartmentById(data.department_id);
  const subdepartment = getDepartmentById(data.subdepartment_id);
  const [salaryMin, salaryMax] = normalizeSalaryValues(numberOrNull(data.salary_min), numberOrNull(data.salary_max));
  const jobDescription = String(data.job_description || "").trim();
  const seoKeywords = parseKeywords(data.seo_keywords);
  const job = {
    id: `job-${Date.now()}`,
    title: data.title.trim(),
    department_id: department?.id || "",
    subdepartment_id: subdepartment?.id || "",
    department: department?.name || "General",
    subdepartment: subdepartment?.name || "",
    location: data.location.trim(),
    work_type: data.work_type,
    status: data.status,
    hiring_manager: data.hiring_manager.trim(),
    summary: summarizeText(jobDescription) || "Details will be shared during screening.",
    salary_min: salaryMin,
    salary_max: salaryMax,
    salary_range: buildSalaryRange(salaryMin, salaryMax),
    job_description: jobDescription,
    requirements: String(data.requirements || "").trim(),
    benefits: String(data.benefits || "").trim(),
    seo_title: String(data.seo_title || "").trim(),
    seo_description: String(data.seo_description || "").trim(),
    seo_keywords: seoKeywords,
    review_days: 5,
    remote: data.location.toLowerCase().includes("remote") || data.location.toLowerCase().includes("hybrid"),
    skills: seoKeywords.length ? seoKeywords.slice(0, 6) : ["Role fit", "Team communication", "Execution"],
    applicants: 0,
    interviews: 0,
    posted_at: new Date().toISOString().slice(0, 10)
  };

  try {
    if (hasSupabase && state.session?.accessToken) {
      const baseJobPayload = {
        title: job.title,
        department: job.department,
        location: job.location,
        work_type: job.work_type,
        status: job.status,
        hiring_manager: job.hiring_manager,
        summary: job.summary,
        salary_range: job.salary_range,
        review_days: job.review_days,
        remote: job.remote,
        skills: job.skills
      };
      const expandedJobPayload = {
        ...baseJobPayload,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        job_description: job.job_description,
        requirements: job.requirements,
        benefits: job.benefits,
        seo_title: job.seo_title || null,
        seo_description: job.seo_description || null,
        seo_keywords: job.seo_keywords
      };
      const departmentJobPayload = {
        department_id: job.department_id || null,
        subdepartment_id: job.subdepartment_id || null,
        subdepartment: job.subdepartment || null
      };
      let createdJobs = [];
      try {
        createdJobs = await supabaseInsert(
          "jobs",
          {
            ...expandedJobPayload,
            ...departmentJobPayload
          },
          true
        );
      } catch (error) {
        try {
          createdJobs = await supabaseInsert(
            "jobs",
            {
              ...baseJobPayload,
              ...departmentJobPayload
            },
            true
          );
        } catch (fallbackError) {
          createdJobs = await supabaseInsert("jobs", baseJobPayload, true);
        }
      }
      const [created] = createdJobs;
      if (created?.id) job.id = created.id;
    } else if (hasSupabase) {
      throw new Error("Missing HR session");
    }
    state.jobs.unshift(job);
    if (job.status === "published") state.selectedJobId = job.id;
    state.jobCreateOpen = false;
    event.currentTarget.reset();
    populateJobDepartmentControls();
    showMessage("#jobFormMessage", "Job created.");
    populateFilters();
    renderApplicantPortal();
    renderHrWorkspace();
  } catch (error) {
    state.jobs.unshift(job);
    state.jobCreateOpen = false;
    showMessage("#jobFormMessage", "Created locally. HR writes need Supabase auth.");
    populateFilters();
    renderApplicantPortal();
    renderHrWorkspace();
  }
}

function activateHashView() {
  const hash = location.hash.replace("#", "");
  if (["landing", "applicant", "login", "hr"].includes(hash)) {
    showView(hash, false);
    return;
  }

  showView("landing", false);
}

async function init() {
  bindEvents();
  renderHrWorkspace();
  await refreshCurrentUser();
  await loadSupabaseData();
  populateFilters();
  renderApplicantPortal();
  renderHrWorkspace();
  activateHashView();
}

init();
