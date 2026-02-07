-- =====================================================
-- ELDERCARE CONNECT - SIMPLE SETUP
-- Run these queries ONE AT A TIME in Supabase SQL Editor
-- =====================================================

-- STEP 1: Get your User ID (you must be logged in first)
-- Copy the 'id' value from the result
SELECT id, email FROM auth.users;


-- STEP 2: Check if service provider already exists
SELECT * FROM service_providers WHERE email = 'dr.sarah@healthcare.com';
-- If it returns a row, COPY THE 'id' - you'll need it for Step 5
-- If it returns nothing, run the INSERT below:

INSERT INTO service_providers (name, email, specialty)
VALUES ('Dr. Sarah Smith', 'dr.sarah@healthcare.com', 'Geriatric Care')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
RETURNING *;
-- COPY THE 'id' from the result


-- STEP 3: Insert/Update yourself as family member
-- Replace YOUR_USER_ID with the id from Step 1
INSERT INTO family_members (id, name, email, phone, whatsapp_number)
VALUES (
  'YOUR_USER_ID',  -- Replace with your user ID from Step 1
  'Your Name',
  'your@email.com',
  '+919096394998',  -- Your phone number
  '+919096394998'   -- Same number
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  whatsapp_number = EXCLUDED.whatsapp_number
RETURNING *;


-- STEP 4: Insert elder
-- Replace YOUR_USER_ID with the same user ID from Step 1
INSERT INTO elders (name, address, medical_conditions, family_contact_id)
VALUES (
  'Grandma Mary',
  '123 Oak Street, Springfield',
  'Type 2 Diabetes, Hypertension',
  'YOUR_USER_ID'  -- Replace with your user ID
)
RETURNING *;
-- COPY THE 'id' from the result - this is your elder_id


-- STEP 5: Insert visit
-- Replace ELDER_ID with the id from Step 4
-- Replace PROVIDER_ID with the id from Step 2
INSERT INTO visits (elder_id, provider_id, scheduled_at, status)
VALUES (
  'ELDER_ID',      -- From Step 4
  'PROVIDER_ID',   -- From Step 2
  NOW(),
  'scheduled'
)
RETURNING *;
-- ⭐ COPY THE 'id' - THIS IS YOUR visit_id for testing!


-- =====================================================
-- VERIFICATION QUERIES
-- Run these to check everything is set up correctly
-- =====================================================

-- Check your data
SELECT
  'Family' as type,
  fm.id,
  fm.name,
  fm.whatsapp_number
FROM family_members fm
UNION ALL
SELECT
  'Elder' as type,
  e.id,
  e.name,
  e.family_contact_id
FROM elders e
UNION ALL
SELECT
  'Provider' as type,
  sp.id,
  sp.name,
  sp.email
FROM service_providers sp
UNION ALL
SELECT
  'Visit' as type,
  v.id,
  v.status,
  v.elder_id
FROM visits v
ORDER BY type;


-- =====================================================
-- MANUAL TEST: Trigger WhatsApp Notification
-- Use this to manually test the webhook without the form
-- Replace VISIT_ID with your visit_id from Step 5
-- =====================================================

UPDATE visits
SET
  status = 'completed',
  completed_at = NOW()
WHERE id = 'VISIT_ID';  -- Replace with your visit_id

-- After running this, you should receive WhatsApp messages
-- on both +919096394998 and +19349498516
