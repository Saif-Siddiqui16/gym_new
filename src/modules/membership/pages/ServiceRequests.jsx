import React, { useState, useEffect } from 'react';
import { Check, X, Clock, User, ClipboardList, Filter, Search, MessageSquare, Shield, Dumbbell, Utensils, UserPlus } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { fetchServiceRequestsAPI, updateServiceRequestStatusAPI } from '../../../api/admin/adminApi';
import { toast } from 'react-hot-toast';
import { useBranchContext } from '../../../context/BranchContext';

const ServiceRequests = () => {
    const { selectedBranch } = useBranchContext();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('Pending');
    const [filterType, setFilterType] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadRequests();
    }, [selectedBranch, filterStatus, filterType]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const params = {
                branchId: selectedBranch,
                status: filterStatus,
                type: filterType
            };
            const data = await fetchServiceRequestsAPI(params);
            setRequests(data);
        } catch (error) {
            console.error('Error loading service requests:', error);
            toast.error('Failed to load service requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        if (!window.confirm(`Are you sure you want to mark this request as ${status}?`)) return;

        try {
            await updateServiceRequestStatusAPI(id, status);
            toast.success(`Request ${status} successfully`);
            loadRequests();
        } catch (error) {
            console.error('Error updating request status:', error);
            toast.error('Failed to update status');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Diet Plan': return <Utensils className="text-emerald-500" size={20} />;
            case 'Workout Plan': return <Dumbbell className="text-indigo-500" size={20} />;
            case 'Freeze Membership': return <Shield className="text-amber-500" size={20} />;
            case 'Unfreeze Membership': return <Shield className="text-blue-500" size={20} />;
            case 'Request Trainer Change': return <UserPlus className="text-purple-500" size={20} />;
            default: return <ClipboardList className="text-slate-400" size={20} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Accepted':
            case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Rejected':
            case 'Cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const filteredRequests = requests.filter(req =>
        req.member?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.member?.memberId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fade-in space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Member Service Requests</h2>
                    <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest">
                        Manage plans, freezes, and trainer changes
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-amber-100">
                        <Clock size={18} />
                        Pending: {requests.filter(r => r.status === 'Pending').length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search member..."
                            className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <select
                            className="w-full h-11 px-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm transition-all"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                    <div>
                        <select
                            className="w-full h-11 px-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm transition-all"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="All">All Requests</option>
                            <option value="Diet Plan">Diet Plan</option>
                            <option value="Workout Plan">Workout Plan</option>
                            <option value="Freeze Membership">Freeze Membership</option>
                            <option value="Unfreeze Membership">Unfreeze Membership</option>
                            <option value="Request Trainer Change">Trainer Change</option>
                        </select>
                    </div>
                    <Button
                        onClick={loadRequests}
                        className="h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                    >
                        <Filter size={18} /> Apply Filters
                    </Button>
                </div>
            </Card>

            {/* List */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching requests...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4 shadow-sm">
                            <ClipboardList size={32} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">No Requests Found</h3>
                        <p className="text-slate-500 font-medium">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    filteredRequests.map(request => (
                        <Card key={request.id} className="p-0 overflow-hidden border border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 bg-white group">
                            <div className="flex flex-col md:flex-row">
                                {/* Type Icon & Status Bar */}
                                <div className={`w-2 shrink-0 ${request.status === 'Pending' ? 'bg-amber-400' : 'bg-emerald-400'}`} />

                                <div className="flex-1 p-6 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                                    <div className="flex items-start gap-5">
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                                            {getIcon(request.type)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-black text-xl text-slate-900 tracking-tight">{request.member?.name}</h3>
                                                <span className="text-[10px] font-black bg-slate-100 px-2 py-0.5 rounded-lg text-slate-500 uppercase tracking-widest">{request.member?.memberId}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest items-center">
                                                <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                                    {request.type}
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md">
                                                    <Clock size={12} /> {new Date(request.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                                {request.tenant?.name && (
                                                    <span className="bg-slate-50 px-2 py-0.5 rounded-md hidden sm:block">
                                                        Branch: {request.tenant.name}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-3 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100 max-w-xl text-slate-600 font-medium leading-relaxed">
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Details:</div>
                                                {request.details || 'No additional details provided.'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto self-end md:self-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(request.status)}`}>
                                            {request.status}
                                        </span>

                                        {request.status === 'Pending' && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleAction(request.id, 'Rejected')}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-95"
                                                    title="Reject"
                                                >
                                                    <X size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(request.id, 'Accepted')}
                                                    className="px-6 h-10 bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-2"
                                                >
                                                    <Check size={18} /> Approve
                                                </button>
                                            </div>
                                        )}

                                        {(request.type === 'Diet Plan' || request.type === 'Workout Plan') && request.status === 'Accepted' && (
                                            <button
                                                onClick={() => {/* Navigate to plan builder */ }}
                                                className="px-6 h-10 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                                            >
                                                <ClipboardList size={18} /> Build Plan
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default ServiceRequests;
