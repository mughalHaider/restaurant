import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { to, vorname, nachname, datum, uhrzeit, table } = await req.json();

    // 🟢 1. Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 🟢 2. Define the email content
    const mailOptions = {
      from: `"Madot Restaurant" <${process.env.EMAIL_USER}>`,
      to,
      subject: "🎉 Ihre Reservierung ist bestätigt – Madot Restaurant",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Madot Restaurant</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Feines kulinarisches Erlebnis</p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px; background: #fff; border: 1px solid #e5e5e5; border-top: none;">
            

            <!-- Title -->
            <h2 style="color: #1f2937; text-align: center; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
              Reservierung bestätigt!
            </h2>

            <!-- Greeting -->
            <p style="color: #6b7280; text-align: center; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
              Hallo <strong style="color: #d97706;">${vorname} ${nachname}</strong>,<br>
              Ihre Reservierung im Madot Restaurant wurde bestätigt. Wir freuen uns auf Ihren Besuch!
            </p>

            <!-- Reservation Details Card -->
            <div style="background-color: #fffbeb; border: 2px solid #fef3c7; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #92400e; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; text-align: center;">
                📅 Ihre Reservierungsdetails
              </h3>
              
              <div style="display: grid; gap: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #fed7aa;">
                  <span style="color: #78350f; font-weight: 500;">Datum:</span>
                  <span style="color: #1f2937; font-weight: 600;">${new Date(datum).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #fed7aa;">
                  <span style="color: #78350f; font-weight: 500;">Uhrzeit:</span>
                  <span style="color: #1f2937; font-weight: 600;">${uhrzeit}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                  <span style="color: #78350f; font-weight: 500;">Tisch:</span>
                  <span style="color: #1f2937; font-weight: 600;">${table}</span>
                </div>
              </div>
            </div>

            <!-- Welcome Message -->
            <div style="background-color: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
              <p style="color: #166534; margin: 0; font-size: 16px; font-weight: 600;">
                🍽️ Wir freuen uns, Sie begrüßen zu dürfen!
              </p>
            </div>

            <!-- Contact Info -->
            <div style="text-align: center; margin: 30px 0 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                Müssen Sie Änderungen vornehmen?<br>
                Kontaktieren Sie uns unter: 
                <a href="mailto:info@madotrestaurant.com" style="color: #d97706; text-decoration: none; font-weight: 500;">
                  info@madotrestaurant.com
                </a> oder rufen Sie an unter <strong>004915213878030</strong>
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; padding: 25px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px;">
              Madot Restaurant &copy; ${new Date().getFullYear()}
            </p>
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              Sonnenalle 14, 16321 Bernau bei Berlin • 03338 1234-0
            </p>
            <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 11px;">
              Dies ist eine automatisch generierte E‑Mail. Bitte antworten Sie nicht auf diese Nachricht.
            </p>
          </div>
        </div>
      `,
      text: `
MADOT RESTAURANT – RESERVIERUNG BESTÄTIGT

Hallo ${vorname} ${nachname},

Ihre Reservierung im Madot Restaurant wurde bestätigt!

RESERVIERUNGSDETAILS:
• Datum: ${new Date(datum).toLocaleDateString('de-DE')}
• Uhrzeit: ${uhrzeit}
• Tisch: ${table}

Wir freuen uns, Sie begrüßen zu dürfen! 🍽️

Für Änderungen kontaktieren Sie uns bitte unter info@madotrestaurant.com.

Mit freundlichen Grüßen
Ihr Madot Restaurant Team
Sonnenalle 14, 16321 Bernau bei Berlin
03338 1234-0

Dies ist eine automatisch generierte E‑Mail. Bitte nicht antworten.
      `,
    };

    // 🟢 3. Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Email sent successfully!" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Email send error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.error("Unknown error:", error);
    return NextResponse.json(
      { success: false, error: "Unknown error" },
      { status: 500 }
    );
  }
}