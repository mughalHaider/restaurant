import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { to, vorname, nachname, datum, uhrzeit } = await req.json();

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
      subject: "❌ Reservierungs-Update – Madot Restaurant",
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
              Reservierung nicht verfügbar
            </h2>

            <!-- Greeting -->
            <p style="color: #6b7280; text-align: center; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
              Hallo <strong style="color: #d97706;">${vorname} ${nachname}</strong>,<br>
              leider können wir Ihre Reservierungsanfrage nicht bestätigen.
            </p>

            <!-- Reservation Details Card -->
            <div style="background-color: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; padding: 25px; margin: 30px 0;">
              <h3 style="color: #991b1b; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; text-align: center;">
                📅 Angefragte Reservierung
              </h3>
              
              <div style="display: grid; gap: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #fca5a5;">
                  <span style="color: #991b1b; font-weight: 500;">Datum:</span>
                  <span style="color: #1f2937; font-weight: 600;">${new Date(datum).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0;">
                  <span style="color: #991b1b; font-weight: 500;">Uhrzeit:</span>
                  <span style="color: #1f2937; font-weight: 600;">${uhrzeit}</span>
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
                    Wir entschuldigen uns aufrichtig für die Unannehmlichkeiten
                  </h4>
                  <p style="color: #78350f; margin: 0; font-size: 14px; line-height: 1.5;">
                    Aufgrund hoher Nachfrage oder betrieblicher Einschränkungen können wir Ihre Reservierung zu diesem Zeitpunkt leider nicht annehmen. Bitte versuchen Sie es an einem anderen Datum oder zu einer anderen Uhrzeit.
                  </p>
                </div>
              </div>
            </div>

            <!-- Alternative Options -->
            <div style="background-color: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 25px 0;">
              <h4 style="color: #166534; margin: 0 0 12px 0; font-size: 16px; font-weight: 600; text-align: center;">
                💡 Alternative Optionen
              </h4>
              <ul style="color: #15803d; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Versuchen Sie ein anderes Datum oder eine andere Uhrzeit</li>
                <li>Kontaktieren Sie uns für besondere Arrangements</li>
                <li>Besuchen Sie uns während weniger frequentierter Zeiten</li>
              </ul>
            </div>

            <!-- Contact Info -->
            <div style="text-align: center; margin: 30px 0 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                Für Unterstützung oder alternative Buchungsoptionen:<br>
                <a href="mailto:info@madotrestaurant.com" style="color: #d97706; text-decoration: none; font-weight: 500;">
                  info@madotrestaurant.com
                </a>
                oder rufen Sie an unter <strong>004915213878030</strong>
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #1f2937; padding: 25px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px;">
              Madot Restaurant &copy; ${new Date().getFullYear()}
            </p>
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              Sonnenalle 14, 16321 Bernau bei Berlin
            </p>
            <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 11px;">
              Dies ist eine automatisch generierte E‑Mail. Bitte antworten Sie nicht auf diese Nachricht.
            </p>
          </div>
        </div>
      `,
      text: `
MADOT RESTAURANT – RESERVIERUNGS-UPDATE

Hallo ${vorname} ${nachname},

leider können wir Ihre Reservierungsanfrage nicht bestätigen.

ANGEFRAGTE RESERVIERUNG:
• Datum: ${new Date(datum).toLocaleDateString('de-DE')}
• Uhrzeit: ${uhrzeit}

Wir entschuldigen uns für die Unannehmlichkeiten. Aufgrund hoher Nachfrage oder betrieblicher Einschränkungen können wir Ihre Reservierung derzeit nicht annehmen.

ALTERNATIVE OPTIONEN:
• Versuchen Sie ein anderes Datum oder eine andere Uhrzeit
• Kontaktieren Sie uns für besondere Arrangements
• Besuchen Sie uns während weniger frequentierter Zeiten

Für Unterstützung oder alternative Buchungsoptionen:
E‑Mail: info@madotrestaurant.com
Telefon: 03338 1234-0

Wir hoffen, Sie zukünftig bei uns begrüßen zu dürfen.

Mit freundlichen Grüßen
Ihr Madot Restaurant Team
Sonnenalle 14, 16321 Bernau bei Berlin

Dies ist eine automatisch generierte E‑Mail. Bitte nicht antworten.
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