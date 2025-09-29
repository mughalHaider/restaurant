import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, date, time, guests } = body;

    // Save to Supabase DB
    const { data, error } = await supabase.from("reservations").insert([
      { name, email, date, time, guests, status: "pending" },
    ]);

    if (error) throw error;

    // TODO: send email confirmation (Mailgun)
    return NextResponse.json({ success: true, data });
  } catch (err: Error | any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
