// Runs automatically after each verified Netlify Forms submission.
// Optional automations, switched on by environment variables in Netlify
// (Site configuration > Environment variables). If a variable is missing, that step is skipped.
//
//   RESEND_API_KEY    API key from resend.com, to email an automatic reply to the person who submitted
//   AUTO_REPLY_FROM   Sender for that reply, e.g.  Doc & Writer <support@docandwriter.com>
//   SLACK_WEBHOOK_URL Slack incoming webhook, to post each new lead to a channel

const CAL = "https://calendly.com/docandwriter/discovery-call";

const checkReply = (d) => ({
  subject: "Your free answer check",
  text: `Hi ${first(d.name)},

Thanks for requesting a free answer check${d.company ? " for " + d.company : ""}. We will ask ${d.ai_agent ? "your AI agent" : (d.help_center_url || "your help center")} 10 questions your own pages answer, and send a 3 minute video of what we find within three business days.

If your help center or agent requires a login, the check covers what is public. Reply to this email if you would like to share a test account.

Want to talk sooner? Book a time here: ${CAL}

The Doc & Writer team
https://www.docandwriter.com`,
});

const generalReply = (d) => ({
  subject: "We received your request",
  text: `Hi ${first(d.name)},

Thanks for writing to Doc & Writer${d.request_type ? " about the " + String(d.request_type).toLowerCase() : ""}. We will reply within one business day.

If you would rather talk now, book a time here: ${CAL}

The Doc & Writer team
https://www.docandwriter.com`,
});

// The contact form carries a request_type. "free-assessment" is the retired form name, kept for old submissions.
const pickReply = (form, d) => {
  if (form === "free-assessment") return checkReply;
  if (form === "contact") return d.request_type === "Free answer check" ? checkReply : generalReply;
  return null;
};

function first(name) {
  return String(name || "").trim().split(/\s+/)[0] || "there";
}

export const handler = async (event) => {
  let payload;
  try {
    payload = JSON.parse(event.body).payload;
  } catch {
    return { statusCode: 400, body: "Bad payload" };
  }
  const form = payload.form_name;
  const d = payload.data || {};
  const tasks = [];

  const build = pickReply(form, d);
  if (process.env.RESEND_API_KEY && process.env.AUTO_REPLY_FROM && build && d.email) {
    const { subject, text } = build(d);
    tasks.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.AUTO_REPLY_FROM, to: [d.email], reply_to: "support@docandwriter.com", subject, text }),
      })
    );
  }

  if (process.env.SLACK_WEBHOOK_URL) {
    const lines = [
      `New request: ${d.request_type || form}`,
      `${d.name || "No name"} <${d.email || "no email"}>${d.company ? ", " + d.company : ""}`,
      d.help_center_url ? `Help center: ${d.help_center_url}` : "",
      d.message ? `Message: ${String(d.message).slice(0, 500)}` : "",
      d.ai_agent ? `AI agent: ${String(d.ai_agent).slice(0, 200)}` : "",
    ].filter(Boolean);
    tasks.push(
      fetch(process.env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: lines.join("\n") }),
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  results.forEach((r) => { if (r.status === "rejected") console.error(r.reason); });
  return { statusCode: 200, body: "ok" };
};
