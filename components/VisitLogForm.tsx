'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type VisitLog = Database['public']['Tables']['visit_logs']['Insert']
type Visit = Database['public']['Tables']['visits']['Update']

interface VisitLogFormProps {
  visitId: string
  onSuccess?: () => void
  onCancel?: () => void
}

const MOOD_OPTIONS = [
  { value: 'excellent', label: '😊 Excellent', color: 'text-green-600' },
  { value: 'good', label: '🙂 Good', color: 'text-blue-600' },
  { value: 'neutral', label: '😐 Neutral', color: 'text-yellow-600' },
  { value: 'poor', label: '😟 Poor', color: 'text-orange-600' },
  { value: 'distressed', label: '😢 Distressed', color: 'text-red-600' },
]

export default function VisitLogForm({ visitId, onSuccess, onCancel }: VisitLogFormProps) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [vitals, setVitals] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    bloodSugar: '',
    heartRate: '',
    temperature: '',
  })
  const [mood, setMood] = useState('')
  const [notes, setNotes] = useState('')

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Photo size must be less than 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
      setError(null)
    }
  }

  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      setUploadingPhoto(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${visitId}-${Date.now()}.${fileExt}`
      const filePath = `visit-photos/${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('visit-logs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('visit-logs')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err) {
      console.error('Photo upload error:', err)
      throw new Error('Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Upload photo if selected
      let photoUrl: string | null = null
      if (photo) {
        photoUrl = await uploadPhoto(photo)
      }

      // Prepare vitals JSON
      const vitalsJson = {
        bloodPressure: vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic
          ? `${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic}`
          : null,
        bloodSugar: vitals.bloodSugar || null,
        heartRate: vitals.heartRate || null,
        temperature: vitals.temperature || null,
      }

      // Create visit log
      const visitLogData: VisitLog = {
        visit_id: visitId,
        photo_url: photoUrl,
        vitals_json: vitalsJson as any,
        mood: mood || null,
        notes: notes || null,
        timestamp: new Date().toISOString(),
      }

      const { error: logError } = await supabase
        .from('visit_logs')
        .insert(visitLogData)

      if (logError) {
        throw logError
      }

      // Update visit status to completed
      const visitUpdate: Visit = {
        status: 'completed',
        completed_at: new Date().toISOString(),
      }

      const { error: visitError } = await supabase
        .from('visits')
        .update(visitUpdate)
        .eq('id', visitId)

      if (visitError) {
        throw visitError
      }

      // Success
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.error('Form submission error:', err)
      setError(err.message || 'Failed to submit visit log')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Visit Log</h2>
        <p className="text-sm text-gray-600 mt-1">Complete the visit details below</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Photo Section */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Visit Photo
        </label>

        {photoPreview ? (
          <div className="relative">
            <img
              src={photoPreview}
              alt="Visit preview"
              className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
            />
            <button
              type="button"
              onClick={() => {
                setPhoto(null)
                setPhotoPreview(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleTakePhoto}
            className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-indigo-600"
          >
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">Take or Upload Photo</span>
            <span className="text-xs">Optional - Max 5MB</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="hidden"
        />
      </div>

      {/* Vitals Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Vitals</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blood Pressure (mmHg)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Systolic"
                value={vitals.bloodPressureSystolic}
                onChange={(e) => setVitals({ ...vitals, bloodPressureSystolic: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <span className="text-gray-500 font-bold">/</span>
              <input
                type="number"
                placeholder="Diastolic"
                value={vitals.bloodPressureDiastolic}
                onChange={(e) => setVitals({ ...vitals, bloodPressureDiastolic: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blood Sugar (mg/dL)
            </label>
            <input
              type="number"
              placeholder="e.g., 120"
              value={vitals.bloodSugar}
              onChange={(e) => setVitals({ ...vitals, bloodSugar: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heart Rate (bpm)
            </label>
            <input
              type="number"
              placeholder="e.g., 72"
              value={vitals.heartRate}
              onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature (°F)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 98.6"
              value={vitals.temperature}
              onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Mood Section */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Mood Assessment <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {MOOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMood(option.value)}
              className={`p-3 border-2 rounded-lg transition-all ${
                mood === option.value
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`text-2xl mb-1 ${option.color}`}>
                {option.label.split(' ')[0]}
              </div>
              <div className="text-xs font-medium text-gray-700">
                {option.label.split(' ')[1]}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Visit Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Describe the visit, activities performed, observations, concerns, etc."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || uploadingPhoto || !mood}
          className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
        >
          {loading || uploadingPhoto ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {uploadingPhoto ? 'Uploading photo...' : 'Submitting...'}
            </>
          ) : (
            'Complete Visit'
          )}
        </button>
      </div>
    </form>
  )
}
