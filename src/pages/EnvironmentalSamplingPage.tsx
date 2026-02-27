import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import crfService from '../services/crfService';
import type { CRF } from '../services/crfService';
import sampleService from '../services/sampleService';
import { MapPin, Camera, Trash2, Plus, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GPSCoordinate {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: string;
}

interface FieldMeasurement {
    parameter: string;
    value: string;
    unit: string;
    timestamp: string;
}

interface SamplingPhoto {
    id: string;
    dataUrl: string;
    description: string;
    timestamp: string;
}

interface EnvironmentalMetadata {
    gpsCoordinates: GPSCoordinate[];
    fieldMeasurements: FieldMeasurement[];
    photos: SamplingPhoto[];
    weatherConditions: string;
    samplingNotes: string;
}

// Component to handle map clicks
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            onClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export const EnvironmentalSamplingPage: React.FC = () => {
    const [formData, setFormData] = useState({
        customer: '',
        address: '',
        contact: '',
        email: '',
        sampleType: '',
        samplingType: '',
        numberOfSamples: 1,
        testParameters: [] as string[],
    });

    const [gpsCoordinates, setGpsCoordinates] = useState<GPSCoordinate[]>([]);
    const [fieldMeasurements, setFieldMeasurements] = useState<FieldMeasurement[]>([]);
    const [photos, setPhotos] = useState<SamplingPhoto[]>([]);
    const [weatherConditions, setWeatherConditions] = useState('');
    const [samplingNotes, setSamplingNotes] = useState('');
    const [mapCenter, setMapCenter] = useState<[number, number]>([6.9271, 79.8612]);

    const [newMeasurement, setNewMeasurement] = useState({
        parameter: '',
        value: '',
        unit: '',
    });

    const [environmentalCRFs, setEnvironmentalCRFs] = useState<CRF[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadEnvironmentalCRFs();
    }, []);

    const loadEnvironmentalCRFs = async () => {
        try {
            setLoading(true);
            const allCRFs = await crfService.getAll();
            const envCRFs = allCRFs.filter((crf: CRF) => 
                crf.samplingType === 'Environmental' || crf.environmentalData
            );
            setEnvironmentalCRFs(envCRFs);
        } catch (error) {
            console.error('Error loading environmental CRFs:', error);
        } finally {
            setLoading(false);
        }
    };

    const environmentalSampleTypes = [
        'Surface Water', 'Groundwater', 'Wastewater', 'Soil', 'Air Quality',
        'Sediment', 'Industrial Effluent', 'Drinking Water', 'Marine Water', 'Other'
    ];

    const samplingTypes = [
        'Grab Sample', 'Composite Sample', 'Continuous Monitoring', 'Passive Sampling', 'Other'
    ];

    const commonTestParameters = {
        'Water Quality': ['pH', 'Temperature', 'Dissolved Oxygen', 'BOD', 'COD', 'TSS', 'TDS', 'Turbidity', 'Conductivity', 'Ammonia', 'Nitrate', 'Phosphate'],
        'Air Quality': ['PM2.5', 'PM10', 'CO', 'CO2', 'NO2', 'SO2', 'O3', 'VOC'],
        'Soil': ['pH', 'Moisture', 'Organic Matter', 'Nitrogen', 'Phosphorus', 'Potassium', 'Heavy Metals'],
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'numberOfSamples' ? parseInt(value) || 1 : value
        }));
    };

    const handleParameterToggle = (param: string) => {
        setFormData(prev => ({
            ...prev,
            testParameters: prev.testParameters.includes(param)
                ? prev.testParameters.filter(p => p !== param)
                : [...prev.testParameters, param]
        }));
    };

    const handleMapClick = (lat: number, lng: number) => {
        const newCoord: GPSCoordinate = {
            latitude: lat,
            longitude: lng,
            accuracy: 10,
            timestamp: new Date().toISOString()
        };
        setGpsCoordinates(prev => [...prev, newCoord]);
        setMapCenter([lat, lng]);
    };

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    const newCoord: GPSCoordinate = {
                        latitude,
                        longitude,
                        accuracy: accuracy || undefined,
                        timestamp: new Date().toISOString()
                    };
                    setGpsCoordinates(prev => [...prev, newCoord]);
                    setMapCenter([latitude, longitude]);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to get your location. Please check your browser permissions.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    };

    const handleRemoveCoordinate = (index: number) => {
        setGpsCoordinates(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddMeasurement = () => {
        if (!newMeasurement.parameter || !newMeasurement.value) {
            alert('Please enter parameter and value');
            return;
        }
        const measurement: FieldMeasurement = {
            ...newMeasurement,
            timestamp: new Date().toISOString()
        };
        setFieldMeasurements(prev => [...prev, measurement]);
        setNewMeasurement({ parameter: '', value: '', unit: '' });
    };

    const handleRemoveMeasurement = (index: number) => {
        setFieldMeasurements(prev => prev.filter((_, i) => i !== index));
    };

    const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const photo: SamplingPhoto = {
                    id: Date.now().toString(),
                    dataUrl: reader.result as string,
                    description: `Photo taken at ${new Date().toLocaleString()}`,
                    timestamp: new Date().toISOString()
                };
                setPhotos(prev => [...prev, photo]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    const handleRemovePhoto = (id: string) => {
        setPhotos(prev => prev.filter(p => p.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.customer || !formData.sampleType || formData.numberOfSamples < 1) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);

            const environmentalMetadata: EnvironmentalMetadata = {
                gpsCoordinates,
                fieldMeasurements,
                photos,
                weatherConditions,
                samplingNotes
            };

            const crfData: Partial<CRF> = {
                crfId: `ENV-${Date.now()}`,
                crfType: 'ENV',
                customer: formData.customer,
                address: formData.address,
                contact: formData.contact,
                email: formData.email,
                sampleType: formData.sampleType,
                samplingType: formData.samplingType,
                numberOfSamples: formData.numberOfSamples,
                testParameters: formData.testParameters,
                receptionDate: new Date().toISOString(),
                receivedBy: 'Current User',
                priority: 'Normal',
                status: 'created',
                environmentalData: JSON.stringify(environmentalMetadata)
            };

            const createdCRF = await crfService.create(crfData as CRF);

            for (let i = 0; i < formData.numberOfSamples; i++) {
                const sampleData = {
                    crfId: createdCRF.id!,
                    sampleId: `${createdCRF.crfId}-S${String(i + 1).padStart(2, '0')}`,
                    description: gpsCoordinates.length > 0 
                        ? `GPS: ${gpsCoordinates[0].latitude.toFixed(6)}, ${gpsCoordinates[0].longitude.toFixed(6)}`
                        : 'Environmental sample',
                    status: 'received',
                    condition: 'good'
                };
                await sampleService.create(sampleData);
            }

            alert(`Environmental CRF created successfully!\n\nGPS Points: ${gpsCoordinates.length}\nField Measurements: ${fieldMeasurements.length}\nPhotos: ${photos.length}`);
            
            resetForm();
            loadEnvironmentalCRFs();
        } catch (error) {
            console.error('Error creating environmental CRF:', error);
            alert('Failed to create environmental CRF');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            customer: '',
            address: '',
            contact: '',
            email: '',
            sampleType: '',
            samplingType: '',
            numberOfSamples: 1,
            testParameters: [],
        });
        setGpsCoordinates([]);
        setFieldMeasurements([]);
        setPhotos([]);
        setWeatherConditions('');
        setSamplingNotes('');
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Environmental Sampling</h1>
                <p className="text-sm text-gray-600 mt-1">Record environmental samples with GPS tracking, field measurements, and photos</p>
            </div>

            <form onSubmit={handleSubmit}>
                <Card className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                            <input name="customer" value={formData.customer} onChange={handleInputChange} required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                            <input name="contact" value={formData.contact} onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input name="address" value={formData.address} onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input name="email" type="email" value={formData.email} onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                </Card>

                <Card className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Sample Details</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sample Type *</label>
                            <select name="sampleType" value={formData.sampleType} onChange={handleInputChange} required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Select type...</option>
                                {environmentalSampleTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sampling Type</label>
                            <select name="samplingType" value={formData.samplingType} onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Select type...</option>
                                {samplingTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Samples *</label>
                            <input name="numberOfSamples" type="number" min="1" value={formData.numberOfSamples} onChange={handleInputChange} required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                </Card>

                <Card className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">GPS Location Tracking</h3>
                        <Button type="button" onClick={handleGetCurrentLocation} className="flex items-center gap-2">
                            <Navigation className="w-4 h-4" />Use My Location
                        </Button>
                    </div>
                    <div className="mb-4">
                        <MapContainer center={mapCenter} zoom={13} style={{ height: '320px', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
                            <MapClickHandler onClick={handleMapClick} />
                            {gpsCoordinates.map((coord, idx) => (
                                <Marker key={idx} position={[coord.latitude, coord.longitude]}>
                                    <Popup>
                                        <div className="text-sm">
                                            <p><strong>Point {idx + 1}</strong></p>
                                            <p>Lat: {coord.latitude.toFixed(6)}</p>
                                            <p>Lng: {coord.longitude.toFixed(6)}</p>
                                            {coord.accuracy && <p>Accuracy: ±{coord.accuracy.toFixed(0)}m</p>}
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                    {gpsCoordinates.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Recorded GPS Points ({gpsCoordinates.length})</p>
                            <div className="grid grid-cols-2 gap-2">
                                {gpsCoordinates.map((coord, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm">{coord.latitude.toFixed(6)}, {coord.longitude.toFixed(6)}</span>
                                        </div>
                                        <button type="button" onClick={() => handleRemoveCoordinate(idx)} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                <Card className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Field Measurements</h3>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Parameter</label>
                            <input placeholder="e.g., Temperature" value={newMeasurement.parameter}
                                onChange={(e) => setNewMeasurement(prev => ({ ...prev, parameter: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                            <input placeholder="e.g., 28.5" value={newMeasurement.value}
                                onChange={(e) => setNewMeasurement(prev => ({ ...prev, value: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                            <input placeholder="e.g., °C" value={newMeasurement.unit}
                                onChange={(e) => setNewMeasurement(prev => ({ ...prev, unit: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="flex items-end">
                            <Button type="button" onClick={handleAddMeasurement} className="w-full flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" />Add
                            </Button>
                        </div>
                    </div>
                    {fieldMeasurements.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Parameter</TableHead>
                                    <TableHead>Value</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fieldMeasurements.map((measurement, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{measurement.parameter}</TableCell>
                                        <TableCell className="font-semibold">{measurement.value}</TableCell>
                                        <TableCell>{measurement.unit}</TableCell>
                                        <TableCell>{new Date(measurement.timestamp).toLocaleTimeString()}</TableCell>
                                        <TableCell>
                                            <button type="button" onClick={() => handleRemoveMeasurement(idx)} className="text-red-500 hover:text-red-700">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Card>

                <Card className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Photo Documentation</h3>
                    <div className="mb-4">
                        <label className="flex items-center gap-2 cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-fit">
                            <Camera className="w-4 h-4" />Capture/Upload Photos
                            <input type="file" accept="image/*" multiple capture="environment" onChange={handlePhotoCapture} className="hidden" />
                        </label>
                    </div>
                    {photos.length > 0 && (
                        <div className="grid grid-cols-4 gap-4">
                            {photos.map(photo => (
                                <div key={photo.id} className="relative group">
                                    <img src={photo.dataUrl} alt={photo.description} className="w-full h-32 object-cover rounded border" />
                                    <button type="button" onClick={() => handleRemovePhoto(photo.id)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <p className="text-xs text-gray-600 mt-1">{photo.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Weather Conditions</label>
                            <input placeholder="e.g., Sunny, 30°C, Light breeze" value={weatherConditions}
                                onChange={(e) => setWeatherConditions(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sampling Notes</label>
                            <textarea rows={4} placeholder="Additional observations, site conditions, etc."
                                value={samplingNotes} onChange={(e) => setSamplingNotes(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                </Card>

                {formData.sampleType && (
                    <Card className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Parameters</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {(commonTestParameters[formData.sampleType as keyof typeof commonTestParameters] || commonTestParameters['Water Quality']).map(param => (
                                <label key={param} className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={formData.testParameters.includes(param)}
                                        onChange={() => handleParameterToggle(param)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                                    <span className="text-sm">{param}</span>
                                </label>
                            ))}
                        </div>
                    </Card>
                )}

                <div className="flex justify-end gap-3">
                    <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Environmental CRF'}
                    </Button>
                </div>
            </form>

            <Card className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Environmental CRFs</h3>
                {loading && <p className="text-gray-500">Loading...</p>}
                {!loading && environmentalCRFs.length === 0 && <p className="text-gray-500">No environmental CRFs found</p>}
                {!loading && environmentalCRFs.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>CRF ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Sample Type</TableHead>
                                <TableHead>Samples</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>GPS Points</TableHead>
                                <TableHead>Photos</TableHead>
                                <TableHead>Created</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {environmentalCRFs.map(crf => {
                                let envData: EnvironmentalMetadata | null = null;
                                try {
                                    envData = crf.environmentalData ? JSON.parse(crf.environmentalData) : null;
                                } catch (e) {
                                    console.error('Failed to parse environmental data', e);
                                }
                                return (
                                    <TableRow key={crf.id}>
                                        <TableCell className="font-semibold">{crf.crfId}</TableCell>
                                        <TableCell>{crf.customer}</TableCell>
                                        <TableCell>{crf.sampleType}</TableCell>
                                        <TableCell>{crf.numberOfSamples}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                crf.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>{crf.status}</span>
                                        </TableCell>
                                        <TableCell>
                                            {envData?.gpsCoordinates?.length ? (
                                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                    {envData.gpsCoordinates.length} points
                                                </span>
                                            ) : <span className="text-gray-400">-</span>}
                                        </TableCell>
                                        <TableCell>
                                            {envData?.photos?.length ? (
                                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                    {envData.photos.length} photos
                                                </span>
                                            ) : <span className="text-gray-400">-</span>}
                                        </TableCell>
                                        <TableCell>{crf.createdAt ? new Date(crf.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    );
};
