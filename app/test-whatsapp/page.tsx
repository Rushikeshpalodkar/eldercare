'use client'

import { useState } from 'react'

export default function TestWhatsAppPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [phoneNumber, setPhoneNumber] = useState('')

  const testWhatsApp = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      })

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🧪 Test WhatsApp Notification
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number (with country code)
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: +12345678901 (must include + and country code)
              </p>
            </div>

            <button
              onClick={testWhatsApp}
              disabled={loading || !phoneNumber}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Sending...' : 'Send Test WhatsApp Message'}
            </button>

            {result && (
              <div className={`p-4 rounded-lg ${
                result.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
              }`}>
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-2">Instructions:</h2>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Make sure you've joined the Twilio WhatsApp sandbox</li>
              <li>Enter your WhatsApp number with country code (e.g., +1234567890)</li>
              <li>Click "Send Test WhatsApp Message"</li>
              <li>Check your WhatsApp for the test message</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> If you don't receive the message, check:
              <br />• Twilio credentials in .env.local
              <br />• You've joined the Twilio sandbox
              <br />• Phone number format is correct
              <br />• Check browser console for errors
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
