import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Sign out
  await supabase.auth.signOut()

  // Redirect to login
  return NextResponse.redirect(new URL('/login', request.url))
}
