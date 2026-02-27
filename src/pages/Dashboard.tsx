import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { WorkflowTimeline } from '../components/WorkflowTimeline';
import { SampleCollectionCalendar } from '../components/SampleCollectionCalendar';
import { useWorkflow } from '../context/WorkflowContext';
import { FileText, FlaskConical, CheckCircle, Clock, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { mockPendingTasks, mockChemistWorkload, mockMonthlyStats } from '../data/mockData';
import crfService, { type CRF } from '../services/crfService';
import sampleService, { type Sample } from '../services/sampleService';

export const Dashboard: React.FC = () => {
    const workflow = useWorkflow();
    const [crfs, setCrfs] = useState<CRF[]>([]);
    const [samples, setSamples] = useState<Sample[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [crfsData, samplesData] = await Promise.all([
                crfService.getAll(),
                sampleService.getAll(),
            ]);
            setCrfs(crfsData);
            setSamples(samplesData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };

    const confirmedRequests = workflow.getConfirmedRequests();
    const pendingRequests = workflow.requests.filter(r => r.status === 'pending');
    
    // Calculate overdue and at-risk tasks
    const overdueTasks = mockPendingTasks.filter(t => t.status === 'Overdue');
    const atRiskTasks = mockPendingTasks.filter(t => t.status === 'At Risk');
    const onTrackTasks = mockPendingTasks.filter(t => t.status === 'On Track');

    // Use real CRF data for stats
    const activeSamples = samples?.filter(s => s.status === 'testing').length || 0;
    const pendingReview = crfs?.filter(c => c.status === 'review').length || 0;

    const stats = [
        {
            title: 'Total CRFs',
            value: (crfs?.length || 0).toString(),
            icon: FileText,
            color: 'bg-primary-light',
            iconColor: 'text-primary-500',
            change: '+12%',
        },
        {
            title: 'Active Tests',
            value: activeSamples.toString(),
            icon: FlaskConical,
            color: 'bg-primary-light',
            iconColor: 'text-primary-500',
            change: '+8%',
        },
        {
            title: 'Pending Review',
            value: pendingReview.toString(),
            icon: CheckCircle,
            color: 'bg-status-success/10',
            iconColor: 'text-status-success',
            change: '+5%',
        },
        {
            title: 'Overdue Tasks',
            value: overdueTasks.length.toString(),
            icon: AlertTriangle,
            color: 'bg-status-error/10',
            iconColor: 'text-status-error',
            change: '-2',
        },
    ];

    const latestRequest = workflow.requests[workflow.requests.length - 1];

    // Get max value for chart scaling
    const maxTests = Math.max(...mockMonthlyStats.map(s => s.tests));

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-sm text-gray-600 mt-1">Overview of laboratory operations and performance</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-600">Current Date</p>
                    <p className="text-lg font-semibold text-gray-800">{new Date().toLocaleDateString('en-GB')}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-neutral-textSecondary mb-2">{stat.title}</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-bold text-neutral-textPrimary">{stat.value}</p>
                                    <span className={`text-xs font-semibold ${
                                        stat.change.startsWith('+') ? 'text-status-success' : 'text-status-error'
                                    }`}>
                                        {stat.change}
                                    </span>
                                </div>
                            </div>
                            <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center`}>
                                <stat.icon size={28} className={stat.iconColor} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Monthly Test Statistics */}
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Monthly Test Statistics</h3>
                        <TrendingUp size={20} className="text-primary-600" />
                    </div>
                    <div className="space-y-3">
                        {mockMonthlyStats.map((stat, index) => (
                            <div key={index}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{stat.month}</span>
                                    <div className="flex gap-4">
                                        <span className="text-primary-600 font-semibold">{stat.tests} tests</span>
                                        <span className="text-green-600">{stat.reports} reports</span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <div 
                                        className="h-2 bg-primary-500 rounded-l"
                                        style={{ width: `${(stat.tests / maxTests) * 100}%` }}
                                    ></div>
                                    <div 
                                        className="h-2 bg-green-500 rounded-r"
                                        style={{ width: `${(stat.reports / maxTests) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-primary-500 rounded"></div>
                            <span className="text-gray-600">Tests Conducted</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span className="text-gray-600">Reports Generated</span>
                        </div>
                    </div>
                </Card>

                {/* Chemist Workload */}
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">Chemist Workload</h3>
                        <Users size={20} className="text-primary-600" />
                    </div>
                    <div className="space-y-4">
                        {mockChemistWorkload.slice(0, 5).map((chemist) => (
                            <div key={chemist.chemistId}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{chemist.chemistName}</span>
                                    <div className="flex gap-3 text-xs">
                                        <span className="text-primary-600 font-semibold">{chemist.activeTasks} active</span>
                                        <span className="text-green-600">{chemist.completedThisWeek} done</span>
                                        {chemist.overdueTests > 0 && (
                                            <span className="text-red-600 font-semibold">{chemist.overdueTests} overdue</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1 h-2">
                                    <div 
                                        className={`bg-primary-500 rounded-l ${chemist.overdueTests > 0 ? '' : 'rounded-r'}`}
                                        style={{ width: `${(chemist.activeTasks / 10) * 100}%` }}
                                        title={`${chemist.activeTasks} active tasks`}
                                    ></div>
                                    {chemist.overdueTests > 0 && (
                                        <div 
                                            className="bg-red-500 rounded-r"
                                            style={{ width: `${(chemist.overdueTests / 10) * 100}%` }}
                                            title={`${chemist.overdueTests} overdue`}
                                        ></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Active Tasks:</span>
                            <span className="font-semibold text-gray-800">
                                {mockChemistWorkload.reduce((sum, c) => sum + c.activeTasks, 0)}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Pending Tasks with Due Dates */}
            <Card className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Pending Tasks & Due Dates</h3>
                    <div className="flex gap-2 text-xs">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-medium">
                            {overdueTasks.length} Overdue
                        </span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-medium">
                            {atRiskTasks.length} At Risk
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                            {onTrackTasks.length} On Track
                        </span>
                    </div>
                </div>
                <div className="space-y-3">
                    {mockPendingTasks.map((task) => {
                        const dueDate = new Date(task.dueDate);
                        const today = new Date();
                        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        
                        return (
                            <div 
                                key={task.id} 
                                className={`p-4 rounded-lg border-l-4 ${
                                    task.status === 'Overdue' ? 'border-red-500 bg-red-50' :
                                    task.status === 'At Risk' ? 'border-yellow-500 bg-yellow-50' :
                                    'border-green-500 bg-green-50'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-semibold text-gray-800">{task.crfId}</span>
                                            <span className="text-sm text-gray-600">• {task.customer}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                task.priority === 'Rush' ? 'bg-red-100 text-red-700' :
                                                task.priority === 'Urgent' ? 'bg-orange-100 text-orange-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {task.priority}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <FlaskConical size={14} />
                                                {task.sampleType}
                                            </span>
                                            <span>• {task.taskType}</span>
                                            <span>• Assigned to: {task.assignedTo}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock size={14} className={
                                                task.status === 'Overdue' ? 'text-red-600' :
                                                task.status === 'At Risk' ? 'text-yellow-600' :
                                                'text-green-600'
                                            } />
                                            <span className="text-sm font-medium text-gray-700">
                                                {dueDate.toLocaleDateString('en-GB')}
                                            </span>
                                        </div>
                                        <span className={`text-xs font-medium ${
                                            task.status === 'Overdue' ? 'text-red-600' :
                                            task.status === 'At Risk' ? 'text-yellow-600' :
                                            'text-green-600'
                                        }`}>
                                            {task.status === 'Overdue' ? `${Math.abs(daysUntilDue)} days overdue` :
                                             daysUntilDue === 0 ? 'Due today' :
                                             daysUntilDue === 1 ? 'Due tomorrow' :
                                             `${daysUntilDue} days remaining`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Workflow Timeline */}
            <WorkflowTimeline />

            {/* Sample Collection Calendar */}
            <div className="mt-8">
                <SampleCollectionCalendar />
            </div>

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
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total Requests:</span>
                            <span className="font-semibold text-gray-800">{workflow.requests.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Pending Requests:</span>
                            <span className="font-semibold text-yellow-600">{pendingRequests.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Confirmed Requests:</span>
                            <span className="font-semibold text-green-600">{confirmedRequests.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">CRFs Created:</span>
                            <span className="font-semibold text-primary-600">{workflow.crfs.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Quotations:</span>
                            <span className="font-semibold text-purple-600">{workflow.quotations.length}</span>
                        </div>
                        <div className="pt-3 mt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Active Chemists:</span>
                                <span className="font-semibold text-gray-800">{mockChemistWorkload.length}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

