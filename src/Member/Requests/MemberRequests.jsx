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
    Dumbbell
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Freeze Membership Card */}
                <div className="group relative overflow-hidden bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary-light rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:scale-110 transition-all" />
                    <div className="relative space-y-8">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-[2rem] bg-primary-light flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                <Snowflake size={32} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Freeze Membership</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Temporary pause your plan</p>
                            </div>
                        </div>
                        <div className="pt-4">
                            <button
                                onClick={() => handleOpenDrawer('Freeze Membership')}
                                className="w-full h-14 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-violet-100 hover:bg-primary-hover transition-all flex items-center justify-center gap-3 group/btn"
                            >
                                Request Freeze
                                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trainer Request Card */}
                <div className="group relative overflow-hidden bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary-light rounded-full -mr-20 -mt-20 blur-3xl opacity-50 group-hover:scale-110 transition-all" />
                    <div className="relative space-y-8">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-[2rem] bg-primary-light flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                <UserPlus size={32} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Request Trainer</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Change or assign personal coach</p>
                            </div>
                        </div>
                        <div className="pt-4">
                            <button
                                onClick={() => handleOpenDrawer('Request Trainer Change')}
                                className="w-full h-14 border-2 border-slate-900 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center justify-center gap-3 group/btn"
                            >
                                Request Trainer
                                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
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
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${request.type === 'Freeze Membership' ? 'bg-violet-100 text-primary' :
                                        request.type === 'Diet Plan' ? 'bg-emerald-100 text-emerald-600' :
                                            request.type === 'Workout Plan' ? 'bg-violet-100 text-primary' :
                                                'bg-purple-100 text-primary'
                                        }`}>
                                        {request.type === 'Freeze Membership' ? <Snowflake size={20} /> :
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
                                    <button className="p-2.5 text-slate-300 hover:text-primary hover:bg-white rounded-xl transition-all">
                                        <ChevronRight size={20} />
                                    </button>
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
