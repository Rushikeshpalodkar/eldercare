# 📱 Send WhatsApp Message RIGHT NOW!

## 🎯 Quick Test - 3 Steps

### Step 1: Find Your Visit ID

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
SELECT
  v.id as visit_id,
  v.status,
  e.name as elder_name,
  sp.name as provider_name
FROM visits v
JOIN elders e ON v.elder_id = e.id
JOIN service_providers sp ON v.provider_id = sp.id
ORDER BY v.created_at DESC
LIMIT 1;
```

**Copy the `visit_id`** from the result.

---

### Step 2: Check Webhook is Configured

Go to **Supabase Dashboard → Database → Webhooks**

**Verify you have a webhook with:**
- ✅ Table: `visits`
- ✅ Events: UPDATE
- ✅ URL: `https://eldercare-livid.vercel.app/api/notify`
- ✅ Header: `x-webhook-secret` with your secret
- ✅ Status: Enabled

**If NOT configured**, click "Create a new hook" and add:
- **Name**: Visit Completed Notification
- **Table**: `visits`
- **Events**: Check ✅ UPDATE only
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `https://eldercare-livid.vercel.app/api/notify`
- **HTTP Headers**:
  - Key: `x-webhook-secret`
  - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2c3ZxaGt4cGFkanR2em1ma2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzk2MTUsImV4cCI6MjA4NTk1NTYxNX0.aAhS1d1njd5wUnEqDpbnl-pdVPzO9eqvTEG-2oi5Cho`

---

### Step 3: Trigger the WhatsApp Message! 🚀

Go back to **Supabase SQL Editor** and run:

```sql
-- Replace YOUR_VISIT_ID with the visit_id from Step 1
UPDATE visits
SET
  status = 'completed',
  completed_at = NOW()
WHERE id = 'YOUR_VISIT_ID';
```

**Expected Result:**
- ✅ Query runs successfully (1 row updated)
- ✅ WhatsApp messages sent to BOTH numbers:
  - +919096394998
  - +19349498516

---

## 📱 What the WhatsApp Message Will Say:

```
🏥 *ElderCare Connect - Visit Complete*

*Elder ID:* [your-elder-id]

*Mood:* 😐 Not recorded

📝 *Notes:*
No notes provided

View full details in your dashboard:
https://eldercare-livid.vercel.app/dashboard

_This is a test notification_
```

---

## 🔍 Troubleshooting

### If you don't receive WhatsApp:

#### 1. Check if the visit was updated
```sql
SELECT id, status, completed_at
FROM visits
ORDER BY created_at DESC
LIMIT 1;
```
- Should show `status: 'completed'` and `completed_at` with a timestamp

#### 2. Check webhook logs
- Go to **Supabase Dashboard → Database → Webhooks**
- Click on your webhook
- Click **"Logs"** tab
- Look for recent requests

**What to check:**
- ✅ **Status 200** = Success! Check Twilio logs
- ❌ **Status 401** = Wrong webhook secret
- ❌ **Status 500** = Server error, check Vercel logs
- ❌ **No log** = Webhook not configured or didn't fire

#### 3. Check Vercel logs (if webhook fired but no message)
- Go to https://vercel.com/
- Click on your project
- Go to "Deployments" → Latest deployment → "Functions"
- Click on `/api/notify` to see logs

#### 4. Check Twilio logs
- Go to https://console.twilio.com/
- Monitor → Logs → Messaging
- Look for recent WhatsApp messages
- Check delivery status

---

## ✅ Quick Verification Checklist

Before running Step 3, make sure:

- [ ] You have a visit in the database (Step 1 returned a result)
- [ ] Webhook is configured in Supabase (Step 2)
- [ ] Webhook URL points to `https://eldercare-livid.vercel.app/api/notify`
- [ ] Webhook secret matches your .env.local
- [ ] Vercel deployment is live and successful
- [ ] You've joined Twilio WhatsApp sandbox

---

## 🎯 Alternative: Test with Form

If you prefer to use the UI:

1. Go to: **http://localhost:3000/test-visit-log**
2. Enter your visit_id
3. Fill out the form with test data
4. Click "Complete Visit"
5. Check WhatsApp!

**Note:** This uses localhost, so it will create a visit_log but the webhook will point to production (Vercel).

---

## 📞 Expected Timeline

When you run the UPDATE query:

1. **Instant** - Visit status changes in database
2. **1-2 seconds** - Webhook fires to Vercel
3. **2-3 seconds** - Vercel processes and calls Twilio
4. **3-5 seconds** - WhatsApp messages sent
5. **5-10 seconds** - Messages delivered to your phone

**Total time:** About 10 seconds from running the SQL to receiving WhatsApp! ⚡

---

## 🚀 Ready?

Run Step 1 to get your visit_id, then Step 3 to send the WhatsApp! 📱
