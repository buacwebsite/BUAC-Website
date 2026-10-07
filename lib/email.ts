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

export interface EmailSendResult {
  success: boolean;
  method?: "gmail-app-password";
  messageId?: string;
  error?: string;
  attempts?: number;
}

interface EmailError extends Error {
  code?: string;
  responseCode?: number;
  command?: string;
  response?: string;
}

function getEmailConfig() {
  return {
    service:
      process.env.EMAIL_SERVICE?.trim() || "gmail",

    user:
      process.env.EMAIL_USER?.trim().toLowerCase() || "",

    password: (
      process.env.GMAIL_APP_PASSWORD ||
      process.env.EMAIL_PASS ||
      ""
    ).replace(/\s+/g, ""),
  };
}

function createTransporter() {
  const config = getEmailConfig();

  /*
   * Explicit Gmail SMTP settings are used instead of relying
   * only on the service shortcut.
   */
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
      user: config.user,
      pass: config.password,
    },

    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 25000,

    tls: {
      minVersion: "TLSv1.2",
      servername: "smtp.gmail.com",
    },
  });
}

function getEmailErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Email delivery failed.";
}

function isAuthenticationError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const mailError = error as EmailError;

  return (
    mailError.code === "EAUTH" ||
    mailError.responseCode === 535 ||
    mailError.responseCode === 534
  );
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export async function sendMail(
  payload: MailPayload,
): Promise<EmailSendResult> {
  const config = getEmailConfig();

  if (!config.user) {
    console.error("[EMAIL] EMAIL_USER is missing.");

    return {
      success: false,
      error: "EMAIL_USER is missing.",
      attempts: 0,
    };
  }

  if (!config.password) {
    console.error(
      "[EMAIL] GMAIL_APP_PASSWORD or EMAIL_PASS is missing.",
    );

    return {
      success: false,
      error:
        "GMAIL_APP_PASSWORD or EMAIL_PASS is missing.",
      attempts: 0,
    };
  }

  const recipient = payload.to?.trim().toLowerCase();

  if (!recipient) {
    console.error("[EMAIL] Recipient email is missing.");

    return {
      success: false,
      error: "Recipient email is missing.",
      attempts: 0,
    };
  }

  const mailOptions = {
    from: `"BRAC University Adventure Club" <${config.user}>`,
    to: recipient,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,

    replyTo:
      payload.replyTo?.trim().toLowerCase() ||
      config.user,
  };

  /*
   * Retry delays:
   * - First attempt: immediately
   * - Second attempt: after 1.5 seconds
   * - Third attempt: after 4 seconds
   */
  const retryDelays = [0, 1500, 4000];

  let lastError = "Email delivery failed.";

  for (
    let attemptIndex = 0;
    attemptIndex < retryDelays.length;
    attemptIndex += 1
  ) {
    const delay = retryDelays[attemptIndex];

    if (delay > 0) {
      await wait(delay);
    }

    const transporter = createTransporter();

    try {
      const result =
        await transporter.sendMail(mailOptions);

      console.log(
        `[EMAIL] Sent successfully to ${recipient}. ` +
          `Message ID: ${result.messageId}. ` +
          `Attempt: ${attemptIndex + 1}`,
      );

      transporter.close();

      return {
        success: true,
        method: "gmail-app-password",
        messageId: result.messageId,
        attempts: attemptIndex + 1,
      };
    } catch (error) {
      lastError = getEmailErrorMessage(error);

      console.error(
        `[EMAIL] Attempt ${attemptIndex + 1} failed for ${recipient}:`,
        error,
      );

      transporter.close();

      /*
       * Retrying cannot fix invalid credentials.
       */
      if (isAuthenticationError(error)) {
        break;
      }
    }
  }

  return {
    success: false,
    error: lastError,
    attempts: retryDelays.length,
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
      margin:0;
      padding:0;
      background:#08090d;
      color:#f3f4f8;
      font-family:Arial,Helvetica,sans-serif;
    "
  >
    <div
      style="
        width:100%;
        padding:24px 0;
        background:#08090d;
      "
    >
      <div
        style="
          width:calc(100% - 32px);
          max-width:600px;
          margin:0 auto;
        "
      >
        <div
          style="
            overflow:hidden;
            border:1px solid rgba(255,255,255,.12);
            border-radius:18px;
            background:#11131a;
          "
        >
          <div
            style="
              padding:30px 24px;
              text-align:center;
              background:linear-gradient(
                135deg,
                #ff622b 0%,
                #ff8a5b 100%
              );
            "
          >
            <h1
              style="
                margin:0;
                color:#ffffff;
                font-size:28px;
                font-weight:700;
                letter-spacing:2px;
              "
            >
              BUAC
            </h1>

            <p
              style="
                margin:8px 0 0;
                color:#ffffff;
                font-size:12px;
                font-weight:600;
                letter-spacing:1.5px;
                text-transform:uppercase;
              "
            >
              BRAC University Adventure Club
            </p>
          </div>

          <div
            style="
              padding:30px 24px;
              color:#dedfe8;
              font-size:15px;
              line-height:1.8;
            "
          >
            ${bodyHtml}
          </div>
        </div>

        <div
          style="
            padding:18px 12px 0;
            color:#969baa;
            font-size:11px;
            line-height:1.6;
            text-align:center;
          "
        >
          BRAC University Adventure Club<br />
          Kha 224 Pragati Sarani,
          Merul Badda, Dhaka 1212, Bangladesh
        </div>
      </div>
    </div>
  </body>
</html>
  `;
}

export function buildClubFairThankYouEmail(
  name: string,
): EmailTemplate {
  const displayName =
    String(name || "").trim() || "Student";

  const safeName = escapeHtml(displayName);

  const bodyHtml = `
    <p style="margin:0 0 18px;">
      Dear ${safeName},
    </p>

    <p style="margin:0 0 18px;">
      We are pleased to inform you that we have successfully
      received your registration for the
      <strong style="color:#ffffff;">
        BRAC University Adventure Club (BUAC)
      </strong>.
    </p>

    <div
      style="
        margin:20px 0;
        padding:16px;
        border-left:4px solid #ff622b;
        border-radius:8px;
        background:rgba(255,98,43,.12);
      "
    >
      <p
        style="
          margin:0;
          color:#ffffff;
          font-weight:700;
        "
      >
        Your Club Fair application has been submitted successfully.
      </p>
    </div>

    <p style="margin:0 0 18px;">
      Please wait for our next instruction email. We will
      provide the next steps, important information, and
      further guidance regarding your registration.
    </p>

    <p style="margin:0 0 18px;">
      Interview time and room details will be emailed to
      you soon.
    </p>

    <p style="margin:0 0 18px;">
      Until then, please keep an eye on your inbox,
      Spam folder, and Promotions folder for updates from BUAC.
    </p>

    <p style="margin:28px 0 0;">
      Warm regards,<br />

      <strong style="color:#ffffff;">
        BUAC Executive Team
      </strong>
    </p>
  `;

  return {
    subject:
      "BUAC Club Fair Registration Received",

    html: buildEmailHtml({
      title: `Thank You, ${displayName}!`,
      bodyHtml,
    }),

    text: `Dear ${displayName},

We are pleased to inform you that we have successfully received your registration for the BRAC University Adventure Club (BUAC).

Your Club Fair application has been submitted successfully.

Please wait for our next instruction email. We will provide the next steps, important information, and further guidance regarding your registration.

Interview time and room details will be emailed to you soon.

Until then, please keep an eye on your inbox, Spam folder, and Promotions folder for updates from BUAC.

Warm regards,
BUAC Executive Team`,
  };
}