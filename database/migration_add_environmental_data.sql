-- ============================================================================
-- LIMS Database Migration: Add Environmental Sampling Support
-- ============================================================================
-- Description: Adds environmental_data column to CRF table for storing
--              GPS coordinates, field measurements, and photos from
--              environmental sampling activities
-- Author: LIMS Development Team
-- Date: February 27, 2026
-- Version: 1.0
-- ============================================================================

-- Start transaction for safety
BEGIN;

-- ============================================================================
-- SECTION 1: Add environmental_data column to CRFS table
-- ============================================================================

-- Add TEXT column (use this for basic JSON storage)
ALTER TABLE crfs 
ADD COLUMN IF NOT EXISTS environmental_data TEXT;

-- Add column comment for documentation
COMMENT ON COLUMN crfs.environmental_data IS 
'JSON string containing environmental sampling metadata: GPS coordinates, field measurements, photos, weather conditions, and sampling notes';

-- ============================================================================
-- SECTION 2: (OPTIONAL) Upgrade to JSONB for better performance
-- ============================================================================
-- Uncomment the following lines if you want to use JSONB instead of TEXT
-- JSONB provides better query performance and native JSON operations

-- -- Alter column type to JSONB
-- ALTER TABLE crfs 
-- ALTER COLUMN environmental_data TYPE JSONB USING environmental_data::jsonb;

-- -- Create GIN index for faster JSON queries
-- CREATE INDEX IF NOT EXISTS idx_crfs_environmental_data_gin 
-- ON crfs USING gin (environmental_data);

-- -- Add specific indexes for common queries
-- CREATE INDEX IF NOT EXISTS idx_crfs_has_gps 
-- ON crfs ((environmental_data->'gpsCoordinates')) 
-- WHERE environmental_data IS NOT NULL;

-- CREATE INDEX IF NOT EXISTS idx_crfs_has_photos 
-- ON crfs ((environmental_data->'photos')) 
-- WHERE environmental_data IS NOT NULL;

-- ============================================================================
-- SECTION 3: Verify the changes
-- ============================================================================

-- Display table structure (use this query instead of \d crfs)
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'crfs' 
  AND column_name = 'environmental_data';

-- Show sample of data (should show NULL for existing records)
SELECT 
    id,
    crf_id,
    crf_type,
    sample_type,
    sampling_type,
    environmental_data,
    created_at
FROM crfs 
ORDER BY created_at DESC 
LIMIT 5;

-- ============================================================================
-- SECTION 4: Sample environmental data structure (for reference)
-- ============================================================================

-- Example of what environmental_data will contain:
/*
{
  "gpsCoordinates": [
    {
      "latitude": 6.927079,
      "longitude": 79.861244,
      "accuracy": 10,
      "timestamp": "2026-02-27T10:30:00Z"
    },
    {
      "latitude": 6.928015,
      "longitude": 79.862311,
      "accuracy": 12,
      "timestamp": "2026-02-27T11:15:00Z"
    }
  ],
  "fieldMeasurements": [
    {
      "parameter": "Temperature",
      "value": "28.5",
      "unit": "°C",
      "timestamp": "2026-02-27T10:30:00Z"
    },
    {
      "parameter": "pH",
      "value": "7.2",
      "unit": "",
      "timestamp": "2026-02-27T10:31:00Z"
    },
    {
      "parameter": "Dissolved Oxygen",
      "value": "6.5",
      "unit": "mg/L",
      "timestamp": "2026-02-27T10:32:00Z"
    }
  ],
  "photos": [
    {
      "id": "1709030400000",
      "dataUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "description": "Photo taken at 2/27/2026, 10:30:00 AM",
      "timestamp": "2026-02-27T10:30:00Z"
    }
  ],
  "weatherConditions": "Sunny, 30°C, Light breeze from northeast",
  "samplingNotes": "Water sample collected from intake point 1. Surface water flowing normally. No visible contamination. Turbidity appears normal."
}
*/

-- ============================================================================
-- SECTION 5: Insert test data (optional - for testing)
-- ============================================================================

-- Uncomment to insert a test environmental CRF
/*
INSERT INTO crfs (
    crf_id,
    crf_type,
    customer,
    address,
    contact,
    email,
    sample_type,
    sampling_type,
    number_of_samples,
    test_parameters,
    reception_date,
    received_by,
    priority,
    status,
    environmental_data,
    created_at,
    updated_at
) VALUES (
    'ENV-2026-001',
    'ENV',
    'Environmental Protection Agency',
    'Colombo Water Treatment Plant, Sapugaskanda',
    'Dr. Silva',
    'silva@epa.gov.lk',
    'Water Quality',
    'Grab Sample',
    3,
    ARRAY['pH', 'Temperature', 'Dissolved Oxygen', 'BOD', 'COD', 'TSS', 'TDS'],
    CURRENT_DATE,
    'Lab Tech 1',
    'High',
    'created',
    '{
        "gpsCoordinates": [
            {
                "latitude": 6.927079,
                "longitude": 79.861244,
                "accuracy": 10,
                "timestamp": "2026-02-27T10:30:00Z"
            },
            {
                "latitude": 6.928015,
                "longitude": 79.862311,
                "accuracy": 12,
                "timestamp": "2026-02-27T11:15:00Z"
            }
        ],
        "fieldMeasurements": [
            {
                "parameter": "Temperature",
                "value": "28.5",
                "unit": "°C",
                "timestamp": "2026-02-27T10:30:00Z"
            },
            {
                "parameter": "pH",
                "value": "7.2",
                "unit": "",
                "timestamp": "2026-02-27T10:31:00Z"
            },
            {
                "parameter": "Dissolved Oxygen",
                "value": "6.5",
                "unit": "mg/L",
                "timestamp": "2026-02-27T10:32:00Z"
            }
        ],
        "photos": [],
        "weatherConditions": "Sunny, 30°C, Light breeze",
        "samplingNotes": "Water sample collected from intake point 1. Surface water flowing normally."
    }',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
*/

-- ============================================================================
-- SECTION 6: Useful queries for environmental data
-- ============================================================================

-- Query 1: Find all environmental CRFs
-- SELECT * FROM crfs WHERE crf_type = 'ENV' ORDER BY created_at DESC;

-- Query 2: Find CRFs with GPS coordinates (TEXT version)
-- SELECT crf_id, customer, sample_type, environmental_data 
-- FROM crfs 
-- WHERE environmental_data IS NOT NULL 
--   AND environmental_data LIKE '%gpsCoordinates%';

-- Query 3: Count environmental CRFs by sample type
-- SELECT sample_type, COUNT(*) as count
-- FROM crfs
-- WHERE crf_type = 'ENV'
-- GROUP BY sample_type
-- ORDER BY count DESC;

-- ============================================================================
-- SECTION 7: (JSONB ONLY) Advanced queries if using JSONB
-- ============================================================================

-- Uncomment these if you converted to JSONB:

-- Query 4: Find CRFs with GPS coordinates (JSONB version)
-- SELECT 
--     crf_id,
--     customer,
--     sample_type,
--     jsonb_array_length(environmental_data->'gpsCoordinates') as gps_point_count,
--     jsonb_array_length(environmental_data->'fieldMeasurements') as measurement_count,
--     jsonb_array_length(environmental_data->'photos') as photo_count
-- FROM crfs
-- WHERE environmental_data->'gpsCoordinates' IS NOT NULL;

-- Query 5: Extract all GPS coordinates
-- SELECT 
--     crf_id,
--     customer,
--     gps->>'latitude' as latitude,
--     gps->>'longitude' as longitude,
--     gps->>'timestamp' as timestamp
-- FROM crfs,
--      jsonb_array_elements(environmental_data->'gpsCoordinates') as gps
-- WHERE environmental_data IS NOT NULL;

-- Query 6: Find CRFs with specific field measurements
-- SELECT 
--     crf_id,
--     customer,
--     measurement->>'parameter' as parameter,
--     measurement->>'value' as value,
--     measurement->>'unit' as unit
-- FROM crfs,
--      jsonb_array_elements(environmental_data->'fieldMeasurements') as measurement
-- WHERE measurement->>'parameter' = 'Temperature';

-- Query 7: Find CRFs within a geographic area (lat/lng bounds)
-- SELECT DISTINCT crf_id, customer, sample_type
-- FROM crfs,
--      jsonb_array_elements(environmental_data->'gpsCoordinates') as gps
-- WHERE (gps->>'latitude')::numeric BETWEEN 6.90 AND 6.95
--   AND (gps->>'longitude')::numeric BETWEEN 79.85 AND 79.90;

-- Query 8: Find CRFs with photos
-- SELECT crf_id, customer, sample_type,
--        jsonb_array_length(environmental_data->'photos') as photo_count
-- FROM crfs
-- WHERE environmental_data->'photos' IS NOT NULL
--   AND jsonb_array_length(environmental_data->'photos') > 0;

-- ============================================================================
-- SECTION 8: Performance optimization views (optional)
-- ============================================================================

-- Create a view for easy environmental data access
CREATE OR REPLACE VIEW v_environmental_crfs AS
SELECT 
    c.id,
    c.crf_id,
    c.crf_type,
    c.customer,
    c.address,
    c.contact,
    c.email,
    c.sample_type,
    c.sampling_type,
    c.number_of_samples,
    c.test_parameters,
    c.reception_date,
    c.priority,
    c.status,
    c.environmental_data,
    c.created_at,
    c.updated_at,
    -- Add computed columns for easier querying (TEXT version)
    CASE 
        WHEN c.environmental_data IS NOT NULL 
        THEN (c.environmental_data::text LIKE '%gpsCoordinates%')
        ELSE false 
    END as has_gps_data,
    CASE 
        WHEN c.environmental_data IS NOT NULL 
        THEN (c.environmental_data::text LIKE '%photos%')
        ELSE false 
    END as has_photos
FROM crfs c
WHERE c.crf_type = 'ENV' OR c.environmental_data IS NOT NULL;

-- Add comment to view
COMMENT ON VIEW v_environmental_crfs IS 
'View providing easy access to environmental sampling CRFs with additional computed columns';

-- ============================================================================
-- SECTION 9: Commit or rollback
-- ============================================================================

-- Review changes before committing
SELECT 'Migration completed successfully!' as status;
SELECT 'Column environmental_data added to crfs table' as message;

-- Commit the transaction
COMMIT;

-- To rollback instead (if needed), uncomment:
-- ROLLBACK;

-- ============================================================================
-- SECTION 10: Rollback script (save this separately if needed)
-- ============================================================================
/*
-- Run this script if you need to undo the migration:

BEGIN;

-- Drop view
DROP VIEW IF EXISTS v_environmental_crfs;

-- Drop indexes (if created)
DROP INDEX IF EXISTS idx_crfs_environmental_data_gin;
DROP INDEX IF EXISTS idx_crfs_has_gps;
DROP INDEX IF EXISTS idx_crfs_has_photos;

-- Remove column
ALTER TABLE crfs DROP COLUMN IF EXISTS environmental_data;

COMMIT;
*/

-- ============================================================================
-- END OF MIGRATION SCRIPT
-- ============================================================================
