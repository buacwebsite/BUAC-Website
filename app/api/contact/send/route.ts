import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations/contact";
import {
  buildEmailHtml,
  sendMail,
} from "@/lib/email";
import { env } from "@/env";

export const dynamic = "force-dynamic";

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult =
      contactSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details:
            validationResult.error.flatten()
              .fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      name,
      email,
      subject,
      message,
    } = validationResult.data;

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const adminEmail =
      env.ADMIN_EMAIL || env.EMAIL_USER;

    if (!adminEmail) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Admin email is not configured.",
        },
        { status: 500 },
      );
    }

    const adminHtml = buildEmailHtml({
      title: "New Contact Form Submission",
      bodyHtml: `
        <h2 style="margin:0 0 18px;color:#ffffff;">
          New Contact Form Submission
        </h2>

        <p>
          A new message was submitted through
          the BUAC website.
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
          <p>
            <strong>Name:</strong>
            ${safeName}
          </p>

          <p>
            <strong>Email:</strong>
            ${safeEmail}
          </p>

          <p>
            <strong>Subject:</strong>
            ${safeSubject}
          </p>
        </div>

        <p>
          <strong>Message:</strong>
        </p>

        <div
          style="
            white-space:pre-wrap;
            padding:16px;
            border-radius:8px;
            background:rgba(255,255,255,.06);
          "
        >
          ${safeMessage}
        </div>
      `,
    });

    const userHtml = buildEmailHtml({
      title: "Thank You for Contacting BUAC",
      bodyHtml: `
        <h2 style="margin:0 0 18px;color:#ffffff;">
          Thank You, ${safeName}!
        </h2>

        <p>
          Thank you for contacting the
          <strong>BRAC University Adventure Club</strong>.
          We have received your message successfully.
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
          <p>
            <strong>Your message:</strong>
          </p>

          <p style="white-space:pre-wrap;">
            ${safeMessage}
          </p>
        </div>

        <p>
          We will get back to you as soon as possible.
        </p>

        <p style="margin-top:24px;">
          Warm regards,<br />
          <strong>BUAC Executive Team</strong>
        </p>
      `,
    });

    const adminMailResult = await sendMail({
      to: adminEmail,
      subject: `Contact Form: ${subject}`,
      html: adminHtml,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `,
      replyTo: email,
    });

    if (!adminMailResult.success) {
      console.error(
        "Admin contact email failed:",
        adminMailResult.error,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to send the message to BUAC.",
        },
        { status: 500 },
      );
    }

    const userMailResult = await sendMail({
      to: email,
      subject: "Thank you for contacting BUAC",
      html: userHtml,
      text: `
Hi ${name},

Thank you for contacting the BRAC University Adventure Club.

We have received your message successfully.

Your message:

${message}

We will get back to you as soon as possible.

Warm regards,
BUAC Executive Team
      `,
    });

    if (!userMailResult.success) {
      console.error(
        "User contact confirmation email failed:",
        userMailResult.error,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Your message was received, but the confirmation email could not be sent.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Email sent successfully! We'll get back to you soon.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Contact email error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to send email. Please try again later.",
      },
      { status: 500 },
    );
  }
}