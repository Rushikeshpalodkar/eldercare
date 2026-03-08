-- =====================================================
-- STEP 1: Get your visit ID
-- =====================================================

SELECT
  id as visit_id,
  status,
  elder_id,
  provider_id,
  scheduled_at,
  '👆 COPY THE visit_id (first column)' as instruction
FROM visits
WHERE elder_id = 'b6390e70-5651-4104-8e4b-d342414af050'
ORDER BY created_at DESC
LIMIT 1;

-- =====================================================
-- STEP 2: Trigger WhatsApp
-- Copy the visit_id from above and replace below
-- =====================================================

UPDATE visits
SET status = 'completed', completed_at = NOW()
WHERE id = 'PASTE_VISIT_ID_HERE';

-- =====================================================
-- STEP 3: Verify it worked
-- =====================================================

SELECT
  id,
  status,
  completed_at,
  CASE
    WHEN status = 'completed' THEN '✅ Status updated - webhook should fire!'
    ELSE '❌ Status not updated'
  END as check
FROM visits
ORDER BY updated_at DESC
LIMIT 1;
