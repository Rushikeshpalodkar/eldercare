# 📱 WhatsApp Notification Testing Guide

## 🎯 Quick Test Your WhatsApp Integration

### Step 1: Test Basic WhatsApp (RIGHT NOW!)

1. **Open this URL:** http://localhost:3000/test-whatsapp

2. **Enter your phone number** with country code:
   - Example: `+91234567890` (if India)
   - Example: `+12345678901` (if USA)
   - Must start with `+` and include country code

3. **Click "Send Test WhatsApp Message"**

4. **Check your WhatsApp** - You should receive:
   ```
   🧪 Test Message from ElderCare Connect

   Hello! This is a test WhatsApp notification.

   If you're seeing this, your WhatsApp integration is working! 🎉
   ...
   ```

### ✅ If you receive the test message:
**Congratulations!** Your Twilio integration is working perfectly. Now you can test the full visit completion flow.

### ❌ If you DON'T receive the test message:

Check these things:

#### 1. Verify Twilio Sandbox is Joined
- Open WhatsApp
- Check if you sent the join message to +14155238886
- You should have received a confirmation like: "You're all set! You've successfully joined the sandbox"

#### 2. Check Phone Number Format
- Must include `+` at the start
- Must include country code
- Example formats:
  - ✅ `+919876543210` (India)
  - ✅ `+12345678901` (USA)
  - ✅ `+447700900000` (UK)
  - ❌ `9876543210` (missing + and country code)
  - ❌ `+1-234-567-8901` (has dashes)

#### 3. Check Twilio Credentials
Check your `.env.local` file has:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

Verify these are correct in your Twilio Console:
- Go to https://console.twilio.com/
- Check Account SID matches
- Check Auth Token matches
- WhatsApp number should be `+14155238886` (sandbox number)

#### 4. Check Browser Console
- Open browser console (F12)
- Look for any error messages
- Check the Network tab for the `/api/test-whatsapp` request

---

## 🧪 Step 2: Test Full Visit Completion Flow

Once the basic WhatsApp test works, test the complete flow:

### A. Add Test Data to Database

Go to Supabase → SQL Editor and run:

```sql
-- 1. Get your auth user ID (login first, then run this)
SELECT id, email FROM auth.users;

-- 2. Insert yourself as family member (replace YOUR_AUTH_USER_ID)
INSERT INTO family_members (id, name, email, phone, whatsapp_number)
VALUES (
  'YOUR_AUTH_USER_ID',  -- Replace with your actual user ID from step 1
  'Your Name',
  'your-email@example.com',
  '+YOUR_PHONE_WITH_COUNTRY_CODE',  -- e.g., +919876543210
  '+YOUR_PHONE_WITH_COUNTRY_CODE'   -- Same as phone
)
ON CONFLICT (id) DO UPDATE
SET whatsapp_number = EXCLUDED.whatsapp_number;

-- 3. Insert an elder
INSERT INTO elders (name, address, medical_conditions, family_contact_id)
VALUES (
  'Grandma Mary',
  '123 Main Street',
  'Diabetes, Hypertension',
  'YOUR_AUTH_USER_ID'  -- Same user ID
)
RETURNING id;  -- Copy this elder_id

-- 4. Insert a service provider
INSERT INTO service_providers (name, email, specialty)
VALUES (
  'Dr. Sarah Smith',
  'dr.sarah@example.com',
  'Geriatric Care'
)
RETURNING id;  -- Copy this provider_id

-- 5. Insert a visit (replace ELDER_ID and PROVIDER_ID)
INSERT INTO visits (elder_id, provider_id, scheduled_at, status)
VALUES (
  'ELDER_ID_FROM_STEP_3',     -- Replace
  'PROVIDER_ID_FROM_STEP_4',  -- Replace
  NOW(),
  'scheduled'
)
RETURNING id;  -- Copy this visit_id for next step
```

### B. Create Test Visit Log Page

Create file: `app/test-visit-log/page.tsx`

```tsx
'use client'
import VisitLogForm from '@/components/VisitLogForm'

export default function TestVisitLogPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <VisitLogForm
        visitId="PASTE_VISIT_ID_HERE"  // From SQL step 5
        onSuccess={() => {
          alert('Visit log created! Check WhatsApp for notification.')
          window.location.href = '/dashboard'
        }}
        onCancel={() => window.location.href = '/dashboard'}
      />
    </div>
  )
}
```

### C. Submit a Visit Log

1. Navigate to: http://localhost:3000/test-visit-log
2. Fill out the form:
   - **Photo**: Take or upload a photo (optional)
   - **Blood Pressure**: 120/80
   - **Blood Sugar**: 110
   - **Heart Rate**: 72
   - **Temperature**: 98.6
   - **Mood**: Select "Good 🙂"
   - **Notes**: "Patient is doing well. All vitals normal."
3. Click "Complete Visit"

### D. Check WhatsApp

You should receive a message like:

```
🏥 *ElderCare Connect - Visit Complete*

*Elder:* Grandma Mary
*Provider:* Dr. Sarah Smith (Geriatric Care)

*Mood:* 🙂 Good

📊 *Vitals:*
• Blood Pressure: 120/80 mmHg
• Blood Sugar: 110 mg/dL
• Heart Rate: 72 bpm
• Temperature: 98.6°F

📝 *Provider Notes:*
Patient is doing well. All vitals normal.

View full details in your dashboard:
https://eldercare-livid.vercel.app/dashboard
```

---

## 🔍 Troubleshooting Visit Completion Notifications

### Issue: Visit log created but NO WhatsApp message

#### Check 1: Is the webhook configured?

Go to Supabase Dashboard → Database → Webhooks

**Should see:**
- Name: Visit Completed Notification
- Table: visits
- Events: UPDATE
- URL: `https://eldercare-livid.vercel.app/api/webhooks/visit-completed`
- Status: Enabled ✓

**If not there:**
Click "Create a new hook" and add:
```
Table: visits
Events: UPDATE
Type: HTTP Request
Method: POST
URL: https://eldercare-livid.vercel.app/api/webhooks/visit-completed
HTTP Headers:
  - Key: x-webhook-secret
  - Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2c3ZxaGt4cGFkanR2em1ma2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzk2MTUsImV4cCI6MjA4NTk1NTYxNX0.aAhS1d1njd5wUnEqDpbnl-pdVPzO9eqvTEG-2oi5Cho
```

#### Check 2: Did the webhook fire?

Go to Supabase Dashboard → Database → Webhooks → Click on your webhook → Logs

**You should see:**
- Request sent
- Response status (200 = success, 500 = error)
- Request/response body

**If status is 401 (Unauthorized):**
- Webhook secret doesn't match
- Check the `x-webhook-secret` header matches your `.env.local`

**If status is 500 (Error):**
- Click on the log to see error details
- Check if WhatsApp number is in correct format
- Check if family member has `whatsapp_number` set in database

#### Check 3: Does family member have WhatsApp number?

Run in Supabase SQL Editor:
```sql
SELECT id, name, email, whatsapp_number
FROM family_members
WHERE id = 'YOUR_AUTH_USER_ID';
```

**Should show:**
- whatsapp_number: `+YOUR_NUMBER` (with +)

**If NULL or missing:**
```sql
UPDATE family_members
SET whatsapp_number = '+YOUR_NUMBER'  -- e.g., +919876543210
WHERE id = 'YOUR_AUTH_USER_ID';
```

#### Check 4: Is the visit status actually "completed"?

Run in Supabase SQL Editor:
```sql
SELECT id, status, completed_at
FROM visits
WHERE id = 'YOUR_VISIT_ID';
```

**Should show:**
- status: `completed`
- completed_at: timestamp (not null)

**If still "scheduled":**
- The visit log form didn't update it
- Check browser console for errors
- Try updating manually:
  ```sql
  UPDATE visits
  SET status = 'completed', completed_at = NOW()
  WHERE id = 'YOUR_VISIT_ID';
  ```

---

## 🎯 Expected Behavior

### When it all works:

1. **You submit the Visit Log Form** →
2. **Visit status changes to "completed"** →
3. **Supabase webhook fires** →
4. **Your API receives the webhook** →
5. **API fetches elder, provider, visit log details** →
6. **API sends WhatsApp via Twilio** →
7. **You receive WhatsApp notification** 🎉

### Webhook Trigger Conditions:

The webhook only fires when:
- ✅ Table is `visits`
- ✅ Event is `UPDATE`
- ✅ New status is `completed`
- ✅ Old status was NOT `completed` (prevents duplicate messages)

---

## 💡 Pro Tips

### Test on Production (Vercel)

Your webhook URL points to production:
`https://eldercare-livid.vercel.app/api/webhooks/visit-completed`

This means:
- ✅ Webhook will work when you submit forms on production
- ⚠️ Won't work for localhost form submissions (webhook can't reach localhost)

**To test locally:**
1. Use the `/test-whatsapp` page (works locally)
2. Or manually trigger the webhook by updating visits in Supabase
3. Or use ngrok to expose localhost to Supabase

### Check Twilio Logs

Go to: https://console.twilio.com/ → Monitor → Logs → Messaging

You'll see:
- All WhatsApp messages sent
- Delivery status
- Error messages if any
- Timestamps

---

## ✅ Quick Checklist

Before testing, verify:

- [ ] Twilio sandbox joined (sent join message to +14155238886)
- [ ] Phone number in correct format (+country code)
- [ ] Twilio credentials correct in .env.local
- [ ] Test WhatsApp works (http://localhost:3000/test-whatsapp)
- [ ] Test data added to database
- [ ] Family member has whatsapp_number set
- [ ] Webhook configured in Supabase
- [ ] Webhook URL points to production (eldercare-livid.vercel.app)

---

## 📞 Still Not Working?

1. **Start with the basic test**: http://localhost:3000/test-whatsapp
   - If this doesn't work, fix Twilio setup first
   - If this works, problem is with webhook/database

2. **Check webhook logs** in Supabase
   - See if webhook is firing
   - Check for error messages

3. **Check Twilio logs**
   - See if messages are being sent
   - Check delivery status

4. **Verify data in database**
   - Family member has correct whatsapp_number
   - Visit status is actually "completed"

5. **Check browser/server console**
   - Look for error messages
   - Network tab for API calls

---

**Start here:** http://localhost:3000/test-whatsapp

Enter your number and see if you get the test message! 🚀
