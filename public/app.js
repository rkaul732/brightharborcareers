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
  renderPipeline();
  renderBoardSettingsForm();
  renderDepartmentSettings();
  renderPipelineSettingsForm();
  renderProfileForm();
  renderPermissions();
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
  $("#candidatesTable").innerHTML = state.applications
    .slice()
    .sort((a, b) => a.full_name.localeCompare(b.full_name))
    .map((application) => {
      const job = state.jobs.find((item) => item.id === application.job_id);
      return `
        <tr>
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
        </tr>
      `;
    })
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
    state.applications = state.applications.map((application) => {
      if (application.id !== id) return application;
      const next =
        state.role === "hiring_manager"
          ? getManagerStage(application.status)
          : getNextStage(application.status);
      nextStatus = next;
      return next ? { ...application, status: next } : application;
    });
    renderHrWorkspace();
    if (hasSupabase && state.session?.accessToken && nextStatus && !id.startsWith("app-")) {
      await supabasePatch("applications", `id=eq.${encodeURIComponent(id)}`, { status: nextStatus }, true).catch(
        () => null
      );
    }
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
    renderHrWorkspace();
  } catch (error) {
    showMessage("#applicationMessage", "Saved locally. Supabase write needs project permissions.");
    state.applications.unshift(application);
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
