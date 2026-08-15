import nodemailer from "nodemailer";

interface MailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailLayoutOptions {
  title: string;
  bodyHtml: string;
}

interface SendMailResult {
  success: boolean;
  method?: "gmail-app-password" | "gmail-oauth2";
  messageId?: string;
  error?: string;
}

function getEmailConfig() {
  return {
    service:
      process.env.EMAIL_SERVICE?.trim() ||
      "gmail",

    user:
      process.env.EMAIL_USER?.trim() ||
      "",

    /*
     * Gmail App Passwords are often displayed
     * with spaces. Remove all whitespace before use.
     */
    appPassword: (
      process.env.EMAIL_PASS ||
      process.env.GMAIL_APP_PASSWORD ||
      ""
    ).replace(/\s+/g, ""),

    /*
     * Optional OAuth2 fallback.
     */
    clientId:
      process.env.GMAIL_CLIENT_ID?.trim() ||
      "",

    clientSecret:
      process.env.GMAIL_CLIENT_SECRET?.trim() ||
      "",

    refreshToken:
      process.env.GMAIL_REFRESH_TOKEN?.trim() ||
      "",

    accessToken:
      process.env.GMAIL_ACCESS_TOKEN?.trim() ||
      "",
  };
}

function createAppPasswordTransporter() {
  const config = getEmailConfig();

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: config.user,
      pass: config.appPassword,
    },
  });
}

function createOAuthTransporter() {
  const config = getEmailConfig();

  return nodemailer.createTransport({
    service: config.service,
    auth: {
      type: "OAuth2",
      user: config.user,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      refreshToken: config.refreshToken,
      accessToken:
        config.accessToken || undefined,
    },
  });
}

export async function sendMail(
  payload: MailPayload,
): Promise<SendMailResult> {
  const config = getEmailConfig();

  if (!config.user) {
    console.error(
      "[EMAIL] EMAIL_USER is missing.",
    );

    return {
      success: false,
      error: "EMAIL_USER is missing.",
    };
  }

  const recipient = payload.to
    ?.trim()
    .toLowerCase();

  if (!recipient) {
    console.error(
      "[EMAIL] Recipient email is missing.",
    );

    return {
      success: false,
      error: "Recipient email is missing.",
    };
  }

  const mailOptions = {
    from: `"BRAC University Adventure Club" <${config.user}>`,
    to: recipient,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo:
      payload.replyTo?.trim() ||
      config.user,
  };

  /*
   * Prefer Gmail App Password because it is
   * generally more reliable on Vercel.
   */
  if (config.appPassword) {
    try {
      const transporter =
        createAppPasswordTransporter();

      await transporter.verify();

      const result =
        await transporter.sendMail(
          mailOptions,
        );

      console.log(
        `[EMAIL] Email sent to ${recipient} with Gmail App Password. Message ID: ${result.messageId}`,
      );

      return {
        success: true,
        method: "gmail-app-password",
        messageId: result.messageId,
      };
    } catch (error) {
      console.error(
        "[EMAIL] Gmail App Password failed:",
        error,
      );

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gmail App Password failed.",
      };
    }
  }

  const hasOAuthConfiguration =
    Boolean(config.clientId) &&
    Boolean(config.clientSecret) &&
    Boolean(config.refreshToken);

  if (hasOAuthConfiguration) {
    try {
      const transporter =
        createOAuthTransporter();

      const result =
        await transporter.sendMail(
          mailOptions,
        );

      console.log(
        `[EMAIL] Email sent to ${recipient} with Gmail OAuth2. Message ID: ${result.messageId}`,
      );

      return {
        success: true,
        method: "gmail-oauth2",
        messageId: result.messageId,
      };
    } catch (error) {
      console.error(
        "[EMAIL] Gmail OAuth2 failed:",
        error,
      );

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gmail OAuth2 failed.",
      };
    }
  }

  console.error(
    "[EMAIL] No email transport is configured.",
  );

  return {
    success: false,
    error:
      "No email transport configured. Set EMAIL_USER and EMAIL_PASS.",
  };
}

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function buildEmailHtml({
  title,
  bodyHtml,
}: EmailLayoutOptions) {
  const safeTitle = escapeHtml(title);

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>${safeTitle}</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #08090d;
      color: #f3f4f8;
      font-family: Arial, Helvetica, sans-serif;
    "
  >
    <div
      style="
        width: 100%;
        background-color: #08090d;
        padding: 24px 0;
      "
    >
      <div
        style="
          width: calc(100% - 32px);
          max-width: 600px;
          margin: 0 auto;
        "
      >
        <div
          style="
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 18px;
            background-color: #11131a;
          "
        >
          <div
            style="
              padding: 30px 24px;
              text-align: center;
              background: linear-gradient(
                135deg,
                #ff622b 0%,
                #ff8a5b 100%
              );
            "
          >
            <h1
              style="
                margin: 0;
                color: #ffffff;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: 2px;
              "
            >
              BUAC
            </h1>

            <p
              style="
                margin: 8px 0 0;
                color: #ffffff;
                font-size: 12px;
                font-weight: 600;
                letter-spacing: 1.5px;
                text-transform: uppercase;
              "
            >
              BRAC University Adventure Club
            </p>
          </div>

          <div
            style="
              padding: 30px 24px;
              color: #dedfe8;
              font-size: 15px;
              line-height: 1.8;
            "
          >
            ${bodyHtml}
          </div>
        </div>

        <div
          style="
            padding: 18px 12px 0;
            color: #969baa;
            font-size: 11px;
            line-height: 1.6;
            text-align: center;
          "
        >
          BRAC University Adventure Club
          <br />

          Kha 224 Pragati Sarani,
          Merul Badda, Dhaka 1212,
          Bangladesh
        </div>
      </div>
    </div>
  </body>
</html>
  `;
}

/*
 * Member and alumni welcome email functions
 * have been removed.
 *
 * Only the Club Fair confirmation email remains.
 */
export function buildClubFairThankYouEmail(
  name: string,
): EmailTemplate {
  const safeName = escapeHtml(
    name || "Student",
  );

  const bodyHtml = `
    <p style="margin:0 0 18px;">
      Dear Student,
    </p>

    <p style="margin:0 0 18px;">
      We are pleased to inform you that
      we have successfully received your
      registration for the BRAC University
      Adventure Club (BUAC).
    </p>

    <p style="margin:0 0 18px;">
      Please wait for our next instruction
      email, where we will provide you with
      the next steps, important information
      and further guidance regarding your
      registration. For the interview, time
      and room details will be emailed to
      you soon!
    </p>

    <p style="margin:0 0 18px;">
      Until then, please keep an eye on your
      email for updates from BUAC.
    </p>

    <p style="margin:28px 0 0;">
      Warm regards,
      <br />

      <strong style="color:#ffffff;">
        BUAC Executive Team
      </strong>
    </p>
  `;

  return {
    subject:
      "BUAC Club Fair Registration Received",

    html: buildEmailHtml({
      title: `Thank You, ${safeName}!`,
      bodyHtml,
    }),

    text: `Dear Student,

We are pleased to inform you that we have successfully received your registration for the BRAC University Adventure Club (BUAC).

Please wait for our next instruction email, where we will provide you with the next steps, important information and further guidance regarding your registration. For the interview, time and room details will be emailed to you soon!

Until then, please keep an eye on your email for updates from BUAC.

Warm regards,
BUAC Executive Team`,
  };
}