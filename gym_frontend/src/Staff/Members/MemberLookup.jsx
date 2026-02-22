import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, CreditCard, Phone } from 'lucide-react';
import { getMembers } from '../../api/staff/memberApi';
import '../../styles/GlobalDesign.css';

const MemberLookup = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const data = await getMembers();
            setMembers(data);
        } catch (error) {
            console.error("Failed to load members:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = (member) => {
        navigate(`/staff/members/${member.id}`, { state: { member } });
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-green-100 text-green-700 border border-green-200 hover:scale-110 hover:shadow-lg hover:bg-green-200 transition-all duration-300 inline-block cursor-pointer">ACTIVE</span>;
            case 'Inactive': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-100 text-gray-600 border border-gray-200 hover:scale-110 hover:shadow-lg hover:bg-gray-200 transition-all duration-300 inline-block cursor-pointer">INACTIVE</span>;
            case 'Expired': return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200 hover:scale-110 hover:shadow-lg hover:bg-red-200 transition-all duration-300 inline-block cursor-pointer">EXPIRED</span>;
            default: return null;
        }
    };

    const filteredResults = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm)
    );

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans staffdashboard-memberlookup">
            <div className="mb-8 transform hover:translate-x-1 transition-transform duration-300">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text hover:from-indigo-600 hover:to-purple-600 transition-all duration-500">Member Lookup</h1>
                <p className="text-sm text-gray-500 mt-1 hover:text-gray-700 transition-colors duration-300">Quickly search and find member profiles for front-desk assistance.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 hover:shadow-xl hover:border-indigo-200 transition-all duration-500 transform hover:-translate-y-1">
                <div className="p-6 border-b border-gray-50 bg-white/50 hover:bg-indigo-50/30 transition-colors duration-300">
                    <div className="relative w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all duration-300" size={20} />
                        <input
                            type="text"
                            placeholder="Search by Name, Membership ID, or Phone number..."
                            className="saas-input pl-12 h-12 w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm transition-all shadow-sm hover:border-indigo-300 hover:shadow-md"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead className="hover:bg-gray-100 transition-colors duration-300">
                            <tr>
                                <th className="hover:text-indigo-600 transition-colors duration-300 cursor-pointer">Member details</th>
                                <th className="hover:text-indigo-600 transition-colors duration-300 cursor-pointer">Plan info</th>
                                <th className="text-center hover:text-indigo-600 transition-colors duration-300 cursor-pointer">Status</th>
                                <th className="text-right hover:text-indigo-600 transition-colors duration-300 cursor-pointer">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center">
                                        <div className="flex items-center justify-center gap-2 text-indigo-600">
                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Loading records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredResults.length > 0 ? (
                                filteredResults.map((member) => (
                                    <tr key={member.id} className="hover:bg-indigo-50/30 transition-all duration-300 group cursor-pointer hover:shadow-md hover:scale-[1.01] transform">
                                        <td data-label="Member details">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm group-hover:scale-125 group-hover:bg-indigo-100 group-hover:shadow-lg group-hover:rotate-6 transition-all duration-500">
                                                    {(member.name || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800 tracking-tight group-hover:text-indigo-700 group-hover:translate-x-1 transition-all duration-300">{member.name}</p>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1 group-hover:text-indigo-500 transition-colors duration-300">
                                                            <CreditCard size={10} className="group-hover:scale-110 transition-transform duration-300" /> {member.id}
                                                        </span>
                                                        <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1 group-hover:text-indigo-500 transition-colors duration-300">
                                                            <Phone size={10} className="group-hover:scale-110 transition-transform duration-300" /> {member.phone}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Plan info">
                                            <span className="text-xs font-bold text-gray-600 px-2 py-1 bg-gray-100 rounded-lg group-hover:bg-indigo-100 group-hover:text-indigo-700 group-hover:scale-110 transition-all duration-300 inline-block">
                                                {member.plan}
                                            </span>
                                        </td>
                                        <td data-label="Status" className="text-center group-hover:scale-110 transition-transform duration-300">
                                            {getStatusBadge(member.status)}
                                        </td>
                                        <td data-label="Actions" className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewProfile(member)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-sm active:scale-95 hover:scale-110 hover:shadow-lg group/btn">
                                                    <Eye size={14} className="group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-all duration-300" />
                                                    View Profile
                                                </button>
                                                <button
                                                    onClick={() => navigate('/staff/lockers/assign', { state: { memberName: member.name } })}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-sm active:scale-95 hover:scale-110 hover:shadow-lg group/btn">
                                                    <CreditCard size={14} className="group-hover/btn:scale-125 group-hover/btn:-rotate-12 transition-all duration-300" />
                                                    Locker
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500 text-sm">
                                        No members found matching "{searchTerm}"
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

export default MemberLookup;
