import { escapeHtml, html, publicSiteUrl, supabaseRequest } from "./_lib.mjs";

const decisionConfig = {
  approve: {
    status: "approved",
    tokenColumn: "approval_token",
    title: "Account Request Approved"
  },
  deny: {
    status: "denied",
    tokenColumn: "denial_token",
    title: "Account Request Denied"
  }
};

export async function handler(event) {
  const decision = String(event.queryStringParameters?.decision || "").toLowerCase();
  const token = String(event.queryStringParameters?.token || "");
  const config = decisionConfig[decision];

  if (!config || !token) {
    return html(400, "Invalid Review Link", "<p>This approval link is missing required information.</p>");
  }

  try {
    const requests = await supabaseRequest(
      `/rest/v1/account_requests?select=*&${config.tokenColumn}=eq.${encodeURIComponent(token)}&status=eq.pending`,
      { method: "GET" }
    );

    const request = requests?.[0];
    if (!request) {
      return html(404, "Request Not Available", "<p>This request may already have been reviewed.</p>");
    }

    let inviteMessage = "";
    let inviteSentAt = null;

    if (decision === "approve") {
      const siteUrl = publicSiteUrl(event);
      try {
        const redirectTo = encodeURIComponent(`${siteUrl}/#login`);
        const invitedUser = await supabaseRequest(`/auth/v1/invite?redirect_to=${redirectTo}`, {
          method: "POST",
          body: JSON.stringify({
            email: request.email,
            data: {
              full_name: request.full_name,
              requested_role: request.requested_role,
              department: request.department || ""
            }
          })
        });

        if (invitedUser?.id) {
          await supabaseRequest("/rest/v1/profiles?on_conflict=id", {
            method: "POST",
            headers: {
              Prefer: "resolution=merge-duplicates,return=minimal"
            },
            body: JSON.stringify({
              id: invitedUser.id,
              full_name: request.full_name,
              email: request.email,
              role: request.requested_role,
              department: request.department || null
            })
          });
        }

        inviteSentAt = new Date().toISOString();
        inviteMessage = "<p>An invitation email was sent to the requester.</p>";
      } catch (error) {
        inviteMessage = `<p>The request was approved, but the invitation email needs manual follow-up: ${escapeHtml(error.message)}</p>`;
      }
    }

    await supabaseRequest(`/rest/v1/account_requests?id=eq.${encodeURIComponent(request.id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        status: config.status,
        reviewed_at: new Date().toISOString(),
        invite_sent_at: inviteSentAt
      })
    });

    const body =
      decision === "approve"
        ? `<p>${escapeHtml(request.full_name)} was approved for ${escapeHtml(request.requested_role)} access.</p>${inviteMessage}`
        : `<p>${escapeHtml(request.full_name)} was denied for hiring-team access.</p>`;

    return html(200, config.title, body);
  } catch (error) {
    return html(
      500,
      "Review Failed",
      `<p>${escapeHtml(error.message || "The request could not be reviewed.")}</p>`
    );
  }
}
