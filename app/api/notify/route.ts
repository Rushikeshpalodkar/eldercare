import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

// Hardcoded test numbers
const TEST_PHONE_NUMBERS = [
  '+919096394998',
  '+19349498516'
]

export async function POST(request: NextRequest) {
  try {
    // Check webhook secret
    const webhookSecret = request.headers.get('x-webhook-secret')
    if (webhookSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid webhook secret' },
        { status: 401 }
      )
    }

    // Parse webhook payload
    const payload = await request.json()

    // Extract data from Supabase webhook
    const { record, old_record, type } = payload

    // Check if this is a visit completion
    if (
      type === 'UPDATE' &&
      record?.status === 'completed' &&
      old_record?.status !== 'completed'
    ) {
      const { mood, notes, elder_id } = record

      // Create WhatsApp message
      const message = `🏥 *ElderCare Connect - Visit Complete*

*Elder ID:* ${elder_id || 'N/A'}

*Mood:* ${getMoodEmoji(mood)} ${mood || 'Not recorded'}

📝 *Notes:*
${notes || 'No notes provided'}

View full details in your dashboard:
${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard

_This is a test notification_`

      // Send to both test numbers
      const results = []
      for (const phoneNumber of TEST_PHONE_NUMBERS) {
        try {
          const result = await twilioClient.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER!}`,
            to: `whatsapp:${phoneNumber}`,
            body: message,
          })

          results.push({
            to: phoneNumber,
            sid: result.sid,
            status: result.status
          })
        } catch (error: any) {
          console.error(`Failed to send to ${phoneNumber}:`, error.message)
          results.push({
            to: phoneNumber,
            error: error.message
          })
        }
      }

      return NextResponse.json({
        success: true,
        message: 'WhatsApp notifications sent',
        results
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Event processed (no action taken)'
    })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

function getMoodEmoji(mood: string | null): string {
  const moodEmojis: { [key: string]: string } = {
    excellent: '😊',
    good: '🙂',
    neutral: '😐',
    poor: '😟',
    distressed: '😢',
  }

  return mood ? (moodEmojis[mood] || '😐') : '😐'
}
