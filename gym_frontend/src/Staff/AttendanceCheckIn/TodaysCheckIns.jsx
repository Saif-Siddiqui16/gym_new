import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserMinus, Clock, Filter, Search, ChevronDown, Check, Activity, Lock } from 'lucide-react';
import MobileCard from '../../components/common/MobileCard';
import '../../styles/GlobalDesign.css';
import { getTodaysCheckIns } from '../../api/staff/memberCheckInApi';

// Reusable Custom Dropdown (Same as Manager Reports)
const CustomDropdown = ({ options, value, onChange, icon: Icon, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative min-w-[150px]" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-11 px-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-100 bg-white' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
                <div className="flex items-center gap-2 text-sm text-gray-700">
                    {Icon && <Icon size={16} className="text-gray-400" />}
                    <span className="font-medium truncate">{value === 'All' ? placeholder : value}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
            </button>

            <div className={`absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                <div className="py-1">
                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => { onChange(option); setIsOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${value === option ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {option === 'All' ? placeholder : option}
                            {value === option && <Check size={14} />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


const TodaysCheckIns = () => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [history, setHistory] = useState([]);
    const [statsData, setStatsData] = useState({ total: 0, inside: 0, checkedOut: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getTodaysCheckIns();
            setHistory(data.history);
            setStatsData(data.stats);
        } catch (error) {
            console.error('Failed to load check-ins', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Total Check-Ins', value: statsData.total, icon: Users, bg: 'bg-indigo-50', color: 'text-indigo-600', border: 'border-indigo-100' },
        { label: 'Currently Inside', value: statsData.inside, icon: Activity, bg: 'bg-green-50', color: 'text-green-600', border: 'border-green-100' },
        { label: 'Total Check-Outs', value: statsData.checkedOut, icon: UserMinus, bg: 'bg-gray-50', color: 'text-gray-600', border: 'border-gray-200' },
    ];

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans staffdashboard-todayscheckins">
            <div className="mb-8 animate-fade-in-down">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Today Check-Ins</h1>
                <p className="text-sm text-gray-500 mt-1">Real-time overview of attendance activity for today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
                {stats.map((stat, idx) => (
                    <div key={idx} className={`bg-white p-6 rounded-3xl shadow-sm border ${stat.border} flex items-center gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group`}>
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={26} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-gray-900 leading-none">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* History Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 animate-fade-in-up" style={{ animationDelay: '0.1s', overflow: 'visible', zIndex: 10, position: 'relative' }}>
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <CustomDropdown
                            options={['All', 'Inside', 'Checked-Out']}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            placeholder="All Status"
                            icon={Filter}
                        />
                    </div>
                    <div className="relative w-full md:w-72 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find member..."
                            className="saas-input pl-11 h-11 w-full rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm hover:border-gray-300 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="hidden md:block saas-table-wrapper">
                    <table className="saas-table saas-table-responsive">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Member Name</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Check-In</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Check-Out</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history
                                .filter(item => statusFilter === 'All' || item.status === statusFilter)
                                .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 group transition-all duration-200">
                                        <td className="px-6 py-4" data-label="Member Name">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                    {(row.name || '?').charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-gray-800 tracking-tight group-hover:text-indigo-700 transition-colors">{row.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Check-In">
                                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md w-fit">
                                                <Clock size={12} className="text-green-500" />
                                                {row.in}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4" data-label="Check-Out">
                                            {row.out !== '-' ? (
                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md w-fit">
                                                    <Clock size={12} className="text-red-400" />
                                                    {row.out}
                                                </div>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right" data-label="Status">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${row.status === 'Inside'
                                                ? 'bg-green-50 text-green-700 border-green-100'
                                                : 'bg-gray-50 text-gray-600 border-gray-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Inside' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right" data-label="Actions">
                                            {row.status === 'Inside' && (
                                                <button
                                                    onClick={() => navigate('/staff/lockers/assign', { state: { memberName: row.name } })}
                                                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-2 ml-auto shadow-sm active:scale-95"
                                                >
                                                    <Lock size={12} />
                                                    Locker
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            {history.filter(item => statusFilter === 'All' || item.status === statusFilter)
                                .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-2">
                                                <Filter size={20} className="text-gray-300" />
                                                <p>No records found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden p-4 space-y-4">
                    {history
                        .filter(item => statusFilter === 'All' || item.status === statusFilter)
                        .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((row) => (
                            <MobileCard
                                key={row.id}
                                title={row.name}
                                badge={row.status}
                                badgeColor={row.status === 'Inside' ? 'emerald' : 'slate'}
                                fields={[
                                    { label: 'Check-In', value: row.in, icon: Clock },
                                    { label: 'Check-Out', value: row.out, icon: Clock }
                                ]}
                                actions={row.status === 'Inside' ? [
                                    {
                                        label: 'Locker',
                                        icon: Lock,
                                        onClick: () => navigate('/staff/lockers/assign', { state: { memberName: row.name } }),
                                        variant: 'primary'
                                    }
                                ] : []}
                            />
                        ))}
                    {history.filter(item => statusFilter === 'All' || item.status === statusFilter)
                        .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                            <div className="py-8 text-center text-sm text-gray-500 bg-white rounded-2xl border border-gray-100">
                                No records found.
                            </div>
                        )}
                </div>
            </div >
        </div >
    );
};

export default TodaysCheckIns;
