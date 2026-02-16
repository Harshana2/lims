import React from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { CheckCircle2, Circle } from 'lucide-react';

const stages = [
    { key: 'request', label: 'Request', statusKey: 'requestStatus' },
    { key: 'quotation', label: 'Quotation', statusKey: 'quotationStatus' },
    { key: 'crf', label: 'CRF', statusKey: 'crfStatus' },
    { key: 'assignment', label: 'Assignment', statusKey: 'assignmentsLocked' },
    { key: 'testing', label: 'Testing', statusKey: 'resultsStatus' },
    { key: 'review', label: 'Review', statusKey: 'reviewStatus' },
    { key: 'report', label: 'Report', statusKey: 'reviewStatus' },
];

export const WorkflowTimeline: React.FC = () => {
    const workflow = useWorkflow();

    const isStageComplete = (stage: any) => {
        switch (stage.key) {
            case 'request':
                return workflow.requests.length > 0 && workflow.requests.some(r => r.status === 'confirmed');
            case 'quotation':
                return workflow.quotations.length > 0;
            case 'crf':
                return workflow.crfStatus === 'CRF Approved';
            case 'assignment':
                return workflow.assignmentsLocked;
            case 'testing':
                return workflow.resultsStatus === 'Results Submitted';
            case 'review':
                return workflow.reviewStatus === 'Approved';
            case 'report':
                return workflow.reviewStatus === 'Approved';
            default:
                return false;
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Workflow Progress</h3>

            <div className="flex items-center justify-between">
                {stages.map((stage, index) => (
                    <React.Fragment key={stage.key}>
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${isStageComplete(stage)
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-400'
                                    }`}
                            >
                                {isStageComplete(stage) ? (
                                    <CheckCircle2 size={20} />
                                ) : (
                                    <Circle size={20} />
                                )}
                            </div>
                            <span className="text-xs mt-2 text-gray-600 text-center">{stage.label}</span>
                        </div>

                        {index < stages.length - 1 && (
                            <div
                                className={`flex-1 h-1 mx-2 ${isStageComplete(stage) ? 'bg-green-500' : 'bg-gray-200'
                                    }`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};
