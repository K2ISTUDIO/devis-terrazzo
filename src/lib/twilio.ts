import twilio from 'twilio'

let _client: ReturnType<typeof twilio> | null = null
function getTwilioClient() {
  if (!_client) _client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  return _client
}

export const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER || ''

export async function sendSMS(to: string, body: string): Promise<boolean> {
  try {
    const normalized = to.startsWith('0')
      ? '+33' + to.slice(1)
      : to.startsWith('+')
      ? to
      : '+33' + to

    await getTwilioClient().messages.create({
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
