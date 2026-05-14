import twilio from 'twilio'

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER!

export async function sendSMS(to: string, body: string): Promise<boolean> {
  try {
    // Normaliser le numéro français
    const normalized = to.startsWith('0')
      ? '+33' + to.slice(1)
      : to.startsWith('+')
      ? to
      : '+33' + to

    await twilioClient.messages.create({
      body,
      from: TWILIO_FROM,
      to: normalized,
    })
    return true
  } catch (error) {
    console.error('[Twilio] SMS error:', error)
    return false
  }
}
