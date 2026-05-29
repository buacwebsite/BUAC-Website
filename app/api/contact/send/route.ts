import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { env } from "../../../../env";
import { contactSchema } from "@/lib/validations/contact";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = contactSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validationResult.data;

    const emailUser = env.EMAIL_USER;
    const emailService = env.EMAIL_SERVICE;
    const adminEmail = env.ADMIN_EMAIL || emailUser;
    const transporter = nodemailer.createTransport({
      service: emailService,
      auth: {
        type: "OAuth2",
        user: emailUser,
        clientId: env.GMAIL_CLIENT_ID,
        clientSecret: env.GMAIL_CLIENT_SECRET,
        refreshToken: env.GMAIL_REFRESH_TOKEN,
        accessToken: env.GMAIL_ACCESS_TOKEN || undefined,
      },
    });

    const adminMailOptions = {
      from: `"${name}" <${emailUser}>`,
      to: adminEmail,
      subject: `Contact Form: ${subject}`,
      replyTo: email,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
              * { font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
              body { font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #ff622b 0%, #ff8a5b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { font-family: 'Poppins', sans-serif; margin: 0; font-weight: 600; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .field { margin-bottom: 20px; }
              .label { font-weight: 600; color: #ff622b; margin-bottom: 5px; }
              .value { background: white; padding: 15px; border-radius: 5px; border-left: 3px solid #ff622b; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Contact Form Submission</h1>
                <p>BUAC Website</p>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">From:</div>
                  <div class="value">${name}</div>
                </div>
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value">${email}</div>
                </div>
                <div class="field">
                  <div class="label">Subject:</div>
                  <div class="value">${subject}</div>
                </div>
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="value">${message}</div>
                </div>
              </div>
              <div class="footer">
                <p>This email was sent from the BUAC website contact form.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
New Contact Form Submission

From: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
      `,
    };

    const userMailOptions = {
      from: `"BUAC - BRAC University Adventure Club" <${emailUser}>`,
      to: email,
      subject: "Thank you for contacting BUAC",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
              * { font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
              body { font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #ff622b 0%, #ff8a5b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { font-family: 'Poppins', sans-serif; margin: 0; font-weight: 600; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Thank You for Reaching Out!</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                <p>Thank you for contacting <strong>BRAC University Adventure Club</strong>! We've received your message and will get back to you as soon as possible.</p>
                <p><strong>Your Message:</strong></p>
                <p style="background: white; padding: 15px; border-radius: 5px; border-left: 3px solid #ff622b;">${message}</p>
                <p>We typically respond within 24-48 hours. In the meantime, feel free to explore our website and follow us on social media!</p>
                <p>Best regards,<br><strong>BUAC Team</strong></p>
              </div>
              <div class="footer">
                <p>BRAC University Adventure Club<br>Kha 224 Pragati Sarani, Merul Badda, Dhaka 1212, Bangladesh</p>
              </div>
            </div>
          </body>

        </html>
      `,
      text: `
Hi ${name},

Thank you for contacting BRAC University Adventure Club! We've received your message and will get back to you as soon as possible.

Your Message:
${message}

We typically respond within 24-48 hours.

Best regards,
BUAC Team
      `,
    };

    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    return NextResponse.json(
      {
        success: true,
        message: "Email sent successfully! We'll get back to you soon.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send email. Please try again later.",
      },
      { status: 500 }
    );
  }
}
