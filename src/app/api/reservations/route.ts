import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vorname, nachname, email, telefon, datum, uhrzeit, gaeste, bemerkung } = body;

    // ✅ 1. Save reservation in Supabase with new field names
    const { data, error } = await supabase.from("reservierungen").insert([
      { 
        vorname,
        nachname,
        email,
        telefon,
        datum,
        uhrzeit,
        gaeste,
        bemerkung: bemerkung || "",
        status: "pending"
      },
    ]);

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    // ✅ 2. Setup Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const fullName = `${vorname} ${nachname}`;

    // ✅ 3. Create Styled Email Content
    const mailOptions = {
      from: `"Madot Restaurant" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🍽️ Reservierungsanfrage eingegangen – Madot Restaurant",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reservation Confirmation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', 'Helvetica Neue', Helvetica, sans-serif; background-color: #fef7ed; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Madot Restaurant</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Feines kulinarisches Erlebnis</p>
                </div>

                <!-- Main Content -->
                <div style="padding: 40px 30px;">

                    <!-- Title -->
                    <h2 style="color: #1f2937; text-align: center; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                        Reservierungsanfrage eingegangen
                    </h2>

                    <!-- Greeting -->
                    <p style="color: #6b7280; text-align: center; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                        Sehr geehrte/r <strong style="color: #d97706;">${fullName}</strong>,<br>
                        vielen Dank für Ihre Anfrage beim Madot Restaurant. Ihre Reservierungsanfrage ist bei uns eingegangen und wird derzeit bearbeitet.
                    </p>

                    <!-- Reservation Details Card -->
                    <div style="background-color: #fffbeb; border: 2px solid #fef3c7; border-radius: 12px; padding: 25px; margin: 30px 0;">
                        <h3 style="color: #92400e; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; text-align: center;">
                            📅 Reservierungsdetails
                        </h3>
                        
                        <div style="display: grid; gap: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #fed7aa;">
                                <span style="color: #78350f; font-weight: 500;">Name:</span>
                                <span style="color: #1f2937; font-weight: 600;">${fullName}</span>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #fed7aa;">
                                <span style="color: #78350f; font-weight: 500;">Telefon:</span>
                                <span style="color: #1f2937; font-weight: 600;">${telefon}</span>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #fed7aa;">
                                <span style="color: #78350f; font-weight: 500;">Datum:</span>
                                <span style="color: #1f2937; font-weight: 600;">${new Date(datum).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #fed7aa;">
                                <span style="color: #78350f; font-weight: 500;">Uhrzeit:</span>
                                <span style="color: #1f2937; font-weight: 600;">${uhrzeit}</span>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0${bemerkung ? '; border-bottom: 1px solid #fed7aa;' : ''}">
                                <span style="color: #78350f; font-weight: 500;">Anzahl der Gäste:</span>
                                <span style="color: #1f2937; font-weight: 600;">${gaeste} ${gaeste === '1' ? 'Gast' : 'Gäste'}</span>
                            </div>
                            
                            ${bemerkung ? `
                            <div style="padding: 12px 0;">
                                <span style="color: #78350f; font-weight: 500; display: block; margin-bottom: 8px;">Besondere Wünsche:</span>
                                <span style="color: #1f2937; font-weight: 400; font-style: italic;">${bemerkung}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Important Notice -->
                    <div style="background-color: #dbeafe; border: 2px solid #93c5fd; border-radius: 12px; padding: 20px; margin: 25px 0;">
                        <div style="display: flex; align-items: flex-start; gap: 12px;">
                            <div style="background-color: #3b82f6; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">
                                <span style="color: white; font-size: 14px; font-weight: bold;">i</span>
                            </div>
                            <div>
                                <h4 style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">
                                    Ihre Reservierung wird in Kürze bestätigt
                                </h4>
                                <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.5;">
                                    Wir bearbeiten Ihre Anfrage und senden Ihnen in Kürze eine finale Bestätigung per E‑Mail. 
                                    Bitte prüfen Sie auch Ihren Spam-Ordner, falls Sie keine E‑Mail erhalten.
                                </p>
                            </div>
                        </div>
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
                <div style="background-color: #1f2937; padding: 30px; text-align: center;">
                    <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px;">
                        Madot Restaurant &copy; ${new Date().getFullYear()}
                    </p>
                    <p style="color: #6b7280; margin: 0; font-size: 12px;">
                        123 Gourmet Straße, Foodstadt • (555) 123-4567
                    </p>
                    <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 11px;">
                        Dies ist eine automatisch generierte E‑Mail. Bitte antworten Sie nicht auf diese Nachricht.
                    </p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `
MADOT RESTAURANT – RESERVIERUNGSANFRAGE EINGEGANGEN

Sehr geehrte/r ${fullName},

vielen Dank für Ihre Reservierungsanfrage im Madot Restaurant.

RESERVIERUNGSDETAILS:
• Name: ${fullName}
• Telefon: ${telefon}
• Datum: ${new Date(datum).toLocaleDateString('de-DE')}
• Uhrzeit: ${uhrzeit}
• Gäste: ${gaeste}
${bemerkung ? `• Besondere Wünsche: ${bemerkung}` : ''}

Ihre Reservierung wird in Kürze bestätigt. Wir bearbeiten Ihre Anfrage und senden Ihnen bald eine finale Bestätigung per E‑Mail.

Für Änderungen kontaktieren Sie uns bitte unter info@madotrestaurant.com oder rufen Sie ${telefon} an.

Mit freundlichen Grüßen
Ihr Madot Restaurant Team
123 Gourmet Straße, Foodstadt
(555) 123-4567

Dies ist eine automatisch generierte E‑Mail. Bitte nicht antworten.
      `,
    };

    // ✅ 4. Send Email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error in reservation API:", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}