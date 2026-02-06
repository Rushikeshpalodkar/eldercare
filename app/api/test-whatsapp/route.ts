import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Format phone number
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`

    // Create test message
    const testMessage = `🧪 *Test Message from ElderCare Connect*

Hello! This is a test WhatsApp notification.

If you're seeing this, your WhatsApp integration is working! 🎉

*Test Details:*
• Twilio Account: ${process.env.TWILIO_ACCOUNT_SID?.substring(0, 10)}...
• From Number: ${process.env.TWILIO_WHATSAPP_NUMBER}
• To Number: ${formattedNumber}
• Timestamp: ${new Date().toLocaleString()}

*Next Steps:*
1. ✅ WhatsApp is working
2. Now test the full visit completion flow
3. You should receive a detailed message when a visit is completed

Visit your dashboard:
${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`

    // Send WhatsApp message
    const result = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER!}`,
      to: `whatsapp:${formattedNumber}`,
      body: testMessage,
    })

    return NextResponse.json({
      success: true,
      message: 'WhatsApp message sent successfully!',
      details: {
        messageSid: result.sid,
        status: result.status,
        to: formattedNumber,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('WhatsApp test error:', error)

    return NextResponse.json(
      {
        error: error.message || 'Failed to send WhatsApp message',
        details: {
          code: error.code,
          moreInfo: error.moreInfo,
          status: error.status
        }
      },
      { status: 500 }
    )
  }
}
