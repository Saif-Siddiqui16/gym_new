import React, { useState } from 'react';
import { Check, X, Clock, User, PauseCircle } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import StatusBadge from '../components/StatusBadge';

// Mock Data
const PENDING_REQUESTS = [
    { id: 1, memberName: 'Sarah Williams', memberId: 'M-104', plan: 'Platinum Annual', duration: '1 Month', reason: 'Traveling for business', requestedOn: '2025-02-04' },
    { id: 2, memberName: 'Mike Johnson', memberId: 'M-103', plan: 'Bronze Quarterly', duration: '2 Months', reason: 'Medical injury (sprained ankle)', requestedOn: '2025-02-05' },
    { id: 3, memberName: 'Emily Davis', memberId: 'M-108', plan: 'Gold Annual', duration: '3 Months', reason: 'Personal reasons', requestedOn: '2025-02-01' },
];

const FreezeRequests = () => {
    const [requests, setRequests] = useState(PENDING_REQUESTS);

    const handleAction = (id, action) => {
        if (window.confirm(`Are you sure you want to ${action} this request?`)) {
            setRequests(prev => prev.filter(r => r.id !== id));
            alert(`Request ${action === 'approve' ? 'Approved' : 'Rejected'} successfully.`);
        }
    };

    return (
        <div className="fade-in space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Freeze Requests</h2>
                    <p className="text-gray-500 font-bold mt-1">Manage member membership freeze approvals.</p>
                </div>
                <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                    <Clock size={18} />
                    Pending: {requests.length}
                </div>
            </div>

            <div className="grid gap-4">
                {requests.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <PauseCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-bold text-gray-900">No Pending Requests</h3>
                        <p className="text-gray-500">All freeze requests have been processed.</p>
                    </div>
                ) : (
                    requests.map(request => (
                        <Card key={request.id} className="hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-gray-900">{request.memberName}</h3>
                                            <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">{request.memberId}</span>
                                        </div>
                                        <div className="flex gap-4 text-sm text-gray-500 font-medium">
                                            <span>{request.plan}</span>
                                            <span>•</span>
                                            <span className="text-orange-600 bg-orange-50 px-2 rounded-md">Requesting: {request.duration}</span>
                                        </div>
                                        <div className="mt-2 text-sm bg-gray-50 p-2 rounded-lg border border-gray-100 max-w-xl text-gray-700">
                                            <span className="font-bold text-gray-400 text-xs uppercase tracking-wide mr-2">Reason:</span>
                                            {request.reason}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                                    <div className="text-right mr-4 hidden md:block">
                                        <div className="text-xs font-bold text-gray-400 uppercase">Requested On</div>
                                        <div className="text-sm font-bold text-gray-900">{request.requestedOn}</div>
                                    </div>
                                    <Button
                                        onClick={() => handleAction(request.id, 'reject')}
                                        className="flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                        variant="outline"
                                    >
                                        <X size={18} className="mr-2" /> Reject
                                    </Button>
                                    <Button
                                        onClick={() => handleAction(request.id, 'approve')}
                                        className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 shadow-lg border-transparent"
                                        variant="primary"
                                    >
                                        <Check size={18} className="mr-2" /> Approve
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default FreezeRequests;
