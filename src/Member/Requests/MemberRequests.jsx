import React, { useState, useEffect } from 'react';
import {
    ClipboardList,
    Snowflake,
    UserPlus,
    Clock,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Search,
    History,
    ArrowUpRight,
    Sparkles,
    UserCircle,
    Utensils,
    Dumbbell,
    Lock,
    Sun
} from 'lucide-react';
import { getServiceRequests, addServiceRequest } from '../../api/member/memberApi';
import RightDrawer from '../../components/common/RightDrawer';
import ServiceRequestDrawer from '../components/ServiceRequestDrawer';
import toast from 'react-hot-toast';

const MemberRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRequestDrawerOpen, setIsRequestDrawerOpen] = useState(false);
    const [defaultType, setDefaultType] = useState('Freeze Membership');

    const loadRequests = async () => {
        try {
            const data = await getServiceRequests();
            setRequests(data || []);
        } catch (error) {
            console.error('Failed to load requests:', error);
            // toast.error("Failed to load request history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleOpenDrawer = (type) => {
        setDefaultType(type);
        setIsRequestDrawerOpen(true);
    };

    const handleRequestSubmit = async (requestData) => {
        try {
            toast.loading("Submitting request...", { id: 'service-request' });
            await addServiceRequest({
                type: requestData.type,
                details: requestData.reason,
                rawType: requestData.type,
                status: 'Pending'
            });
            toast.success("Request submitted successfully!", { id: 'service-request' });
            loadRequests();
        } catch (error) {
            toast.error(error.message || "Failed to submit request", { id: 'service-request' });
        }
    };

    return (
        <div className="saas-container h-screen  space-y-10 fade-in scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent bg-white">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-10 border-b-2 border-slate-100">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-violet-100">
                        <ClipboardList size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">My Requests</h1>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">Manage membership and service requests</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Freeze Membership Card */}
                <div className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-violet-100 transition-all">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Snowflake size={22} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 tracking-tight">Freeze Membership</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temporary pause your plan</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleOpenDrawer('Freeze Membership')}
                            className="w-full h-11 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
                        >
                            Request Freeze <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Unfreeze Membership Card */}
                <div className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-amber-100 transition-all">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                                <Sun size={22} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 tracking-tight">Unfreeze Membership</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resume your membership</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleOpenDrawer('Unfreeze Membership')}
                            className="w-full h-11 border-2 border-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            Request Unfreeze <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Request Locker Card */}
                <div className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-emerald-100 transition-all">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <Lock size={22} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 tracking-tight">Request Locker</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Get a locker assigned</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleOpenDrawer('Request Locker')}
                            className="w-full h-11 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                        >
                            Request Locker <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Trainer Request Card */}
                <div className="group relative overflow-hidden bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-violet-100 transition-all">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all">
                                <UserPlus size={22} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 tracking-tight">Request Trainer</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Change or assign coach</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleOpenDrawer('Request Trainer Change')}
                            className="w-full h-11 border-2 border-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            Request Trainer <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Request History Section */}
            <div className="bg-white rounded-[3rem] border-2 border-slate-100 p-10 shadow-xl shadow-slate-200/50 min-h-[400px]">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-primary-light rounded-2xl text-primary">
                        <History size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Request History</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Track status of your submissions</p>
                    </div>
                </div>

                {requests.length > 0 ? (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div key={request.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-3xl bg-slate-50 border-2 border-slate-100 group hover:bg-white hover:border-violet-100 transition-all">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                        request.type === 'Freeze Membership' ? 'bg-blue-50 text-blue-600' :
                                        request.type === 'Unfreeze Membership' ? 'bg-amber-50 text-amber-600' :
                                        request.type === 'Request Locker' ? 'bg-emerald-50 text-emerald-600' :
                                        request.type === 'Diet Plan' ? 'bg-emerald-100 text-emerald-600' :
                                        request.type === 'Workout Plan' ? 'bg-violet-100 text-primary' :
                                        'bg-purple-100 text-primary'
                                        }`}>
                                        {request.type === 'Freeze Membership' ? <Snowflake size={20} /> :
                                            request.type === 'Unfreeze Membership' ? <Sun size={20} /> :
                                            request.type === 'Request Locker' ? <Lock size={20} /> :
                                            request.type === 'Diet Plan' ? <Utensils size={20} /> :
                                            request.type === 'Workout Plan' ? <Dumbbell size={20} /> :
                                            <UserPlus size={20} />}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 text-sm tracking-tight">{request.type}</h4>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                                            {request.date ? new Date(request.date).toLocaleDateString() : (request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'Pending Date')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${(request.status === 'Approved' || request.status === 'Accepted') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        request.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                            'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {request.status || 'Pending'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 mb-8 border-2 border-dashed border-slate-100">
                            <Clock size={40} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No requests yet</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">All your future service requests will appear here</p>
                    </div>
                )}
            </div>

            <ServiceRequestDrawer
                isOpen={isRequestDrawerOpen}
                onClose={() => setIsRequestDrawerOpen(false)}
                onSubmit={handleRequestSubmit}
                initialType={defaultType}
            />
        </div>
    );
};

export default MemberRequests;
