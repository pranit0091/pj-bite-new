/**
 * Fast2SMS SMS helper.
 * Requires env: FAST2SMS_API_KEY
 *
 * Route "q" (Quick) works without DLT registration — fine for development.
 * For production India SMS, register a DLT sender ID and switch to route "dlt".
 */
export async function sendOtpSms(phone: string, otp: string): Promise<void> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) throw new Error("FAST2SMS_API_KEY is not configured");

  const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "POST",
    headers: {
      authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      route: "q",
      numbers: phone,
      message: `Your PJ Bite verification code is ${otp}. Valid for 10 minutes. Do not share this with anyone.`,
      flash: 0,
    }),
  });

  const data = await res.json();
  if (!data.return) {
    const msg = Array.isArray(data.message) ? data.message[0] : data.message;
    throw new Error(msg || "Failed to send SMS");
  }
}
