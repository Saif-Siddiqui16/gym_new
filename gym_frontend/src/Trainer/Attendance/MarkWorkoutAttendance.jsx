import React, { useState, useEffect } from 'react';
import {
    Calendar,
    Clock,
    ChevronDown,
    User,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    Save,
    Dumbbell
} from 'lucide-react';
import { getSessions, saveAttendance, getAssignedMembers } from '../../api/trainer/trainerApi';

const MarkWorkoutAttendance = () => {
    const [sessions, setSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState('Select');
    const [selectedWorkout, setSelectedWorkout] = useState('Select Session');
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        const result = await getSessions({ limit: 100 });
        setSessions(result?.data || []);
        if (result?.data?.length > 0) {
            handleSessionSelect(result.data[0]);
        }
    };

    const handleSessionSelect = async (session) => {
        setSelectedSessionId(session.id);
        setSelectedDate(session.date);
        setSelectedTime(session.time);
        setSelectedWorkout(session.title);

        setLoading(true);
        // In real app, we'd fetch members for THIS session. 
        // For mock, we'll just get all assigned members to simulate.
        const result = await getAssignedMembers({ limit: 50 });
        setMembers((result?.data || []).map(m => ({
            ...m,
            status: 'pending' // Default status for new session marking
        })));
        setLoading(false);
    };

    const handleSave = async () => {
        if (!selectedSessionId) return;
        setSaving(true);
        const success = await saveAttendance(selectedSessionId, members.map(m => ({ id: m.id, status: m.status })));
        if (success) {
            alert("Attendance saved successfully!");
        }
        setSaving(false);
    };

    const handleStatusChange = (memberId, status) => {
        setMembers(members.map(m => m.id === memberId ? { ...m, status } : m));
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'absent': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'late': return <Clock className="w-5 h-5 text-amber-500" />;
            default: return null;
        }
    };

    const getStatusClasses = (currentStatus, targetStatus) => {
        const base = "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border w-full justify-center sm:w-auto";
        if (currentStatus === targetStatus) {
            switch (targetStatus) {
                case 'present': return `${base} bg-green-50 border-green-200 text-green-700 ring-2 ring-green-100 shadow-md`;
                case 'absent': return `${base} bg-red-50 border-red-200 text-red-700 ring-2 ring-red-100 shadow-md`;
                case 'late': return `${base} bg-amber-50 border-amber-200 text-amber-700 ring-2 ring-amber-100 shadow-md`;
            }
        }
        return `${base} bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:scale-105 hover:shadow-md active:scale-95`;
    };

    const [statusFilter, setStatusFilter] = useState('all');

    const filteredMembers = members.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.id.toString().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mark Workout Attendance</h1>
                    <p className="text-gray-500 text-sm mt-1">Select session and record member presence</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                            <Dumbbell size={18} className="text-blue-500" />
                            {selectedWorkout}
                            <ChevronDown size={16} />
                        </button>
                        <div className="absolute top-full mt-2 left-0 min-w-[250px] bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] max-h-[300px] overflow-y-auto p-2">
                            {sessions.map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => handleSessionSelect(s)}
                                    className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition-colors flex flex-col"
                                >
                                    <span className="font-bold text-gray-900 text-sm">{s.title}</span>
                                    <span className="text-xs text-gray-400">{s.date} • {s.time}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Enrolled', value: members.length.toString(), color: 'blue' },
                    { label: 'Present Today', value: members.filter(m => m.status === 'present').length.toString(), color: 'green' },
                    { label: 'Absent', value: members.filter(m => m.status === 'absent').length.toString(), color: 'red' },
                    { label: 'Late', value: members.filter(m => m.status === 'late').length.toString(), color: 'amber' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-gray-700 transition-colors">{stat.label}</p>
                        <p className={`text-2xl font-bold mt-1 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-300`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search member by name or ID..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="relative group/filter">
                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 h-full w-full sm:w-auto">
                        <Filter size={18} />
                        Status: {(statusFilter || 'all').charAt(0).toUpperCase() + (statusFilter || 'all').slice(1)}
                    </button>
                    <div className="absolute top-full mt-2 right-0 min-w-[150px] bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover/filter:opacity-100 group-hover/filter:visible transition-all z-[100] p-1">
                        {['all', 'present', 'absent', 'late', 'pending'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors ${statusFilter === status ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                            >
                                {(status || 'all').charAt(0).toUpperCase() + (status || 'all').slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Member List - Mobile Cards / Desktop Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Desktop View (Table) */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-bottom border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Member Info</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Membership</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Attendance Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredMembers.length > 0 ? (
                                filteredMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-blue-50/30 transition-all duration-200 group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                                    {(member.name || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                                                    <p className="text-xs text-gray-500">ID: #M-102{member.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">
                                                {member.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    onClick={() => handleStatusChange(member.id, 'present')}
                                                    className={getStatusClasses(member.status, 'present')}
                                                >
                                                    <CheckCircle2 size={16} /> Present
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(member.id, 'absent')}
                                                    className={getStatusClasses(member.status, 'absent')}
                                                >
                                                    <XCircle size={16} /> Absent
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(member.id, 'late')}
                                                    className={getStatusClasses(member.status, 'late')}
                                                >
                                                    <Clock size={16} /> Late
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-10 text-center text-gray-500">
                                        No members found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile/Tablet View (Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden divide-y divide-gray-100">
                    {filteredMembers.length > 0 ? (
                        filteredMembers.map((member) => (
                            <div key={member.id} className="p-4 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                            {(member.name || '?').charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{member.name}</p>
                                            <p className="text-xs text-gray-500">{member.type}</p>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-gray-50 rounded-xl">
                                        {getStatusIcon(member.status) || <Clock size={20} className="text-gray-300" />}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => handleStatusChange(member.id, 'present')}
                                        className={`${getStatusClasses(member.status, 'present')} text-xs`}
                                    >
                                        Present
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(member.id, 'absent')}
                                        className={`${getStatusClasses(member.status, 'absent')} text-xs`}
                                    >
                                        Absent
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(member.id, 'late')}
                                        className={`${getStatusClasses(member.status, 'late')} text-xs`}
                                    >
                                        Late
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center text-gray-500">
                            No members found.
                        </div>
                    )}
                </div>
            </div>

            {/* Spacer for sticky bar */}
            <div className="h-20 sm:hidden"></div>

            {/* Sticky Action Bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-fit z-50">
                <div className="bg-gray-900/95 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-8">
                    <div className="hidden md:flex flex-col">
                        <p className="text-xs text-gray-400 font-medium">Progress</p>
                        <p className="text-sm font-bold">{members.filter(m => m.status !== 'pending').length}/{members.length} Members Marked</p>
                    </div>
                    <div className="h-full w-px bg-white/10 hidden md:block"></div>
                    <button
                        onClick={handleSave}
                        disabled={saving || !selectedSessionId}
                        className="flex items-center justify-center gap-2 px-8 py-2 bg-blue-600 hover:bg-blue-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/40 active:scale-95 transition-all duration-300 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 w-full md:w-auto disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Save size={18} />
                        )}
                        {saving ? 'Saving...' : 'Save Attendance'}
                    </button>
                </div>
            </div>
        </div>
    );
};


export default MarkWorkoutAttendance;
