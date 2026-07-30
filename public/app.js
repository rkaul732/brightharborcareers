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

const pipelineLabels = {
  new: "New",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer"
};

const demoJobs = [
  {
    id: "job-101",
    title: "Senior Talent Partner",
    department: "People Operations",
    location: "Boston, MA",
    work_type: "Full-time",
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
    department: "Client Experience",
    location: "Providence, RI",
    work_type: "Full-time",
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
    department: "Analytics",
    location: "Remote",
    work_type: "Full-time",
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
    department: "Clinical Services",
    location: "New Haven, CT",
    work_type: "Part-time",
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
    department: "People Operations",
    location: "Hybrid",
    work_type: "Full-time",
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

const state = {
  currentView: "landing",
  jobs: [...demoJobs],
  applications: [...demoApplications],
  selectedJobId: "job-101",
  selectedJobIds: new Set(),
  role: "recruiter",
  session: readInitialSession(),
  filters: {
    query: "",
    department: "All",
    location: "All",
    workType: "All"
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

async function loadSupabaseData() {
  if (!hasSupabase) return;

  try {
    const jobs = await supabaseSelect(
      "jobs",
      "select=id,title,department,location,work_type,status,hiring_manager,summary,salary_range,review_days,remote,skills,posted_at&order=posted_at.desc"
    );
    setConnection(true, "Supabase connected");

    if (Array.isArray(jobs) && jobs.length) {
      state.jobs = jobs.map((job) => ({
        ...job,
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
    }
  } catch (error) {
    setConnection(Boolean(state.session?.accessToken), state.session?.accessToken ? "HR session limited" : "Demo data");
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
  saveSession({ ...state.session, email: user.email || state.session.email || "" });
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
  fillSelect($("#workTypeFilter"), uniqueOptions("work_type", publishedJobs), state.filters.workType);
}

function fillSelect(select, options, selected) {
  select.innerHTML = options
    .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
    .join("");
  select.value = options.includes(selected) ? selected : "All";
}

function filteredJobs() {
  const query = state.filters.query.trim().toLowerCase();
  return state.jobs.filter((job) => {
    if (job.status !== "published") return false;
    const matchesQuery =
      !query ||
      [job.title, job.department, job.location, job.summary, ...(job.skills || [])]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesDepartment =
      state.filters.department === "All" || job.department === state.filters.department;
    const matchesLocation = state.filters.location === "All" || job.location === state.filters.location;
    const matchesWorkType = state.filters.workType === "All" || job.work_type === state.filters.workType;
    return matchesQuery && matchesDepartment && matchesLocation && matchesWorkType;
  });
}

function renderApplicantPortal() {
  const jobs = filteredJobs();
  if (!jobs.some((job) => job.id === state.selectedJobId)) {
    state.selectedJobId = jobs[0]?.id || state.jobs.find((job) => job.status === "published")?.id;
  }

  $("#publishedCount").textContent = state.jobs.filter((job) => job.status === "published").length;
  $("#remoteCount").textContent = state.jobs.filter((job) => job.status === "published" && job.remote).length;
  const published = state.jobs.filter((job) => job.status === "published");
  const avg = published.length
    ? Math.round(published.reduce((total, job) => total + Number(job.review_days || 0), 0) / published.length)
    : 0;
  $("#avgCycle").textContent = `${avg}d`;

  const list = $("#jobList");
  if (!jobs.length) {
    list.innerHTML = `<div class="empty-state">No open roles match those filters.</div>`;
  } else {
    list.innerHTML = jobs.map(renderJobCard).join("");
  }

  const selectedJob = state.jobs.find((job) => job.id === state.selectedJobId);
  $("#jobDetail").innerHTML = selectedJob ? renderJobDetail(selectedJob) : renderNoJobDetail();
}

function renderJobCard(job) {
  const selected = job.id === state.selectedJobId ? " is-selected" : "";
  const skills = (job.skills || []).slice(0, 3);
  return `
    <button class="job-card${selected}" type="button" data-job-id="${escapeHtml(job.id)}">
      <div>
        <h3>${escapeHtml(job.title)}</h3>
        <div class="job-meta">
          <span>${escapeHtml(job.department)}</span>
          <span>${escapeHtml(job.location)}</span>
          <span>${escapeHtml(job.work_type)}</span>
        </div>
      </div>
      <p class="summary">${escapeHtml(job.summary)}</p>
      <div class="tag-row">
        ${skills.map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join("")}
      </div>
    </button>
  `;
}

function renderJobDetail(job) {
  return `
    <header>
      <p class="eyebrow">Selected role</p>
      <h2>${escapeHtml(job.title)}</h2>
      <div class="job-meta">
        <span>${escapeHtml(job.department)}</span>
        <span>${escapeHtml(job.location)}</span>
        <span>${escapeHtml(job.work_type)}</span>
      </div>
    </header>
    <p class="summary">${escapeHtml(job.summary)}</p>
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
      ${(job.skills || []).map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join("")}
    </div>
  `;
}

function renderNoJobDetail() {
  return `<div class="empty-state">Select a published role to view details.</div>`;
}

function renderHrWorkspace() {
  renderRoleCard();
  renderAuthPanel();
  syncRoleControls();
  renderMetrics();
  renderJobsTable();
  renderPipeline();
  renderPermissions();
}

function renderAuthPanel() {
  const signedIn = Boolean(state.session?.accessToken);
  const sessionMarkup = signedIn
    ? `
      <span class="status-pill">Signed in</span>
      <strong>${escapeHtml(state.session.email || "HR user")}</strong>
    `
    : "";

  $("#authEmailField").hidden = signedIn;
  $("#authForm button[type='submit']").hidden = signedIn;
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
  $("#publishSelected").disabled = !canManageJobs;
  $$("#jobForm input, #jobForm select, #jobForm textarea, #jobForm button").forEach((control) => {
    control.disabled = !canManageJobs;
  });
  $("#adminPanel").hidden = state.role !== "admin";
}

function renderRoleCard() {
  const profile = roleProfiles[state.role];
  $("#roleCard").innerHTML = `
    <h3>${escapeHtml(profile.label)} workspace</h3>
    <p>${escapeHtml(profile.summary)}</p>
    <ul class="role-list">
      ${profile.capabilities.map((capability) => `<li>${escapeHtml(capability)}</li>`).join("")}
    </ul>
  `;
}

function renderMetrics() {
  const openJobs = state.jobs.filter((job) => job.status === "published").length;
  const draftJobs = state.jobs.filter((job) => job.status === "draft").length;
  const activeApplicants = state.applications.filter((application) => application.status !== "archived").length;
  const interviews = state.applications.filter((application) => application.status === "interview").length;
  const metrics = [
    ["Open jobs", openJobs, `${draftJobs} drafts waiting`],
    ["Applicants", activeApplicants, "Across active pipelines"],
    ["Interviews", interviews, "Ready for manager review"],
    ["Offer stage", state.applications.filter((application) => application.status === "offer").length, "Final decisions"]
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
  $("#jobsTable").innerHTML = state.jobs
    .map((job) => {
      const applications = state.applications.filter((application) => application.job_id === job.id);
      const checked = state.selectedJobIds.has(job.id) ? "checked" : "";
      return `
        <tr>
          <td>
            <strong>${escapeHtml(job.title)}</strong>
            <div class="table-meta">
              <span>${escapeHtml(job.department)}</span>
              <span>${escapeHtml(job.location)}</span>
            </div>
          </td>
          <td>${escapeHtml(job.hiring_manager || "Unassigned")}</td>
          <td><span class="status-pill ${escapeHtml(job.status)}">${escapeHtml(formatStatus(job.status))}</span></td>
          <td>${applications.length} applicants, ${applications.filter((item) => item.status === "interview").length} interviews</td>
          <td>
            <label class="table-action">
              <input type="checkbox" data-select-job="${escapeHtml(job.id)}" ${checked}>
              Select
            </label>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderPipeline() {
  $("#pipelineBoard").innerHTML = Object.entries(pipelineLabels)
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
        ? `Move to ${pipelineLabels[nextStage]}`
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
        <span class="stage-pill">${escapeHtml(formatStatus(application.status))}</span>
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

function getNextStage(status) {
  const order = ["new", "screening", "interview", "offer"];
  const index = order.indexOf(status);
  return index >= 0 && index < order.length - 1 ? order[index + 1] : null;
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

  $$(".role-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.role = button.dataset.role;
      $$(".role-button").forEach((item) => item.classList.toggle("is-active", item === button));
      renderHrWorkspace();
    });
  });

  $("#jobSearch").addEventListener("input", (event) => {
    state.filters.query = event.target.value;
    renderApplicantPortal();
  });

  $("#departmentFilter").addEventListener("change", (event) => {
    state.filters.department = event.target.value;
    renderApplicantPortal();
  });

  $("#locationFilter").addEventListener("change", (event) => {
    state.filters.location = event.target.value;
    renderApplicantPortal();
  });

  $("#workTypeFilter").addEventListener("change", (event) => {
    state.filters.workType = event.target.value;
    renderApplicantPortal();
  });

  $("#resetFilters").addEventListener("click", () => {
    state.filters = { query: "", department: "All", location: "All", workType: "All" };
    $("#jobSearch").value = "";
    populateFilters();
    renderApplicantPortal();
  });

  $("#jobList").addEventListener("click", (event) => {
    const card = event.target.closest("[data-job-id]");
    if (!card) return;
    state.selectedJobId = card.dataset.jobId;
    renderApplicantPortal();
  });

  $("#applicationForm").addEventListener("submit", handleApplicationSubmit);
  $("#jobForm").addEventListener("submit", handleJobSubmit);
  $("#authForm").addEventListener("submit", handleAuthSubmit);
  $("#requestAccountForm").addEventListener("submit", handleAccountRequestSubmit);
  $("#continueToWorkspace").addEventListener("click", () => showView("hr"));
  $("#signOutButton").addEventListener("click", () => {
    saveSession(null);
    setConnection(false, "Demo data");
    renderAuthPanel();
    renderHrWorkspace();
    showView("login");
  });

  $("#jobsTable").addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-select-job]");
    if (!checkbox) return;
    if (checkbox.checked) state.selectedJobIds.add(checkbox.dataset.selectJob);
    else state.selectedJobIds.delete(checkbox.dataset.selectJob);
  });

  $("#publishSelected").addEventListener("click", () => {
    if (state.role === "hiring_manager") return;
    state.jobs = state.jobs.map((job) =>
      state.selectedJobIds.has(job.id) ? { ...job, status: "published" } : job
    );
    state.selectedJobIds.clear();
    populateFilters();
    renderApplicantPortal();
    renderHrWorkspace();
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

async function handleAuthSubmit(event) {
  event.preventDefault();
  if (!hasSupabase) {
    showMessage("#authMessage", "Add Supabase environment values first.");
    return;
  }

  const email = new FormData(event.currentTarget).get("email")?.trim();
  if (!email) return;

  const response = await fetch(`${env.supabaseUrl}/auth/v1/otp`, {
    method: "POST",
    headers: {
      apikey: env.supabaseAnonKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      create_user: false,
      options: {
        email_redirect_to: `${location.origin}${location.pathname}`
      }
    })
  });

  let responseBody = {};
  try {
    responseBody = await response.json();
  } catch (error) {
    responseBody = {};
  }

  showMessage(
    "#authMessage",
    response.ok
      ? "Sign-in link sent. Check inbox and spam."
      : `Supabase error: ${responseBody.msg || responseBody.message || "account not approved yet"}`
  );
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
    showMessage("#requestAccountMessage", error.message || "Request could not be sent.");
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
  const job = {
    id: `job-${Date.now()}`,
    title: data.title.trim(),
    department: data.department.trim(),
    location: data.location.trim(),
    work_type: data.work_type,
    status: data.status,
    hiring_manager: data.hiring_manager.trim(),
    summary: data.summary.trim(),
    salary_range: "Shared during screening",
    review_days: 5,
    remote: data.location.toLowerCase().includes("remote") || data.location.toLowerCase().includes("hybrid"),
    skills: ["Role fit", "Team communication", "Execution"],
    applicants: 0,
    interviews: 0,
    posted_at: new Date().toISOString().slice(0, 10)
  };

  try {
    if (hasSupabase && state.session?.accessToken) {
      const [created] = await supabaseInsert("jobs", {
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
      }, true);
      if (created?.id) job.id = created.id;
    } else if (hasSupabase) {
      throw new Error("Missing HR session");
    }
    state.jobs.unshift(job);
    if (job.status === "published") state.selectedJobId = job.id;
    event.currentTarget.reset();
    showMessage("#jobFormMessage", "Job created.");
    populateFilters();
    renderApplicantPortal();
    renderHrWorkspace();
  } catch (error) {
    state.jobs.unshift(job);
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
