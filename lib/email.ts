import nodemailer from "nodemailer";

function getEmailConfig() {
  return {
    user: process.env.EMAIL_USER || "",
    service: process.env.EMAIL_SERVICE || "gmail",
    appPassword:
      process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || "",
    clientId: process.env.GMAIL_CLIENT_ID || "",
    clientSecret: process.env.GMAIL_CLIENT_SECRET || "",
    refreshToken: process.env.GMAIL_REFRESH_TOKEN || "",
    accessToken: process.env.GMAIL_ACCESS_TOKEN || "",
  };
}

function createOAuthTransporter() {
  const cfg = getEmailConfig();

  return nodemailer.createTransport({
    service: cfg.service,
    auth: {
      type: "OAuth2",
      user: cfg.user,
      clientId: cfg.clientId,
      clientSecret: cfg.clientSecret,
      refreshToken: cfg.refreshToken,
      accessToken: cfg.accessToken || undefined,
    },
  });
}

function createAppPasswordTransporter() {
  const cfg = getEmailConfig();

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: cfg.user,
      pass: cfg.appPassword,
    },
  });
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export async function sendMail(payload: EmailPayload) {
  const cfg = getEmailConfig();

  if (!cfg.user) {
    console.error("[EMAIL] EMAIL_USER is not configured. Email not sent.");
    return { success: false, error: "EMAIL_USER missing" };
  }

  if (!payload.to) {
    console.error("[EMAIL] No recipient address provided.");
    return { success: false, error: "No recipient" };
  }

  const mailOptions = {
    from: `"BRAC University Adventure Club" <${cfg.user}>`,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo || cfg.user,
  };

  const hasOAuth =
    Boolean(cfg.clientId) &&
    Boolean(cfg.clientSecret) &&
    Boolean(cfg.refreshToken);

  if (hasOAuth) {
    try {
      const transporter = createOAuthTransporter();
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL] OAuth2 sent to ${payload.to} (${info.messageId})`);
      return { success: true, messageId: info.messageId, method: "oauth2" };
    } catch (oauthError) {
      console.error("[EMAIL] OAuth2 send failed:", oauthError);
    }
  }

  if (cfg.appPassword) {
    try {
      const transporter = createAppPasswordTransporter();
      const info = await transporter.sendMail(mailOptions);
      console.log(
        `[EMAIL] App Password sent to ${payload.to} (${info.messageId})`,
      );
      return {
        success: true,
        messageId: info.messageId,
        method: "app-password",
      };
    } catch (smtpError) {
      console.error("[EMAIL] App Password send failed:", smtpError);
      return { success: false, error: smtpError };
    }
  }

  console.error(
    "[EMAIL] No working transport. Set GMAIL_CLIENT_ID/SECRET/REFRESH_TOKEN or EMAIL_PASS.",
  );

  return { success: false, error: "No email transport configured" };
}

interface BuacEmailWrapperOptions {
  title: string;
  bodyHtml: string;
}

export function buildEmailHtml({
  title,
  bodyHtml,
}: BuacEmailWrapperOptions) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#08090d;font-family:Arial,Helvetica,sans-serif;color:#f3f4f8;">
    <div style="max-width:600px;margin:0 auto;padding:16px;">
      <div style="background-color:#11131a;border:1px solid rgba(255,255,255,0.12);border-radius:18px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#ff622b 0%,#ff8a5b 100%);color:#ffffff;padding:32px 24px;text-align:center;">
          <h1 style="margin:0;font-weight:700;letter-spacing:1px;font-size:26px;">BUAC</h1>
          <p style="margin:6px 0 0 0;font-size:12px;opacity:0.95;letter-spacing:2px;text-transform:uppercase;">
            BRAC University Adventure Club
          </p>
        </div>

        <div style="padding:28px 24px;line-height:1.7;color:#dedfe8;font-size:15px;">
          ${bodyHtml}
        </div>
      </div>

      <div style="text-align:center;padding:20px;color:#969baa;font-size:12px;">
        <p style="margin:0 0 8px 0;">
          BRAC University Adventure Club<br />
          Kha 224 Pragati Sarani, Merul Badda, Dhaka 1212, Bangladesh
        </p>
        <p style="margin:0;">© ${new Date().getFullYear()} BUAC. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
  `;
}

export function buildMemberWelcomeEmail(name: string) {
  const bodyHtml = `
    <h2 style="font-size:20px;color:#ffffff;margin-top:0;">Welcome to BUAC, ${name}!</h2>

    <p style="margin:0 0 16px 0;">
      Congratulations on becoming an official member of the
      <strong style="color:#ffffff;">BRAC University Adventure Club</strong>.
      You are now part of a community driven by exploration, courage, and teamwork.
    </p>

    <div style="background:rgba(255,98,43,0.12);border-left:4px solid #ff622b;padding:14px 18px;border-radius:8px;margin:20px 0;color:#ffffff;">
      Your adventure starts now. Get ready for expeditions, workshops, campfires,
      and lifelong memories with fellow adventurers.
    </div>

    <p style="margin:0 0 16px 0;">
      Keep an eye on your inbox and our social channels for upcoming events and tours.
    </p>

    <p style="margin:24px 0 0 0;">
      Warm regards,<br />
      <strong style="color:#ffffff;">BUAC Executive Team</strong>
    </p>
  `;

  return {
    subject: "Welcome to BRAC University Adventure Club",
    html: buildEmailHtml({ title: "Welcome to BUAC", bodyHtml }),
    text: `Welcome to BUAC, ${name}!

Congratulations on becoming an official member of the BRAC University Adventure Club.

Get ready for expeditions, workshops, and lifelong memories with fellow adventurers.

Warm regards,
BUAC Executive Team`,
  };
}

export function buildAlumniWelcomeEmail(name: string) {
  const bodyHtml = `
    <h2 style="font-size:20px;color:#ffffff;margin-top:0;">Welcome Back, ${name}!</h2>

    <p style="margin:0 0 16px 0;">
      We are delighted to welcome you back to the
      <strong style="color:#ffffff;">BRAC University Adventure Club</strong> alumni network.
    </p>

    <div style="background:rgba(255,98,43,0.12);border-left:4px solid #ff622b;padding:14px 18px;border-radius:8px;margin:20px 0;color:#ffffff;">
      Once a BUAC-ian, always a BUAC-ian. Your legacy continues to inspire new adventurers.
    </div>

    <p style="margin:0 0 16px 0;">
      You will now receive updates on alumni reunions, mentorship programs, and exclusive events.
    </p>

    <p style="margin:24px 0 0 0;">
      Warm regards,<br />
      <strong style="color:#ffffff;">BUAC Executive Team</strong>
    </p>
  `;

  return {
    subject: "Welcome Back to the BUAC Alumni Network",
    html: buildEmailHtml({ title: "Welcome Back to BUAC", bodyHtml }),
    text: `Welcome back, ${name}!

We are delighted to welcome you back to the BRAC University Adventure Club alumni network.

You will receive updates on alumni reunions, mentorship programs, and exclusive events.

Warm regards,
BUAC Executive Team`,
  };
}

export function buildClubFairThankYouEmail(name: string) {
  const bodyHtml = `
    <h2 style="font-size:20px;color:#ffffff;margin-top:0;">Thank You for Registering, ${name}!</h2>

    <p style="margin:0 0 16px 0;">
      Thank you for submitting your application for the
      <strong style="color:#ffffff;">BUAC Club Fair</strong>. We have received your details successfully.
    </p>

    <div style="background:rgba(255,98,43,0.12);border-left:4px solid #ff622b;padding:14px 18px;border-radius:8px;margin:20px 0;color:#ffffff;">
      <strong>Next Steps:</strong> Please wait for our next instruction email.
      We will send you another email with detailed instructions and further guidance very soon.
    </div>

    <p style="margin:0 0 16px 0;">
      In the meantime, follow our social channels to stay updated on upcoming events.
    </p>

    <p style="margin:24px 0 0 0;">
      Warm regards,<br />
      <strong style="color:#ffffff;">BUAC Executive Team</strong>
    </p>
  `;

  return {
    subject: "Registration Received — BUAC Club Fair",
    html: buildEmailHtml({ title: "Club Fair Registration", bodyHtml }),
    text: `Thank you for registering, ${name}!

We have received your BUAC Club Fair registration.

Next Steps: Please wait for our next instruction email. We will send you another email with detailed instructions and further guidance very soon.

Warm regards,
BUAC Executive Team`,
  };
}