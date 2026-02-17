import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { mockScheduledCollections } from '../data/mockData';

const localizer = momentLocalizer(moment);

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: {
        customer: string;
        sampleType: string;
        status: string;
    };
}

export const SampleCollectionCalendar: React.FC = () => {
    // Transform scheduled collections into calendar events
    const events: CalendarEvent[] = mockScheduledCollections.map(collection => {
        const startDate = new Date(collection.collectionDate);
        const endDate = new Date(collection.collectionDate);
        endDate.setHours(endDate.getHours() + 1); // 1 hour duration

        return {
            id: collection.id,
            title: `${collection.customerName} - ${collection.sampleType}`,
            start: startDate,
            end: endDate,
            resource: {
                customer: collection.customerName,
                sampleType: collection.sampleType,
                status: collection.status,
            },
        };
    });

    // Custom event styling based on status
    const eventStyleGetter = (event: CalendarEvent) => {
        let backgroundColor = '#3b82f6'; // blue
        
        switch (event.resource.status) {
            case 'scheduled':
                backgroundColor = '#eab308'; // yellow
                break;
            case 'collected':
                backgroundColor = '#22c55e'; // green
                break;
            case 'cancelled':
                backgroundColor = '#ef4444'; // red
                break;
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
            },
        };
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6" style={{ height: '600px' }}>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sample Collection Schedule</h3>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 'calc(100% - 40px)' }}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day', 'agenda']}
                defaultView="month"
                popup
                tooltipAccessor={(event: CalendarEvent) => 
                    `${event.resource.customer}\n${event.resource.sampleType}\nStatus: ${event.resource.status}`
                }
            />
            <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }}></div>
                    <span>Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
                    <span>Collected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                    <span>Cancelled</span>
                </div>
            </div>
        </div>
    );
};
