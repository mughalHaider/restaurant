import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { to, name, date, time } = await req.json();

    const { data, error } = await resend.emails.send({
      from: "Madot Restaurant <onboarding@resend.dev>", // ✅ sandbox sender
      to, // ⚠️ must be the same verified email if sandbox
      subject: "Your Reservation Could Not Be Confirmed ❌",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Reservation Rejected ❌</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>We regret to inform you that your reservation at <strong>Madot Restaurant</strong> could not be confirmed.</p>
          <p>
            <strong>Date:</strong> ${new Date(date).toLocaleDateString()}<br/>
            <strong>Time:</strong> ${time}
          </p>
          <p>We sincerely apologize for the inconvenience. Please try booking again at another time 🙏</p>
          <p style="font-size: 12px; color: #888;">This is an automated email, please do not reply.</p>
        </div>
      `,
      text: `Hello ${name},\n\nUnfortunately, your reservation on ${date} at ${time} could not be confirmed.\n\nWe apologize for the inconvenience.\n\nMadot Restaurant`,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: false, error: "Unknown error" }, { status: 500 });
  }
}
