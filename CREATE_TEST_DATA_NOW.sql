-- =====================================================
-- CREATE TEST DATA - RUN THESE ONE AT A TIME
-- =====================================================

-- STEP 1: Get your user ID (you must be logged in first)
-- Go to http://localhost:3000/login and login with your email
-- Then come back and run this:

SELECT id, email FROM auth.users;
-- 👆 COPY YOUR USER ID (the long string in the 'id' column)

-- =====================================================
-- STEP 2: Insert/Update Family Member
-- Replace YOUR_USER_ID with the ID from Step 1
-- =====================================================

INSERT INTO family_members (id, name, email, phone, whatsapp_number)
VALUES (
  'YOUR_USER_ID',  -- 👈 REPLACE THIS!
  'Your Name',
  'your@email.com',
  '+919096394998',
  '+919096394998'
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  whatsapp_number = EXCLUDED.whatsapp_number
RETURNING *;

-- ✅ Should return 1 row showing your family member data

-- =====================================================
-- STEP 3: Check/Get Service Provider
-- =====================================================

-- First, check if provider exists:
SELECT * FROM service_providers WHERE email = 'dr.sarah@healthcare.com';

-- If it returns a row, COPY THE 'id'
-- If it returns nothing, run this INSERT:

INSERT INTO service_providers (name, email, specialty)
VALUES ('Dr. Sarah Smith', 'dr.sarah@healthcare.com', 'Geriatric Care')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
RETURNING *;

-- 👆 COPY THE 'id' FROM THE RESULT (provider_id)

-- =====================================================
-- STEP 4: Insert Elder
-- Replace YOUR_USER_ID with the same ID from Step 1
-- =====================================================

INSERT INTO elders (name, address, medical_conditions, family_contact_id)
VALUES (
  'Grandma Mary',
  '123 Oak Street, Springfield',
  'Type 2 Diabetes, Hypertension',
  'YOUR_USER_ID'  -- 👈 REPLACE THIS!
)
RETURNING *;

-- 👆 COPY THE 'id' FROM THE RESULT (elder_id)

-- =====================================================
-- STEP 5: Insert Visit
-- Replace ELDER_ID and PROVIDER_ID with IDs from Steps 3 & 4
-- =====================================================

INSERT INTO visits (elder_id, provider_id, scheduled_at, status)
VALUES (
  'ELDER_ID',      -- 👈 From Step 4
  'PROVIDER_ID',   -- 👈 From Step 3
  NOW(),
  'scheduled'
)
RETURNING *;

-- 👆 COPY THE 'id' FROM THE RESULT (visit_id)
-- ⭐ THIS IS IMPORTANT - YOU'LL USE THIS TO TRIGGER WHATSAPP!

-- =====================================================
-- VERIFICATION: Check everything was created
-- =====================================================

SELECT
  'Data Summary' as info,
  (SELECT COUNT(*) FROM family_members) as family_members,
  (SELECT COUNT(*) FROM elders) as elders,
  (SELECT COUNT(*) FROM service_providers) as providers,
  (SELECT COUNT(*) FROM visits) as visits;

-- =====================================================
-- NOW TRIGGER WHATSAPP!
-- Replace YOUR_VISIT_ID with the visit_id from Step 5
-- =====================================================

UPDATE visits
SET status = 'completed', completed_at = NOW()
WHERE id = 'YOUR_VISIT_ID';  -- 👈 REPLACE THIS!

-- ⚡ This will send WhatsApp to:
-- ✅ +919096394998
-- ✅ +19349498516

-- =====================================================
-- CHECK IT WORKED
-- =====================================================

SELECT id, status, completed_at
FROM visits
ORDER BY updated_at DESC
LIMIT 1;

-- Should show status='completed' and completed_at with timestamp
