import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, message } = await req.json();

    if (!firstName || !email || !message) {
      return NextResponse.json({ success: false, error: "Name, email and message are required." }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    if (!adminEmail) {
      return NextResponse.json({ success: false, error: "Server email is not configured." }, { status: 500 });
    }

    const fullName = `${firstName} ${lastName || ""}`.trim();

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9f7f2;border-radius:12px;">
        <h2 style="color:#1E5C2A;font-size:22px;margin-bottom:4px;">New Contact Message</h2>
        <p style="color:#6B7A5E;font-size:13px;margin-bottom:24px;">Received via pjbite.com/contact</p>

        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;color:#6B7A5E;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;width:120px;">Name</td>
              <td style="padding:10px 0;color:#1A2010;font-weight:700;font-size:14px;">${fullName}</td></tr>
          <tr><td style="padding:10px 0;color:#6B7A5E;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Email</td>
              <td style="padding:10px 0;color:#1A2010;font-weight:700;font-size:14px;"><a href="mailto:${email}" style="color:#1E5C2A;">${email}</a></td></tr>
        </table>

        <div style="margin-top:20px;padding:16px;background:#fff;border-radius:8px;border:1px solid #e8e6e1;">
          <p style="color:#6B7A5E;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px;">Message</p>
          <p style="color:#1A2010;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap;">${String(message).replace(/[<>]/g, (c) => (c === "<" ? "&lt;" : "&gt;")).replace(/\n/g, "<br/>")}</p>
        </div>

        <p style="margin-top:32px;color:#6B7A5E;font-size:11px;">PJ Bite Contact Form · pjbite.com</p>
      </div>
    `;

    const ok = await sendOrderEmail({
      to: adminEmail,
      subject: `Contact Message from ${fullName}`,
      html,
    });

    if (!ok) {
      return NextResponse.json({ success: false, error: "Could not send your message right now. Please email us directly." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[CONTACT_ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to send message." }, { status: 500 });
  }
}
