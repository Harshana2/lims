# Environmental Sampling Page - Implementation Plan

## 📋 Overview

Environmental Sampling is a specialized workflow for LS (Lab Service) type CRFs where lab personnel go to customer locations to collect field data with GPS coordinates.

## 🗺️ Key Features

### 1. **GPS Location Tracking**
- Interactive map using Leaflet (OpenStreetMap)
- Add multiple sampling points with click
- Each point has a numbered pin icon
- Display latitude/longitude for each point

### 2. **Field Data Collection**
- For each GPS point, collect:
  - Location name/description
  - Measurement type (Noise, Temperature, pH, etc.)
  - Measured value
  - Unit of measurement
  - Time of measurement
  - Notes/remarks
  - Photo upload (optional)

### 3. **Mobile-Friendly Interface**
- Designed for tablet use in the field
- Touch-friendly controls
- Offline data storage (localStorage)
- Sync when online

### 4. **Workflow Integration**
- Select existing LS type CRF
- Add GPS sampling points
- Collect field data for each point
- Submit for review
- CRF status: draft → field-sampling → review → approved → completed

## 🏗️ Data Structure

```typescript
interface GPSSamplingPoint {
    id: string;
    pointNumber: number;
    latitude: number;
    longitude: number;
    locationName: string;
    measurements: FieldMeasurement[];
    timestamp: string;
    photo?: string; // base64 image
}

interface FieldMeasurement {
    parameter: string; // Noise, Temperature, pH, etc.
    value: string;
    unit: string;
    measuredBy: string;
    measuredAt: string;
    remarks?: string;
}

interface EnvironmentalSamplingData {
    crfId: string;
    samplingDate: string;
    teamMembers: string[];
    equipment: string[];
    weatherConditions?: string;
    samplingPoints: GPSSamplingPoint[];
    status: 'draft' | 'field-sampling' | 'review' | 'approved';
}
```

## 🎨 UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Environmental Sampling                                      │
│ Select LS CRF: [Dropdown]                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │              LEAFLET MAP                           │    │
│  │                                                     │    │
│  │  📍1  📍2  📍3                                     │    │
│  │                                                     │    │
│  │                  [ Click to add point ]            │    │
│  │                                                     │    │
│  └───────────────────────────────────────────────────┘    │
│                                                             │
│  Sampling Points:                                           │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 📍 Point 1: Factory Entrance                        │  │
│  │    Lat: 6.9271, Lng: 79.8612                        │  │
│  │    ┌─────────────────────────────────┐             │  │
│  │    │ Noise Level: 85 dB              │             │  │
│  │    │ Temperature: 32°C               │             │  │
│  │    │ [Add Measurement] [Delete Point]│             │  │
│  │    └─────────────────────────────────┘             │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  [Submit for Review]                                        │
└─────────────────────────────────────────────────────────────┘
```

## 🔌 Leaflet Integration

### Installation
```bash
npm install leaflet react-leaflet @types/leaflet
```

### Import CSS
```tsx
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
```

### Custom Marker Icons
```tsx
const createNumberedIcon = (number: number) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin">${number}</div>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
    });
};
```

### Map Component
```tsx
<MapContainer
    center={[6.9271, 79.8612]} // Colombo, Sri Lanka
    zoom={13}
    style={{ height: '400px', width: '100%' }}
>
    <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    />
    <LocationMarker />
    {samplingPoints.map((point, index) => (
        <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={createNumberedIcon(index + 1)}
        >
            <Popup>{point.locationName}</Popup>
        </Marker>
    ))}
</MapContainer>
```

## 📱 Mobile Features

### Get Current Location
```tsx
const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            setCurrentLat(position.coords.latitude);
            setCurrentLng(position.coords.longitude);
        });
    }
};
```

### Photo Capture
```tsx
<input
    type="file"
    accept="image/*"
    capture="environment" // Use back camera on mobile
    onChange={handlePhotoCapture}
/>
```

## 🔄 Workflow States

1. **Select LS CRF** (status must be 'draft' or 'submitted')
2. **Add Sampling Points** - Click on map to add GPS coordinates
3. **Collect Field Data** - For each point, add measurements
4. **Submit** - Status changes to 'field-sampling' → 'review'
5. **Review** - Supervisor reviews data
6. **Approve** - Data approved, generate report

## 🎯 Navigation Update

Add to Sidebar.tsx:
```tsx
{
    name: 'Environmental Sampling',
    path: '/environmental-sampling',
    icon: MapPin
}
```

## 📦 Files to Create

1. `src/pages/EnvironmentalSamplingPage.tsx` - Main page
2. `src/components/SamplingMap.tsx` - Leaflet map component
3. `src/components/MeasurementForm.tsx` - Field data entry form
4. `src/context/EnvironmentalSamplingContext.tsx` - State management (optional)

## 🚀 Implementation Priority

1. ✅ Install Leaflet packages
2. ✅ Create basic map component
3. ✅ Add click-to-add-point functionality
4. ✅ Display numbered markers
5. ✅ Create measurement form for each point
6. ✅ Integrate with CRF workflow
7. ✅ Add photo capture
8. ✅ Add GPS geolocation
9. ✅ Mobile optimization

---

**Note:** User can install Leaflet manually if npm command doesn't work:
```
npm install leaflet react-leaflet @types/leaflet
```

Then add to `index.css`:
```css
@import 'leaflet/dist/leaflet.css';
```
