import nodemailer from "nodemailer";

interface MailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

function getConfig() {
  return {
    emailUser: process.env.EMAIL_USER || "",
    emailPass:
      process.env.EMAIL_PASS ||
      process.env.GMAIL_APP_PASSWORD ||
      "",
    emailService: process.env.EMAIL_SERVICE || "gmail",
    clientId: process.env.GMAIL_CLIENT_ID || "",
    clientSecret: process.env.GMAIL_CLIENT_SECRET || "",
    refreshToken: process.env.GMAIL_REFRESH_TOKEN || "",
    accessToken: process.env.GMAIL_ACCESS_TOKEN || "",
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getAppPasswordTransporter() {
  const config = getConfig();

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
  });
}

function getOAuthTransporter() {
  const config = getConfig();

  return nodemailer.createTransport({
    service: config.emailService,
    auth: {
      type: "OAuth2",
      user: config.emailUser,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      refreshToken: config.refreshToken,
      accessToken: config.accessToken || undefined,
    },
  });
}

export async function sendMail(payload: MailPayload) {
  const config = getConfig();

  if (!config.emailUser) {
    console.error("[EMAIL] EMAIL_USER is missing.");
    return { success: false, error: "EMAIL_USER is missing" };
  }

  if (!payload.to) {
    console.error("[EMAIL] Recipient email is missing.");
    return { success: false, error: "Recipient email is missing" };
  }

  const mailOptions = {
    from: `"BRAC University Adventure Club" <${config.emailUser}>`,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: config.emailUser,
  };

  /**
   * Gmail App Password is preferred.
   * It avoids the OAuth unauthorized_client issue.
   */
  if (config.emailPass) {
    try {
      const transporter = getAppPasswordTransporter();
      await transporter.verify();

      const result = await transporter.sendMail(mailOptions);

      console.log(
        `[EMAIL] App Password email sent to ${payload.to}. Message ID: ${result.messageId}`,
      );

      return {
        success: true,
        method: "gmail-app-password",
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("[EMAIL] Gmail App Password failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gmail App Password failed",
      };
    }
  }

  const hasOAuth =
    config.clientId &&
    config.clientSecret &&
    config.refreshToken;

  if (hasOAuth) {
    try {
      const transporter = getOAuthTransporter();
      const result = await transporter.sendMail(mailOptions);

      console.log(
        `[EMAIL] OAuth email sent to ${payload.to}. Message ID: ${result.messageId}`,
      );

      return {
        success: true,
        method: "gmail-oauth",
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("[EMAIL] Gmail OAuth failed:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Gmail OAuth failed",
      };
    }
  }

  return {
    success: false,
    error:
      "No email configuration found. Add EMAIL_PASS or valid Gmail OAuth credentials.",
  };
}

function buildEmailLayout(title: string, body: string) {
  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#08090d;font-family:Arial,Helvetica,sans-serif;color:#f3f4f8;">
    <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
      <div style="overflow:hidden;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:#11131a;">
        <div style="padding:30px 24px;text-align:center;background:linear-gradient(135deg,#ff622b,#ff8a5b);">
          <h1 style="margin:0;color:#fff;font-size:27px;letter-spacing:2px;">BUAC</h1>
          <p style="margin:8px 0 0;color:#fff;font-size:12px;letter-spacing:1.5px;">
            BRAC UNIVERSITY ADVENTURE CLUB
          </p>
        </div>
        <div style="padding:28px 24px;line-height:1.7;color:#dedfe8;font-size:15px;">
          <h2 style="margin-top:0;color:#fff;font-size:21px;">${title}</h2>
          ${body}
        </div>
      </div>
      <p style="margin:18px 0 0;text-align:center;color:#969baa;font-size:11px;">
        BRAC University Adventure Club<br />
        Kha 224 Pragati Sarani, Merul Badda, Dhaka 1212, Bangladesh
      </p>
    </div>
  </body>
</html>
  `;
}

export function buildMemberWelcomeEmail(name: string) {
  const safeName = escapeHtml(name);

  return {
    subject: "Welcome to BRAC University Adventure Club",
    html: buildEmailLayout(
      `Welcome to BUAC, ${safeName}!`,
      `
        <p>Congratulations on becoming a member of <strong>BRAC University Adventure Club</strong>.</p>
        <p style="padding:14px 16px;border-left:4px solid #ff622b;border-radius:8px;background:rgba(255,98,43,.12);">
          Your adventure begins here. Get ready for workshops, tours, training, and lifelong memories.
        </p>
        <p>Keep an eye on your email and BUAC social media channels for upcoming announcements.</p>
        <p>Warm regards,<br /><strong>BUAC Executive Team</strong></p>
      `,
    ),
    text: `Welcome to BUAC, ${name}!

Congratulations on becoming a member of BRAC University Adventure Club.

Your adventure begins here. Keep an eye on your email and BUAC social media channels for announcements.

Warm regards,
BUAC Executive Team`,
  };
}

export function buildAlumniWelcomeEmail(name: string) {
  const safeName = escapeHtml(name);

  return {
    subject: "Welcome Back to the BUAC Alumni Network",
    html: buildEmailLayout(
      `Welcome Back, ${safeName}!`,
      `
        <p>We are delighted to welcome you back to the <strong>BUAC Alumni Network</strong>.</p>
        <p style="padding:14px 16px;border-left:4px solid #ff622b;border-radius:8px;background:rgba(255,98,43,.12);">
          Once a BUAC-ian, always a BUAC-ian. Your experience and legacy continue to inspire new adventurers.
        </p>
        <p>You will receive updates about alumni gatherings, mentorship opportunities, and special events.</p>
        <p>Warm regards,<br /><strong>BUAC Executive Team</strong></p>
      `,
    ),
    text: `Welcome back to BUAC, ${name}!

Once a BUAC-ian, always a BUAC-ian.

You will receive future updates about alumni gatherings and BUAC events.

Warm regards,
BUAC Executive Team`,
  };
}

export function buildClubFairThankYouEmail(name: string) {
  const safeName = escapeHtml(name);

  return {
    subject: "BUAC Club Fair Registration Received",
    html: buildEmailLayout(
      `Thank You, ${safeName}!`,
      `
        <p>We have successfully received your BUAC Club Fair registration.</p>
        <p style="padding:14px 16px;border-left:4px solid #ff622b;border-radius:8px;background:rgba(255,98,43,.12);">
          Please wait for our next instruction email. We will send you another email with the next steps and further guidance.
        </p>
        <p>Thank you for showing interest in BRAC University Adventure Club.</p>
        <p>Warm regards,<br /><strong>BUAC Executive Team</strong></p>
      `,
    ),
    text: `Thank you for registering, ${name}!

We received your BUAC Club Fair registration.

Please wait for our next instruction email. We will send you another email with next steps and further guidance.

Warm regards,
BUAC Executive Team`,
  };
}