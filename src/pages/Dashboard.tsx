import React from 'react';
import { Card } from '../components/ui/Card';
import { WorkflowTimeline } from '../components/WorkflowTimeline';
import { useWorkflow } from '../context/WorkflowContext';
import { FileText, FlaskConical, CheckCircle, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const workflow = useWorkflow();

    const confirmedRequests = workflow.getConfirmedRequests();
    const pendingRequests = workflow.requests.filter(r => r.status === 'pending');

    const stats = [
        {
            title: 'Total Requests',
            value: workflow.requests.length.toString(),
            icon: FileText,
            color: 'bg-blue-500',
        },
        {
            title: 'Confirmed Requests',
            value: confirmedRequests.length.toString(),
            icon: CheckCircle,
            color: 'bg-green-500',
        },
        {
            title: 'Pending Requests',
            value: pendingRequests.length.toString(),
            icon: AlertCircle,
            color: 'bg-yellow-500',
        },
        {
            title: 'Quotations Generated',
            value: workflow.quotations.length.toString(),
            icon: FlaskConical,
            color: 'bg-purple-500',
        },
    ];

    const latestRequest = workflow.requests[workflow.requests.length - 1];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                <stat.icon size={24} className="text-white" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Workflow Timeline */}
            <WorkflowTimeline />

            {/* Quick Info */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Latest Request</h3>
                    {latestRequest ? (
                        <div className="space-y-2">
                            <p className="text-sm"><span className="font-medium">Request ID:</span> {latestRequest.id}</p>
                            <p className="text-sm"><span className="font-medium">Customer:</span> {latestRequest.customer}</p>
                            <p className="text-sm"><span className="font-medium">Sample Type:</span> {latestRequest.sampleType}</p>
                            <p className="text-sm"><span className="font-medium">Samples:</span> {latestRequest.numberOfSamples}</p>
                            <p className="text-sm"><span className="font-medium">Status:</span> 
                                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                                    latestRequest.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {latestRequest.status}
                                </span>
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No requests yet</p>
                    )}
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Total Requests:</span>
                            <span className="font-medium">{workflow.requests.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Pending Requests:</span>
                            <span className="font-medium">{pendingRequests.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Confirmed Requests:</span>
                            <span className="font-medium">{confirmedRequests.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>CRF Status:</span>
                            <span className="font-medium">{workflow.crfStatus}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Results Status:</span>
                            <span className="font-medium">{workflow.resultsStatus}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
