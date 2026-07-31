import { json, sendEmail, supabaseRequest } from "./_lib.mjs";

export const config = {
  schedule: "*/15 * * * *"
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formatFrom(value) {
  const email = String(value || process.env.EMAIL_FROM || "no-reply@brightharbor.org").trim();
  return email.includes("<") ? email : `Bright Harbor Careers <${email}>`;
}

async function patchCommunication(id, payload) {
  const rows = await supabaseRequest(`/rest/v1/communication_events?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload)
  });
  return Array.isArray(rows) ? rows[0] : rows;
}

async function recordActivity(record, eventType) {
  if (!uuidPattern.test(record.application_id || "") || !uuidPattern.test(record.job_id || "")) return;

  await supabaseRequest("/rest/v1/activity_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      job_id: record.job_id,
      application_id: record.application_id,
      event_type: eventType,
      event_body: `${record.send_type || "automated"} email: ${record.subject}`
    })
  }).catch(() => null);
}

export async function handler() {
  const now = new Date().toISOString();
  const due = await supabaseRequest(
    `/rest/v1/communication_events?select=*&status=eq.queued&send_after=lte.${encodeURIComponent(now)}&order=send_after.asc&limit=25`
  );
  const records = Array.isArray(due) ? due : [];
  const results = [];

  for (const record of records) {
    try {
      const result = await sendEmail({
        to: record.candidate_email,
        from: formatFrom(record.sender_email),
        replyTo: record.reply_to || record.sender_email,
        subject: record.subject,
        text: record.body
      });
      const saved = await patchCommunication(record.id, {
        status: "sent",
        delivery_status: "sent",
        provider_message_id: result.id || "",
        error_message: "",
        sent_at: new Date().toISOString()
      });
      await recordActivity(saved || record, "communication_sent");
      results.push({ id: record.id, status: "sent" });
    } catch (error) {
      const saved = await patchCommunication(record.id, {
        status: "failed",
        delivery_status: "failed",
        error_message: error.message || "Email provider could not send the queued message."
      });
      await recordActivity(saved || record, "communication_failed");
      results.push({ id: record.id, status: "failed" });
    }
  }

  return json(200, {
    processed: results.length,
    results
  });
}
