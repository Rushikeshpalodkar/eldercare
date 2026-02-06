'use client'

import { Database } from '@/types/database'
import { format } from 'date-fns'

type VisitLog = Database['public']['Tables']['visit_logs']['Row'] & {
  visits: {
    id: string
    scheduled_at: string
    completed_at: string | null
    status: string
    elders: {
      id: string
      name: string
      address: string | null
    } | null
    service_providers: {
      id: string
      name: string
      specialty: string | null
    } | null
  } | null
}

interface VisitTimelineProps {
  visitLogs: VisitLog[]
}

const MOOD_EMOJIS: { [key: string]: { emoji: string; label: string; color: string } } = {
  excellent: { emoji: '😊', label: 'Excellent', color: 'text-green-600 bg-green-50' },
  good: { emoji: '🙂', label: 'Good', color: 'text-blue-600 bg-blue-50' },
  neutral: { emoji: '😐', label: 'Neutral', color: 'text-yellow-600 bg-yellow-50' },
  poor: { emoji: '😟', label: 'Poor', color: 'text-orange-600 bg-orange-50' },
  distressed: { emoji: '😢', label: 'Distressed', color: 'text-red-600 bg-red-50' },
}

export default function VisitTimeline({ visitLogs }: VisitTimelineProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPp') // e.g., "Apr 29, 2023, 9:30 AM"
    } catch {
      return dateString
    }
  }

  const formatVitals = (vitalsJson: any) => {
    if (!vitalsJson) return null

    const vitals = []
    if (vitalsJson.bloodPressure) {
      vitals.push({ label: 'BP', value: vitalsJson.bloodPressure, unit: 'mmHg' })
    }
    if (vitalsJson.bloodSugar) {
      vitals.push({ label: 'Blood Sugar', value: vitalsJson.bloodSugar, unit: 'mg/dL' })
    }
    if (vitalsJson.heartRate) {
      vitals.push({ label: 'Heart Rate', value: vitalsJson.heartRate, unit: 'bpm' })
    }
    if (vitalsJson.temperature) {
      vitals.push({ label: 'Temperature', value: vitalsJson.temperature, unit: '°F' })
    }

    return vitals.length > 0 ? vitals : null
  }

  return (
    <div className="space-y-8">
      {visitLogs.map((log, index) => {
        const visit = log.visits
        const elder = visit?.elders
        const provider = visit?.service_providers
        const mood = log.mood ? MOOD_EMOJIS[log.mood] : null
        const vitals = formatVitals(log.vitals_json)

        return (
          <div key={log.id} className="relative pl-8 pb-8">
            {/* Timeline Line */}
            {index !== visitLogs.length - 1 && (
              <div className="absolute left-3 top-10 bottom-0 w-0.5 bg-gradient-to-b from-indigo-400 to-purple-300" />
            )}

            {/* Timeline Dot */}
            <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-white shadow-md" />

            {/* Content Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {elder?.name || 'Elder'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Care visit by {provider?.name || 'Provider'}
                      {provider?.specialty && (
                        <span className="text-gray-500"> • {provider.specialty}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(log.timestamp)}
                    </p>
                  </div>

                  {/* Mood Badge */}
                  {mood && (
                    <div className={`px-3 py-2 rounded-lg ${mood.color} flex items-center gap-2`}>
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className="text-sm font-medium">{mood.label}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Photo Section */}
                  {log.photo_url && (
                    <div className="lg:col-span-2">
                      <img
                        src={log.photo_url}
                        alt="Visit photo"
                        className="w-full max-h-96 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}

                  {/* Vitals Section */}
                  {vitals && vitals.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Vital Signs
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {vitals.map((vital, idx) => (
                          <div
                            key={idx}
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100"
                          >
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                              {vital.label}
                            </p>
                            <p className="text-xl font-bold text-gray-900 mt-1">
                              {vital.value}{' '}
                              <span className="text-sm font-normal text-gray-600">
                                {vital.unit}
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes Section */}
                  {log.notes && (
                    <div className={vitals ? '' : 'lg:col-span-2'}>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Provider Notes
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {log.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
