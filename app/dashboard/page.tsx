import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VisitTimeline from '@/components/VisitTimeline'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch family member data
  const { data: familyMember } = await supabase
    .from('family_members')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch elders linked to this family member
  const { data: elders } = await supabase
    .from('elders')
    .select('*')
    .eq('family_contact_id', user.id)

  // Fetch all visit logs for the family's elders
  const elderIds = elders?.map((elder) => elder.id) || []

  const { data: visitLogs } = await supabase
    .from('visit_logs')
    .select(`
      *,
      visits (
        id,
        scheduled_at,
        completed_at,
        status,
        elders (
          id,
          name,
          address
        ),
        service_providers (
          id,
          name,
          specialty
        )
      )
    `)
    .in('visits.elder_id', elderIds.length > 0 ? elderIds : [''])
    .order('timestamp', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Family Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, {familyMember?.name || user.email}
              </p>
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Elders Summary */}
        {elders && elders.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elders.map((elder) => (
              <div
                key={elder.id}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {elder.name?.charAt(0) || 'E'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {elder.name}
                    </h3>
                    <p className="text-sm text-gray-500">{elder.address}</p>
                  </div>
                </div>
                {elder.medical_conditions && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Medical Conditions
                    </p>
                    <p className="text-sm text-gray-700">{elder.medical_conditions}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Visit Logs Timeline */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Visit History</h2>
            <p className="text-sm text-gray-600 mt-1">
              Recent care visits and health updates
            </p>
          </div>

          {visitLogs && visitLogs.length > 0 ? (
            <VisitTimeline visitLogs={visitLogs} />
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No visit logs yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Visit logs will appear here once care providers complete their visits.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
