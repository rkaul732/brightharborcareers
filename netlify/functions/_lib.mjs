import { randomBytes } from "node:crypto";

export function json(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: JSON.stringify(body)
  };
}

export function html(statusCode, title, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "text/html; charset=utf-8"
    },
    body: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} | Bright Harbor Careers</title>
    <style>
      body {
        margin: 0;
        background: #f6f8f6;
        color: #16211f;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        display: grid;
        place-items: center;
        min-height: 100vh;
        padding: 24px;
      }
      section {
        width: min(620px, 100%);
        border: 1px solid #d8e0dc;
        border-radius: 8px;
        background: #fff;
        padding: 28px;
        box-shadow: 0 16px 44px rgba(22, 33, 31, 0.09);
      }
      h1 { margin: 0 0 12px; font-size: 28px; line-height: 1.15; }
      p { margin: 0 0 14px; color: #61706c; line-height: 1.55; }
      a { color: #0f5c55; font-weight: 800; }
    </style>
  </head>
  <body>
    <main>
      <section>
        <h1>${escapeHtml(title)}</h1>
        ${body}
        <p><a href="/">Return to Bright Harbor Careers</a></p>
      </section>
    </main>
  </body>
</html>`
  };
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function requiredServerEnv() {
  const missing = [];
  const values = {
    supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    siteUrl: process.env.SITE_URL || process.env.URL || ""
  };

  if (!values.supabaseUrl) missing.push("SUPABASE_URL");
  if (!values.serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

  return { missing, values };
}

export function randomToken() {
  return randomBytes(24).toString("hex");
}

export async function supabaseRequest(path, options = {}) {
  const { missing, values } = requiredServerEnv();
  if (missing.length) {
    throw new Error(`Missing server environment variables: ${missing.join(", ")}`);
  }

  const response = await fetch(`${values.supabaseUrl}${path}`, {
    ...options,
    headers: {
      apikey: values.serviceRoleKey,
      Authorization: `Bearer ${values.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      body?.message ||
      body?.msg ||
      body?.error_description ||
      body?.error ||
      `Supabase request failed with ${response.status}`;
    throw new Error(message);
  }

  return body;
}

export function publicSiteUrl(event) {
  const configured = process.env.SITE_URL || process.env.URL;
  if (configured) return configured.replace(/\/$/, "");

  const host = event.headers.host || event.headers.Host;
  const protocol = host?.includes("localhost") ? "http" : "https";
  return host ? `${protocol}://${host}` : "";
}

export function emailHtmlFromText(value) {
  const paragraphs = String(value || "")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.length
    ? paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`).join("")
    : "<p></p>";
}

export async function sendEmail({ to, from, replyTo, subject, text, html: htmlBody }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY for email sending.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: from || process.env.EMAIL_FROM || "Bright Harbor Careers <no-reply@brightharbor.org>",
      to,
      subject,
      text,
      html: htmlBody || emailHtmlFromText(text),
      ...(replyTo ? { reply_to: replyTo } : {})
    })
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Email provider could not send the message.");
  }

  return result;
}

export async function sendHrReviewEmail({ request, approveUrl, denyUrl }) {
  const to = process.env.HR_APPROVAL_EMAIL || "hr@brightharbor.org";
  const from = process.env.EMAIL_FROM || "Bright Harbor Careers <no-reply@brightharbor.org>";

  const text = [
    "A hiring-team account was requested.",
    "",
    `Name: ${request.full_name}`,
    `Email: ${request.email}`,
    `Requested role: ${request.requested_role}`,
    `Department: ${request.department || "Not provided"}`,
    `Reason: ${request.message || "Not provided"}`,
    "",
    `Approve: ${approveUrl}`,
    `Deny: ${denyUrl}`
  ].join("\n");

  const htmlBody = `
    <p>A hiring-team account was requested.</p>
    <ul>
      <li><strong>Name:</strong> ${escapeHtml(request.full_name)}</li>
      <li><strong>Email:</strong> ${escapeHtml(request.email)}</li>
      <li><strong>Requested role:</strong> ${escapeHtml(request.requested_role)}</li>
      <li><strong>Department:</strong> ${escapeHtml(request.department || "Not provided")}</li>
      <li><strong>Reason:</strong> ${escapeHtml(request.message || "Not provided")}</li>
    </ul>
    <p>
      <a href="${escapeHtml(approveUrl)}">Approve request</a><br>
      <a href="${escapeHtml(denyUrl)}">Deny request</a>
    </p>
  `;

  return sendEmail({
    from,
    to,
    subject: `Bright Harbor account request: ${request.full_name}`,
    text,
    html: htmlBody
  });
}
