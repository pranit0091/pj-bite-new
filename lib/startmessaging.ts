/**
 * StartMessaging SMS helper.
 *
 * Required env:
 *   STARTMESSAGING_API_KEY     — API key from the StartMessaging dashboard (e.g. sm_live_xxx)
 *
 * Optional env:
 *   STARTMESSAGING_TEMPLATE_ID — DLT-approved template ID. Recommended for India SMS delivery.
 *   STARTMESSAGING_APP_NAME    — App name placeholder used by the template. Defaults to "PJ Bite".
 *
 * Docs: https://startmessaging.com/otp-api
 *   POST https://api.startmessaging.com/otp/send
 *   Headers: X-API-Key: <key>, Content-Type: application/json
 *   Body:    { phoneNumber: "+919876543210", templateId?: "...", variables: { otp, appName? } }
 */

const API_URL = "https://api.startmessaging.com/otp/send";

/**
 * Normalize a 10-digit Indian mobile number to E.164 (+91XXXXXXXXXX).
 * If the caller already passed a +country-prefixed number, it is returned as-is.
 */
function toE164(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  throw new Error("Invalid phone number — expected a 10-digit Indian mobile");
}

export async function sendOtpSms(phone: string, otp: string): Promise<void> {
  const apiKey = process.env.STARTMESSAGING_API_KEY;
  if (!apiKey) throw new Error("STARTMESSAGING_API_KEY is not configured");

  const templateId = process.env.STARTMESSAGING_TEMPLATE_ID;
  const appName = process.env.STARTMESSAGING_APP_NAME || "PJ Bite";

  const body: Record<string, unknown> = {
    phoneNumber: toE164(phone),
    variables: { otp, appName },
  };
  if (templateId) body.templateId = templateId;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response — fall through to status-based error
  }

  if (!res.ok || data?.success === false) {
    const msg =
      data?.error?.message ||
      data?.message ||
      data?.error ||
      `StartMessaging request failed (HTTP ${res.status})`;
    throw new Error(typeof msg === "string" ? msg : "Failed to send SMS");
  }
}
