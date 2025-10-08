import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { to, name, date, time } = await req.json();

    // 🟢 1. Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 🟢 2. Email content
    const mailOptions = {
      from: `"Madot Restaurant" <${process.env.EMAIL_USER}>`,
      to,
      subject: "❌ Reservation Update - Madot Restaurant",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Madot Restaurant</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Fine Dining Experience</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px; background: #fff; border: 1px solid #e5e5e5; border-top: none;">
            <!-- Warning Icon -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background-color: #ef4444; width: 80px; height: 80px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 36px; font-weight: bold; line-height: 1; display: block;">✕</span>
              </div>
            </div>

            <!-- Title -->
            <h2 style="color: #1f2937; text-align: center; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
              Reservation Not Available
            </h2>

            <!-- Greeting -->
            <p style="color: #6b7280; text-align: center; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
              Hi <strong style="color: #d97706;">${name}</strong>,<br>
              We regret to inform you that your reservation request could not be confirmed.
            </p>

            <!-- Reservation Details Card -->
            <div style="background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #991b1b; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; text-align: center;">
                📅 Requested Reservation
              </h3>
              
              <div style="display: grid; gap: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #fca5a5;">
                  <span style="color: #991b1b; font-weight: 500;">Date:</span>
                  <span style="color: #1f2937; font-weight: 600;">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                  <span style="color: #991b1b; font-weight: 500;">Time:</span>
                  <span style="color: #1f2937; font-weight: 600;">${time}</span>
                </div>
              </div>
            </div>

            <!-- Apology Message -->
            <div style="background-color: #fffbeb; border: 2px solid #fef3c7; border-radius: 12px; padding: 20px; margin: 25px 0;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="background-color: #d97706; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
                  <span style="color: white; font-size: 14px; font-weight: bold;">!</span>
                </div>
                <div>
                  <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                    We sincerely apologize for the inconvenience
                  </h4>
                  <p style="color: #78350f; margin: 0; font-size: 14px; line-height: 1.5;">
                    Due to high demand or operational constraints, we are unable to accommodate your reservation at this time. We encourage you to try another date or time.
                  </p>
                </div>
              </div>
            </div>

            <!-- Alternative Options -->
            <div style="background-color: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #166534; margin: 0 0 12px 0; font-size: 16px; font-weight: 600; text-align: center;">
                💡 Alternative Options
              </h4>
              <ul style="color: #15803d; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Try a different date or time</li>
                <li>Contact us for special arrangements</li>
                <li>Visit during our less busy hours</li>
              </ul>
            </div>

            <!-- Contact Info -->
            <div style="text-align: center; margin: 30px 0 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                For assistance or alternative booking options:<br>
                <a href="mailto:info@madotrestaurant.com" style="color: #d97706; text-decoration: none; font-weight: 500;">
                  info@madotrestaurant.com
                </a>
                <br>
                <span style="font-size: 13px;">(555) 123-4567</span>
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; padding: 25px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px;">
              Madot Restaurant &copy; ${new Date().getFullYear()}
            </p>
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              123 Gourmet Street, Food City
            </p>
            <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 11px;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `,
      text: `
MADOT RESTAURANT - RESERVATION UPDATE

Hi ${name},

We regret to inform you that your reservation request could not be confirmed.

REQUESTED RESERVATION:
• Date: ${new Date(date).toLocaleDateString()}
• Time: ${time}

We sincerely apologize for the inconvenience. Due to high demand or operational constraints, we are unable to accommodate your reservation at this time.

ALTERNATIVE OPTIONS:
• Try a different date or time
• Contact us for special arrangements
• Visit during our less busy hours

For assistance or alternative booking options:
Email: info@madotrestaurant.com
Phone: (555) 123-4567

We hope to serve you in the future.

Best regards,
Madot Restaurant Team
123 Gourmet Street, Food City

This is an automated email. Please do not reply to this message.
      `,
    };

    // 🟢 3. Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Rejection email sent successfully!" });
  } catch (error: unknown) {
    console.error("Email send error:", error);

    const message =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}