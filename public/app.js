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

const pipelineStages = ["new", "screening", "interview", "offer", "hired"];

const defaultPipelineLabels = {
  new: "New",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired"
};

const defaultWorkflows = [
  {
    id: "workflow-standard",
    name: "Standard hiring",
    status: "active",
    stages: {
      new: "New",
      screening: "Screening",
      interview: "Interview",
      offer: "Offer",
      hired: "Hired"
    }
  },
  {
    id: "workflow-clinical",
    name: "Clinical hiring",
    status: "active",
    stages: {
      new: "Applied",
      screening: "Credential review",
      interview: "Clinical interview",
      offer: "Offer",
      hired: "Hired"
    }
  },
  {
    id: "workflow-high-volume",
    name: "High-volume hiring",
    status: "active",
    stages: {
      new: "Applied",
      screening: "Phone screen",
      interview: "Team interview",
      offer: "Ready to offer",
      hired: "Hired"
    }
  }
];

const requirementOptions = [
  { value: "mandatory", label: "Mandatory" },
  { value: "optional", label: "Optional" },
  { value: "not_required", label: "Not required" }
];

const onboardingDocumentTypes = [
  {
    id: "i9",
    label: "Form I-9",
    keywords: ["i-9", "i9", "employment eligibility", "uscis"]
  },
  {
    id: "w4",
    label: "Federal W-4",
    keywords: ["w-4", "w4", "withholding", "allowance", "tax"]
  },
  {
    id: "direct_deposit",
    label: "Direct deposit",
    keywords: ["direct deposit", "routing", "account number", "payroll"]
  },
  {
    id: "identification",
    label: "Government ID",
    keywords: ["driver license", "passport", "identification", "government id", "photo id"]
  },
  {
    id: "credentials",
    label: "License or certification",
    keywords: ["license", "licensure", "certification", "credential", "certificate"]
  },
  {
    id: "background",
    label: "Background authorization",
    keywords: ["background", "authorization", "consent", "screening"]
  }
];

const onboardingStorageBucket = "onboarding-documents";

const jobStatusOptions = ["published", "draft", "internal", "confidential"];

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
  { key: "candidate_first_name", label: "Candidate first name" },
  { key: "candidate_last_name", label: "Candidate last name" },
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

const communicationTemplateTypes = ["Automated email", "Manual email", "Interview email", "Offer email", "Status update"];

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
      "Hello {{candidate_first_name}},\n\nThank you for applying for {{job_title}} at {{company_name}}. Our hiring team has received your application and will review your experience soon.\n\nIf your background aligns with the role, {{recruiter_name}} will contact you with next steps.\n\nThank you,\n{{company_name}} Careers",
    category: "Application",
    template_type: "Automated email",
    status: "active",
    archived_at: ""
  },
  {
    id: "tmpl-interview-stage",
    name: "Interview stage follow-up",
    subject: "Next steps for {{job_title}}",
    body:
      "Hello {{candidate_first_name}},\n\nWe are glad to move you forward for {{job_title}}. The next step is an interview with our team.\n\nInterview timing: {{interview_date_time}}\n\nPlease reply to {{reply_to}} with any scheduling questions.\n\nThank you,\n{{recruiter_name}}",
    category: "Interview",
    template_type: "Interview email",
    status: "active",
    archived_at: ""
  },
  {
    id: "tmpl-offer-sent",
    name: "Offer sent",
    subject: "Offer details for {{job_title}}",
    body:
      "Hello {{candidate_first_name}},\n\nWe are excited to share offer details for {{job_title}} with {{company_name}}.\n\n{{offer_details}}\n\nPlease review and reply to {{reply_to}} with any questions.\n\nWarmly,\n{{recruiter_name}}",
    category: "Offer",
    template_type: "Offer email",
    status: "active",
    archived_at: ""
  },
  {
    id: "tmpl-status-update",
    name: "Candidate status update",
    subject: "Update from {{company_name}} Careers",
    body:
      "Hello {{candidate_first_name}},\n\nThank you for your interest in {{job_title}}. We wanted to share that your current application stage is {{application_stage}}.\n\nWe appreciate your time and interest in {{company_name}}.\n\nThank you,\n{{company_name}} Careers",
    category: "Status update",
    template_type: "Status update",
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
    workflow_id: "workflow-standard",
    recruiter_name: "Sam Lee",
    review_lead: "Maya Rivera",
    team_members: "Maya Rivera, Sam Lee",
    application_summary: "Resume and contact information are required for this role.",
    summary_requirement: "optional",
    resume_requirement: "mandatory",
    cover_letter_requirement: "optional",
    phone_requirement: "mandatory",
    custom_question_requirement: "mandatory",
    require_resume: true,
    require_cover_letter: false,
    require_phone: true,
    application_question: "Share one recruiting process improvement you have led.",
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
    workflow_id: "workflow-standard",
    recruiter_name: "Sam Lee",
    review_lead: "Noah Chen",
    team_members: "Noah Chen, Sam Lee",
    application_summary: "Resume and phone number are required. Cover letters are optional.",
    summary_requirement: "optional",
    resume_requirement: "mandatory",
    cover_letter_requirement: "optional",
    phone_requirement: "mandatory",
    custom_question_requirement: "mandatory",
    require_resume: true,
    require_cover_letter: false,
    require_phone: true,
    application_question: "What client partnership experience is most relevant to this role?",
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
    workflow_id: "workflow-high-volume",
    recruiter_name: "Rina Patel",
    review_lead: "Priya Shah",
    team_members: "Priya Shah, Rina Patel",
    application_summary: "Resume is required. Include links to dashboards or analytics samples if available.",
    summary_requirement: "not_required",
    resume_requirement: "mandatory",
    cover_letter_requirement: "not_required",
    phone_requirement: "optional",
    custom_question_requirement: "mandatory",
    require_resume: true,
    require_cover_letter: false,
    require_phone: false,
    application_question: "Which analytics tools have you used most recently?",
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
    workflow_id: "workflow-clinical",
    recruiter_name: "Sam Lee",
    review_lead: "Elena Brooks",
    team_members: "Elena Brooks, Sam Lee",
    application_summary: "Resume, phone number, and licensure details are required for clinical review.",
    summary_requirement: "optional",
    resume_requirement: "mandatory",
    cover_letter_requirement: "optional",
    phone_requirement: "mandatory",
    custom_question_requirement: "mandatory",
    require_resume: true,
    require_cover_letter: false,
    require_phone: true,
    application_question: "List any relevant licenses, certifications, or scheduling constraints.",
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
    workflow_id: "workflow-standard",
    recruiter_name: "Rina Patel",
    review_lead: "Avery Stone",
    team_members: "Avery Stone, Rina Patel",
    application_summary: "Resume and systems experience summary are required.",
    summary_requirement: "mandatory",
    resume_requirement: "mandatory",
    cover_letter_requirement: "mandatory",
    phone_requirement: "mandatory",
    custom_question_requirement: "mandatory",
    require_resume: true,
    require_cover_letter: true,
    require_phone: true,
    application_question: "Which HR systems have you administered?",
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
    phone: "(732) 555-0148",
    resume_url: "https://example.com/jordan-ellis-resume.pdf",
    cover_note: "Interested in building thoughtful recruiting programs for clinical teams.",
    candidate_summary_response: "Experienced recruiter focused on candidate experience and structured hiring.",
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
    phone: "(732) 555-0162",
    resume_url: "https://example.com/amara-okafor-resume.pdf",
    cover_note: "Looking forward to supporting client-facing operations.",
    candidate_summary_response: "Client operations leader with scheduling and quality improvement experience.",
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
    phone: "(732) 555-0187",
    resume_url: "https://example.com/miles-bennett-resume.pdf",
    cover_note: "Excited by reporting and data quality work.",
    candidate_summary_response: "Analytics professional who enjoys translating data into decisions.",
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
    phone: "(732) 555-0194",
    resume_url: "https://example.com/sophia-nguyen-resume.pdf",
    cover_note: "Ready to help Bright Harbor scale recruiting operations.",
    candidate_summary_response: "Talent operations specialist with onboarding and compliance coordination experience.",
    status: "hired",
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
    phone: "(732) 555-0126",
    resume_url: "https://example.com/ethan-murphy-resume.pdf",
    cover_note: "Interested in coordinating clinical program staffing.",
    candidate_summary_response: "Program coordinator with a background in clinical team support.",
    status: "screening",
    score: 82,
    source: "Career site",
    applied_at: "2026-07-25",
    recruiter: "Sam Lee"
  },
  {
    id: "app-206",
    job_id: "job-105",
    full_name: "Leah Martinez",
    email: "leah.martinez@example.com",
    phone: "(732) 555-0175",
    resume_url: "https://example.com/leah-martinez-resume.pdf",
    cover_note: "Prepared to partner with people leaders on hiring operations.",
    candidate_summary_response: "People operations generalist with employee records and onboarding experience.",
    status: "offer",
    score: 89,
    source: "Career site",
    applied_at: "2026-07-18",
    recruiter: "Rina Patel"
  }
];

const demoOnboardingDocuments = [
  {
    id: "on-doc-001",
    application_id: "app-204",
    file_name: "Sophia Nguyen onboarding packet - I-9 W-4 direct deposit.txt",
    file_type: "text/plain",
    file_size: 1480,
    matched_type_ids: ["i9", "w4", "direct_deposit"],
    uploaded_at: "2026-08-01T14:30:00.000Z",
    scan_notes: "Detected Form I-9, Federal W-4, and direct deposit keywords.",
    content_text:
      "Bright Harbor onboarding packet for Sophia Nguyen\nIncluded sheets: Form I-9 employment eligibility, Federal W-4 withholding, direct deposit payroll authorization."
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
  hrSection: "home",
  settingsSection: "departments",
  hrJobQuery: "",
  hrJobFilters: {
    status: "All",
    department: "All",
    workType: "All"
  },
  jobCreateOpen: false,
  session: readInitialSession(),
  profile: initialProfile,
  boardSettings: readLocalBoardSettings(),
  departments: readLocalDepartments(),
  pipelineSettings: readLocalPipelineSettings(),
  workflows: readLocalWorkflows(),
  communicationTemplates: readLocalCommunicationTemplates(),
  automationRules: readLocalAutomationRules(),
  senderAccounts: readLocalSenderAccounts(),
  communications: readLocalCommunications(),
  selectedTemplateId: "",
  selectedAutomationRuleId: "",
  selectedWorkflowId: "",
  selectedCandidateId: demoApplications[0]?.id || "",
  candidateProfileTab: "communications",
  communicationQuery: "",
  manualTemplateId: "",
  manualSubject: "",
  manualBody: "",
  selectedOnboardingApplicationId: demoApplications.find((application) => application.status === "hired")?.id || "",
  onboardingDocuments: demoOnboardingDocuments.map(normalizeOnboardingDocument),
  selectedOnboardingDocumentId: "",
  jobCreateTab: "description",
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

async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
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

function normalizeWorkflow(workflow = {}) {
  const sourceStages = workflow.stages || workflow;
  const stages = pipelineStages.reduce((labels, stage) => {
    const value = String(sourceStages?.[stage] || "").trim();
    return {
      ...labels,
      [stage]: value || defaultPipelineLabels[stage]
    };
  }, {});

  return {
    id: String(workflow.id || newClientId("workflow")),
    name: String(workflow.name || "Custom workflow").trim(),
    status: workflow.status === "inactive" ? "inactive" : "active",
    stages,
    created_at: workflow.created_at || "",
    updated_at: workflow.updated_at || ""
  };
}

function normalizeWorkflows(workflows = []) {
  return workflows
    .map(normalizeWorkflow)
    .filter((workflow) => workflow.id && workflow.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function readLocalWorkflows() {
  try {
    const saved = JSON.parse(localStorage.getItem("bhc-workflows") || "null");
    return normalizeWorkflows(Array.isArray(saved) && saved.length ? saved : defaultWorkflows);
  } catch (error) {
    return normalizeWorkflows(defaultWorkflows);
  }
}

function saveLocalWorkflows(workflows) {
  try {
    localStorage.setItem("bhc-workflows", JSON.stringify(workflows));
  } catch (error) {
    return;
  }
}

function activeWorkflows() {
  return state.workflows.filter((workflow) => workflow.status === "active");
}

function defaultWorkflow() {
  return (
    activeWorkflows().find((workflow) => workflow.id === "workflow-standard") ||
    activeWorkflows()[0] ||
    normalizeWorkflow(defaultWorkflows[0])
  );
}

function workflowById(id) {
  return state.workflows.find((workflow) => workflow.id === id) || null;
}

function workflowForJob(job = {}) {
  return workflowById(job.workflow_id) || defaultWorkflow();
}

function workflowEntries(workflow = defaultWorkflow()) {
  const labels = workflow?.stages || defaultPipelineLabels;
  return pipelineStages.map((stage) => [stage, labels[stage] || defaultPipelineLabels[stage]]);
}

function workflowLabelForApplication(application = {}) {
  const job = jobById(application.job_id);
  return workflowForJob(job).stages?.[application.status] || pipelineLabel(application.status);
}

function normalizeRequirement(value, fallback = "optional") {
  if (value === true || value === "required") return "mandatory";
  if (value === false) return fallback === "not_required" ? "not_required" : "optional";
  const normalized = String(value || "").trim().toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
  return requirementOptions.some((option) => option.value === normalized) ? normalized : fallback;
}

function requirementLabel(value) {
  const normalized = normalizeRequirement(value);
  return requirementOptions.find((option) => option.value === normalized)?.label || "Optional";
}

function isMandatoryRequirement(value) {
  return normalizeRequirement(value) === "mandatory";
}

function isVisibleRequirement(value) {
  return normalizeRequirement(value) !== "not_required";
}

function requirementForJob(job = {}, field, legacyBoolean, fallback = "optional") {
  return normalizeRequirement(job[field], job[legacyBoolean] === true ? "mandatory" : job[legacyBoolean] === false ? fallback : fallback);
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

function normalizeOnboardingRecord(record = {}) {
  return {
    employee_id: String(record.employee_id || "").trim(),
    department_id: String(record.department_id || "").trim(),
    department_name: String(record.department_name || "").trim(),
    manager_name: String(record.manager_name || "").trim(),
    reports_to: String(record.reports_to || "").trim(),
    start_date: String(record.start_date || "").trim(),
    work_location: String(record.work_location || "").trim(),
    employment_type: String(record.employment_type || "").trim()
  };
}

function normalizeOnboardingDocument(record = {}) {
  const uploadedAt = record.uploaded_at || record.created_at || new Date().toISOString();
  return {
    id: String(record.id || newClientId("on-doc")),
    application_id: String(record.application_id || ""),
    file_name: String(record.file_name || "Onboarding document").trim(),
    file_type: String(record.file_type || "application/octet-stream").trim(),
    file_size: Number(record.file_size || 0),
    storage_bucket: String(record.storage_bucket || onboardingStorageBucket).trim(),
    storage_path: String(record.storage_path || "").trim(),
    matched_type_ids: Array.isArray(record.matched_type_ids) ? record.matched_type_ids.map(String) : [],
    scan_notes: String(record.scan_notes || record.scan_summary || "Uploaded for HR review.").trim(),
    content_text: String(record.content_text || ""),
    file: record.file,
    object_url: record.object_url || "",
    uploaded_at: uploadedAt,
    created_at: record.created_at || uploadedAt,
    status: String(record.status || "uploaded").trim()
  };
}

function normalizeTemplateType(value = "") {
  const normalized = String(value || "").trim();
  return communicationTemplateTypes.includes(normalized) ? normalized : "Automated email";
}

function normalizeCommunicationTemplate(template = {}) {
  return {
    id: String(template.id || newClientId("tmpl")),
    name: String(template.name || "").trim(),
    subject: String(template.subject || "").trim(),
    body: String(template.body || "").trim(),
    category: String(template.category || "General").trim() || "General",
    template_type: normalizeTemplateType(template.template_type),
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

function candidateNameParts(name = "") {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return {
    first: parts[0] || "Candidate",
    last: parts.length > 1 ? parts[parts.length - 1] : ""
  };
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
  const candidateName = application.full_name || details.candidate_name || "Candidate";
  const nameParts = candidateNameParts(candidateName);
  return {
    candidate_name: candidateName,
    candidate_first_name: nameParts.first,
    candidate_last_name: nameParts.last,
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

function departmentById(id) {
  return state.departments.find((department) => department.id === id) || null;
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

function descendantDepartmentIds(departmentId, departments = activeDepartments()) {
  const children = departments.filter((department) => department.parent_id === departmentId);
  return children.reduce((ids, child) => {
    ids.add(child.id);
    descendantDepartmentIds(child.id, departments).forEach((id) => ids.add(id));
    return ids;
  }, new Set());
}

function eligibleParentDepartments(departmentId = "") {
  const blockedIds = departmentId
    ? new Set([departmentId, ...descendantDepartmentIds(departmentId)])
    : new Set();
  return activeDepartments()
    .filter((department) => !blockedIds.has(department.id))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function departmentDisplayRows() {
  const departments = activeDepartments();
  const byParent = departments.reduce((map, department) => {
    const parentKey = department.parent_id || "";
    if (!map.has(parentKey)) map.set(parentKey, []);
    map.get(parentKey).push(department);
    return map;
  }, new Map());
  const rows = [];
  const visited = new Set();

  const walk = (parentId = "", depth = 0) => {
    const children = (byParent.get(parentId) || []).slice().sort((a, b) => a.name.localeCompare(b.name));
    children.forEach((department) => {
      if (visited.has(department.id)) return;
      visited.add(department.id);
      rows.push({ department, depth });
      walk(department.id, depth + 1);
    });
  };

  walk();
  departments
    .filter((department) => !visited.has(department.id))
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((department) => rows.push({ department, depth: 0 }));
  return rows;
}

function departmentParentOptions(departmentId = "", selectedParentId = "") {
  const selectedParent = selectedParentId ? getDepartmentById(selectedParentId) : null;
  const options = eligibleParentDepartments(departmentId);
  if (selectedParent && !options.some((department) => department.id === selectedParent.id)) {
    options.push(selectedParent);
  }
  return options.sort((a, b) => a.name.localeCompare(b.name));
}

function renderDepartmentParentOptions(departmentId = "", selectedParentId = "") {
  return [
    `<option value="">None - parent department</option>`,
    ...departmentParentOptions(departmentId, selectedParentId).map(
      (department) =>
        `<option value="${escapeAttribute(department.id)}"${department.id === selectedParentId ? " selected" : ""}>${escapeHtml(department.name)}</option>`
    )
  ].join("");
}

function syncJobsWithDepartments() {
  state.jobs = state.jobs.map((job) => {
    const department = getDepartmentById(job.department_id);
    const subdepartment = getDepartmentById(job.subdepartment_id);

    if (subdepartment?.parent_id) {
      const parent = getDepartmentById(subdepartment.parent_id);
      return {
        ...job,
        department_id: parent?.id || "",
        department: parent?.name || job.department || "General",
        subdepartment_id: subdepartment.id,
        subdepartment: subdepartment.name
      };
    }

    if (department?.parent_id) {
      const parent = getDepartmentById(department.parent_id);
      return {
        ...job,
        department_id: parent?.id || "",
        department: parent?.name || job.department || "General",
        subdepartment_id: department.id,
        subdepartment: department.name
      };
    }

    if (department) {
      return {
        ...job,
        department_id: department.id,
        department: department.name,
        subdepartment_id:
          subdepartment && subdepartment.parent_id === department.id ? subdepartment.id : "",
        subdepartment:
          subdepartment && subdepartment.parent_id === department.id ? subdepartment.name : ""
      };
    }

    if (subdepartment && !subdepartment.parent_id) {
      return {
        ...job,
        department_id: subdepartment.id,
        department: subdepartment.name,
        subdepartment_id: "",
        subdepartment: ""
      };
    }

    return {
      ...job,
      department_id: job.department_id && !department ? "" : job.department_id,
      department: job.department_id && !department ? "General" : job.department,
      subdepartment_id: job.subdepartment_id && !subdepartment ? "" : job.subdepartment_id,
      subdepartment: job.subdepartment_id && !subdepartment ? "" : job.subdepartment
    };
  });
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
    if (state.session?.accessToken) {
      await loadPipelineSettings();
      await loadWorkflows();
    }

    let jobs = [];
    try {
      jobs = await supabaseSelect(
        "jobs",
        "select=id,title,department,department_id,subdepartment,subdepartment_id,location,work_type,status,hiring_manager,workflow_id,recruiter_name,review_lead,team_members,application_summary,summary_requirement,resume_requirement,cover_letter_requirement,phone_requirement,custom_question_requirement,require_resume,require_cover_letter,require_phone,application_question,summary,salary_range,salary_min,salary_max,job_description,requirements,benefits,seo_title,seo_description,seo_keywords,review_days,remote,skills,posted_at&order=posted_at.desc"
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
        workflow_id: job.workflow_id || defaultWorkflow().id,
        recruiter_name: job.recruiter_name || "",
        review_lead: job.review_lead || "",
        team_members: job.team_members || "",
        application_summary: job.application_summary || "Resume and contact information are requested for this role.",
        summary_requirement: normalizeRequirement(job.summary_requirement, "optional"),
        resume_requirement: normalizeRequirement(job.resume_requirement, job.require_resume === false ? "optional" : "mandatory"),
        cover_letter_requirement: normalizeRequirement(
          job.cover_letter_requirement,
          job.require_cover_letter ? "mandatory" : "optional"
        ),
        phone_requirement: normalizeRequirement(job.phone_requirement, job.require_phone === false ? "optional" : "mandatory"),
        custom_question_requirement: normalizeRequirement(job.custom_question_requirement, "mandatory"),
        require_resume: job.require_resume !== false,
        require_cover_letter: Boolean(job.require_cover_letter),
        require_phone: job.require_phone !== false,
        application_question: job.application_question || "",
        job_description: job.job_description || job.summary || "",
        requirements: job.requirements || "",
        benefits: job.benefits || "",
        seo_keywords: parseKeywords(job.seo_keywords || job.skills || []),
        skills: Array.isArray(job.skills) ? job.skills : parseKeywords(job.skills),
        applicants: demoApplications.filter((application) => application.job_id === job.id).length,
        interviews: demoApplications.filter(
          (application) => application.job_id === job.id && application.status === "interview"
        ).length,
        status: normalizeJobStatus(job.status)
      }));
      syncJobsWithDepartments();
      state.selectedJobId = state.jobs.find((job) => job.status === "published")?.id || state.jobs[0].id;
      setConnection(true, "Supabase public data");
    }

    if (state.session?.accessToken) {
      const applications = await supabaseSelect(
        "applications",
        "select=id,job_id,full_name,email,phone,resume_url,cover_note,application_answers,status,score,source,applied_at&order=applied_at.desc",
        true
      );
      if (Array.isArray(applications)) {
        state.applications = applications.map((application) => ({
          ...application,
          applied_at: application.applied_at?.slice(0, 10),
          candidate_summary_response: application.application_answers?.["Candidate summary"] || "",
          recruiter: "Assigned"
        }));
        setConnection(true, "Supabase HR connected");
      }
      await loadCommunicationData();
      await loadOnboardingData();
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

async function loadWorkflows() {
  try {
    const workflows = await supabaseSelect(
      "workflows",
      "select=id,name,status,stages,created_at,updated_at&order=name.asc",
      true
    );
    if (Array.isArray(workflows) && workflows.length) {
      state.workflows = normalizeWorkflows(workflows);
      saveLocalWorkflows(state.workflows);
    }
  } catch (error) {
    return;
  }
}

async function loadCommunicationData() {
  if (!hasSupabase || !state.session?.accessToken) return;

  try {
    let templates = [];
    try {
      templates = await supabaseSelect(
        "communication_templates",
        "select=id,name,subject,body,category,template_type,status,archived_at,created_at,updated_at&order=name.asc",
        true
      );
    } catch (error) {
      templates = await supabaseSelect(
        "communication_templates",
        "select=id,name,subject,body,category,status,archived_at,created_at,updated_at&order=name.asc",
        true
      );
    }
    const [rules, accounts, communications] = await Promise.all([
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

async function loadOnboardingData() {
  if (!hasSupabase || !state.session?.accessToken) return;

  try {
    const [records, documents] = await Promise.all([
      supabaseSelect(
        "onboarding_records",
        "select=application_id,employee_id,department_id,department_name,manager_name,reports_to,start_date,work_location,employment_type,created_at,updated_at",
        true
      ),
      supabaseSelect(
        "onboarding_documents",
        "select=id,application_id,file_name,file_type,file_size,storage_bucket,storage_path,matched_type_ids,scan_summary,status,uploaded_at,created_at,updated_at&order=uploaded_at.desc",
        true
      )
    ]);

    const recordsByApplication = new Map(
      (Array.isArray(records) ? records : []).map((record) => [
        String(record.application_id),
        normalizeOnboardingRecord(record)
      ])
    );
    state.applications = state.applications.map((application) => {
      const onboarding = recordsByApplication.get(String(application.id));
      return onboarding ? { ...application, onboarding } : application;
    });
    state.onboardingDocuments = Array.isArray(documents)
      ? documents.map(normalizeOnboardingDocument)
      : [];
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
  renderApplicationRequirements(selectedJob);
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

function renderApplicationRequirements(job) {
  if (!job) return;

  const note = $("#applicationRequirementsNote");
  const phoneField = $("#phoneApplicationField");
  const resumeField = $("#resumeApplicationField");
  const summaryField = $("#summaryApplicationField");
  const coverField = $("#coverLetterApplicationField");
  const questionField = $("#customQuestionApplicationField");
  if (!note || !phoneField || !resumeField || !summaryField || !coverField || !questionField) return;

  const phoneInput = $("input[name='phone']");
  const resumeInput = $("input[name='resume_url']");
  const summaryInput = $("textarea[name='candidate_summary_response']");
  const coverInput = $("textarea[name='cover_note']");
  const questionInput = $("textarea[name='custom_question_response']");
  const summaryRequirement = requirementForJob(job, "summary_requirement", "require_summary", "optional");
  const resumeRequirement = requirementForJob(job, "resume_requirement", "require_resume", "mandatory");
  const coverRequirement = requirementForJob(job, "cover_letter_requirement", "require_cover_letter", "optional");
  const phoneRequirement = requirementForJob(job, "phone_requirement", "require_phone", "mandatory");
  const questionRequirement = requirementForJob(job, "custom_question_requirement", "require_custom_question", "mandatory");

  note.textContent = job.application_summary || "Complete the requested fields below to apply.";
  phoneField.hidden = !isVisibleRequirement(phoneRequirement);
  resumeField.hidden = !isVisibleRequirement(resumeRequirement);
  summaryField.hidden = !isVisibleRequirement(summaryRequirement);
  coverField.hidden = !isVisibleRequirement(coverRequirement);
  phoneInput.required = isMandatoryRequirement(phoneRequirement);
  resumeInput.required = isMandatoryRequirement(resumeRequirement);
  summaryInput.required = isMandatoryRequirement(summaryRequirement);
  coverInput.required = isMandatoryRequirement(coverRequirement);
  $("span", phoneField).textContent = `Phone ${isMandatoryRequirement(phoneRequirement) ? "" : "(optional)"}`.trim();
  $("span", resumeField).textContent = `Resume URL ${isMandatoryRequirement(resumeRequirement) ? "" : "(optional)"}`.trim();
  $("span", summaryField).textContent = `Candidate summary ${isMandatoryRequirement(summaryRequirement) ? "" : "(optional)"}`.trim();
  $("span", coverField).textContent = `Cover letter ${isMandatoryRequirement(coverRequirement) ? "" : "(optional)"}`.trim();
  if (!isVisibleRequirement(phoneRequirement)) phoneInput.value = "";
  if (!isVisibleRequirement(resumeRequirement)) resumeInput.value = "";
  if (!isVisibleRequirement(summaryRequirement)) summaryInput.value = "";
  if (!isVisibleRequirement(coverRequirement)) coverInput.value = "";

  const question = String(job.application_question || "").trim();
  questionField.hidden = !question || !isVisibleRequirement(questionRequirement);
  if (question && isVisibleRequirement(questionRequirement)) {
    $("#customQuestionLabel").textContent = question;
    questionInput.required = isMandatoryRequirement(questionRequirement);
  } else {
    questionInput.required = false;
    questionInput.value = "";
  }
}

function renderHrWorkspace() {
  renderHrSections();
  renderHrSubheader();
  renderProfileMenu();
  renderJobsToolbar();
  renderJobCreateTabs();
  renderSettingsSections();
  renderRoleCard();
  renderAuthPanel();
  syncRoleControls();
  populateJobDepartmentControls();
  renderJobDraftPreview();
  renderHomeDashboard();
  renderMetrics();
  renderJobsTable();
  renderCandidatesTable();
  renderCandidateProfile();
  renderPipeline();
  renderEmployeeOnboarding();
  renderHrOnboarding();
  renderBoardSettingsForm();
  renderDepartmentSettings();
  renderPipelineSettingsForm();
  renderWorkflowSettings();
  renderCommunicationSettings();
  renderProfileForm();
  renderPermissions();
  syncRoleControls();
}

function renderHrSections() {
  $$(".hr-menu-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.hrSection === state.hrSection);
  });
  $("#hrHomeSection").hidden = state.hrSection !== "home";
  $("#hrJobsSection").hidden = state.hrSection !== "jobs";
  $("#hrCandidatesSection").hidden = state.hrSection !== "candidates";
  $("#hrReportsSection").hidden = state.hrSection !== "reports";
  $("#hrOnboardingSection").hidden = state.hrSection !== "onboarding";
  $("#hrSettingsSection").hidden = state.hrSection !== "settings";
  $("#hrProfileSection").hidden = state.hrSection !== "profile";
}

function renderHrSubheader() {
  const eyebrow = $("#hrSubheaderEyebrow");
  const title = $("#hrSubheaderTitle");
  if (!eyebrow || !title) return;

  const labels = {
    home: ["Home", "Today in hiring"],
    jobs: ["Jobs", state.jobCreateOpen ? "Create a job" : "All Jobs"],
    candidates: ["Candidates", "All applicants"],
    reports: ["Reports", "Pipeline overview"],
    onboarding: ["Onboarding", "Hired employee setup"],
    settings: ["Settings", "System configuration"],
    profile: ["Profile", "Edit my profile"]
  };
  const [sectionLabel, sectionTitle] = labels[state.hrSection] || labels.home;
  eyebrow.textContent = sectionLabel;
  title.textContent = sectionTitle;
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
  $(".app-shell")?.classList.toggle("is-hr-session", signedIn);
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
  $("#hrSessionPanel").innerHTML = signedIn
    ? sessionMarkup
    : `<p class="summary">Sign in from the Hiring Team page to open this workspace.</p>`;
}

function currentUserAssignmentTokens() {
  const email = state.profile.email || state.session?.email || "";
  const name = profileDisplayName();
  const localEmailName = email.includes("@") ? email.split("@")[0].replace(/[._-]+/g, " ") : "";
  return [name, email, localEmailName, ...name.split(/\s+/)]
    .map((value) => String(value || "").trim().toLowerCase())
    .filter((value) => value.length > 1 && value !== "hiring" && value !== "team");
}

function isJobAssignedToCurrentUser(job = {}) {
  const assignmentText = [job.hiring_manager, job.recruiter_name, job.review_lead, job.team_members]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return currentUserAssignmentTokens().some((token) => assignmentText.includes(token));
}

function assignedJobsForCurrentUser() {
  return state.jobs
    .filter(isJobAssignedToCurrentUser)
    .sort((a, b) => a.title.localeCompare(b.title));
}

function homeTodoItems() {
  const newApplications = state.applications.filter((application) => application.status === "new").length;
  const interviewApplications = state.applications.filter((application) => application.status === "interview").length;
  const draftJobs = state.jobs.filter((job) => job.status === "draft").length;
  const failedCommunications = state.communications.filter((record) => record.delivery_status === "failed" || record.status === "failed").length;
  const queuedCommunications = state.communications.filter((record) => record.delivery_status === "queued" || record.status === "queued").length;
  return [
    {
      count: newApplications,
      label: "Review new applicants",
      note: `${newApplications} ${newApplications === 1 ? "candidate" : "candidates"} waiting for screening`,
      section: "candidates"
    },
    {
      count: interviewApplications,
      label: "Prepare interview follow-up",
      note: `${interviewApplications} ${interviewApplications === 1 ? "candidate" : "candidates"} in interview stage`,
      section: "candidates"
    },
    {
      count: draftJobs,
      label: "Finish draft jobs",
      note: `${draftJobs} ${draftJobs === 1 ? "draft" : "drafts"} not yet published`,
      section: "jobs"
    },
    {
      count: failedCommunications + queuedCommunications,
      label: "Check communications",
      note: `${failedCommunications} failed, ${queuedCommunications} queued`,
      section: "settings"
    }
  ];
}

function renderHomeDashboard() {
  const profileCard = $("#homeProfileCard");
  const assignedJobs = $("#homeAssignedJobs");
  const todoList = $("#homeTodoList");
  const activityList = $("#homeActivityList");
  if (!profileCard || !assignedJobs || !todoList || !activityList) return;

  const assigned = assignedJobsForCurrentUser();
  const activeAssigned = assigned.filter((job) => job.status === "published").length;
  const profileAvatar = state.profile.avatar_url
    ? `<img src="${escapeHtml(state.profile.avatar_url)}" alt="${escapeHtml(profileDisplayName())}">`
    : `<span>${escapeHtml(profileInitials())}</span>`;

  profileCard.innerHTML = `
    <div class="home-profile-top">
      <div class="home-profile-avatar">${profileAvatar}</div>
      <div>
        <p class="eyebrow">${escapeHtml(formatStatus(state.role))}</p>
        <h3>${escapeHtml(profileDisplayName())}</h3>
        <p>${escapeHtml(state.profile.title || state.profile.department || state.session?.email || "Hiring team member")}</p>
      </div>
    </div>
    <div class="home-profile-stats">
      <span><b>${assigned.length}</b> assigned jobs</span>
      <span><b>${activeAssigned}</b> published</span>
    </div>
    <button class="secondary-action small" type="button" data-home-section="jobs">View jobs</button>
  `;

  assignedJobs.innerHTML = assigned.length
    ? assigned
        .slice(0, 5)
        .map(
          (job) => `
            <article class="home-job-item">
              <div>
                <span class="home-job-title">${escapeHtml(job.title)}</span>
                <p>${escapeHtml(job.department)} · ${escapeHtml(job.location)}</p>
              </div>
              <span class="status-pill ${escapeHtml(job.status)}">${escapeHtml(formatStatus(job.status))}</span>
            </article>
          `
        )
        .join("")
    : `<div class="empty-state compact">No jobs are assigned to ${escapeHtml(profileDisplayName())} yet.</div>`;

  todoList.innerHTML = homeTodoItems()
    .map(
      (item) => `
        <button class="home-todo-item" type="button" data-home-section="${escapeHtml(item.section)}">
          <span>${escapeHtml(item.label)}</span>
          <small>${escapeHtml(item.note)}</small>
        </button>
      `
    )
    .join("");

  const recentCommunications = state.communications
    .slice()
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .slice(0, 4);
  activityList.innerHTML = recentCommunications.length
    ? recentCommunications
        .map(
          (record) => `
            <article class="home-activity-item">
              <span>${escapeHtml(record.subject || "Email communication")}</span>
              <small>${escapeHtml(record.candidate_name || record.candidate_email)} · ${escapeHtml(formatStatus(record.delivery_status || record.status))}</small>
            </article>
          `
        )
        .join("")
    : `<div class="empty-state compact">No communication activity yet.</div>`;
}

function syncRoleControls() {
  const canManageJobs = state.role === "recruiter" || state.role === "admin";
  const canManageBoard = state.role === "admin";
  const canManageDepartments = Boolean(roleProfiles[state.role]);
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
    control.disabled = !canManageDepartments;
  });
  $$("#departmentTree input, #departmentTree select, #departmentTree button").forEach((control) => {
    control.disabled = !canManageDepartments;
  });
  $$("#pipelineSettingsForm input, #pipelineSettingsForm button").forEach((control) => {
    control.disabled = !canManageBoard;
  });
  $$("#workflowSettingsForm input, #workflowSettingsForm select, #workflowSettingsForm button").forEach((control) => {
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

function signOutHrUser() {
  saveSession(null);
  state.hrSection = "home";
  $("#profileDropdown").hidden = true;
  $("#profileMenuButton").setAttribute("aria-expanded", "false");
  setConnection(false, "Demo data");
  renderHrWorkspace();
  showView("login");
}

function renderJobsToolbar() {
  const search = $("#hrJobSearch");
  const createPanel = $("#jobCreatePanel");
  const tableWrap = $("#jobsTableWrap");
  const createButton = $("#showJobCreate");
  const toolbar = $("#jobsToolbar");
  const filterBar = $("#jobsFilterBar");
  const searchField = search?.closest(".job-search-field");
  if (search && document.activeElement !== search) search.value = state.hrJobQuery;
  renderHrJobFilters();
  createPanel.hidden = !state.jobCreateOpen;
  tableWrap.hidden = state.jobCreateOpen;
  if (toolbar) toolbar.hidden = state.jobCreateOpen;
  if (filterBar) filterBar.hidden = state.jobCreateOpen;
  if (searchField) searchField.hidden = state.jobCreateOpen;
  createButton.hidden = state.jobCreateOpen;
  createButton.setAttribute("aria-expanded", String(state.jobCreateOpen));
}

function fillHrFilterSelect(select, options, selected, labelFor = (value) => value) {
  if (!select) return "All";
  const cleanOptions = ["All", ...new Set(options.filter(Boolean).filter((option) => option !== "All"))];
  select.innerHTML = cleanOptions
    .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option === "All" ? "All" : labelFor(option))}</option>`)
    .join("");
  select.value = cleanOptions.includes(selected) ? selected : "All";
  return select.value;
}

function renderHrJobFilters() {
  const statusOptions = ["All", ...jobStatusOptions];
  const departmentOptions = uniqueOptions("department", state.jobs);
  const workTypeOptions = uniqueOptions("work_type", state.jobs);
  state.hrJobFilters.status = fillHrFilterSelect(
    $("#hrJobStatusFilter"),
    statusOptions,
    state.hrJobFilters.status,
    formatStatus
  );
  state.hrJobFilters.department = fillHrFilterSelect(
    $("#hrJobDepartmentFilter"),
    departmentOptions,
    state.hrJobFilters.department
  );
  state.hrJobFilters.workType = fillHrFilterSelect(
    $("#hrJobWorkTypeFilter"),
    workTypeOptions,
    state.hrJobFilters.workType
  );
}

function renderJobCreateTabs() {
  $$("[data-job-create-tab]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.jobCreateTab === state.jobCreateTab);
  });
  $$("[data-job-create-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.jobCreatePanel !== state.jobCreateTab;
  });
  renderJobWorkflowPreview();
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
      recruiter_name: "",
      review_lead: "",
      team_members: "",
      workflow_id: defaultWorkflow().id,
      application_summary: "",
      summary_requirement: "optional",
      resume_requirement: "mandatory",
      cover_letter_requirement: "optional",
      phone_requirement: "mandatory",
      custom_question_requirement: "mandatory",
      require_resume: true,
      require_cover_letter: false,
      require_phone: true,
      application_question: "",
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
  const workflow = workflowById(data.workflow_id) || defaultWorkflow();
  const [salaryMin, salaryMax] = normalizeSalaryValues(numberOrNull(data.salary_min), numberOrNull(data.salary_max));
  const jobDescription = String(data.job_description || "").trim();

  return {
    title: String(data.title || "").trim() || "Untitled job",
    department: department?.name || "Department pending",
    subdepartment: subdepartment?.name || "",
    location: String(data.location || "").trim() || "Location pending",
    work_type: data.work_type || "Full Time",
    status: normalizeJobStatus(data.status),
    hiring_manager: String(data.hiring_manager || "").trim() || "Hiring manager pending",
    recruiter_name: String(data.recruiter_name || "").trim(),
    review_lead: String(data.review_lead || "").trim(),
    team_members: String(data.team_members || "").trim(),
    workflow_id: workflow.id,
    workflow_name: workflow.name,
    application_summary: String(data.application_summary || "").trim(),
    summary_requirement: normalizeRequirement(data.summary_requirement, "optional"),
    resume_requirement: normalizeRequirement(data.resume_requirement, "mandatory"),
    cover_letter_requirement: normalizeRequirement(data.cover_letter_requirement, "optional"),
    phone_requirement: normalizeRequirement(data.phone_requirement, "mandatory"),
    custom_question_requirement: normalizeRequirement(data.custom_question_requirement, "mandatory"),
    require_resume: isMandatoryRequirement(data.resume_requirement),
    require_cover_letter: isMandatoryRequirement(data.cover_letter_requirement),
    require_phone: isMandatoryRequirement(data.phone_requirement),
    application_question: String(data.application_question || "").trim(),
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
        <div>
          <dt>Workflow</dt>
          <dd>${escapeHtml(draft.workflow_name || workflowForJob(draft).name)}</dd>
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
      <section class="description-block">
        <h4>Application</h4>
        ${renderTextBlock(draft.application_summary, "Application requirements will appear here.")}
        <div class="tag-row">
          <span class="tag">Summary: ${escapeHtml(requirementLabel(draft.summary_requirement))}</span>
          <span class="tag">Resume: ${escapeHtml(requirementLabel(draft.resume_requirement))}</span>
          <span class="tag">Cover letter: ${escapeHtml(requirementLabel(draft.cover_letter_requirement))}</span>
          <span class="tag">Phone: ${escapeHtml(requirementLabel(draft.phone_requirement))}</span>
          <span class="tag">Custom question: ${escapeHtml(requirementLabel(draft.custom_question_requirement))}</span>
        </div>
      </section>
      <section class="description-block">
        <h4>Team Members</h4>
        <p>${escapeHtml(draft.recruiter_name || "Primary recruiter pending")}</p>
        ${draft.team_members ? renderTextBlock(draft.team_members, "") : `<p class="summary">Additional review team members can be assigned.</p>`}
        ${draft.review_lead ? `<p>${escapeHtml(draft.review_lead)}</p>` : ""}
      </section>
      <section class="description-block">
        <h4>Workflow</h4>
        <div class="pipeline-chip-row">
          ${workflowEntries(workflowById(draft.workflow_id) || defaultWorkflow())
            .map(([stage, label]) => `<span class="pipeline-chip">${escapeHtml(label)}</span>`)
            .join("")}
        </div>
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
    [`${labels.offer} stage`, state.applications.filter((application) => application.status === "offer").length, "Final decisions"],
    [`${labels.hired} stage`, state.applications.filter((application) => application.status === "hired").length, "Onboarding ready"]
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
      const matchesJobStatus =
        state.hrJobFilters.status === "All" || normalizeJobStatus(job.status) === state.hrJobFilters.status;
      const matchesDepartment =
        state.hrJobFilters.department === "All" || job.department === state.hrJobFilters.department;
      const matchesWorkType =
        state.hrJobFilters.workType === "All" || job.work_type === state.hrJobFilters.workType;
      if (!matchesJobStatus || !matchesDepartment || !matchesWorkType) return false;
      if (!query) return true;
      return [
        job.title,
        job.department,
        job.subdepartment,
        job.location,
        job.work_type,
        formatStatus(job.status),
        job.hiring_manager
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  if (!jobs.length) {
    $("#jobsTable").innerHTML = `
      <tr>
        <td colspan="3">
          <div class="empty-state compact">No jobs match these filters.</div>
        </td>
      </tr>
    `;
    return;
  }

  $("#jobsTable").innerHTML = jobs
    .map((job) => {
      const applications = state.applications.filter((application) => application.job_id === job.id);
      const workflow = workflowForJob(job);
      const pipelineMarkup = workflowEntries(workflow)
        .map(([stage, label]) => {
          const count = applications.filter((application) => application.status === stage).length;
          return `<span class="pipeline-chip">${escapeHtml(label)} <b>${count}</b></span>`;
        })
        .join("");
      return `
        <tr class="hr-job-row">
          <td>
            <span class="hr-job-title">${escapeHtml(job.title)}</span>
            <div class="table-meta">
              <span>${escapeHtml(job.department)}</span>
              ${job.subdepartment ? `<span>${escapeHtml(job.subdepartment)}</span>` : ""}
              <span>${escapeHtml(job.location)}</span>
              <span>${escapeHtml(workflow.name)}</span>
            </div>
          </td>
          <td class="pipeline-cell"><div class="pipeline-chip-row">${pipelineMarkup}</div></td>
          <td class="status-cell"><span class="status-pill job-status-pill ${escapeHtml(job.status)}">${escapeHtml(formatStatus(job.status))}</span></td>
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
          <td><span class="stage-pill">${escapeHtml(workflowLabelForApplication(application))}</span></td>
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
  $("#candidateProfileMeta").textContent = `${job?.title || "General application"} · ${workflowLabelForApplication(application)}`;
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
        <strong>${escapeHtml(workflowLabelForApplication(application))}</strong>
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

function documentTypeById(typeId) {
  return onboardingDocumentTypes.find((type) => type.id === typeId) || null;
}

function hiredApplications() {
  return state.applications
    .filter((application) => application.status === "hired")
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
}

function selectedOnboardingApplication() {
  const hires = hiredApplications();
  if (!hires.length) {
    state.selectedOnboardingApplicationId = "";
    return null;
  }
  const selected = hires.find((application) => application.id === state.selectedOnboardingApplicationId) || hires[0];
  state.selectedOnboardingApplicationId = selected.id;
  return selected;
}

function onboardingDocumentsForApplication(applicationId) {
  return state.onboardingDocuments
    .filter((document) => document.application_id === applicationId)
    .sort((a, b) => new Date(b.uploaded_at || 0) - new Date(a.uploaded_at || 0));
}

function completedOnboardingTypeIds(applicationId) {
  return new Set(
    onboardingDocumentsForApplication(applicationId).flatMap((document) => document.matched_type_ids || [])
  );
}

function onboardingCompletion(applicationId) {
  const completed = completedOnboardingTypeIds(applicationId);
  return {
    completed: completed.size,
    total: onboardingDocumentTypes.length,
    missing: onboardingDocumentTypes.length - completed.size
  };
}

function onboardingDocumentLabel(document) {
  const labels = (document.matched_type_ids || [])
    .map((typeId) => documentTypeById(typeId)?.label)
    .filter(Boolean);
  return labels.length ? labels.join(", ") : "Needs HR review";
}

function renderOnboardingChecklist(applicationId) {
  const completed = completedOnboardingTypeIds(applicationId);
  return onboardingDocumentTypes
    .map((type) => {
      const isComplete = completed.has(type.id);
      return `
        <article class="onboarding-check-item${isComplete ? " is-complete" : ""}">
          <span class="check-indicator">${isComplete ? "✓" : ""}</span>
          <div>
            <strong>${escapeHtml(type.label)}</strong>
            <p>${isComplete ? "Included in uploaded documents." : "Needed before HR can complete onboarding."}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function applicationDemographics(application, job) {
  return [
    ["Name", application.full_name || "Not recorded"],
    ["Phone", application.phone || "Not recorded"],
    ["Email", application.email || "Not recorded"],
    ["Role", job?.title || "General application"],
    ["Department", job?.department || "Department pending"],
    ["Resume", application.resume_url || "Not recorded"]
  ];
}

function renderOnboardingDemographics(application) {
  const job = jobById(application.job_id);
  return `
    <div class="onboarding-demographic-grid">
      ${applicationDemographics(application, job)
        .map(
          ([label, value]) => `
            <article>
              <span>${escapeHtml(label)}</span>
              <strong>${escapeHtml(value)}</strong>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderEmployeeOnboarding() {
  const select = $("#onboardingEmployeeSelect");
  if (!select) return;

  const hires = hiredApplications();
  const welcome = $("#employeeOnboardingWelcome");
  const demographics = $("#employeeOnboardingDemographics");
  const checklist = $("#employeeOnboardingChecklist");
  const scanResults = $("#onboardingScanResults");

  if (!hires.length) {
    select.innerHTML = `<option value="">No hired employees yet</option>`;
    select.disabled = true;
    welcome.textContent = "Onboarding opens after a candidate is moved to the Hired stage.";
    demographics.innerHTML = `<div class="empty-state compact">No hired employee is ready for onboarding yet.</div>`;
    checklist.innerHTML = "";
    scanResults.innerHTML = "";
    return;
  }

  const selected = selectedOnboardingApplication();
  select.disabled = false;
  select.innerHTML = hires
    .map((application) => `<option value="${escapeAttribute(application.id)}">${escapeHtml(application.full_name)}</option>`)
    .join("");
  select.value = selected.id;
  const firstName = candidateNameParts(selected.full_name).first;
  welcome.textContent = `Welcome, ${firstName}. We are excited to help you get ready for your first day.`;
  demographics.innerHTML = renderOnboardingDemographics(selected);
  checklist.innerHTML = renderOnboardingChecklist(selected.id);
  scanResults.innerHTML = renderOnboardingScanResults(selected.id);
}

function renderOnboardingScanResults(applicationId) {
  const documents = onboardingDocumentsForApplication(applicationId);
  if (!documents.length) {
    return `<div class="empty-state compact">No onboarding documents have been uploaded yet.</div>`;
  }

  return `
    <div class="scan-result-list">
      ${documents
        .map(
          (document) => `
            <article class="scan-result-card">
              <div>
                <strong>${escapeHtml(document.file_name)}</strong>
                <p>${escapeHtml(document.scan_notes || "Uploaded for HR review.")}</p>
              </div>
              <span class="status-pill">${escapeHtml(onboardingDocumentLabel(document))}</span>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function onboardingDepartmentOptions(selectedDepartmentId = "") {
  const departments = parentDepartments();
  return [
    `<option value="">Select department</option>`,
    ...departments.map(
      (department) =>
        `<option value="${escapeAttribute(department.id)}"${department.id === selectedDepartmentId ? " selected" : ""}>${escapeHtml(department.name)}</option>`
    )
  ].join("");
}

function onboardingHierarchy(application = {}) {
  return {
    employee_id: application.onboarding?.employee_id || "",
    department_id: application.onboarding?.department_id || jobById(application.job_id)?.department_id || "",
    manager_name: application.onboarding?.manager_name || "",
    reports_to: application.onboarding?.reports_to || "",
    start_date: application.onboarding?.start_date || "",
    work_location: application.onboarding?.work_location || jobById(application.job_id)?.location || "",
    employment_type: application.onboarding?.employment_type || jobById(application.job_id)?.work_type || "Full Time"
  };
}

function renderHrOnboarding() {
  const metricGrid = $("#onboardingMetricGrid");
  if (!metricGrid) return;

  const hires = hiredApplications();
  const selected = selectedOnboardingApplication();
  const completedCount = hires.filter((application) => onboardingCompletion(application.id).missing === 0).length;
  const uploadedCount = state.onboardingDocuments.length;

  metricGrid.innerHTML = [
    ["Hired employees", hires.length, "Ready for onboarding"],
    ["Complete packets", completedCount, "All required documents detected"],
    ["Needs documents", Math.max(hires.length - completedCount, 0), "Awaiting uploads"],
    ["Uploaded files", uploadedCount, "Available for HR review"]
  ]
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

  $("#onboardingHireRoster").innerHTML = hires.length
    ? hires
        .map((application) => {
          const job = jobById(application.job_id);
          const completion = onboardingCompletion(application.id);
          return `
            <button class="onboarding-hire-card${selected?.id === application.id ? " is-selected" : ""}" type="button" data-onboarding-candidate="${escapeAttribute(application.id)}">
              <span>${escapeHtml(application.full_name)}</span>
              <small>${escapeHtml(job?.title || "General application")}</small>
              <b>${completion.completed}/${completion.total} documents</b>
            </button>
          `;
        })
        .join("")
    : `<div class="empty-state compact">Move a candidate to Hired to start onboarding.</div>`;

  $("#onboardingAdminDetail").innerHTML = selected
    ? renderOnboardingAdminDetail(selected)
    : `<div class="empty-state compact">No hired candidate is ready for onboarding yet.</div>`;
}

function renderOnboardingAdminDetail(application) {
  const job = jobById(application.job_id);
  const hierarchy = onboardingHierarchy(application);
  const documents = onboardingDocumentsForApplication(application.id);
  return `
    <div class="section-header compact">
      <div>
        <p class="eyebrow">New hire</p>
        <h2>${escapeHtml(application.full_name)}</h2>
        <p class="summary">${escapeHtml(job?.title || "General application")} · ${escapeHtml(application.email || "No email recorded")}</p>
      </div>
    </div>
    ${renderOnboardingDemographics(application)}
    <form class="onboarding-hierarchy-form" id="onboardingHierarchyForm">
      <input type="hidden" name="application_id" value="${escapeAttribute(application.id)}">
      <div class="section-header compact">
        <div>
          <p class="eyebrow">Organizational hierarchy</p>
          <h2>Employee setup</h2>
        </div>
      </div>
      <div class="form-grid">
        <label class="field">
          <span>Employee ID</span>
          <input name="employee_id" value="${escapeAttribute(hierarchy.employee_id)}" placeholder="BH-1024">
        </label>
        <label class="field">
          <span>Department</span>
          <select name="department_id">${onboardingDepartmentOptions(hierarchy.department_id)}</select>
        </label>
        <label class="field">
          <span>Manager</span>
          <input name="manager_name" value="${escapeAttribute(hierarchy.manager_name)}" placeholder="Manager name">
        </label>
        <label class="field">
          <span>Reports to</span>
          <input name="reports_to" value="${escapeAttribute(hierarchy.reports_to)}" placeholder="Director or team lead">
        </label>
        <label class="field">
          <span>Start date</span>
          <input name="start_date" type="date" value="${escapeAttribute(hierarchy.start_date)}">
        </label>
        <label class="field">
          <span>Work location</span>
          <input name="work_location" value="${escapeAttribute(hierarchy.work_location)}">
        </label>
        <label class="field">
          <span>Employment status</span>
          <select name="employment_type">
            ${["Full Time", "Part Time", "Per Diem"].map(
              (type) => `<option${hierarchy.employment_type === type ? " selected" : ""}>${escapeHtml(type)}</option>`
            ).join("")}
          </select>
        </label>
      </div>
      <button class="secondary-action" type="submit">
        <svg><use href="#icon-database"></use></svg>
        Save hierarchy
      </button>
      <p class="form-message" id="onboardingAdminMessage" role="status"></p>
    </form>
    <section class="onboarding-document-review">
      <div class="section-header compact">
        <div>
          <p class="eyebrow">Documents</p>
          <h2>Checklist and uploaded files</h2>
        </div>
      </div>
      <div class="onboarding-checklist hr-checklist">${renderOnboardingChecklist(application.id)}</div>
      <div class="table-wrap compact-table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Document</th>
              <th scope="col">Scan result</th>
              <th scope="col">Uploaded</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${
              documents.length
                ? documents
                    .map(
                      (document) => `
                        <tr>
                          <td>${escapeHtml(document.file_name)}</td>
                          <td>${escapeHtml(onboardingDocumentLabel(document))}</td>
                          <td>${escapeHtml(formatDateTime(document.uploaded_at))}</td>
                          <td>
                            <div class="communication-action-row compact-actions">
                              <button class="table-action" type="button" data-view-onboarding-doc="${escapeAttribute(document.id)}">View</button>
                              <button class="table-action" type="button" data-save-onboarding-doc="${escapeAttribute(document.id)}">Save</button>
                              <button class="table-action" type="button" data-print-onboarding-doc="${escapeAttribute(document.id)}">Print</button>
                            </div>
                          </td>
                        </tr>
                      `
                    )
                    .join("")
                : `<tr><td colspan="4"><div class="empty-state compact">No documents uploaded yet.</div></td></tr>`
            }
          </tbody>
        </table>
      </div>
      <div class="onboarding-document-preview" id="onboardingDocumentPreview">
        <div class="empty-state compact">Select View to preview a document.</div>
      </div>
    </section>
  `;
}

function onboardingDocumentById(documentId) {
  return state.onboardingDocuments.find((document) => document.id === documentId) || null;
}

function canPersistOnboarding(applicationId) {
  return Boolean(hasSupabase && state.session?.accessToken && applicationId && !String(applicationId).startsWith("app-"));
}

function safeStorageFileName(fileName = "") {
  return String(fileName || "document")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "document";
}

function storageObjectUrl(bucket, path) {
  return `${env.supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${String(path)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/")}`;
}

async function uploadOnboardingDocumentFile(file, documentId, applicationId) {
  const storagePath = `${applicationId}/${documentId}-${safeStorageFileName(file.name)}`;
  const response = await fetch(storageObjectUrl(onboardingStorageBucket, storagePath), {
    method: "POST",
    headers: {
      apikey: env.supabaseAnonKey,
      Authorization: `Bearer ${state.session.accessToken}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true"
    },
    body: file
  });
  if (!response.ok) throw new Error(await response.text());
  return storagePath;
}

async function saveOnboardingUpload(document, file) {
  if (!canPersistOnboarding(document.application_id)) return document;

  const storagePath = await uploadOnboardingDocumentFile(file, document.id, document.application_id);
  const [created] = await supabaseInsert(
    "onboarding_documents",
    {
      id: document.id,
      application_id: document.application_id,
      uploaded_by: state.session.userId || null,
      file_name: document.file_name,
      file_type: document.file_type,
      file_size: document.file_size,
      storage_bucket: onboardingStorageBucket,
      storage_path: storagePath,
      matched_type_ids: document.matched_type_ids || [],
      scan_summary: document.scan_notes,
      status: "uploaded"
    },
    true
  );

  return normalizeOnboardingDocument({
    ...document,
    ...(created || {}),
    storage_path: storagePath
  });
}

async function recordActivityEvent(eventType, application, eventBody) {
  if (!application || !canPersistOnboarding(application.id)) return;

  await supabaseInsert(
    "activity_events",
    {
      actor_id: state.session.userId || null,
      job_id: application.job_id || null,
      application_id: application.id,
      event_type: eventType,
      event_body: eventBody
    },
    true
  ).catch(() => null);
}

async function fetchOnboardingDocumentBlob(document) {
  if (!document?.storage_path || !state.session?.accessToken) return null;

  const response = await fetch(storageObjectUrl(document.storage_bucket || onboardingStorageBucket, document.storage_path), {
    headers: {
      apikey: env.supabaseAnonKey,
      Authorization: `Bearer ${state.session.accessToken}`
    }
  });
  if (!response.ok) throw new Error("Document file could not be opened.");
  return response.blob();
}

async function onboardingDocumentUrl(document) {
  if (!document) return "";
  if (document.object_url) return document.object_url;
  const storedBlob = await fetchOnboardingDocumentBlob(document);
  if (storedBlob) {
    document.object_url = URL.createObjectURL(storedBlob);
    if (!document.content_text && document.file_type?.startsWith("text/")) {
      document.content_text = await storedBlob.text();
    }
    return document.object_url;
  }
  const blob = document.file || new Blob([document.content_text || document.scan_notes || document.file_name], {
    type: document.file_type || "text/plain"
  });
  document.object_url = URL.createObjectURL(blob);
  return document.object_url;
}

async function scanOnboardingFile(file, applicationId) {
  let fileText = "";
  try {
    fileText = await file.text();
  } catch (error) {
    fileText = "";
  }

  const scanSource = `${file.name} ${file.type || ""} ${fileText}`.toLowerCase();
  const matchedTypeIds = onboardingDocumentTypes
    .filter((type) => type.keywords.some((keyword) => scanSource.includes(keyword.toLowerCase())))
    .map((type) => type.id);
  const matchedLabels = matchedTypeIds.map((typeId) => documentTypeById(typeId)?.label).filter(Boolean);

  return {
    id: newClientId("on-doc"),
    application_id: applicationId,
    file_name: file.name,
    file_type: file.type || "application/octet-stream",
    file_size: file.size || 0,
    matched_type_ids: matchedTypeIds,
    uploaded_at: new Date().toISOString(),
    scan_notes: matchedLabels.length
      ? `Detected ${matchedLabels.join(", ")}.`
      : "No required document sheet was detected. HR review is needed.",
    content_text: fileText,
    file,
    object_url: URL.createObjectURL(file)
  };
}

async function handleOnboardingUploadSubmit(event) {
  event.preventDefault();
  const application = selectedOnboardingApplication();
  const input = $("#onboardingDocumentUpload");
  const files = Array.from(input?.files || []);
  if (!application) {
    showMessage("#onboardingUploadMessage", "Select a hired employee first.");
    return;
  }
  if (!files.length) {
    showMessage("#onboardingUploadMessage", "Choose at least one document to upload.");
    return;
  }

  const scannedDocuments = [];
  let liveSaveFailed = false;
  for (const file of files) {
    const scannedDocument = await scanOnboardingFile(file, application.id);
    try {
      scannedDocuments.push(await saveOnboardingUpload(scannedDocument, file));
    } catch (error) {
      liveSaveFailed = true;
      scannedDocuments.push(scannedDocument);
    }
  }
  state.onboardingDocuments = [
    ...scannedDocuments.map(normalizeOnboardingDocument),
    ...state.onboardingDocuments
  ];
  input.value = "";
  const detectedCount = scannedDocuments.reduce((count, document) => count + (document.matched_type_ids?.length || 0), 0);
  await recordActivityEvent(
    "onboarding_documents_uploaded",
    application,
    `${scannedDocuments.length} onboarding ${scannedDocuments.length === 1 ? "document was" : "documents were"} uploaded.`
  );
  showMessage(
    "#onboardingUploadMessage",
    liveSaveFailed
      ? "Upload scanned locally, but Supabase document storage needs the onboarding migration and storage policies."
      : detectedCount
      ? `Upload complete. ${detectedCount} checklist item${detectedCount === 1 ? "" : "s"} detected.`
      : "Upload complete. HR review is needed for these files."
  );
  renderEmployeeOnboarding();
  renderHrOnboarding();
}

async function handleOnboardingHierarchySubmit(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const applicationId = data.application_id;
  const department = getDepartmentById(data.department_id);
  const onboarding = normalizeOnboardingRecord({
    employee_id: data.employee_id,
    department_id: data.department_id,
    department_name: department?.name || "",
    manager_name: data.manager_name,
    reports_to: data.reports_to,
    start_date: data.start_date,
    work_location: data.work_location,
    employment_type: data.employment_type
  });
  let selectedApplication = applicationById(applicationId);

  state.applications = state.applications.map((application) => {
    if (application.id !== applicationId) return application;
    selectedApplication = application;
    return {
      ...application,
      onboarding
    };
  });
  renderHrOnboarding();
  showMessage("#onboardingAdminMessage", "Saving onboarding hierarchy...");

  if (canPersistOnboarding(applicationId)) {
    try {
      const [saved] = await supabaseUpsert(
        "onboarding_records",
        {
          application_id: applicationId,
          employee_id: onboarding.employee_id || null,
          department_id: onboarding.department_id || null,
          department_name: onboarding.department_name || null,
          manager_name: onboarding.manager_name || null,
          reports_to: onboarding.reports_to || null,
          start_date: onboarding.start_date || null,
          work_location: onboarding.work_location || null,
          employment_type: onboarding.employment_type || null,
          created_by: state.session.userId || null,
          updated_by: state.session.userId || null
        },
        true,
        "application_id"
      );
      if (saved) {
        state.applications = state.applications.map((application) =>
          application.id === applicationId
            ? { ...application, onboarding: normalizeOnboardingRecord(saved) }
            : application
        );
      }
      await recordActivityEvent(
        "onboarding_hierarchy_updated",
        selectedApplication,
        "Onboarding hierarchy and employee setup details were updated."
      );
      renderHrOnboarding();
      showMessage("#onboardingAdminMessage", "Onboarding hierarchy saved.");
      return;
    } catch (error) {
      renderHrOnboarding();
      showMessage("#onboardingAdminMessage", "Saved locally. Run the onboarding Supabase migration to save this permanently.");
      return;
    }
  }

  showMessage("#onboardingAdminMessage", "Onboarding hierarchy saved for this preview.");
}

async function renderOnboardingDocumentPreview(document) {
  const target = $("#onboardingDocumentPreview");
  if (!target || !document) return;
  target.innerHTML = `<div class="empty-state compact">Opening document...</div>`;
  let url = "";
  try {
    url = await onboardingDocumentUrl(document);
  } catch (error) {
    target.innerHTML = `<div class="empty-state compact">Document could not be opened. Check Supabase storage access.</div>`;
    return;
  }
  const isImage = document.file_type?.startsWith("image/");
  const isPdf = document.file_type === "application/pdf" || document.file_name.toLowerCase().endsWith(".pdf");
  target.innerHTML = `
    <div class="document-preview-header">
      <div>
        <strong>${escapeHtml(document.file_name)}</strong>
        <p>${escapeHtml(document.scan_notes || "Uploaded for HR review.")}</p>
      </div>
      <span class="status-pill">${escapeHtml(onboardingDocumentLabel(document))}</span>
    </div>
    ${
      isImage
        ? `<img src="${escapeAttribute(url)}" alt="${escapeAttribute(document.file_name)}">`
        : isPdf
          ? `<iframe src="${escapeAttribute(url)}" title="${escapeAttribute(document.file_name)}"></iframe>`
          : `<pre>${escapeHtml(document.content_text || "Preview is not available for this file type. Use Save to download the uploaded document.")}</pre>`
    }
  `;
}

async function saveOnboardingDocument(document) {
  if (!document) return;
  const link = window.document.createElement("a");
  link.href = await onboardingDocumentUrl(document);
  link.download = document.file_name || "onboarding-document";
  window.document.body.appendChild(link);
  link.click();
  link.remove();
}

async function printOnboardingDocument(document) {
  if (!document) return;
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  const url = await onboardingDocumentUrl(document);
  const isEmbeddable =
    document.file_type?.startsWith("image/") ||
    document.file_type === "application/pdf" ||
    document.file_name.toLowerCase().endsWith(".pdf");
  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${escapeHtml(document.file_name)}</title>
        <style>
          body { margin: 24px; font-family: Arial, sans-serif; color: #1c2f43; }
          iframe, img { width: 100%; min-height: 85vh; border: 0; object-fit: contain; }
          pre { white-space: pre-wrap; font-size: 13px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(document.file_name)}</h1>
        ${
          isEmbeddable
            ? document.file_type?.startsWith("image/")
              ? `<img src="${escapeAttribute(url)}" alt="${escapeAttribute(document.file_name)}">`
              : `<iframe src="${escapeAttribute(url)}" title="${escapeAttribute(document.file_name)}"></iframe>`
            : `<pre>${escapeHtml(document.content_text || document.scan_notes || "Document preview unavailable.")}</pre>`
        }
        <script>window.addEventListener("load", () => window.print());</script>
      </body>
    </html>
  `);
  printWindow.document.close();
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
      template_type: "Automated email",
      status: "active"
    });
  if (!state.selectedTemplateId && selected.id) state.selectedTemplateId = selected.id;

  table.innerHTML = templates.length
    ? templates
        .map(
          (template) => `
            <article class="template-list-card ${template.id === state.selectedTemplateId ? "is-selected" : ""}">
              <div class="template-list-header">
                <div>
                  <span class="template-list-title">${escapeHtml(template.name)}</span>
                  <div class="template-list-meta">
                    <span>Category: ${escapeHtml(template.category)}</span>
                    <span>Template type: ${escapeHtml(template.template_type)}</span>
                  </div>
                </div>
                <div class="template-list-actions">
                  <span class="status-pill ${escapeHtml(template.status)}">${escapeHtml(formatStatus(template.status))}</span>
                  <button class="table-action" type="button" data-select-template="${escapeHtml(template.id)}">
                    Edit
                  </button>
                </div>
              </div>
              <p class="template-subject">${escapeHtml(template.subject)}</p>
              <details class="template-content-details">
                <summary>View template content</summary>
                <div class="email-preview-body">${renderEmailBody(template.body)}</div>
              </details>
            </article>
          `
        )
        .join("")
    : `<div class="empty-state compact">No active templates.</div>`;

  form.elements.template_id.value = selected.id || "";
  form.elements.name.value = selected.name || "";
  form.elements.category.value = selected.category || "General";
  form.elements.template_type.value = normalizeTemplateType(selected.template_type);
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
        ? `Move to ${workflowForJob(job).stages?.[nextStage] || pipelineLabel(nextStage)}`
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
        <span class="stage-pill">${escapeHtml(workflowLabelForApplication(application))}</span>
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

function renderJobWorkflowPreview() {
  const preview = $("#jobWorkflowPreview");
  const select = $("#jobWorkflowSelect");
  if (!preview || !select) return;

  const workflow = workflowById(select.value) || defaultWorkflow();
  preview.innerHTML = `
    <article class="workflow-preview-card">
      <div>
        <span>Selected workflow</span>
        <strong>${escapeHtml(workflow.name)}</strong>
      </div>
      <div class="pipeline-chip-row">
        ${workflowEntries(workflow)
          .map(([, label]) => `<span class="pipeline-chip">${escapeHtml(label)}</span>`)
          .join("")}
      </div>
    </article>
  `;
}

function renderWorkflowSettings() {
  const form = $("#workflowSettingsForm");
  const table = $("#workflowTable");
  if (!form || !table) return;

  const selected =
    state.selectedWorkflowId === "new-workflow"
      ? normalizeWorkflow({ id: "", name: "", status: "active", stages: defaultPipelineLabels })
      : workflowById(state.selectedWorkflowId) ||
        state.workflows[0] ||
        normalizeWorkflow(defaultWorkflows[0]);
  if (!state.selectedWorkflowId && selected.id) state.selectedWorkflowId = selected.id;

  table.innerHTML = state.workflows.length
    ? state.workflows
        .map(
          (workflow) => `
            <tr class="${workflow.id === state.selectedWorkflowId ? "is-selected" : ""}">
              <td>
                <strong>${escapeHtml(workflow.name)}</strong>
                <div class="table-meta">
                  ${workflowEntries(workflow)
                    .map(([, label]) => `<span>${escapeHtml(label)}</span>`)
                    .join("")}
                </div>
              </td>
              <td><span class="status-pill ${escapeHtml(workflow.status)}">${escapeHtml(formatStatus(workflow.status))}</span></td>
              <td>
                <button class="table-action" type="button" data-select-workflow="${escapeHtml(workflow.id)}">
                  Edit
                </button>
              </td>
            </tr>
          `
        )
        .join("")
    : `
      <tr>
        <td colspan="3">
          <div class="empty-state compact">No workflows have been created yet.</div>
        </td>
      </tr>
    `;

  form.elements.workflow_id.value = selected.id || "";
  form.elements.name.value = selected.name || "";
  form.elements.status.value = selected.status || "active";
  pipelineStages.forEach((stage) => {
    form.elements[stage].value = selected.stages?.[stage] || defaultPipelineLabels[stage];
  });
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
  populateWorkflowControls();
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

function populateWorkflowControls() {
  const select = $("#jobWorkflowSelect");
  if (!select) return;

  const workflows = activeWorkflows();
  const selected = workflows.some((workflow) => workflow.id === select.value) ? select.value : defaultWorkflow().id;
  select.innerHTML = workflows.length
    ? workflows.map((workflow) => `<option value="${escapeHtml(workflow.id)}">${escapeHtml(workflow.name)}</option>`).join("")
    : `<option value="">Create a workflow in Settings first</option>`;
  select.value = selected;
  renderJobWorkflowPreview();
}


function renderDepartmentSettings() {
  populateParentDepartmentSelect();
  const rows = departmentDisplayRows();
  const countLabel = `${rows.length} ${rows.length === 1 ? "department" : "departments"}`;
  const count = $("#departmentListCount");
  if (count) count.textContent = countLabel;

  $("#departmentTree").innerHTML = rows.length
    ? rows
        .map(({ department, depth }) => {
          const openJobs = state.jobs.filter(
            (job) =>
              job.status === "published" &&
              (job.department_id === department.id ||
                job.subdepartment_id === department.id ||
                (!job.department_id && job.department === department.name))
          ).length;
          return `
            <article class="department-list-row" data-department-row="${escapeAttribute(department.id)}" style="--department-depth: ${depth}">
              <label class="field compact-field department-name-field">
                <span>Name</span>
                <input data-department-name value="${escapeAttribute(department.name)}">
              </label>
              <label class="field compact-field">
                <span>Parent</span>
                <select data-department-parent>
                  ${renderDepartmentParentOptions(department.id, department.parent_id || "")}
                </select>
              </label>
              <span class="status-pill department-type-pill">
                ${department.parent_id ? "Subdepartment" : "Parent department"} · ${openJobs} open
              </span>
              <div class="department-row-actions">
                <button class="secondary-action small" type="button" data-save-department="${escapeAttribute(department.id)}">
                  Save
                </button>
                <button class="danger-action" type="button" data-delete-department="${escapeAttribute(department.id)}">
                  Delete
                </button>
              </div>
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

function normalizeJobStatus(status = "draft") {
  return jobStatusOptions.includes(status) ? status : "draft";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function showMessage(selector, message) {
  const element = $(selector);
  if (!element) return;
  element.textContent = message;
  window.setTimeout(() => {
    if (element.textContent === message) element.textContent = "";
  }, 5000);
}

function setAuthLoading(isLoading, message = "Signing in securely...") {
  const form = $("#authForm");
  const panel = $("#authLoadingPanel");
  const text = $("#authLoadingText");
  const submitButton = $("#authSubmitButton");
  const usernameInput = $("#authUsernameField input");
  const passwordInput = $("#authPasswordField input");
  form?.classList.toggle("is-loading", isLoading);
  form?.setAttribute("aria-busy", String(isLoading));
  if (panel) panel.hidden = !isLoading;
  if (text) text.textContent = message;
  if (submitButton) submitButton.disabled = isLoading;
  if (usernameInput) usernameInput.disabled = isLoading;
  if (passwordInput) passwordInput.disabled = isLoading;
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
    template_type: data.template_type,
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
      let savedRows = [];
      try {
        savedRows = await supabaseUpsert("communication_templates", template, true);
      } catch (error) {
        const { template_type: _templateType, ...legacyTemplate } = template;
        savedRows = await supabaseUpsert("communication_templates", legacyTemplate, true);
      }
      const [saved] = savedRows;
      if (saved) {
        state.communicationTemplates = normalizeCommunicationTemplates(
          state.communicationTemplates.map((item) => (item.id === template.id ? { ...template, ...saved } : item))
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
      if (state.hrSection !== "jobs") state.jobCreateOpen = false;
      $("#profileDropdown").hidden = true;
      $("#profileMenuButton").setAttribute("aria-expanded", "false");
      renderHrWorkspace();
    });
  });

  $("#hrHomeSection").addEventListener("click", (event) => {
    const button = event.target.closest("[data-home-section]");
    if (!button) return;
    state.hrSection = button.dataset.homeSection;
    if (state.hrSection === "settings") state.settingsSection = "communications";
    renderHrWorkspace();
  });

  $("#profileMenuButton").addEventListener("click", () => {
    const dropdown = $("#profileDropdown");
    const isOpening = dropdown.hidden;
    dropdown.hidden = !isOpening;
    $("#profileMenuButton").setAttribute("aria-expanded", String(isOpening));
  });

  $("#profileDropdown").addEventListener("click", (event) => {
    if (event.target.closest("#profileSignOutButton")) {
      signOutHrUser();
      return;
    }
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

  $("#hrJobStatusFilter").addEventListener("change", (event) => {
    state.hrJobFilters.status = event.target.value;
    renderJobsTable();
  });

  $("#hrJobDepartmentFilter").addEventListener("change", (event) => {
    state.hrJobFilters.department = event.target.value;
    renderJobsTable();
  });

  $("#hrJobWorkTypeFilter").addEventListener("change", (event) => {
    state.hrJobFilters.workType = event.target.value;
    renderJobsTable();
  });

  $("#showJobCreate").addEventListener("click", () => {
    state.jobCreateOpen = true;
    state.jobCreateTab = "description";
    renderHrSubheader();
    renderJobsToolbar();
    renderJobCreateTabs();
    populateJobDepartmentControls();
    renderJobDraftPreview();
    $("#jobForm input[name='title']").focus();
  });

  $$(".job-create-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state.jobCreateTab = button.dataset.jobCreateTab;
      renderJobCreateTabs();
    });
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
    renderHrSubheader();
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
  $("#jobWorkflowSelect").addEventListener("change", () => {
    renderJobWorkflowPreview();
    renderJobDraftPreview();
  });
  $("#departmentForm").addEventListener("submit", handleDepartmentSubmit);
  $("#departmentTree").addEventListener("click", (event) => {
    const saveButton = event.target.closest("[data-save-department]");
    if (saveButton) {
      handleDepartmentRowSave(saveButton.closest("[data-department-row]"));
      return;
    }

    const deleteButton = event.target.closest("[data-delete-department]");
    if (deleteButton) {
      handleDepartmentDelete(deleteButton.dataset.deleteDepartment);
    }
  });
  $("#boardSettingsForm").addEventListener("submit", handleBoardSettingsSubmit);
  $("#pipelineSettingsForm").addEventListener("submit", handlePipelineSettingsSubmit);
  $("#workflowSettingsForm").addEventListener("submit", handleWorkflowSubmit);
  $("#workflowTable").addEventListener("click", (event) => {
    const button = event.target.closest("[data-select-workflow]");
    if (!button) return;
    state.selectedWorkflowId = button.dataset.selectWorkflow;
    renderWorkflowSettings();
  });
  $("#newWorkflowButton").addEventListener("click", () => {
    state.selectedWorkflowId = "new-workflow";
    renderWorkflowSettings();
    $("#workflowSettingsForm input[name='name']").focus();
  });
  $("#duplicateWorkflowButton").addEventListener("click", duplicateSelectedWorkflow);
  $("#deleteWorkflowButton").addEventListener("click", deleteSelectedWorkflow);
  $("#profileForm").addEventListener("submit", handleProfileSubmit);
  $("#showApplicationButton").addEventListener("click", () => {
    state.applicationOpen = true;
    renderApplicantPortal();
    $("#applicationPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("#onboardingEmployeeSelect").addEventListener("change", (event) => {
    state.selectedOnboardingApplicationId = event.target.value;
    renderEmployeeOnboarding();
    renderHrOnboarding();
  });
  $("#onboardingUploadForm").addEventListener("submit", handleOnboardingUploadSubmit);
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
      if (nextStatus === "hired") {
        await dispatchAutomationEvent("candidate_hired", movedApplication, {
          previous_stage: previousStatus,
          pipeline_stage: nextStatus
        });
      }
      renderHrWorkspace();
    }
  });

  $("#hrOnboardingSection").addEventListener("click", async (event) => {
    const candidateButton = event.target.closest("[data-onboarding-candidate]");
    if (candidateButton) {
      state.selectedOnboardingApplicationId = candidateButton.dataset.onboardingCandidate;
      renderHrOnboarding();
      renderEmployeeOnboarding();
      return;
    }

    const viewButton = event.target.closest("[data-view-onboarding-doc]");
    if (viewButton) {
      await renderOnboardingDocumentPreview(onboardingDocumentById(viewButton.dataset.viewOnboardingDoc));
      return;
    }

    const saveButton = event.target.closest("[data-save-onboarding-doc]");
    if (saveButton) {
      await saveOnboardingDocument(onboardingDocumentById(saveButton.dataset.saveOnboardingDoc));
      return;
    }

    const printButton = event.target.closest("[data-print-onboarding-doc]");
    if (printButton) {
      await printOnboardingDocument(onboardingDocumentById(printButton.dataset.printOnboardingDoc));
    }
  });

  $("#hrOnboardingSection").addEventListener("submit", async (event) => {
    if (event.target.closest("#onboardingHierarchyForm")) {
      await handleOnboardingHierarchySubmit(event);
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

  if (departmentDuplicateExists(name, parentId)) {
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
  form.reset();
  refreshDepartmentDependentViews();
}

function refreshDepartmentDependentViews() {
  state.departments = normalizeDepartments(state.departments);
  syncJobsWithDepartments();
  saveLocalDepartments(state.departments);
  populateFilters();
  renderApplicantPortal();
  renderHrWorkspace();
}

function departmentDuplicateExists(name, parentId, departmentId = "") {
  const normalizedName = name.toLowerCase();
  return activeDepartments().some(
    (department) =>
      department.id !== departmentId &&
      (department.parent_id || "") === (parentId || "") &&
      department.name.toLowerCase() === normalizedName
  );
}

async function handleDepartmentRowSave(row) {
  const departmentId = row?.dataset.departmentRow;
  const department = departmentById(departmentId);
  if (!department || department.status !== "active") return;

  const name = String(row.querySelector("[data-department-name]")?.value || "").trim();
  const parentId = row.querySelector("[data-department-parent]")?.value || null;
  if (!name) {
    showMessage("#departmentMessage", "Department name is required.");
    return;
  }
  if (parentId === departmentId || descendantDepartmentIds(departmentId).has(parentId)) {
    showMessage("#departmentMessage", "A department cannot report to itself or one of its subdepartments.");
    return;
  }
  if (departmentDuplicateExists(name, parentId, departmentId)) {
    showMessage("#departmentMessage", "That department already exists under the selected parent.");
    return;
  }

  const updatedDepartment = normalizeDepartment({
    ...department,
    name,
    parent_id: parentId
  });
  state.departments = state.departments.map((item) =>
    item.id === departmentId ? updatedDepartment : item
  );
  refreshDepartmentDependentViews();

  try {
    if (hasSupabase && state.session?.accessToken) {
      await supabasePatch(
        "departments",
        `id=eq.${encodeURIComponent(departmentId)}`,
        {
          name: updatedDepartment.name,
          parent_id: updatedDepartment.parent_id || null,
          status: updatedDepartment.status
        },
        true
      );
      showMessage("#departmentMessage", "Department updated.");
    } else if (hasSupabase) {
      throw new Error("Missing admin session");
    } else {
      showMessage("#departmentMessage", "Department updated for this preview.");
    }
  } catch (error) {
    showMessage("#departmentMessage", "Department updated locally. Supabase save requires an admin account.");
  }
}

async function handleDepartmentDelete(departmentId) {
  const department = departmentById(departmentId);
  if (!department || department.status !== "active") return;

  const descendantIds = descendantDepartmentIds(departmentId);
  state.departments = state.departments.filter(
    (item) => item.id !== departmentId && !descendantIds.has(item.id)
  );
  refreshDepartmentDependentViews();

  try {
    if (hasSupabase && state.session?.accessToken) {
      await supabaseDelete("departments", `id=eq.${encodeURIComponent(departmentId)}`, true);
      showMessage(
        "#departmentMessage",
        descendantIds.size ? "Department and subdepartments deleted." : "Department deleted."
      );
    } else if (hasSupabase) {
      throw new Error("Missing admin session");
    } else {
      showMessage(
        "#departmentMessage",
        descendantIds.size
          ? "Department and subdepartments deleted for this preview."
          : "Department deleted for this preview."
      );
    }
  } catch (error) {
    showMessage("#departmentMessage", "Department deleted locally. Supabase delete requires an admin account.");
  }
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

async function handleWorkflowSubmit(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.currentTarget));
  const workflow = normalizeWorkflow({
    id: data.workflow_id || newClientId("workflow"),
    name: data.name,
    status: data.status,
    stages: pipelineStages.reduce(
      (labels, stage) => ({
        ...labels,
        [stage]: data[stage]
      }),
      {}
    )
  });

  const index = state.workflows.findIndex((item) => item.id === workflow.id);
  if (index >= 0) state.workflows[index] = workflow;
  else state.workflows.push(workflow);
  state.workflows = normalizeWorkflows(state.workflows);
  state.selectedWorkflowId = workflow.id;
  saveLocalWorkflows(state.workflows);
  populateWorkflowControls();
  renderWorkflowSettings();
  renderJobsTable();

  try {
    if (hasSupabase && state.session?.accessToken) {
      const [saved] = await supabaseUpsert("workflows", workflow, true);
      if (saved) {
        state.workflows = normalizeWorkflows(
          state.workflows.map((item) => (item.id === workflow.id ? saved : item))
        );
        saveLocalWorkflows(state.workflows);
        populateWorkflowControls();
        renderWorkflowSettings();
        renderJobsTable();
      }
      showMessage("#workflowSettingsMessage", "Workflow saved.");
      return;
    }

    showMessage("#workflowSettingsMessage", "Workflow saved for this preview.");
  } catch (error) {
    showMessage("#workflowSettingsMessage", "Workflow saved locally. Supabase save needs admin access.");
  }
}

function duplicateSelectedWorkflow() {
  const workflow = workflowById(state.selectedWorkflowId);
  if (!workflow) return;
  const copy = normalizeWorkflow({
    ...workflow,
    id: newClientId("workflow"),
    name: `Copy of ${workflow.name}`
  });
  state.workflows.push(copy);
  state.workflows = normalizeWorkflows(state.workflows);
  state.selectedWorkflowId = copy.id;
  saveLocalWorkflows(state.workflows);
  populateWorkflowControls();
  renderWorkflowSettings();
  showMessage("#workflowSettingsMessage", "Workflow duplicated.");
}

async function deleteSelectedWorkflow() {
  const workflow = workflowById(state.selectedWorkflowId);
  if (!workflow) return;
  if (state.workflows.length <= 1) {
    showMessage("#workflowSettingsMessage", "Keep at least one workflow available.");
    return;
  }

  const fallback = state.workflows.find((item) => item.id !== workflow.id) || defaultWorkflow();
  state.workflows = state.workflows.filter((item) => item.id !== workflow.id);
  state.jobs = state.jobs.map((job) => (job.workflow_id === workflow.id ? { ...job, workflow_id: fallback.id } : job));
  state.selectedWorkflowId = fallback.id;
  saveLocalWorkflows(state.workflows);
  populateWorkflowControls();
  renderWorkflowSettings();
  renderJobsTable();

  try {
    if (hasSupabase && state.session?.accessToken) {
      await supabaseDelete("workflows", `id=eq.${encodeURIComponent(workflow.id)}`, true);
      showMessage("#workflowSettingsMessage", "Workflow deleted.");
    } else {
      showMessage("#workflowSettingsMessage", "Workflow deleted for this preview.");
    }
  } catch (error) {
    showMessage("#workflowSettingsMessage", "Workflow deleted locally. Supabase delete needs admin access.");
  }
}

async function refreshHrDataAfterSignIn() {
  try {
    setConnection(true, "Loading HR data");
    await loadSupabaseData();
    populateFilters();
    renderApplicantPortal();
    renderHrWorkspace();
  } catch (error) {
    setConnection(true, "HR session limited");
    renderHrWorkspace();
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

  setAuthLoading(true, "Checking your account...");
  showMessage("#authMessage", "Signing in...");

  try {
    const response = await fetchWithTimeout(`${env.supabaseUrl}/auth/v1/token?grant_type=password`, {
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
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true, "Opening Hiring Team home...");
    saveSession({
      accessToken: responseBody.access_token,
      refreshToken: responseBody.refresh_token,
      userId: responseBody.user?.id || "",
      email: responseBody.user?.email || username,
      expiresAt: responseBody.expires_at || ""
    });
    state.hrSection = "home";
    state.jobCreateOpen = false;
    event.currentTarget.reset();
    setAuthLoading(false);
    renderAuthPanel();
    renderHrWorkspace();
    showView("hr");
    refreshHrDataAfterSignIn();
  } catch (error) {
    const message =
      error?.name === "AbortError"
        ? "Sign-in is taking longer than expected. Please try again in a moment."
        : "Unable to sign in right now. Please check your connection and try again.";
    showMessage("#authMessage", message);
    setAuthLoading(false);
  }
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
    candidate_summary_response: String(data.candidate_summary_response || "").trim(),
    cover_note: data.cover_note.trim(),
    custom_question_response: String(data.custom_question_response || "").trim(),
    status: "new",
    source: "Career site",
    score: 74,
    applied_at: new Date().toISOString().slice(0, 10),
    recruiter: "Unassigned"
  };

  try {
    if (hasSupabase) {
      let createdRows = [];
      const baseApplicationPayload = {
        job_id: application.job_id,
        full_name: application.full_name,
        email: application.email,
        phone: application.phone,
        resume_url: application.resume_url,
        cover_note: application.cover_note,
        status: application.status,
        source: application.source
      };
      try {
        createdRows = await supabaseInsert("applications", {
          ...baseApplicationPayload,
          application_answers: {
            ...(application.candidate_summary_response
              ? { "Candidate summary": application.candidate_summary_response }
              : {}),
            ...(selectedJob.application_question && application.custom_question_response
              ? { [selectedJob.application_question]: application.custom_question_response }
              : {})
          }
        });
      } catch (error) {
        createdRows = await supabaseInsert("applications", baseApplicationPayload);
      }
      const [created] = createdRows;
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
  const workflow = workflowById(data.workflow_id) || defaultWorkflow();
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
    status: normalizeJobStatus(data.status),
    hiring_manager: data.hiring_manager.trim(),
    workflow_id: workflow.id,
    recruiter_name: String(data.recruiter_name || "").trim(),
    review_lead: String(data.review_lead || "").trim(),
    team_members: String(data.team_members || "").trim(),
    application_summary: String(data.application_summary || "").trim(),
    summary_requirement: normalizeRequirement(data.summary_requirement, "optional"),
    resume_requirement: normalizeRequirement(data.resume_requirement, "mandatory"),
    cover_letter_requirement: normalizeRequirement(data.cover_letter_requirement, "optional"),
    phone_requirement: normalizeRequirement(data.phone_requirement, "mandatory"),
    custom_question_requirement: normalizeRequirement(data.custom_question_requirement, "mandatory"),
    require_resume: isMandatoryRequirement(data.resume_requirement),
    require_cover_letter: isMandatoryRequirement(data.cover_letter_requirement),
    require_phone: isMandatoryRequirement(data.phone_requirement),
    application_question: String(data.application_question || "").trim(),
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
        workflow_id: job.workflow_id,
        recruiter_name: job.recruiter_name || null,
        review_lead: job.review_lead || null,
        team_members: job.team_members || null,
        application_summary: job.application_summary || null,
        summary_requirement: job.summary_requirement,
        resume_requirement: job.resume_requirement,
        cover_letter_requirement: job.cover_letter_requirement,
        phone_requirement: job.phone_requirement,
        custom_question_requirement: job.custom_question_requirement,
        require_resume: job.require_resume,
        require_cover_letter: job.require_cover_letter,
        require_phone: job.require_phone,
        application_question: job.application_question || null,
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
  if (["landing", "applicant", "onboarding", "login", "hr"].includes(hash)) {
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
