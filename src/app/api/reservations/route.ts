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

    // ✅ Send confirmation email
    await resend.emails.send({
      from: "Restaurant <no-reply@yourdomain.com>",
      to: email,
      subject: "Reservation Request Received",
      html: `
        <p>Dear ${name},</p>
        <p>Thank you for your reservation request.</p>
        <p>Here are the details you submitted:</p>
        <ul>
          <li><b>Date:</b> ${date}</li>
          <li><b>Time:</b> ${time}</li>
          <li><b>Guests:</b> ${guests}</li>
        </ul>
        <p>We have received your request and will confirm shortly. ✅</p>
        <p>Best regards,<br/>Restaurant Team</p>
      `,
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
