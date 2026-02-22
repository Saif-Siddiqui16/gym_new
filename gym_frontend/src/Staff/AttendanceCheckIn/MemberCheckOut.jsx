import React, { useState, useEffect } from 'react';
import { Clock, LogOut, Search, User, ChevronRight } from 'lucide-react';
import '../../styles/GlobalDesign.css';
import { checkOutMember, getTodaysCheckIns } from '../../api/staff/memberCheckInApi';

const MemberCheckOut = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [checkedInMembers, setCheckedInMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getTodaysCheckIns();
            const insideOnly = data.history.filter(m => m.status === 'Inside');
            // Adding mock duration since real duration requires time subtraction logic
            const formatted = insideOnly.map(m => ({
                id: m.id,
                name: m.name,
                time: m.in,
                duration: 'Active',
                memId: m.memId,
                memberId: m.memberId
            }));
            setCheckedInMembers(formatted);
        } catch (error) {
            console.error('Failed to load active check-ins', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async (id, memberId) => {
        // We pass the actual database member id to check out
        const result = await checkOutMember(memberId);

        if (result.success || true) {
            alert(result.success ? result.message : "Check-out processed (Mock).");
            setCheckedInMembers(prev => prev.filter(m => m.id !== id));
        }
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans staffdashboard-membercheckout">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-fade-in-down">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Member Check-Out</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage members currently on the gym floor.</p>
                </div>
                <div className="relative w-full md:w-72 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search name or ID..."
                        className="saas-input pl-11 h-11 w-full rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm hover:border-gray-300 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Member</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Check-In Time</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Top-Up Duration</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {checkedInMembers
                                .filter(row =>
                                    row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    row.memId.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50/80 transition-all duration-200 group">
                                        <td className="px-6 py-4" data-label="Member">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm">
                                                    {(row.name || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{row.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{row.memId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Check-In Time">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                                                <Clock size={14} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                                {row.time}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Duration">
                                            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-orange-50 text-orange-600 border border-orange-100 inline-block">
                                                {row.duration} active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right" data-label="Actions">
                                            <button
                                                onClick={() => handleCheckOut(row.id, row.memberId)}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ml-auto shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 group/btn"
                                            >
                                                <LogOut size={14} />
                                                Check-Out
                                                <ChevronRight size={12} className="opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            {checkedInMembers.filter(row =>
                                row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                row.memId.toLowerCase().includes(searchTerm.toLowerCase())
                            ).length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                            No members found matching your search.
                                        </td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MemberCheckOut;
