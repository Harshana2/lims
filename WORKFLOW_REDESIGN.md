# LIMS Workflow Redesign - Implementation Summary

## New Workflow Structure

### Core Concept
CRF (Customer Request Form) is now the **central entity** in the workflow. Everything revolves around CRF.

### CRF Types
1. **CS (Customer Sample)** - Samples from customers with quotations
2. **LS (Lab Sample)** - Walk-in samples without prior quotation

### Sample ID Format
- CS samples: `CS/25/001`, `CS/25/002`, etc.
- LS samples: `LS/25/001`, `LS/25/002`, etc.
- Format: `{TYPE}/{YEAR}/{COUNTER}`

## Updated Workflow Flow

### Scenario 1: Customer with Request & Quotation (CS Type)
```
Request → Quotation → CRF (CS type) → Parameter Assignment → Data Entry → Review → Report
```

### Scenario 2: Walk-in Customer (LS Type)
```
CRF (LS type) → Parameter Assignment → Data Entry → Review → Report
```

## CRF Status Lifecycle
```
draft → submitted → assigned → testing → review → approved → completed
```

- **draft**: CRF created but not submitted
- **submitted**: CRF submitted and ready for parameter assignment
- **assigned**: Parameters assigned to samples
- **testing**: Data entry in progress
- **review**: Results submitted, pending review
- **approved**: Results approved
- **completed**: Report generated

## Key Features Implemented

### 1. WorkflowContext.tsx ✅
- New CRF interface with all required fields
- Sample auto-generation based on CRF type
- Status management system
- Functions for CRF CRUD operations
- Test results tracking
- Review data tracking

### 2. What Needs to be Built

#### A. CRF Page (Redesigned)
**Features:**
- Create CRF form with editable fields
- Choose CRF type (CS/LS)
- Optional quotation reference for CS type
- Auto-generate sample IDs based on type and count
- Table showing all CRFs with status
- Edit CRF functionality
- Submit CRF (changes status from draft → submitted)
- E-signature support
- PDF generation for CRF

**Fields:**
- CRF Type (CS/LS)
- Customer details
- Sample type
- Test parameters (checkboxes)
- Number of samples
- Sampling type
- Reception date & time
- Received by (name + signature)
- Quotation reference (optional, for CS type)
- Status

#### B. Parameter Assignment Page (Updated)
**Features:**
- Select CRF dropdown (shows submitted CRFs)
- Display all samples from selected CRF
- For each sample: assign chemist, method, due date
- Lock assignments (updates CRF status → assigned)
- E-signature for assignment officer

#### C. Data Entry Page (Updated)
**Features:**
- Select CRF dropdown (shows assigned CRFs)
- Display all samples with their assigned parameters
- For each sample: enter test value, remarks
- Submit results (updates CRF status → testing then → review)
- E-signature for chemist

#### D. Review & Sign Page (Updated)
**Features:**
- Select CRF dropdown (shows CRFs in review status)
- Display all test results in table format
- Approve/Reject with comments
- E-signature for supervisor
- Updates CRF status → approved

#### E. Report Generation Page (Updated)
**Features:**
- Select CRF dropdown (shows approved CRFs)
- Generate professional A4 report
- Multi-page PDF support (each page is A4)
- Include all samples and results
- E-signatures from all stages
- Updates CRF status → completed

## Database Schema (for future backend)

```typescript
CRF {
  id: string (CS/25/001)
  crfType: 'CS' | 'LS'
  customer: string
  address: string
  contact: string
  email: string
  sampleType: string
  testParameters: string[]
  numberOfSamples: number
  samples: Sample[]
  samplingType: string
  receptionDate: string
  receivedBy: string
  signature: string
  date: string
  priority: string
  quotationRef?: string
  status: enum
  createdAt: timestamp
  updatedAt: timestamp
}

Sample {
  id: string (CS/25/001)
  crfId: string
  description: string
  submissionDetail: string
}

ParameterAssignment {
  id: string
  crfId: string
  sampleId: string
  parameter: string
  unit: string
  method: string
  chemist: string
  dueDate: date
  assignedBy: string
  assignedDate: timestamp
}

TestResult {
  id: string
  crfId: string
  sampleId: string
  parameter: string
  testValue: string
  remarks: string
  testedBy: string
  testedDate: timestamp
}

Review {
  id: string
  crfId: string
  reviewedBy: string
  signature: string
  status: 'approved' | 'rejected'
  comments: string
  reviewDate: timestamp
}
```

## Implementation Priority

1. ✅ Update WorkflowContext (DONE)
2. Create new CRF Page with form + table
3. Update Parameter Assignment Page
4. Update Data Entry Page
5. Update Review & Sign Page
6. Update Report Generation Page
7. Update Dashboard to show CRF statistics
8. Test complete workflow for both CS and LS types

## Next Steps

Would you like me to:
1. Create the new CRF Page first?
2. Update all pages in sequence?
3. Focus on a specific page?

Please confirm and I'll proceed with the implementation!
