import nodemailer from "nodemailer";

interface MailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
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
    return {
      success: false,
      error: "EMAIL_USER is missing",
    };
  }

  if (!payload.to) {
    console.error("[EMAIL] Recipient email is missing.");
    return {
      success: false,
      error: "Recipient email is missing",
    };
  }

  const mailOptions = {
    from: `"BRAC University Adventure Club" <${config.emailUser}>`,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo || config.emailUser,
  };

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
          error instanceof Error
            ? error.message
            : "Gmail App Password failed",
      };
    }
  }

  const hasOAuth =
    Boolean(config.clientId) &&
    Boolean(config.clientSecret) &&
    Boolean(config.refreshToken);

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
          error instanceof Error
            ? error.message
            : "Gmail OAuth failed",
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
        <div style="padding:28px 24px;line-height:1.75;color:#dedfe8;font-size:15px;">
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
  const safeName = escapeHtml(name || "Adventurer");

  return {
    subject: "Welcome to BRAC University Adventure Club",
    html: buildEmailLayout(
      "Welcome to BUAC",
      `
        <p>Dear Adventurers,</p>
        <p>
          Welcome to <strong>BRAC University Adventure Club (BUAC)</strong>,
          a place where adventure never disappoints!
        </p>
        <p>
          We are delighted to welcome you, ${safeName}, to our community of
          passionate and adventurous individuals. Your BUAC journey is already
          filled with exciting experiences, friendships and opportunities to grow,
          and hopefully it will remain the same or even grow more!
        </p>
        <p>
          We look forward to having you with us on this exciting journey!
        </p>
        <p>
          Warm regards,<br />
          <strong>BUAC Executive Team</strong>
        </p>
      `,
    ),
    text: `Dear Adventurers,

Welcome to BRAC University Adventure Club (BUAC), a place where adventure never disappoints!

We are delighted to welcome you, ${name || "Adventurer"}, to our community of passionate and adventurous individuals. Your BUAC journey is already filled with exciting experiences, friendships and opportunities to grow, and hopefully it will remain the same or even grow more!

We look forward to having you with us on this exciting journey!

Warm regards,
BUAC Executive Team`,
  };
}

export function buildAlumniWelcomeEmail(name: string) {
  const safeName = escapeHtml(name || "Adventurer");

  return {
    subject: "Welcome Back to the BUAC Alumni Network",
    html: buildEmailLayout(
      "Once a BUAC-ian, Always a BUAC-ian",
      `
        <p>Dear Adventurers,</p>
        <p>
          Once a BUAC-ian, always a BUAC-ian.
        </p>
        <p>
          Although your active journey with the club may have come to an end,
          your connection with the BUAC family will always remain. We are grateful
          for the memories, contributions, laughter and experiences you shared
          with us during your time in the club.
        </p>
        <p>
          Through this website, you will get to revisit the beautiful moments we
          created together through pictures and memories from our previous events,
          along with glimpses of the exciting adventures and events yet to come.
          We hope these moments bring back the feelings, friendships and memories
          that made your time with BUAC so special.
        </p>
        <p>
          No matter where life takes you, a part of the BUAC journey will always
          belong to you, and you will always be a part of ours.
        </p>
        <p>
          Warm regards,<br />
          <strong>BUAC Executive Team</strong>
        </p>
      `,
    ),
    text: `Dear Adventurers,

Once a BUAC-ian, always a BUAC-ian.

Although your active journey with the club may have come to an end, your connection with the BUAC family will always remain. We are grateful for the memories, contributions, laughter and experiences you shared with us during your time in the club.

Through this website, you will get to revisit the beautiful moments we created together through pictures and memories from our previous events, along with glimpses of the exciting adventures and events yet to come. We hope these moments bring back the feelings, friendships and memories that made your time with BUAC so special.

No matter where life takes you, a part of the BUAC journey will always belong to you, and you will always be a part of ours.

Warm regards,
BUAC Executive Team`,
  };
}

export function buildClubFairThankYouEmail(name: string) {
  const safeName = escapeHtml(name || "Student");

  return {
    subject: "BUAC Club Fair Registration Received",
    html: buildEmailLayout(
      "Registration Received",
      `
        <p>Dear Student,</p>
        <p>
          We are pleased to inform you that we have successfully received your
          registration for the <strong>BRAC University Adventure Club (BUAC)</strong>.
        </p>
        <p>
          Please wait for our next instruction email, where we will provide you
          with the next steps, important information and further guidance regarding
          your registration. For the interview, time and room details will be
          emailed to you soon!
        </p>
        <p>
          Until then, please keep an eye on your email for updates from BUAC.
        </p>
        <p>
          Warm regards,<br />
          <strong>BUAC Executive Team</strong>
        </p>
      `,
    ),
    text: `Dear Student,

We are pleased to inform you that we have successfully received your registration for the BRAC University Adventure Club (BUAC).

Please wait for our next instruction email, where we will provide you with the next steps, important information and further guidance regarding your registration. For the interview, time and room details will be emailed to you soon!

Until then, please keep an eye on your email for updates from BUAC.

Warm regards,
BUAC Executive Team`,
  };
}

export function buildPasswordResetEmail(
  name: string,
  resetUrl: string,
) {
  const safeName = escapeHtml(name || "Adventurer");
  const safeUrl = escapeHtml(resetUrl);

  return {
    subject: "Reset Your BUAC Password",
    html: buildEmailLayout(
      "Reset Your Password",
      `
        <p>Hello ${safeName},</p>
        <p>We received a request to reset the password for your BUAC account.</p>
        <p style="padding:14px 16px;border-left:4px solid #ff622b;border-radius:8px;background:rgba(255,98,43,.12);">
          This reset link is valid for <strong>1 hour</strong>. If you did not request this, you can ignore this email.
        </p>
        <p style="margin:24px 0;">
          <a href="${safeUrl}" style="display:inline-block;background:#ff622b;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;">
            Reset Password
          </a>
        </p>
        <p style="word-break:break-all;font-size:12px;color:#b8bcc8;">
          If the button does not work, copy and paste this link:<br />
          ${safeUrl}
        </p>
        <p>Warm regards,<br /><strong>BUAC Executive Team</strong></p>
      `,
    ),
    text: `Hello ${name || "Adventurer"},

We received a request to reset the password for your BUAC account.

This reset link is valid for 1 hour. If you did not request this, you can ignore this email.

Reset your password:
${resetUrl}

Warm regards,
BUAC Executive Team`,
  };
}