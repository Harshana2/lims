# Environmental Sampling Module - User Guide

## Overview
The Environmental Sampling module in LIMS allows field officers to collect GPS-tagged environmental samples with real-time measurements and photo documentation.

## Features

### 1. **GPS Location Mapping**
- Interactive map with clickable markers
- Multiple map views (Standard/Satellite)
- Click on map to add sampling points
- Use current device location
- Automatic numbering of sampling points

### 2. **Field Measurements**
Record various environmental parameters at each sampling point:
- **Noise Level** (dB)
- **Air Temperature** (°C)
- **Water Temperature** (°C)
- **pH Level**
- **Dissolved Oxygen** (mg/L)
- **Turbidity** (NTU)
- **Conductivity** (μS/cm)
- **Wind Speed** (m/s)
- **Humidity** (%)
- **Atmospheric Pressure** (hPa)
- **Light Intensity** (lux)
- Custom parameters

### 3. **Photo Documentation**
- Capture photos at each sampling location
- Photos are embedded in reports
- Visual evidence of sampling conditions

### 4. **Report Generation**
- Professional PDF reports with:
  - GPS coordinates of all sampling points
  - Field measurements table
  - Map screenshot with markers
  - Photos from each location
  - Introduction, methodology, findings, conclusions
  - Digital signatures (Prepared By & Reviewed By)

## How to Use

### Step 1: Select a CRF
1. Navigate to **Environmental Sampling** from the sidebar
2. Select a Lab Service (LS) CRF from the dropdown
   - Only LS-type CRFs are shown (field sampling at customer location)
   - CRFs must be in 'draft' or 'submitted' status

### Step 2: Add Sampling Points
**Option A: Click on Map**
- Click anywhere on the map to add a numbered sampling point
- Markers are automatically numbered (1, 2, 3, etc.)

**Option B: Use Current Location**
- Click "Add Current Location" button
- GPS coordinates from your device are used
- Requires browser location permission

### Step 3: Configure Each Point
For each sampling point:
1. **Edit Location Name**: Click "Edit" to customize the location name
2. **Add Measurements**:
   - Click "Add Measurement"
   - Select parameter (e.g., Noise Level, pH, Temperature)
   - Enter measured value and unit
   - Add measurer name
   - Optional: Add remarks
   - Click "Save Measurement"
3. **Capture Photo**:
   - Click "Capture Photo"
   - Upload a photo from your device
   - Photo thumbnail appears on the point

### Step 4: Review Data
- Check all sampling points in the sidebar
- Verify measurements are complete
- Ensure all required points have been captured

### Step 5: Submit Field Data
1. Click "Submit Field Data"
2. System validates:
   - At least one sampling point exists
   - All points have at least one measurement
3. Environmental data is attached to the CRF
4. CRF status changes to "review"
5. Success confirmation displayed

### Step 6: Generate Report (Optional)
1. Click "Generate Report" button
2. Fill in report details:
   - Project Name
   - Date
   - Prepared By
   - Reviewed By
   - Introduction
   - Methodology
   - Findings
   - Conclusion
   - Recommendations
3. Add digital signatures:
   - Prepared By signature
   - Reviewed By signature
4. Click "Download PDF Report"
5. Professional report is generated with all field data

## Map Features

### Map Controls
- **Zoom In/Out**: Use + and - buttons or scroll wheel
- **Pan**: Click and drag the map
- **Switch View**: Toggle between Standard and Satellite view

### Marker Colors & Numbers
- Each sampling point has a numbered marker (blue pin with white number)
- Numbers are sequential: 1, 2, 3, etc.
- Selected point is highlighted

### GPS Coordinates
- Latitude and Longitude displayed for each point
- Precision: 6 decimal places (~10cm accuracy)
- Format: Decimal degrees

## Field Data Collection Best Practices

### 1. **Plan Sampling Points**
- Review site before sampling
- Identify representative locations
- Consider accessibility and safety
- Mark points systematically (grid pattern, transect, etc.)

### 2. **Measurement Accuracy**
- Calibrate instruments before use
- Record measurements immediately
- Note environmental conditions
- Add relevant remarks for unusual readings

### 3. **Photo Documentation**
- Take photos showing sampling context
- Include landmarks or reference points
- Capture equipment and sample containers
- Document any site conditions affecting samples

### 4. **Data Verification**
- Double-check coordinates
- Review all measurements before submission
- Ensure no missing data
- Verify location names are descriptive

## Report Sections

### Title Page
- Report title
- Project name
- Date
- Prepared By
- Reviewed By

### Introduction
- Background and objectives
- Site description
- Sampling purpose

### Methodology
- Sampling techniques used
- Equipment and instruments
- Quality control measures

### Sampling Locations (Map)
- Screenshot of map with all points
- GPS coordinates table
- Location descriptions

### Field Measurements
- Table of all parameters measured
- Values, units, and timestamps
- Measurer names
- Remarks for each reading

### Photo Documentation
- Photos from each sampling point
- Point numbers and locations
- Visual observations

### Findings
- Summary of measurements
- Notable observations
- Data trends or patterns

### Conclusion
- Overall assessment
- Compliance status (if applicable)
- Key findings summary

### Recommendations
- Follow-up actions
- Additional testing needed
- Site improvements

### Signatures
- Digital signature - Prepared By
- Digital signature - Reviewed By
- Date and names

## Integration with LIMS Workflow

### CRF Status Flow
1. **Draft/Submitted** → Available for environmental sampling
2. **Review** → After field data submission
3. **Approved** → After review and approval
4. **Testing** → Laboratory analysis begins
5. **Completed** → Final report generated

### Data Linkage
- Environmental data is attached to the CRF
- GPS coordinates link to sample IDs
- Field measurements complement lab results
- Photos provide chain of custody evidence

## Troubleshooting

### GPS Not Working
- **Problem**: "Geolocation not supported" message
- **Solution**: Use a modern browser (Chrome, Firefox, Edge)
- **Solution**: Enable location services in browser settings
- **Solution**: Grant location permission when prompted

### Map Not Loading
- **Problem**: Blank map area
- **Solution**: Check internet connection (map tiles require online access)
- **Solution**: Refresh the page
- **Solution**: Clear browser cache

### Cannot Submit Data
- **Problem**: Submit button disabled or validation error
- **Solution**: Ensure at least one sampling point exists
- **Solution**: Add measurements to all sampling points
- **Solution**: Check that a CRF is selected

### Photo Not Uploading
- **Problem**: Photo capture doesn't work
- **Solution**: Use JPG, PNG, or HEIC formats
- **Solution**: Reduce file size (max ~5MB recommended)
- **Solution**: Check browser file upload permissions

### Report Generation Fails
- **Problem**: PDF doesn't download
- **Solution**: Fill in all required report fields
- **Solution**: Ensure signatures are added
- **Solution**: Allow pop-ups in browser settings

## Mobile Device Usage

### Recommended Setup
- Use tablet or smartphone with GPS
- Enable location services
- Ensure stable internet for map tiles
- Use protective case for field conditions

### Field Tips
- Download offline maps if available
- Have backup power source (battery pack)
- Protect device from weather/dust
- Test GPS accuracy before starting

### Data Entry
- Use landscape mode for map view
- Portrait mode for measurement forms
- External keyboard for extensive notes
- Stylus for signature capture

## Data Security

### Location Privacy
- GPS data is only stored in CRF records
- No third-party location tracking
- Data accessible only to authorized users

### Photo Storage
- Photos embedded as base64 in CRF data
- Not stored separately on external servers
- Included in PDF reports only

### Digital Signatures
- Canvas-based signature capture
- Stored as PNG images
- Embedded in PDF reports
- Timestamp and name verification

## Example Workflow: Water Quality Sampling

1. **Preparation**
   - Create LS-type CRF for "Water Quality Survey"
   - Navigate to Environmental Sampling page
   - Select the CRF

2. **Field Collection**
   - Visit first water sampling site
   - Click "Add Current Location" (GPS: 6.9271, 79.8612)
   - Name: "Upstream Sampling Point"
   - Measure:
     * Water Temperature: 28.5°C
     * pH: 7.2
     * Dissolved Oxygen: 6.5 mg/L
     * Turbidity: 15 NTU
   - Capture photo of water body
   
3. **Additional Points**
   - Move to second site
   - Add Current Location (GPS: 6.9280, 79.8620)
   - Name: "Downstream Sampling Point"
   - Repeat measurements
   - Capture photo

4. **Submission**
   - Review all 2 points with measurements
   - Click "Submit Field Data"
   - CRF status → Review

5. **Report Generation**
   - Fill report details
   - Add findings about water quality
   - Add signatures
   - Download PDF

6. **Lab Processing**
   - Samples sent to lab (with GPS tags)
   - Laboratory tests performed
   - Results entered in Data Entry page
   - Final report links field + lab data

## Support & Contact

For technical support or feature requests:
- Check the LIMS documentation
- Contact system administrator
- Submit bug reports through helpdesk

---

**Version**: 1.0  
**Last Updated**: February 27, 2026  
**Module**: Environmental Sampling  
**System**: Laboratory Information Management System (LIMS)
