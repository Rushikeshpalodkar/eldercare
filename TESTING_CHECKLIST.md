# ElderCare Connect - Testing Checklist

## ✅ Completed Setup

### 1. Environment Configuration
- [x] Supabase URL and Anon Key configured
- [x] Twilio credentials configured (Account SID, Auth Token, WhatsApp Number)
- [x] Webhook secret configured
- [x] App URL configured (https://eldercare-livid.vercel.app/)

### 2. Database Schema
- [x] Migration file created: `20260206_create_eldercare_schema.sql`
- [x] Tables created:
  - family_members
  - elders
  - service_providers
  - visits
  - visit_logs
- [x] Row Level Security (RLS) enabled on all tables
- [x] RLS policies created for data access control
- [x] Foreign key relationships established
- [x] Indexes created for performance

### 3. Application Structure
- [x] Next.js 14 with App Router
- [x] TypeScript configuration
- [x] Tailwind CSS setup
- [x] Production build successful

### 4. Authentication
- [x] Supabase Auth integration
- [x] Magic link login page (`/login`)
- [x] Auth callback handler (`/auth/callback`)
- [x] Sign out functionality (`/auth/signout`)
- [x] Route protection middleware

### 5. Components
- [x] VisitLogForm - Mobile-friendly visit logging with:
  - Photo upload (camera/file)
  - Vitals tracking (BP, Sugar, Heart Rate, Temperature)
  - Mood assessment (5 emoji options)
  - Notes field
  - Supabase Storage integration
  - Auto-update visit status to "completed"
- [x] VisitTimeline - Dashboard timeline display
- [x] Family Dashboard page with elder cards

### 6. API Routes
- [x] WhatsApp webhook (`/api/webhooks/visit-completed`)
- [x] Twilio integration for notifications
- [x] Webhook security with secret validation

### 7. Build & Deployment
- [x] Build passes without errors
- [x] All routes compile successfully
- [x] TypeScript types generated from Supabase

---

## 🔧 Manual Testing Required

### 1. **Supabase Storage Bucket** (⚠️ REQUIRED)
Create the storage bucket in Supabase:

**Option A: Via SQL Editor**
\`\`\`sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('visit-logs', 'visit-logs', true);
\`\`\`

**Option B: Via Dashboard**
1. Go to Storage in Supabase Dashboard
2. Create new bucket: "visit-logs"
3. Set as Public
4. Configure RLS policies if needed

### 2. **Supabase Auth Configuration**
In Supabase Dashboard → Authentication → URL Configuration:
- Add redirect URL: `https://eldercare-livid.vercel.app/auth/callback`
- Add redirect URL: `http://localhost:3000/auth/callback` (for local dev)
- Enable Email provider in Authentication → Providers

### 3. **Supabase Webhook Configuration**
In Supabase Dashboard → Database → Webhooks:
- **Table**: visits
- **Events**: UPDATE
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `https://eldercare-livid.vercel.app/api/webhooks/visit-completed`
- **HTTP Headers**:
  - Key: `x-webhook-secret`
  - Value: Your webhook secret from .env

### 4. **Twilio WhatsApp Sandbox**
1. Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message
2. Join the sandbox by sending the code from your WhatsApp
3. Test number format: Must include country code (e.g., +1234567890)

---

## 🧪 End-to-End Testing Flow

### Test 1: Authentication Flow
1. Navigate to `http://localhost:3000` or your deployed URL
2. Click "Sign In"
3. Enter email address
4. Check email for magic link
5. Click magic link → Should redirect to `/dashboard`
6. Verify you see the dashboard with your email
7. Click "Sign Out" → Should redirect to `/login`

### Test 2: Database Setup
1. Log into Supabase Dashboard → SQL Editor
2. Insert test data:

\`\`\`sql
-- Insert a family member (use your auth user ID)
INSERT INTO family_members (id, name, email, phone, whatsapp_number)
VALUES ('YOUR_AUTH_USER_ID', 'John Doe', 'john@example.com', '+1234567890', '+1234567890');

-- Insert an elder
INSERT INTO elders (name, address, medical_conditions, family_contact_id)
VALUES ('Mary Doe', '123 Main St', 'Diabetes, Hypertension', 'YOUR_AUTH_USER_ID');

-- Insert a service provider
INSERT INTO service_providers (name, email, specialty)
VALUES ('Dr. Smith', 'dr.smith@example.com', 'Geriatric Care');

-- Insert a visit (get the elder_id and provider_id from above inserts)
INSERT INTO visits (elder_id, provider_id, scheduled_at, status)
VALUES ('ELDER_ID', 'PROVIDER_ID', NOW(), 'scheduled');
\`\`\`

3. Refresh dashboard → Should see the elder card

### Test 3: Visit Log Form
1. Create a test page to use the VisitLogForm component:

\`\`\`tsx
// app/test-visit-log/page.tsx
'use client'
import VisitLogForm from '@/components/VisitLogForm'

export default function TestPage() {
  return (
    <div className="p-8">
      <VisitLogForm
        visitId="YOUR_VISIT_ID"
        onSuccess={() => alert('Success!')}
        onCancel={() => console.log('Cancelled')}
      />
    </div>
  )
}
\`\`\`

2. Navigate to `/test-visit-log`
3. Fill out the form:
   - Upload a photo (or take one on mobile)
   - Enter vitals (BP: 120/80, Sugar: 100, etc.)
   - Select a mood
   - Add notes
4. Submit → Should create visit_log and update visit status

### Test 4: Dashboard Timeline
1. After submitting a visit log, go to `/dashboard`
2. Should see the visit in the timeline with:
   - Photo (if uploaded)
   - Vitals displayed
   - Mood emoji
   - Provider notes
   - Timestamp

### Test 5: WhatsApp Notification
1. Ensure family member has whatsapp_number in database
2. Ensure Twilio sandbox is joined
3. Submit a visit log
4. Should receive WhatsApp message with:
   - Elder name
   - Provider details
   - Mood
   - Vitals
   - Notes
   - Dashboard link

---

## 📋 Pre-Deployment Checklist

### Vercel Deployment
- [ ] Add all environment variables in Vercel project settings:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - TWILIO_ACCOUNT_SID
  - TWILIO_AUTH_TOKEN
  - TWILIO_WHATSAPP_NUMBER
  - SUPABASE_WEBHOOK_SECRET
  - NEXT_PUBLIC_APP_URL

- [ ] Update NEXT_PUBLIC_APP_URL in .env after deployment
- [ ] Update Supabase webhook URL to production URL
- [ ] Update Supabase Auth redirect URLs to production URL

### Security
- [ ] Never commit .env.local to git (already in .gitignore)
- [ ] Use strong webhook secret
- [ ] Enable RLS on all tables (already done)
- [ ] Test RLS policies work correctly

---

## 🐛 Common Issues & Solutions

### Issue: "Supabase client not found"
**Solution**: Make sure environment variables are set correctly in .env.local

### Issue: "Photo upload fails"
**Solution**: Create the storage bucket "visit-logs" in Supabase

### Issue: "WhatsApp message not received"
**Solution**:
1. Check Twilio credentials
2. Ensure sandbox is joined
3. Verify phone number format (+country code)
4. Check webhook is firing (Supabase Dashboard → Database → Webhooks → Logs)

### Issue: "Build fails on Vercel"
**Solution**:
1. Check all environment variables are set in Vercel
2. Review build logs for specific errors
3. Test build locally first: `npm run build`

### Issue: "Can't access dashboard"
**Solution**:
1. Ensure you're authenticated
2. Check middleware is working
3. Verify auth cookies are being set

---

## 🎯 System Requirements Met

✅ **Database Schema**
- 5 tables with proper relationships
- Row Level Security enabled
- Foreign key constraints
- Timestamps and triggers

✅ **Authentication**
- Magic link email auth
- Route protection
- Secure session management

✅ **Visit Logging**
- Mobile-friendly form
- Photo upload to Supabase Storage
- Vitals tracking (BP, Sugar, HR, Temp)
- Mood assessment
- Provider notes
- Auto-complete visit status

✅ **Family Dashboard**
- Timeline view of visit history
- Elder information cards
- Visit details with photos
- Vitals display
- Mood indicators
- Provider notes

✅ **WhatsApp Notifications**
- Automated on visit completion
- Rich message formatting
- Vitals included
- Dashboard deep link
- Twilio integration

✅ **TypeScript & Types**
- Full type safety
- Generated from Supabase schema
- No type errors in build

---

## 📊 Next Steps

1. **Create Storage Bucket** (if not done)
2. **Configure Supabase Auth URLs**
3. **Set up Supabase Webhook**
4. **Join Twilio WhatsApp Sandbox**
5. **Add test data to database**
6. **Test complete user flow**
7. **Deploy to Vercel**
8. **Test production deployment**

---

**System Status**: ✅ **READY FOR TESTING**

All code is complete and builds successfully. Manual configuration steps above are required before full system testing.
