import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, date, time, guests } = body;

    // Save to Supabase DB
    const { data, error } = await supabase.from("reservations").insert([
      { name, email, date, time, guests, status: "pending" },
    ]);

    if (error) throw error;

    // ✅ Send confirmation email (sandbox mode)
    await resend.emails.send({
      from: "Madot Restaurant <onboarding@resend.dev>", // sandbox sender
      to: email, // ⚠️ must be your verified email in Resend sandbox
      subject: "Reservation Request Received ✅",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Reservation Request Received</h2>
          <p>Dear <strong>${name}</strong>,</p>
          <p>Thank you for your reservation request at <strong>Madot Restaurant</strong>.</p>
          <p>Here are the details you submitted:</p>
          <ul>
            <li><b>Date:</b> ${new Date(date).toLocaleDateString()}</li>
            <li><b>Time:</b> ${time}</li>
            <li><b>Guests:</b> ${guests}</li>
          </ul>
          <p>We have received your request and will confirm shortly. ✅</p>
          <p>Best regards,<br/>Madot Restaurant Team</p>
          <p style="font-size: 12px; color: #888;">This is an automated email, please do not reply.</p>
        </div>
      `,
      text: `Dear ${name},\n\nThank you for your reservation request.\n\nDate: ${date}\nTime: ${time}\nGuests: ${guests}\n\nWe will confirm your booking shortly.\n\nMadot Restaurant Team`,
    });

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
