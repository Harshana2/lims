# Backend Update Guide: Environmental Sampling Support

## Overview
This guide shows you how to update the Spring Boot backend to support the new `environmentalData` field in the CRF entity. This field stores GPS coordinates, field measurements, and photos from environmental sampling activities.

## 1. Update CRF Entity (Java)

**File**: `src/main/java/com/lims/entity/CRF.java`

Add the new field to your CRF entity:

```java
@Entity
@Table(name = "crf")
public class CRF {
    // ...existing fields...
    
    @Column(name = "sampling_type", length = 100)
    private String samplingType;
    
    // NEW FIELD - Add this
    @Column(name = "environmental_data", columnDefinition = "TEXT")
    private String environmentalData;  // JSON string containing GPS, measurements, photos
    
    // ...rest of fields...
    
    // Add getter and setter
    public String getEnvironmentalData() {
        return environmentalData;
    }
    
    public void setEnvironmentalData(String environmentalData) {
        this.environmentalData = environmentalData;
    }
}
```

## 2. Database Migration (SQL)

**Option A: If using Flyway or Liquibase**

Create a new migration file: `V4__add_environmental_data_to_crf.sql`

```sql
-- Add environmental_data column to CRF table
ALTER TABLE crf 
ADD COLUMN environmental_data TEXT;

-- Add comment for documentation
COMMENT ON COLUMN crf.environmental_data IS 'JSON data containing GPS coordinates, field measurements, and photos from environmental sampling';
```

**Option B: Manual SQL (PostgreSQL)**

Run this directly in your PostgreSQL database:

```sql
-- Connect to your LIMS database
ALTER TABLE crf 
ADD COLUMN environmental_data TEXT;

-- Verify the column was added
\d crf
```

## 3. Update DTO (if you're using DTOs)

**File**: `src/main/java/com/lims/dto/CRFRequest.java` or `CRFDTO.java`

```java
public class CRFRequest {
    // ...existing fields...
    
    private String samplingType;
    private String environmentalData;  // NEW
    
    // Add getter/setter
    public String getEnvironmentalData() {
        return environmentalData;
    }
    
    public void setEnvironmentalData(String environmentalData) {
        this.environmentalData = environmentalData;
    }
}
```

## 4. Verify Repository (No changes needed)

Your existing CRFRepository should automatically work with the new field:

```java
@Repository
public interface CRFRepository extends JpaRepository<CRF, Long> {
    // No changes needed - JPA automatically handles new fields
}
```

## 5. Test the Implementation

### Create a Test Environmental CRF

**POST** `http://localhost:8080/api/crf`

```json
{
  "crfType": "ENV",
  "customer": "Environmental Protection Agency",
  "address": "Colombo Water Treatment Plant",
  "contact": "Dr. Silva",
  "email": "silva@epa.gov.lk",
  "sampleType": "Water Quality",
  "samplingType": "Grab Sample",
  "numberOfSamples": 3,
  "testParameters": ["pH", "Temperature", "Dissolved Oxygen", "BOD", "COD"],
  "receptionDate": "2026-02-27",
  "receivedBy": "Lab Tech 1",
  "priority": "High",
  "status": "created",
  "environmentalData": "{\"gpsCoordinates\":[{\"latitude\":6.927079,\"longitude\":79.861244,\"accuracy\":10,\"timestamp\":\"2026-02-27T10:30:00Z\"}],\"fieldMeasurements\":[{\"parameter\":\"Temperature\",\"value\":\"28.5\",\"unit\":\"°C\",\"timestamp\":\"2026-02-27T10:30:00Z\"},{\"parameter\":\"pH\",\"value\":\"7.2\",\"unit\":\"\",\"timestamp\":\"2026-02-27T10:31:00Z\"}],\"photos\":[],\"weatherConditions\":\"Sunny, 30°C\",\"samplingNotes\":\"Water sample collected from intake point 1\"}"
}
```

### Retrieve and Verify

**GET** `http://localhost:8080/api/crf/{id}`

Response should include:
```json
{
  "id": 1,
  "crfId": "ENV-2026-001",
  "crfType": "ENV",
  "environmentalData": "{\"gpsCoordinates\":[...],\"fieldMeasurements\":[...]}",
  // ...other fields...
}
```

## 6. Environmental Data JSON Structure

The `environmentalData` field stores a JSON string with this structure:

```json
{
  "gpsCoordinates": [
    {
      "latitude": 6.927079,
      "longitude": 79.861244,
      "accuracy": 10,
      "timestamp": "2026-02-27T10:30:00Z"
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
  "weatherConditions": "Sunny, 30°C, Light breeze",
  "samplingNotes": "Water sample collected from intake point 1. Surface water flowing normally."
}
```

## 7. Optional: Create Helper Service (Advanced)

If you want to parse and query environmental data, create a service:

**File**: `src/main/java/com/lims/service/EnvironmentalDataService.java`

```java
@Service
public class EnvironmentalDataService {
    
    @Autowired
    private ObjectMapper objectMapper;
    
    public JsonNode parseEnvironmentalData(String environmentalDataJson) {
        try {
            return objectMapper.readTree(environmentalDataJson);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error parsing environmental data", e);
        }
    }
    
    public List<GPSCoordinate> extractGPSCoordinates(String environmentalDataJson) {
        JsonNode data = parseEnvironmentalData(environmentalDataJson);
        JsonNode coords = data.get("gpsCoordinates");
        
        if (coords == null || !coords.isArray()) {
            return Collections.emptyList();
        }
        
        List<GPSCoordinate> result = new ArrayList<>();
        for (JsonNode coord : coords) {
            GPSCoordinate gps = new GPSCoordinate();
            gps.setLatitude(coord.get("latitude").asDouble());
            gps.setLongitude(coord.get("longitude").asDouble());
            gps.setTimestamp(coord.get("timestamp").asText());
            result.add(gps);
        }
        return result;
    }
}
```

## 8. Verification Checklist

- [ ] Database column `environmental_data` added to `crf` table
- [ ] CRF entity updated with new field and getter/setter
- [ ] Application compiles without errors
- [ ] Test POST request creates CRF with environmental data
- [ ] Test GET request returns environmental data correctly
- [ ] Frontend can create environmental CRF successfully
- [ ] Frontend table shows GPS points and photos count

## 9. Rollback Plan (if needed)

If you need to rollback the changes:

```sql
-- Remove the column
ALTER TABLE crf DROP COLUMN environmental_data;
```

## 10. Additional Enhancements (Optional)

### PostgreSQL JSONB Support
For better JSON querying, use JSONB instead of TEXT:

```java
@Column(name = "environmental_data", columnDefinition = "jsonb")
@Type(type = "jsonb")
private String environmentalData;
```

SQL:
```sql
ALTER TABLE crf 
ADD COLUMN environmental_data JSONB;

-- Create index for faster JSON queries
CREATE INDEX idx_crf_environmental_data_gin 
ON crf USING gin (environmental_data);
```

### Query Examples with JSONB
```sql
-- Find CRFs with GPS coordinates
SELECT * FROM crf 
WHERE environmental_data->'gpsCoordinates' IS NOT NULL;

-- Find CRFs with temperature measurements
SELECT * FROM crf 
WHERE environmental_data @> '{"fieldMeasurements": [{"parameter": "Temperature"}]}';

-- Extract GPS coordinates
SELECT 
    crfId,
    jsonb_array_elements(environmental_data->'gpsCoordinates') as gps_point
FROM crf
WHERE crfType = 'ENV';
```

## Support

If you encounter any issues:
1. Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-*.log`
2. Check Spring Boot logs for entity mapping errors
3. Verify JSON structure with: `SELECT environmental_data FROM crf WHERE id = 1;`
4. Test JSON parsing: `SELECT environmental_data::jsonb FROM crf WHERE id = 1;`

---

**Last Updated**: February 27, 2026  
**Version**: 1.0  
**Status**: Ready for Implementation
