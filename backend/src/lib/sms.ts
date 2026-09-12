import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_FROM;
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendOtpSms(phone: string, code: string) {
  if (!client || !from) {
    console.warn(`SMS skipped because Twilio is not configured: ${phone}`);
    return false;
  }
  await client.messages.create({
    body: `Mã xác thực GymTrack của bạn là ${code}. Mã có hiệu lực trong 10 phút.`,
    from,
    to: phone,
  });
  return true;
}
