import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Eye, CheckCircle, XCircle, User, ChevronLeft, ChevronRight, MessageSquare, Calendar } from 'lucide-react';
import '../styles/GlobalDesign.css';
import CustomDropdown from '../components/common/CustomDropdown';
import MobileCard from '../components/common/MobileCard';
import RightDrawer from '../components/common/RightDrawer';
import { fetchTrainerChangeRequests } from '../api/superadmin/superAdminApi';

const TrainerChangeRequestList = ({ role }) => {
    // For demonstration, assume current user belongs to 'Downtown Center'
    const currentUserBranch = 'Downtown Center';

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const itemsPerPage = 5;

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchTrainerChangeRequests();
                setRequests(data);
            } catch (error) {
                console.error("Failed to fetch trainer change requests", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.memberId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || req.status === statusFilter;

        // RBAC: Managers only see their branch. Super Admin and Branch Admin see all.
        const isAdmin = role === 'SUPER_ADMIN' || role === 'BRANCH_ADMIN';
        const matchesBranch = isAdmin || req.branch === currentUserBranch;

        return matchesSearch && matchesStatus && matchesBranch;
    });

    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const displayedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleAction = (id, newStatus) => {
        setRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: newStatus } : req
        ));
        console.log(`Request ${id} status updated to ${newStatus}`);
    };

    const handleViewDetails = (request) => {
        setSelectedRequest(request);
        setIsDrawerOpen(true);
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Approved': return 'bg-green-50 text-green-600 border-green-100';
            case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 md:p-8">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                        Trainer Change Requests
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">Review and manage member requests for trainer reassignment</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 mb-6">
                <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-violet-500" size={18} />
                        <input
                            type="text"
                            className="pl-11 h-11 w-full rounded-xl border-2 border-slate-200 focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm"
                            placeholder="Search by member name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <CustomDropdown
                            options={['All', 'Pending', 'Approved', 'Rejected']}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            placeholder="All Status"
                            icon={Filter}
                        />
                    </div>
                </div>





                {/* Table */}
                <div className="saas-table-wrapper hidden md:block">
                    <table className="saas-table w-full">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Member</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Requested Change</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100 text-sm">
                            {displayedRequests.length > 0 ? (
                                displayedRequests.map((req) => (
                                    <tr key={req.id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                                                    {req.memberName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">{req.memberName}</div>
                                                    <div className="text-[10px] font-mono text-slate-400 tracking-tight">{req.memberId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-slate-400">From:</span>
                                                    <span className="font-medium text-slate-700">{req.currentTrainer}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-slate-400">To:</span>
                                                    <span className="font-bold text-violet-600">{req.newTrainer}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Calendar size={14} className="text-slate-300" />
                                                <span className="text-xs font-medium">{req.date}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-dashed ${getStatusStyles(req.status)} shadow-sm`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {req.status === 'Pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(req.id, 'Approved')}
                                                            className="w-8 h-8 flex items-center justify-center text-green-500 hover:bg-green-50 rounded-lg transition-all"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(req.id, 'Rejected')}
                                                            className="w-8 h-8 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => handleViewDetails(req)}
                                                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        No requests found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                    {displayedRequests.length > 0 ? (
                        displayedRequests.map((req) => (
                            <MobileCard
                                key={req.id}
                                title={req.memberName}
                                subtitle={req.memberId}
                                status={req.status}
                                statusColor={req.status === 'Approved' ? 'emerald' : req.status === 'Rejected' ? 'rose' : 'amber'}
                                icon={User}
                                iconColor="bg-violet-100 text-violet-600"
                                fields={[
                                    { label: 'Current Trainer', value: req.currentTrainer },
                                    { label: 'Requested Trainer', value: req.newTrainer, highlight: true },
                                    { label: 'Date', value: req.date },
                                    { label: 'Reason', value: req.reason }
                                ]}
                                actions={[
                                    {
                                        label: 'View',
                                        icon: Eye,
                                        onClick: () => handleViewDetails(req),
                                        variant: 'secondary'
                                    },
                                    ...(req.status === 'Pending' ? [
                                        {
                                            label: 'Approve',
                                            icon: CheckCircle,
                                            onClick: () => handleAction(req.id, 'Approved'),
                                            variant: 'primary',
                                            className: 'bg-green-600 hover:bg-green-700 text-white'
                                        },
                                        {
                                            label: 'Reject',
                                            icon: XCircle,
                                            onClick: () => handleAction(req.id, 'Rejected'),
                                            variant: 'danger',
                                            className: 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                                        }
                                    ] : [])
                                ]}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            <p>No requests found.</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/20">
                        <p className="text-xs text-slate-500">
                            Showing <span className="font-bold text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredRequests.length)}</span> of <span className="font-bold text-slate-900">{filteredRequests.length}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-all text-slate-500 shadow-sm"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-all text-slate-500 shadow-sm"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Request Details Drawer */}
            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Request Details"
                subtitle={selectedRequest?.memberId}
            >
                {selectedRequest && (
                    <div className="space-y-8 fade-in">
                        {/* Status Banner */}
                        <div className={`p-4 rounded-2xl border-2 border-dashed flex items-center justify-between ${getStatusStyles(selectedRequest.status)}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${selectedRequest.status === 'Approved' ? 'bg-green-500' : selectedRequest.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                                <span className="text-xs font-black uppercase tracking-[0.2em]">{selectedRequest.status}</span>
                            </div>
                            <span className="text-[10px] font-bold opacity-60 uppercase">{selectedRequest.date}</span>
                        </div>

                        {/* Change Breakdown */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Trainer</p>
                                <p className="font-bold text-slate-700">{selectedRequest.currentTrainer}</p>
                            </div>
                            <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100">
                                <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-2">Requested Trainer</p>
                                <p className="font-black text-violet-600">{selectedRequest.newTrainer}</p>
                            </div>
                        </div>

                        {/* Reason Section */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-slate-400">
                                <MessageSquare size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Member Reason</span>
                            </div>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                                "{selectedRequest.reason}"
                            </p>
                        </div>

                        {/* Branch Info */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch</span>
                            <span className="text-xs font-bold text-slate-700">{selectedRequest.branch}</span>
                        </div>

                        {/* Quick Actions if Pending */}
                        {selectedRequest.status === 'Pending' && (
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={() => { handleAction(selectedRequest.id, 'Rejected'); setIsDrawerOpen(false); }}
                                    className="py-4 bg-white border-2 border-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 hover:text-rose-500 transition-all"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => { handleAction(selectedRequest.id, 'Approved'); setIsDrawerOpen(false); }}
                                    className="py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-violet-200 hover:scale-105 transition-all"
                                >
                                    Approve
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default TrainerChangeRequestList;
