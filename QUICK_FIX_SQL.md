# 🔧 Quick Fix: Create Test Data Step-by-Step

## Run These SQL Queries ONE AT A TIME in Supabase SQL Editor

### Step 1: Check Your User ID
```sql
-- Login first at http://localhost:3000/login
-- Then run this to get your user ID:
SELECT id, email FROM auth.users;
```
**Copy the `id` value - you'll need it for all steps below**

---

### Step 2: Insert Family Member
```sql
-- Replace YOUR_USER_ID with the ID from Step 1
-- Replace YOUR_PHONE with your actual phone number (e.g., +919876543210)

INSERT INTO family_members (id, name, email, phone, whatsapp_number)
VALUES (
  'YOUR_USER_ID',  -- Replace this
  'Your Name',
  'your@email.com',
  '+919876543210',  -- Replace with your actual phone
  '+919876543210'   -- Same as above
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  whatsapp_number = EXCLUDED.whatsapp_number;

-- Verify it worked:
SELECT * FROM family_members WHERE id = 'YOUR_USER_ID';
```

---

### Step 3: Insert Service Provider (Run This FIRST!)
```sql
-- This creates the service provider
INSERT INTO service_providers (name, email, specialty)
VALUES (
  'Dr. Sarah Smith',
  'dr.sarah@healthcare.com',
  'Geriatric Care Specialist'
)
RETURNING *;

-- ⭐ COPY THE 'id' FROM THE RESULT!
```

**Example result:**
```
id: 8f4d2a9c-b123-4567-89ab-cdef12345678
name: Dr. Sarah Smith
...
```

---

### Step 4: Insert Elder
```sql
-- Replace YOUR_USER_ID with your actual user ID from Step 1
INSERT INTO elders (name, address, medical_conditions, family_contact_id)
VALUES (
  'Grandma Mary',
  '123 Oak Street, Springfield',
  'Type 2 Diabetes, Hypertension',
  'YOUR_USER_ID'  -- Replace this
)
RETURNING *;

-- ⭐ COPY THE 'id' FROM THE RESULT!
```

**Example result:**
```
id: 7a3b1c8d-4567-89ab-cdef-123456789abc
name: Grandma Mary
...
```

---

### Step 5: Insert Visit
```sql
-- Replace ELDER_ID with the id from Step 4
-- Replace PROVIDER_ID with the id from Step 3

INSERT INTO visits (elder_id, provider_id, scheduled_at, status)
VALUES (
  'ELDER_ID_HERE',      -- From Step 4
  'PROVIDER_ID_HERE',   -- From Step 3
  NOW(),
  'scheduled'
)
RETURNING *;

-- ⭐⭐ COPY THE 'id' FROM THE RESULT - THIS IS YOUR visit_id!
```

**Example result:**
```
id: 6b2c9d7e-8901-2345-6789-abcdef123456
elder_id: 7a3b1c8d-4567-89ab-cdef-123456789abc
provider_id: 8f4d2a9c-b123-4567-89ab-cdef12345678
status: scheduled
...
```

---

## ✅ Verify Everything

Run this to check all your data:

```sql
-- Check family member
SELECT 'Family Member:' as type, id, name, whatsapp_number
FROM family_members
WHERE id = 'YOUR_USER_ID';

-- Check elder
SELECT 'Elder:' as type, id, name, family_contact_id
FROM elders
WHERE family_contact_id = 'YOUR_USER_ID';

-- Check service provider
SELECT 'Provider:' as type, id, name, specialty
FROM service_providers
ORDER BY created_at DESC
LIMIT 1;

-- Check visit
SELECT
  'Visit:' as type,
  v.id as visit_id,
  v.status,
  e.name as elder_name,
  sp.name as provider_name
FROM visits v
JOIN elders e ON v.elder_id = e.id
JOIN service_providers sp ON v.provider_id = sp.id
WHERE e.family_contact_id = 'YOUR_USER_ID'
ORDER BY v.created_at DESC
LIMIT 1;
```

---

## 🧪 Now Test!

Once all data is inserted:

1. Go to: **http://localhost:3000/test-visit-log**
2. Paste the **visit_id** from Step 5
3. Fill out the form
4. Submit
5. Check WhatsApp! 📱

---

## 🔍 Alternative: Let Me Check Your Data

If you want, you can run this and share the output (it won't show any sensitive data):

```sql
-- Shows counts of your data
SELECT
  (SELECT COUNT(*) FROM family_members) as family_members_count,
  (SELECT COUNT(*) FROM elders) as elders_count,
  (SELECT COUNT(*) FROM service_providers) as providers_count,
  (SELECT COUNT(*) FROM visits) as visits_count;

-- Shows latest records (no sensitive data)
SELECT 'Latest Provider:' as info, id, name, specialty
FROM service_providers
ORDER BY created_at DESC LIMIT 1;

SELECT 'Latest Elder:' as info, id, name
FROM elders
ORDER BY created_at DESC LIMIT 1;

SELECT 'Latest Visit:' as info, id, status
FROM visits
ORDER BY created_at DESC LIMIT 1;
```
