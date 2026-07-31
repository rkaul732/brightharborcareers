import { randomUUID } from "node:crypto";
import { json, requiredServerEnv, sendEmail, supabaseRequest } from "./_lib.mjs";

const hrRoles = new Set(["recruiter", "hiring_manager", "admin"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    return {};
  }
}

function header(event, key) {
  const lowerKey = key.toLowerCase();
  return Object.entries(event.headers || {}).find(([name]) => name.toLowerCase() === lowerKey)?.[1] || "";
}

function formatFrom(value) {
  const email = String(value || process.env.EMAIL_FROM || "no-reply@brightharbor.org").trim();
  return email.includes("<") ? email : `Bright Harbor Careers <${email}>`;
}

function formatStatus(status = "") {
  return String(status || "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function renderTemplateString(value, context) {
  return String(value || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) =>
    Object.prototype.hasOwnProperty.call(context, key) ? context[key] : match
  );
}

async function requireHrUser(event) {
  const token = header(event, "authorization").replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    const error = new Error("Sign in as a hiring-team user before running this automation.");
    error.statusCode = 401;
    throw error;
  }

  const { missing, values } = requiredServerEnv();
  if (missing.length) {
    throw new Error(`Missing server environment variables: ${missing.join(", ")}`);
  }
  const userResponse = await fetch(`${values.supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: values.serviceRoleKey,
      Authorization: `Bearer ${token}`
    }
  });

  if (!userResponse.ok) {
    const error = new Error("Sign in as a hiring-team user before running this automation.");
    error.statusCode = 401;
    throw error;
  }

  const user = await userResponse.json();
  const profiles = await supabaseRequest(
    `/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=id,role,email,full_name&limit=1`
  );
  const profile = Array.isArray(profiles) ? profiles[0] : null;
  if (!profile || !hrRoles.has(profile.role)) {
    const error = new Error("Only hiring-team users can run this automation.");
    error.statusCode = 403;
    throw error;
  }

  return { user, profile };
}

async function fetchOne(path) {
  const rows = await supabaseRequest(path);
  return Array.isArray(rows) ? rows[0] : null;
}

async function recordActivity(record, eventType, actorId = null) {
  if (!uuidPattern.test(record.application_id || "") || !uuidPattern.test(record.job_id || "")) return;

  await supabaseRequest("/rest/v1/activity_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      actor_id: actorId,
      job_id: record.job_id,
      application_id: record.application_id,
      event_type: eventType,
      event_body: `${record.send_type || "automated"} email: ${record.subject}`
    })
  }).catch(() => null);
}

async function insertCommunication(record) {
  const rows = await supabaseRequest("/rest/v1/communication_events", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(record)
  });
  return Array.isArray(rows) ? rows[0] : rows;
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

function mergeContext({ application, job, sender, details }) {
  const candidateName = application.full_name || "Candidate";
  const nameParts = candidateNameParts(candidateName);
  return {
    candidate_name: candidateName,
    candidate_first_name: nameParts.first,
    candidate_last_name: nameParts.last,
    candidate_email: application.email || "",
    job_title: job.title || "the role",
    department: job.department || "Bright Harbor",
    job_location: job.location || "Location to be confirmed",
    company_name: "Bright Harbor",
    recruiter_name: details.recruiter_name || "Bright Harbor Careers",
    hiring_manager: job.hiring_manager || "Hiring team",
    application_stage: formatStatus(application.status || "new"),
    interview_date_time: details.interview_date_time || "Scheduling to be confirmed",
    offer_details: details.offer_details || job.salary_range || "Offer details will be shared by the hiring team.",
    sender_email: sender.email,
    reply_to: sender.reply_to || sender.email
  };
}

async function hasExistingCandidateApplyMessage(applicationId, ruleId) {
  const rows = await supabaseRequest(
    `/rest/v1/communication_events?select=id&application_id=eq.${encodeURIComponent(applicationId)}&automation_rule_id=eq.${encodeURIComponent(ruleId)}&trigger_event=eq.candidate_applies&limit=1`
  );
  return Array.isArray(rows) && rows.length > 0;
}

async function sendOrQueue({ application, job, rule, template, sender, details, actorId }) {
  const context = mergeContext({ application, job, sender, details });
  const now = new Date();
  const delayMinutes = Number(rule.delay_minutes || 0);
  const sendAfter = new Date(now.getTime() + Math.max(delayMinutes, 0) * 60 * 1000);
  const isDelayed = delayMinutes > 0;
  const record = {
    id: `comm-${randomUUID()}`,
    application_id: String(application.id),
    job_id: String(application.job_id),
    candidate_name: application.full_name || "",
    candidate_email: application.email,
    template_id: template.id,
    automation_rule_id: rule.id,
    trigger_event: rule.trigger_event,
    direction: "outbound",
    send_type: "automated",
    subject: renderTemplateString(template.subject, context),
    body: renderTemplateString(template.body, context),
    sender_email: rule.sender_email || sender.email,
    reply_to: rule.reply_to || sender.reply_to || sender.email,
    status: isDelayed ? "queued" : "sent",
    delivery_status: isDelayed ? "queued" : "sent",
    provider: "resend",
    provider_message_id: "",
    error_message: "",
    queued_at: now.toISOString(),
    send_after: sendAfter.toISOString(),
    sent_at: isDelayed ? null : now.toISOString(),
    created_by: actorId
  };

  if (!isDelayed) {
    try {
      const result = await sendEmail({
        to: record.candidate_email,
        from: formatFrom(record.sender_email),
        replyTo: record.reply_to,
        subject: record.subject,
        text: record.body
      });
      record.provider_message_id = result.id || "";
    } catch (error) {
      record.status = "failed";
      record.delivery_status = "failed";
      record.error_message = error.message || "Email provider could not send the automated message.";
      record.sent_at = null;
    }
  }

  const saved = await insertCommunication(record);
  await recordActivity(
    saved || record,
    record.status === "queued" ? "communication_queued" : record.status === "failed" ? "communication_failed" : "communication_sent",
    actorId
  );
  return saved || record;
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Use POST to run communication automations." });
  }

  try {
    const payload = parseBody(event);
    const triggerEvent = String(payload.trigger_event || "").trim();
    const applicationId = String(payload.application_id || "").trim();
    const details = payload.details || {};

    if (!triggerEvent || !applicationId) {
      return json(400, { error: "trigger_event and application_id are required." });
    }

    const publicTrigger = triggerEvent === "candidate_applies";
    const actor = publicTrigger ? null : await requireHrUser(event);
    const application = await fetchOne(
      `/rest/v1/applications?id=eq.${encodeURIComponent(applicationId)}&select=id,job_id,full_name,email,status,source,applied_at&limit=1`
    );
    if (!application) return json(404, { error: "Application was not found." });

    const job = await fetchOne(
      `/rest/v1/jobs?id=eq.${encodeURIComponent(application.job_id)}&select=id,title,department,location,hiring_manager,salary_range&limit=1`
    );
    const rules = await supabaseRequest(
      `/rest/v1/automation_rules?trigger_event=eq.${encodeURIComponent(triggerEvent)}&status=eq.active&select=*&order=name.asc`
    );
    const records = [];

    for (const rule of Array.isArray(rules) ? rules : []) {
      const stage = details.pipeline_stage || application.status;
      if (triggerEvent === "candidate_stage_changed" && rule.pipeline_stage && rule.pipeline_stage !== stage) {
        continue;
      }
      if (triggerEvent === "candidate_applies" && (await hasExistingCandidateApplyMessage(application.id, rule.id))) {
        continue;
      }

      const template = await fetchOne(
        `/rest/v1/communication_templates?id=eq.${encodeURIComponent(rule.template_id)}&select=*&limit=1`
      );
      if (!template || template.status !== "active" || template.archived_at) continue;

      const sender =
        (await fetchOne(`/rest/v1/sender_accounts?id=eq.${encodeURIComponent(rule.sender_account_id)}&select=*&limit=1`)) || {
          email: rule.sender_email || "hr@brightharbor.org",
          reply_to: rule.reply_to || rule.sender_email || "hr@brightharbor.org"
        };

      records.push(
        await sendOrQueue({
          application,
          job: job || {},
          rule,
          template,
          sender,
          details,
          actorId: actor?.user?.id || null
        })
      );
    }

    return json(200, {
      message: `${records.length} communication ${records.length === 1 ? "automation" : "automations"} processed.`,
      records
    });
  } catch (error) {
    return json(error.statusCode || 500, {
      error: error.message || "Communication automations could not run."
    });
  }
}
