import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, position, message } = await req.json();

    if (!name || !email || !position) {
      return NextResponse.json({ error: "Name, email and position are required." }, { status: 400 });
    }

    const adminEmail = process.env.SMTP_USER;
    if (!adminEmail) {
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9f7f2;border-radius:12px;">
        <h2 style="color:#1E5C2A;font-size:22px;margin-bottom:4px;">New Career Application</h2>
        <p style="color:#6B7A5E;font-size:13px;margin-bottom:24px;">Received via pjbite.com/careers</p>

        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;color:#6B7A5E;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;width:120px;">Name</td>
              <td style="padding:10px 0;color:#1A2010;font-weight:700;font-size:14px;">${name}</td></tr>
          <tr><td style="padding:10px 0;color:#6B7A5E;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Email</td>
              <td style="padding:10px 0;color:#1A2010;font-weight:700;font-size:14px;"><a href="mailto:${email}" style="color:#1E5C2A;">${email}</a></td></tr>
          <tr><td style="padding:10px 0;color:#6B7A5E;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Phone</td>
              <td style="padding:10px 0;color:#1A2010;font-weight:700;font-size:14px;">${phone || "—"}</td></tr>
          <tr><td style="padding:10px 0;color:#6B7A5E;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Position</td>
              <td style="padding:10px 0;color:#1A2010;font-weight:700;font-size:14px;">${position}</td></tr>
        </table>

        ${message ? `
        <div style="margin-top:20px;padding:16px;background:#fff;border-radius:8px;border:1px solid #e8e6e1;">
          <p style="color:#6B7A5E;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px;">Message</p>
          <p style="color:#1A2010;font-size:14px;line-height:1.6;margin:0;">${message.replace(/\n/g, "<br/>")}</p>
        </div>` : ""}

        <p style="margin-top:32px;color:#6B7A5E;font-size:11px;">PJ Bite Careers · pjbite.com</p>
      </div>
    `;

    await sendOrderEmail({
      to: adminEmail,
      subject: `Career Application: ${position} — ${name}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Career application error:", error);
    return NextResponse.json({ error: "Failed to submit application." }, { status: 500 });
  }
}
