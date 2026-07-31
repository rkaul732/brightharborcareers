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

async function requireHrUser(event) {
  const { missing, values } = requiredServerEnv();
  if (missing.length) {
    throw new Error(`Missing server environment variables: ${missing.join(", ")}`);
  }

  const token = header(event, "authorization").replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    const error = new Error("Sign in as a hiring-team user before sending email.");
    error.statusCode = 401;
    throw error;
  }

  const userResponse = await fetch(`${values.supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: values.serviceRoleKey,
      Authorization: `Bearer ${token}`
    }
  });

  if (!userResponse.ok) {
    const error = new Error("Sign in as a hiring-team user before sending email.");
    error.statusCode = 401;
    throw error;
  }

  const user = await userResponse.json();
  const profiles = await supabaseRequest(
    `/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=id,role,email,full_name&limit=1`
  );
  const profile = Array.isArray(profiles) ? profiles[0] : null;
  if (!profile || !hrRoles.has(profile.role)) {
    const error = new Error("Only hiring-team users can send candidate communications.");
    error.statusCode = 403;
    throw error;
  }

  return { user, profile };
}

async function insertCommunication(record) {
  const rows = await supabaseRequest("/rest/v1/communication_events", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(record)
  });
  return Array.isArray(rows) ? rows[0] : rows;
}

async function recordActivity(record, actorId) {
  if (!uuidPattern.test(record.application_id || "") || !uuidPattern.test(record.job_id || "")) return;

  await supabaseRequest("/rest/v1/activity_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      actor_id: actorId,
      job_id: record.job_id,
      application_id: record.application_id,
      event_type:
        record.status === "queued"
          ? "communication_queued"
          : record.status === "failed"
            ? "communication_failed"
            : "communication_sent",
      event_body: `${record.send_type || "manual"} email: ${record.subject}`
    })
  }).catch(() => null);
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Use POST to send communications." });
  }

  let actor = null;
  let record = null;

  try {
    actor = await requireHrUser(event);
    const payload = parseBody(event);
    const recipient = String(payload.to || payload.candidate_email || "").trim();
    const subject = String(payload.subject || "").trim();
    const body = String(payload.body || "").trim();
    const senderEmail = String(payload.sender_email || process.env.EMAIL_FROM || "hr@brightharbor.org").trim();
    const replyTo = String(payload.reply_to || senderEmail).trim();

    if (!recipient || !subject || !body) {
      return json(400, { error: "Recipient, subject, and message body are required." });
    }

    const now = new Date();
    const delayMinutes = Number(payload.delay_minutes || 0);
    const sendAfter = payload.send_after
      ? new Date(payload.send_after)
      : new Date(now.getTime() + Math.max(delayMinutes, 0) * 60 * 1000);
    const isDelayed = sendAfter.getTime() - now.getTime() > 30 * 1000;

    if (payload.mode === "test") {
      const result = await sendEmail({
        to: recipient,
        from: formatFrom(senderEmail),
        replyTo,
        subject,
        text: body
      });
      return json(200, {
        message: "Test email sent.",
        status: "sent",
        delivery_status: "sent",
        provider_message_id: result.id || ""
      });
    }

    record = {
      id: String(payload.id || randomUUID()),
      application_id: String(payload.application_id || ""),
      job_id: String(payload.job_id || ""),
      candidate_name: String(payload.candidate_name || "").trim(),
      candidate_email: recipient,
      template_id: String(payload.template_id || ""),
      automation_rule_id: String(payload.automation_rule_id || ""),
      trigger_event: String(payload.trigger_event || "manual_send"),
      direction: String(payload.direction || "outbound"),
      send_type: String(payload.send_type || "manual"),
      subject,
      body,
      sender_email: senderEmail,
      reply_to: replyTo,
      status: isDelayed ? "queued" : "sent",
      delivery_status: isDelayed ? "queued" : "sent",
      provider: "resend",
      provider_message_id: "",
      error_message: "",
      queued_at: now.toISOString(),
      send_after: sendAfter.toISOString(),
      sent_at: isDelayed ? null : now.toISOString(),
      created_by: actor.user.id
    };

    if (!isDelayed) {
      try {
        const result = await sendEmail({
          to: recipient,
          from: formatFrom(senderEmail),
          replyTo,
          subject,
          text: body
        });
        record.provider_message_id = result.id || "";
      } catch (error) {
        record.status = "failed";
        record.delivery_status = "failed";
        record.error_message = error.message || "Email provider could not send the message.";
        record.sent_at = null;
      }
    }

    const saved = await insertCommunication(record);
    await recordActivity(saved || record, actor.user.id);

    return json(record.status === "failed" ? 502 : isDelayed ? 202 : 200, {
      message: isDelayed ? "Email queued." : record.status === "failed" ? "Email failed and was logged." : "Email sent.",
      status: record.status,
      delivery_status: record.delivery_status,
      record: saved || record
    });
  } catch (error) {
    return json(error.statusCode || 500, {
      error: error.message || "Communication could not be sent.",
      record
    });
  }
}
