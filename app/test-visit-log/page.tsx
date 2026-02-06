'use client'

import { useState } from 'react'
import VisitLogForm from '@/components/VisitLogForm'

export default function TestVisitLogPage() {
  const [visitId, setVisitId] = useState('')
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      {!showForm ? (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🧪 Test Visit Log Form
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Visit ID
              </label>
              <input
                type="text"
                value={visitId}
                onChange={(e) => setVisitId(e.target.value)}
                placeholder="Paste the visit_id from your SQL query"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                📋 How to get your Visit ID:
              </h3>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Go to Supabase Dashboard → SQL Editor</li>
                <li>Run the SQL to insert a visit (see WHATSAPP_TESTING_GUIDE.md)</li>
                <li>Copy the visit ID returned</li>
                <li>Paste it above</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">
                ⚠️ Quick Tip:
              </h3>
              <p className="text-sm text-yellow-800">
                You can also find visit IDs by running:
              </p>
              <pre className="bg-yellow-100 p-2 rounded mt-2 text-xs overflow-x-auto">
                SELECT id, status FROM visits ORDER BY created_at DESC LIMIT 5;
              </pre>
            </div>

            <button
              onClick={() => setShowForm(true)}
              disabled={!visitId}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Load Visit Log Form
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setShowForm(false)}
            className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            ← Back
          </button>

          <VisitLogForm
            visitId={visitId}
            onSuccess={() => {
              alert('✅ Visit log created successfully!\n\n🔔 Check your WhatsApp for the notification!\n\nYou will now be redirected to the dashboard.')
              setTimeout(() => {
                window.location.href = '/dashboard'
              }, 2000)
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  )
}
