import nodemailer from "nodemailer";
import { env } from "@/env";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: env.EMAIL_SERVICE,
    auth: {
      type: "OAuth2",
      user: env.EMAIL_USER,
      clientId: env.GMAIL_CLIENT_ID,
      clientSecret: env.GMAIL_CLIENT_SECRET,
      refreshToken: env.GMAIL_REFRESH_TOKEN,
      accessToken: env.GMAIL_ACCESS_TOKEN || undefined,
    },
  });

  return transporter;
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export async function sendMail(payload: EmailPayload) {
  const emailSender = getTransporter();

  try {
    await emailSender.sendMail({
      from: `"BRAC University Adventure Club" <${env.EMAIL_USER}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.replyTo || env.EMAIL_USER,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
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
    <title>${title}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

      * { box-sizing: border-box; }

      body {
        margin: 0;
        padding: 0;
        background: #0a0a0f;
        font-family: 'Poppins', -apple-system, BlinkMacSystemFont,
          'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #e8e8f0;
      }

      .wrapper {
        max-width: 600px;
        margin: 0 auto;
        padding: 24px;
      }

      .card {
        background: #141420;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        overflow: hidden;
      }

      .banner {
        background: linear-gradient(135deg, #ff622b 0%, #ff8a5b 100%);
        color: #ffffff;
        padding: 32px 28px;
        text-align: center;
      }

      .banner h1 {
        margin: 0;
        font-family: 'Poppins', sans-serif;
        font-weight: 700;
        letter-spacing: 0.5px;
        font-size: 24px;
      }

      .banner p {
        margin: 8px 0 0 0;
        font-size: 13px;
        opacity: 0.9;
        letter-spacing: 2px;
        text-transform: uppercase;
      }

      .content {
        padding: 28px;
        line-height: 1.7;
        color: #dedfe8;
        font-size: 15px;
      }

      .content h2 {
        font-size: 20px;
        color: #ffffff;
        margin-top: 0;
      }

      .content p {
        margin: 0 0 16px 0;
      }

      .highlight {
        background: rgba(255, 98, 43, 0.1);
        border-left: 3px solid #ff622b;
        padding: 14px 18px;
        border-radius: 8px;
        margin: 18px 0;
      }

      .footer {
        text-align: center;
        padding: 20px;
        color: #969baa;
        font-size: 12px;
      }

      a {
        color: #ff8a5b;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <div class="banner">
          <h1>BUAC</h1>
          <p>BRAC University Adventure Club</p>
        </div>

        <div class="content">
          ${bodyHtml}
        </div>
      </div>

      <div class="footer">
        <p>
          BRAC University Adventure Club<br />
          Kha 224 Pragati Sarani, Merul Badda, Dhaka 1212, Bangladesh
        </p>
        <p>© ${new Date().getFullYear()} BUAC. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
  `;
}

export function buildMemberWelcomeEmail(name: string) {
  const bodyHtml = `
    <h2>Welcome to BUAC, ${name}! 🏔️</h2>

    <p>
      Congratulations on becoming a member of the <strong>BRAC University Adventure Club</strong>.
      You are now part of a community driven by exploration, courage, and unforgettable outdoor stories.
    </p>

    <div class="highlight">
      Your adventure begins here. Get ready for thrilling expeditions, skill-building workshops,
      and lifelong memories with fellow adventurers.
    </div>

    <p>
      Keep an eye on your inbox and our official social media channels for upcoming events,
      trainings, and tours. If you have any questions, feel free to reply to this email.
    </p>

    <p>See you on the trail!</p>

    <p style="margin-top: 22px;">
      Warm regards,<br />
      <strong>BUAC Team</strong>
    </p>
  `;

  return {
    subject: "Welcome to BRAC University Adventure Club 🎉",
    html: buildEmailHtml({
      title: "Welcome to BUAC",
      bodyHtml,
    }),
    text: `Welcome to BUAC, ${name}!

You are now part of the BRAC University Adventure Club community — a place for exploration, courage, and unforgettable outdoor stories.

Get ready for thrilling expeditions, skill-building workshops, and lifelong memories with fellow adventurers. Keep an eye on your inbox and our social media channels for upcoming events and tours.

Warm regards,
BUAC Team`,
  };
}

export function buildAlumniWelcomeEmail(name: string) {
  const bodyHtml = `
    <h2>Welcome Back, ${name}! 🌟</h2>

    <p>
      We're so glad to reconnect with you as an alumnus of the
      <strong>BRAC University Adventure Club</strong>.
    </p>

    <div class="highlight">
      Once a BUAC-ian, always a BUAC-ian. Your journey with us continues,
      and your experience remains a vital part of our story.
    </div>

    <p>
      You'll now stay updated on alumni gatherings, reunions, mentorship opportunities,
      and other special events curated just for our extended family.
    </p>

    <p>
      Thank you for coming back home to BUAC. If there's anything you'd like to share,
      contribute, or organize with the club, we'd love to hear from you.
    </p>

    <p style="margin-top: 22px;">
      Warm regards,<br />
      <strong>BUAC Team</strong>
    </p>
  `;

  return {
    subject: "Welcome Back to BUAC — Alumni Reconnected 💫",
    html: buildEmailHtml({
      title: "Welcome Back to BUAC",
      bodyHtml,
    }),
    text: `Welcome back, ${name}!

We're so glad to reconnect with you as an alumnus of the BRAC University Adventure Club. Once a BUAC-ian, always a BUAC-ian.

You'll now stay updated on alumni gatherings, reunions, mentorship opportunities, and other special events curated just for our extended family.

Warm regards,
BUAC Team`,
  };
}

export function buildClubFairThankYouEmail(name: string) {
  const bodyHtml = `
    <h2>Thank You for Registering, ${name}! 🙌</h2>

    <p>
      Thank you for submitting your registration for the
      <strong>BUAC Club Fair</strong>. We've received your application successfully.
    </p>

    <div class="highlight">
      Please wait for our next instruction email. We will send you another mail
      with the next steps, event details, and further guidance very soon.
    </div>

    <p>
      In the meantime, feel free to follow our official social media channels
      to stay updated about upcoming events and our adventures.
    </p>

    <p>
      Once again, thank you for showing interest in becoming a part of the
      <strong>BRAC University Adventure Club</strong>. We can't wait to meet you.
    </p>

    <p style="margin-top: 22px;">
      Warm regards,<br />
      <strong>BUAC Team</strong>
    </p>
  `;

  return {
    subject: "Thank You for Registering — BUAC Club Fair 🎪",
    html: buildEmailHtml({
      title: "Thank You for Registering",
      bodyHtml,
    }),
    text: `Thank you for registering, ${name}!

We've received your BUAC Club Fair registration successfully.

Please wait for our next instruction email. We will send you another mail with the next steps, event details, and further guidance very soon.

In the meantime, feel free to follow our official social media channels for updates.

Warm regards,
BUAC Team`,
  };
}