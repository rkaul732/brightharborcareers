import { json, publicSiteUrl, randomToken, sendHrReviewEmail, supabaseRequest } from "./_lib.mjs";

const allowedRoles = new Set(["recruiter", "hiring_manager", "admin"]);

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed." });
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Request body must be valid JSON." });
  }

  const request = {
    full_name: String(payload.full_name || "").trim(),
    email: String(payload.email || "").trim().toLowerCase(),
    requested_role: String(payload.requested_role || "").trim(),
    department: String(payload.department || "").trim(),
    message: String(payload.message || "").trim(),
    approval_token: randomToken(),
    denial_token: randomToken()
  };

  if (!request.full_name || !request.email || !allowedRoles.has(request.requested_role)) {
    return json(400, { error: "Name, email, and requested role are required." });
  }

  const siteUrl = publicSiteUrl(event);
  const approveUrl = `${siteUrl}/.netlify/functions/review-account-request?decision=approve&token=${request.approval_token}`;
  const denyUrl = `${siteUrl}/.netlify/functions/review-account-request?decision=deny&token=${request.denial_token}`;

  try {
    const [createdRequest] = await supabaseRequest("/rest/v1/account_requests", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(request)
    });

    await sendHrReviewEmail({
      request: createdRequest,
      approveUrl,
      denyUrl
    });

    await supabaseRequest(`/rest/v1/account_requests?id=eq.${encodeURIComponent(createdRequest.id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ email_sent_at: new Date().toISOString() })
    });

    return json(200, {
      message: "Request sent to HR. Watch your inbox for a follow-up."
    });
  } catch (error) {
    return json(500, {
      error: error.message || "Account request could not be sent."
    });
  }
}
