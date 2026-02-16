import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useWorkflow } from '../context/WorkflowContext';
import { MapPin, Camera, Trash2, Plus, Navigation } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FieldMeasurement {
    parameter: string;
    value: string;
    unit: string;
    measuredBy: string;
    measuredAt: string;
    remarks?: string;
}

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

// Component to handle map clicks
const LocationMarker: React.FC<{ onAddPoint: (lat: number, lng: number) => void }> = ({ onAddPoint }) => {
    useMapEvents({
        click(e) {
            onAddPoint(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Create numbered marker icons
const createNumberedIcon = (number: number) => {
    return L.divIcon({
        className: 'custom-numbered-marker',
        html: `
            <div style="
                background: #3b82f6;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 16px;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">${number}</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

export const EnvironmentalSamplingPage: React.FC = () => {
    const { crfs, getCRFsByStatus, updateCRFStatus } = useWorkflow();
    const [selectedCRFId, setSelectedCRFId] = useState<string>('');
    const [samplingPoints, setSamplingPoints] = useState<GPSSamplingPoint[]>([]);
    const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([6.9271, 79.8612]); // Colombo, Sri Lanka
    const [showMeasurementForm, setShowMeasurementForm] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Measurement form state
    const [measurementForm, setMeasurementForm] = useState({
        parameter: 'Noise Level',
        value: '',
        unit: 'dB',
        measuredBy: '',
        remarks: ''
    });

    // Get LS type CRFs (Lab Service - we go to customer location)
    const lsCRFs = crfs.filter(c => c.crfType === 'LS' && (c.status === 'draft' || c.status === 'submitted'));
    const selectedCRF = crfs.find(c => c.id === selectedCRFId);

    const handleCRFChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const crfId = e.target.value;
        setSelectedCRFId(crfId);
        setSamplingPoints([]);
        setIsSubmitted(false);
        
        // You could set map center based on customer location if available
        // For now, using default Colombo coordinates
    };

    const handleAddPoint = (lat: number, lng: number) => {
        if (!selectedCRFId || isSubmitted) return;

        const newPoint: GPSSamplingPoint = {
            id: `point-${Date.now()}`,
            pointNumber: samplingPoints.length + 1,
            latitude: lat,
            longitude: lng,
            locationName: `Point ${samplingPoints.length + 1}`,
            measurements: [],
            timestamp: new Date().toISOString(),
        };

        setSamplingPoints(prev => [...prev, newPoint]);
        setSelectedPointId(newPoint.id);
    };

    const handleDeletePoint = (pointId: string) => {
        setSamplingPoints(prev => {
            const filtered = prev.filter(p => p.id !== pointId);
            // Renumber points
            return filtered.map((p, index) => ({ ...p, pointNumber: index + 1 }));
        });
        if (selectedPointId === pointId) {
            setSelectedPointId(null);
        }
    };

    const handleLocationNameChange = (pointId: string, name: string) => {
        setSamplingPoints(prev =>
            prev.map(p => p.id === pointId ? { ...p, locationName: name } : p)
        );
    };

    const handleAddMeasurement = () => {
        if (!selectedPointId || !measurementForm.parameter || !measurementForm.value || !measurementForm.measuredBy) {
            alert('Please fill in all required measurement fields');
            return;
        }

        const newMeasurement: FieldMeasurement = {
            ...measurementForm,
            measuredAt: new Date().toISOString(),
        };

        setSamplingPoints(prev =>
            prev.map(p => 
                p.id === selectedPointId 
                    ? { ...p, measurements: [...p.measurements, newMeasurement] }
                    : p
            )
        );

        // Reset form
        setMeasurementForm({
            parameter: 'Noise Level',
            value: '',
            unit: 'dB',
            measuredBy: measurementForm.measuredBy, // Keep the name
            remarks: ''
        });
        setShowMeasurementForm(false);
    };

    const handlePhotoCapture = (pointId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setSamplingPoints(prev =>
                prev.map(p => p.id === pointId ? { ...p, photo: reader.result as string } : p)
            );
        };
        reader.readAsDataURL(file);
    };

    const handleGetCurrentLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setMapCenter([lat, lng]);
                    alert(`Current location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                },
                (error) => {
                    alert('Error getting location: ' + error.message);
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    };

    const handleAddCurrentLocationPoint = () => {
        if (!selectedCRFId || isSubmitted) {
            alert('Please select a CRF first');
            return;
        }

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    const newPoint: GPSSamplingPoint = {
                        id: `point-${Date.now()}`,
                        pointNumber: samplingPoints.length + 1,
                        latitude: lat,
                        longitude: lng,
                        locationName: `Point ${samplingPoints.length + 1} (Current Location)`,
                        measurements: [],
                        timestamp: new Date().toISOString(),
                    };

                    setSamplingPoints(prev => [...prev, newPoint]);
                    setSelectedPointId(newPoint.id);
                    setMapCenter([lat, lng]);
                    alert(`Point ${newPoint.pointNumber} added at your current location!`);
                },
                (error) => {
                    alert('Error getting location: ' + error.message);
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    };

    const handleSubmit = () => {
        if (!selectedCRFId) return;

        if (samplingPoints.length === 0) {
            alert('Please add at least one sampling point');
            return;
        }

        const hasEmptyMeasurements = samplingPoints.some(p => p.measurements.length === 0);
        if (hasEmptyMeasurements) {
            alert('All sampling points must have at least one measurement');
            return;
        }

        // TODO: Save sampling data to context/backend
        // For now, just update CRF status
        updateCRFStatus(selectedCRFId, 'review');
        setIsSubmitted(true);
        alert('Environmental sampling data submitted successfully! CRF moved to Review status.');
    };

    const selectedPoint = samplingPoints.find(p => p.id === selectedPointId);

    const parameterOptions = [
        { label: 'Noise Level', unit: 'dB' },
        { label: 'Temperature', unit: '°C' },
        { label: 'pH', unit: 'pH' },
        { label: 'Humidity', unit: '%' },
        { label: 'Air Quality Index', unit: 'AQI' },
        { label: 'Wind Speed', unit: 'm/s' },
        { label: 'Pressure', unit: 'kPa' },
    ];

    if (lsCRFs.length === 0) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Environmental Sampling</h1>
                <Card>
                    <p className="text-gray-500">
                        No LS (Lab Service) CRFs available for environmental sampling. 
                        LS CRFs must be in "draft" or "submitted" status.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Environmental Sampling</h1>
                    <p className="text-sm text-gray-600 mt-1">Field data collection with GPS location tracking</p>
                </div>
                {isSubmitted && <Badge status="approved">Submitted for Review</Badge>}
            </div>

            {/* CRF Selection */}
            <Card className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select LS Type CRF</h3>
                <Select
                    label="CRF ID"
                    value={selectedCRFId}
                    onChange={handleCRFChange}
                    options={[
                        { value: '', label: 'Select an LS CRF' },
                        ...lsCRFs.map(crf => ({
                            value: crf.id,
                            label: `${crf.id} - ${crf.customer} - ${crf.sampleType}`
                        }))
                    ]}
                    required
                />

                {selectedCRF && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Customer:</span>
                                <span className="ml-2 font-medium">{selectedCRF.customer}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Address:</span>
                                <span className="ml-2 font-medium">{selectedCRF.address}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Sample Type:</span>
                                <span className="ml-2 font-medium">{selectedCRF.sampleType}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Parameters:</span>
                                <span className="ml-2 font-medium">{selectedCRF.testParameters.join(', ')}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {selectedCRF && (
                <>
                    {/* Map Section */}
                    <Card className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Sampling Location Map</h3>
                            <div className="flex gap-2">
                                <Button
                                    variant="primary"
                                    onClick={handleAddCurrentLocationPoint}
                                    disabled={isSubmitted}
                                >
                                    <MapPin size={16} className="mr-2" />
                                    Add Point at Current Location
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={handleGetCurrentLocation}
                                >
                                    <Navigation size={16} className="mr-2" />
                                    Center Map on My Location
                                </Button>
                            </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">
                            <MapPin size={16} className="inline mr-1" />
                            Click on the map to add sampling points
                        </p>

                        <div className="rounded-lg overflow-hidden border-2 border-gray-200">
                            <MapContainer
                                center={mapCenter}
                                zoom={15}
                                style={{ height: '500px', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <LocationMarker onAddPoint={handleAddPoint} />
                                {samplingPoints.map((point) => (
                                    <Marker
                                        key={point.id}
                                        position={[point.latitude, point.longitude]}
                                        icon={createNumberedIcon(point.pointNumber)}
                                        eventHandlers={{
                                            click: () => setSelectedPointId(point.id)
                                        }}
                                    >
                                        <Popup>
                                            <div className="p-2">
                                                <p className="font-bold">{point.locationName}</p>
                                                <p className="text-xs text-gray-600">
                                                    {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                                                </p>
                                                <p className="text-xs mt-1">{point.measurements.length} measurement(s)</p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>

                        <div className="mt-4 text-sm text-gray-600">
                            <p><strong>Total Points:</strong> {samplingPoints.length}</p>
                            <p className="mt-1 text-xs">Click on numbered markers to view/edit point details</p>
                        </div>
                    </Card>

                    {/* Sampling Points List */}
                    {samplingPoints.length > 0 && (
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sampling Points & Measurements</h3>
                            
                            <div className="space-y-4">
                                {samplingPoints.map((point) => (
                                    <div
                                        key={point.id}
                                        className={`border-2 rounded-lg p-4 transition-all ${
                                            selectedPointId === point.id 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200'
                                        }`}
                                        onClick={() => setSelectedPointId(point.id)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                                    {point.pointNumber}
                                                </div>
                                                <div>
                                                    <Input
                                                        value={point.locationName}
                                                        onChange={(e) => handleLocationNameChange(point.id, e.target.value)}
                                                        placeholder="Location name"
                                                        disabled={isSubmitted}
                                                        className="font-semibold"
                                                    />
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        📍 {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    onChange={(e) => handlePhotoCapture(point.id, e)}
                                                    className="hidden"
                                                    disabled={isSubmitted}
                                                />
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={isSubmitted}
                                                >
                                                    <Camera size={16} />
                                                </Button>
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => handleDeletePoint(point.id)}
                                                    disabled={isSubmitted}
                                                >
                                                    <Trash2 size={16} className="text-red-600" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Photo Preview */}
                                        {point.photo && (
                                            <div className="mb-3">
                                                <img 
                                                    src={point.photo} 
                                                    alt="Sampling point" 
                                                    className="w-full h-48 object-cover rounded"
                                                />
                                            </div>
                                        )}

                                        {/* Measurements */}
                                        <div className="space-y-2">
                                            {point.measurements.map((measurement, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold text-gray-800">
                                                                {measurement.parameter}: {measurement.value} {measurement.unit}
                                                            </p>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                Measured by: {measurement.measuredBy} | {new Date(measurement.measuredAt).toLocaleString()}
                                                            </p>
                                                            {measurement.remarks && (
                                                                <p className="text-xs text-gray-600 mt-1">
                                                                    Remarks: {measurement.remarks}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add Measurement Button */}
                                        {selectedPointId === point.id && !isSubmitted && (
                                            <div className="mt-3">
                                                {!showMeasurementForm ? (
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => setShowMeasurementForm(true)}
                                                    >
                                                        <Plus size={16} className="mr-2" />
                                                        Add Measurement
                                                    </Button>
                                                ) : (
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                                                        <h4 className="font-semibold mb-3">Add New Measurement</h4>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-sm font-medium mb-1">Parameter</label>
                                                                <select
                                                                    value={measurementForm.parameter}
                                                                    onChange={(e) => {
                                                                        const param = parameterOptions.find(p => p.label === e.target.value);
                                                                        setMeasurementForm({
                                                                            ...measurementForm,
                                                                            parameter: e.target.value,
                                                                            unit: param?.unit || ''
                                                                        });
                                                                    }}
                                                                    className="w-full px-3 py-2 border rounded"
                                                                >
                                                                    {parameterOptions.map(opt => (
                                                                        <option key={opt.label} value={opt.label}>
                                                                            {opt.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <Input
                                                                label="Value"
                                                                type="text"
                                                                value={measurementForm.value}
                                                                onChange={(e) => setMeasurementForm({ ...measurementForm, value: e.target.value })}
                                                                placeholder="Enter value"
                                                                required
                                                            />
                                                            <Input
                                                                label="Unit"
                                                                type="text"
                                                                value={measurementForm.unit}
                                                                onChange={(e) => setMeasurementForm({ ...measurementForm, unit: e.target.value })}
                                                                required
                                                            />
                                                            <Input
                                                                label="Measured By"
                                                                type="text"
                                                                value={measurementForm.measuredBy}
                                                                onChange={(e) => setMeasurementForm({ ...measurementForm, measuredBy: e.target.value })}
                                                                placeholder="Your name"
                                                                required
                                                            />
                                                            <div className="col-span-2">
                                                                <Input
                                                                    label="Remarks (Optional)"
                                                                    type="text"
                                                                    value={measurementForm.remarks}
                                                                    onChange={(e) => setMeasurementForm({ ...measurementForm, remarks: e.target.value })}
                                                                    placeholder="Optional notes"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 mt-3">
                                                            <Button onClick={handleAddMeasurement}>
                                                                Save Measurement
                                                            </Button>
                                                            <Button
                                                                variant="secondary"
                                                                onClick={() => setShowMeasurementForm(false)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-end">
                                {!isSubmitted ? (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={samplingPoints.length === 0 || samplingPoints.some(p => p.measurements.length === 0)}
                                    >
                                        Submit Environmental Sampling Data
                                    </Button>
                                ) : (
                                    <Badge status="approved">Data Submitted - Moved to Review</Badge>
                                )}
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};
