import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { to, name, date, time, table } = await req.json();

    const { data, error } = await resend.emails.send({
      from: "Madot Restaurant <onboarding@resend.dev>", // ✅ sandbox sender
      to,  // must be the same email you signed up with at Resend
      subject: "Your Reservation is Confirmed 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Reservation Confirmed ✅</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your reservation at <strong>Madot Restaurant</strong> has been confirmed.</p>
          <p>
            <strong>Date:</strong> ${new Date(date).toLocaleDateString()}<br/>
            <strong>Time:</strong> ${time}<br/>
            <strong>Table:</strong> ${table}
          </p>
          <p>We look forward to serving you 🍽️</p>
          <p style="font-size: 12px; color: #888;">This is an automated email, please do not reply.</p>
        </div>
      `,
      text: `Hello ${name},\n\nYour reservation has been confirmed.\n\nDate: ${date}\nTime: ${time}\nTable: ${table}\n\nSee you soon! 🍽️`,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
