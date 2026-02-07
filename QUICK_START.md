# 🚀 QUICK START - Get WhatsApp Message in 5 Minutes!

## **You Need to Add Test Data First**

The "No rows returned" means you don't have a visit in the database yet. Let's fix that!

---

## **📝 Follow These Steps in Order:**

### **STEP 1: Login to Your App**

1. Go to: **http://localhost:3000/login**
2. Enter your email
3. Check your email and click the magic link
4. You should be redirected to the dashboard

---

### **STEP 2: Get Your User ID**

1. Go to **Supabase Dashboard**
2. Click **Authentication** in the left sidebar
3. Click **Users**
4. Find your email in the list
5. **COPY the User UID** (long string like `abc123...`)

**Alternative:** Run this in SQL Editor:
```sql
SELECT id, email FROM auth.users;
```

---

### **STEP 3: Run This Complete Setup**

Open **Supabase SQL Editor** and run this **ALL AT ONCE**:

**⚠️ IMPORTANT: Replace `YOUR_USER_ID` with your actual user ID from Step 2!**

```sql
-- Insert yourself as family member
INSERT INTO family_members (id, name, email, phone, whatsapp_number)
VALUES (
  'YOUR_USER_ID',  -- 👈 CHANGE THIS!
  'Test User',
  'your@email.com',
  '+919096394998',
  '+919096394998'
)
ON CONFLICT (id) DO UPDATE SET whatsapp_number = '+919096394998';

-- Create provider (or get existing)
INSERT INTO service_providers (name, email, specialty)
VALUES ('Dr. Smith', 'dr.smith@test.com', 'Geriatric Care')
ON CONFLICT (email) DO UPDATE SET name = 'Dr. Smith'
RETURNING id;

-- Create elder
INSERT INTO elders (name, address, medical_conditions, family_contact_id)
SELECT
  'Grandma Test',
  '123 Test St',
  'Diabetes',
  'YOUR_USER_ID'  -- 👈 CHANGE THIS!
WHERE EXISTS (SELECT 1 FROM family_members WHERE id = 'YOUR_USER_ID')
RETURNING id;

-- Create visit
INSERT INTO visits (elder_id, provider_id, scheduled_at, status)
SELECT
  (SELECT id FROM elders WHERE family_contact_id = 'YOUR_USER_ID' LIMIT 1),
  (SELECT id FROM service_providers WHERE email = 'dr.smith@test.com' LIMIT 1),
  NOW(),
  'scheduled'
WHERE EXISTS (
  SELECT 1 FROM elders WHERE family_contact_id = 'YOUR_USER_ID'
)
RETURNING *;
```

**COPY THE `id` from the last result - that's your visit_id!**

---

### **STEP 4: Verify Webhook is Configured**

Go to **Supabase → Database → Webhooks**

**Check if you have a webhook with:**
- Table: `visits`
- Events: UPDATE ✓
- URL: `https://eldercare-livid.vercel.app/api/notify`

**If NO webhook exists:**

Click **"Create a new hook"** with:
```
Name: Visit Notification
Table: visits
Events: ✓ UPDATE (ONLY UPDATE, uncheck INSERT/DELETE)
Type: HTTP Request
Method: POST
URL: https://eldercare-livid.vercel.app/api/notify

HTTP Headers:
  Key: x-webhook-secret
  Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2c3ZxaGt4cGFkanR2em1ma2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzk2MTUsImV4cCI6MjA4NTk1NTYxNX0.aAhS1d1njd5wUnEqDpbnl-pdVPzO9eqvTEG-2oi5Cho
```

Click **"Create webhook"**

---

### **STEP 5: Send WhatsApp! 🚀**

Now run this in **Supabase SQL Editor**:

```sql
-- Replace YOUR_VISIT_ID with the visit_id from Step 3
UPDATE visits
SET status = 'completed', completed_at = NOW()
WHERE id = 'YOUR_VISIT_ID';
```

**Within 10 seconds, check WhatsApp on:**
- ✅ +919096394998
- ✅ +19349498516

---

## **🔍 Debug if No WhatsApp:**

### Check 1: Visit updated?
```sql
SELECT id, status, completed_at FROM visits ORDER BY updated_at DESC LIMIT 1;
```
Should show `status = 'completed'`

### Check 2: Webhook fired?
- Supabase → Database → Webhooks → Click webhook → **Logs**
- Should see POST request with status 200

### Check 3: Twilio logs
- https://console.twilio.com/ → Monitor → Logs → Messaging
- Look for WhatsApp messages

---

## **📱 Alternative: Use the Test Page**

If SQL is confusing, use the UI:

1. After creating data (Step 3), go to: **http://localhost:3000/test-visit-log**
2. Paste your visit_id
3. Fill out the form
4. Click "Complete Visit"
5. Check WhatsApp!

---

## **Need Help?**

Run this to see your current data:

```sql
SELECT
  (SELECT COUNT(*) FROM auth.users) as users,
  (SELECT COUNT(*) FROM family_members) as family,
  (SELECT COUNT(*) FROM elders) as elders,
  (SELECT COUNT(*) FROM service_providers) as providers,
  (SELECT COUNT(*) FROM visits) as visits;
```

**Expected:**
- users: 1+ (your login)
- family: 1+ (your family member)
- elders: 1+
- providers: 1+
- visits: 1+

If any are 0, you need to run Step 3 again!

---

**🎯 Start with STEP 1 - Login to the app!**
