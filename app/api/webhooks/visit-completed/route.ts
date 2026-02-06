import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { createClient } from '@/lib/supabase/server'

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

interface VisitCompletedPayload {
  type: 'UPDATE'
  table: string
  record: {
    id: string
    elder_id: string
    provider_id: string
    scheduled_at: string
    completed_at: string
    status: string
  }
  old_record: {
    status: string
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret (optional but recommended)
    const webhookSecret = request.headers.get('x-webhook-secret')
    if (webhookSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse webhook payload
    const payload: VisitCompletedPayload = await request.json()

    // Check if this is a visit completion event
    if (
      payload.table === 'visits' &&
      payload.type === 'UPDATE' &&
      payload.record.status === 'completed' &&
      payload.old_record.status !== 'completed'
    ) {
      const supabase = await createClient()

      // Fetch elder details
      const { data: elder } = await supabase
        .from('elders')
        .select(`
          *,
          family_members (
            name,
            whatsapp_number
          )
        `)
        .eq('id', payload.record.elder_id)
        .single()

      // Fetch provider details
      const { data: provider } = await supabase
        .from('service_providers')
        .select('name, specialty')
        .eq('id', payload.record.provider_id)
        .single()

      // Fetch latest visit log
      const { data: visitLog } = await supabase
        .from('visit_logs')
        .select('mood, notes, vitals_json')
        .eq('visit_id', payload.record.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

      // Send WhatsApp message if family member has WhatsApp number
      const familyMember = elder?.family_members as any
      if (familyMember?.whatsapp_number) {
        const message = formatWhatsAppMessage({
          elderName: elder?.name || 'your loved one',
          providerName: provider?.name || 'care provider',
          providerSpecialty: provider?.specialty || '',
          mood: visitLog?.mood || 'not recorded',
          notes: visitLog?.notes || 'No additional notes',
          vitals: visitLog?.vitals_json,
        })

        await sendWhatsAppMessage(
          familyMember.whatsapp_number,
          message
        )

        return NextResponse.json({
          success: true,
          message: 'WhatsApp notification sent',
          recipient: familyMember.whatsapp_number,
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Visit completed but no WhatsApp number found',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Event processed (no action taken)',
    })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

function formatWhatsAppMessage({
  elderName,
  providerName,
  providerSpecialty,
  mood,
  notes,
  vitals,
}: {
  elderName: string
  providerName: string
  providerSpecialty: string
  mood: string
  notes: string
  vitals: any
}) {
  const moodEmojis: { [key: string]: string } = {
    excellent: '😊 Excellent',
    good: '🙂 Good',
    neutral: '😐 Neutral',
    poor: '😟 Poor',
    distressed: '😢 Distressed',
  }

  let message = `🏥 *ElderCare Connect - Visit Complete*\n\n`
  message += `*Elder:* ${elderName}\n`
  message += `*Provider:* ${providerName}`
  if (providerSpecialty) {
    message += ` (${providerSpecialty})`
  }
  message += `\n\n`

  message += `*Mood:* ${moodEmojis[mood] || mood}\n\n`

  if (vitals) {
    message += `📊 *Vitals:*\n`
    if (vitals.bloodPressure) {
      message += `• Blood Pressure: ${vitals.bloodPressure} mmHg\n`
    }
    if (vitals.bloodSugar) {
      message += `• Blood Sugar: ${vitals.bloodSugar} mg/dL\n`
    }
    if (vitals.heartRate) {
      message += `• Heart Rate: ${vitals.heartRate} bpm\n`
    }
    if (vitals.temperature) {
      message += `• Temperature: ${vitals.temperature}°F\n`
    }
    message += `\n`
  }

  message += `📝 *Provider Notes:*\n${notes}\n\n`
  message += `View full details in your dashboard:\n`
  message += `${process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'}/dashboard`

  return message
}

async function sendWhatsAppMessage(to: string, message: string) {
  try {
    // Ensure phone number is in E.164 format (e.g., +1234567890)
    const formattedNumber = to.startsWith('+') ? to : `+${to}`

    const result = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER!}`,
      to: `whatsapp:${formattedNumber}`,
      body: message,
    })

    console.log('WhatsApp message sent:', result.sid)
    return result
  } catch (error: any) {
    console.error('Twilio error:', error)
    throw new Error(`Failed to send WhatsApp message: ${error.message}`)
  }
}
