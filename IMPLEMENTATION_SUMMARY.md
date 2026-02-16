# 🎯 Next Implementation Tasks - Summary

## ✅ Completed Today

### 1. **Data Entry Page** - DONE ✅
- CRF selector (filters status='assigned')
- Table view for all Sample × Parameter combinations
- Test value input, Tested By, Test Date, Remarks
- Submit button → Updates status to 'testing' then 'review'

### 2. **Quotation → CRF Integration** - DONE ✅
- Auto-fill CRF form from quotation
- Updated QuotationData interface
- Status-based access control

### 3. **Parameter Assignment Page** - DONE ✅
- CRF selector with status filtering
- Chemist assignment for each test
- Lock parameters → Updates status to 'assigned'

---

## 🚀 **Remaining Tasks** (In Priority Order)

### **TASK 1: Custom Quotation (No Request Required)**

**What:** Allow creating quotations directly without a request for walk-in customers.

**Location:** `QuotationPage.tsx`

**Features:**
- Add "+ New Custom Quotation" button
- Form to enter:
  - Customer details (name, address, contact, email)
  - Sample type, number of samples
  - Select parameters (checkboxes)
  - Auto-calculate pricing
  - Generate quotation PDF
- Save with `approved: true` flag
- Can be linked to CRF later

**Implementation Steps:**
1. Add state for custom quotation form
2. Create form with customer + parameter selection
3. Calculate total price automatically
4. Save to quotations array
5. Show in quotation list table

---

### **TASK 2: Update CRF Types Clarification**

**Current Understanding (INCORRECT):**
- CS = Customer Sample (with quotation)
- LS = Lab Sample (walk-in)

**NEW Correct Understanding:**
- **CS = Customer brings samples to lab** (they come to office)
- **LS = Lab goes to customer location to collect samples** (field sampling)

**Changes Needed:**
1. Update CRF form labels/descriptions:
   - CS: "Customer Submission - Customer brings samples to lab"
   - LS: "Lab Service - Lab team collects samples from customer site"

2. Update tooltip/help text everywhere CS/LS appears

3. Environmental Sampling is a subcategory of LS (lab goes to site)

---

### **TASK 3: Environmental Sampling Page** ⭐ **PRIORITY**

**What:** Special page for field data collection with GPS mapping.

**Location:** New file: `src/pages/EnvironmentalSamplingPage.tsx`

**Features:**
1. **Map Integration (Leaflet)**
   - OpenStreetMap display
   - Click to add sampling points
   - Numbered pin markers (1, 2, 3...)
   - Show lat/lng for each point
   - Get current device location button

2. **Sampling Point Data Collection**
   - For each GPS point:
     - Location name/description
     - Multiple measurements (Noise, Temp, pH, etc.)
     - Value + Unit
     - Time of measurement
     - Measured by (name)
     - Photo upload (optional)
     - Remarks

3. **Workflow**
   - Select LS type CRF
   - Add GPS points on map
   - Collect field data
   - Submit → Status: 'field-sampling' → 'review'

4. **Mobile Optimized**
   - Touch-friendly for tablets
   - Camera integration
   - GPS auto-detect

**Data Structure:**
```typescript
interface GPSSamplingPoint {
    id: string;
    pointNumber: number;
    latitude: number;
    longitude: number;
    locationName: string;
    measurements: FieldMeasurement[];
    timestamp: string;
    photo?: string;
}

interface FieldMeasurement {
    parameter: string;  // Noise, Temperature, etc.
    value: string;
    unit: string;
    measuredBy: string;
    measuredAt: string;
    remarks?: string;
}
```

**Installation Required:**
```bash
npm install leaflet react-leaflet @types/leaflet
```

**Add to `index.css`:**
```css
@import 'leaflet/dist/leaflet.css';
```

**Add to `Sidebar.tsx` navigation:**
```tsx
{
    name: 'Environmental Sampling',
    path: '/environmental-sampling',
    icon: MapPin  // from lucide-react
}
```

---

### **TASK 4: Review & Sign Page Update**

**What:** Update to work with CRF workflow.

**Location:** `ReviewSignPage.tsx`

**Features:**
- CRF selector (filter: status='review')
- Display all test results in table
- Show Sample ID, Parameter, Test Value, Tested By
- Supervisor review:
  - Approve/Reject each result
  - Add comments
  - E-signature
- Submit → Updates status to 'approved'

---

### **TASK 5: Report Generation Page Update**

**What:** Generate comprehensive test report PDF.

**Location:** `ReportGenerationPage.tsx`

**Features:**
- CRF selector (filter: status='approved')
- Display comprehensive report with:
  - Lab header (ISO accreditation)
  - Customer details
  - Sample information with IDs
  - Test results table (Sample × Parameter × Value)
  - All signatures (Reception, Tested By, Reviewer)
  - Chain of custody
- Multi-page A4 PDF support
- Download button
- Submit → Updates status to 'completed'

---

### **TASK 6: Dashboard Update**

**What:** Show CRF statistics and workflow status.

**Location:** `Dashboard.tsx`

**Features:**
- CRF counts by type (CS vs LS)
- Status distribution chart
- Recent CRFs table
- Environmental sampling map overview
- Pending tasks alerts

---

## 📝 **Quick Reference: Status Lifecycle**

```
CRF Creation:
  draft → submitted
  
Parameter Assignment:
  submitted → assigned
  
Data Entry (Lab Testing):
  assigned → testing → review
  
Environmental Sampling (Field):
  draft → field-sampling → review
  
Review & Sign:
  review → approved
  
Report Generation:
  approved → completed
```

---

## 🎨 **Scenario Example: Environmental Sampling**

1. Lab person has tablet
2. Goes to factory site
3. Opens Environmental Sampling page
4. Selects LS type CRF "FACT-2026-001"
5. Map shows factory location
6. Clicks 3 points on map:
   - Point 1: Factory entrance (Noise: 85 dB)
   - Point 2: Production area (Noise: 95 dB, Temp: 32°C)
   - Point 3: Boundary wall (Noise: 70 dB)
7. Each point has GPS coords + measurements
8. Takes photos at each point
9. Submits → Status: 'field-sampling' → 'review'
10. Back at lab, supervisor reviews
11. Approves → Generate report with map

---

## 🔧 **Installation Steps for User**

If npm command doesn't work, tell user to:

1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`
3. Then: `cd c:\Users\harshana_k\Desktop\Personal\lims`
4. Then: `npm install leaflet react-leaflet @types/leaflet`

Or manually download packages and add to package.json.

---

**Would you like me to:**
1. ✅ Continue with Custom Quotation implementation?
2. ✅ Create Environmental Sampling page (needs Leaflet)?
3. ✅ Update Review & Sign page?

Let me know which one to prioritize!
