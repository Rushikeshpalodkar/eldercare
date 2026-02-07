-- =====================================================
-- TRIGGER WHATSAPP MESSAGE - COPY AND RUN THIS!
-- =====================================================

-- STEP 1: Find your most recent visit
SELECT
  v.id as visit_id,
  v.status,
  v.created_at,
  e.name as elder_name,
  sp.name as provider_name,
  '👆 COPY THIS visit_id' as instruction
FROM visits v
JOIN elders e ON v.elder_id = e.id
JOIN service_providers sp ON v.provider_id = sp.id
ORDER BY v.created_at DESC
LIMIT 1;

-- =====================================================
-- STEP 2: Copy the visit_id from above, then run below
-- Replace YOUR_VISIT_ID with the actual ID
-- =====================================================

UPDATE visits
SET
  status = 'completed',
  completed_at = NOW()
WHERE id = 'YOUR_VISIT_ID';  -- 👈 REPLACE THIS!

-- ⚡ This will trigger WhatsApp to:
-- ✅ +919096394998
-- ✅ +19349498516

-- =====================================================
-- VERIFICATION: Check if it worked
-- =====================================================

-- Check the visit was updated
SELECT
  id,
  status,
  completed_at,
  '✅ Should show status=completed' as check
FROM visits
ORDER BY updated_at DESC
LIMIT 1;

-- Check webhook logs in Supabase Dashboard:
-- Database → Webhooks → Your webhook → Logs tab
-- Should show a POST request with status 200

-- =====================================================
-- RESET FOR TESTING AGAIN
-- If you want to test multiple times, reset the visit:
-- =====================================================

UPDATE visits
SET
  status = 'scheduled',
  completed_at = NULL
WHERE id = 'YOUR_VISIT_ID';  -- Same visit_id

-- Now you can run STEP 2 again to trigger another message!
