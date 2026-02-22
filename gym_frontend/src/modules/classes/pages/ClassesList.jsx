import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, Calendar, User, MapPin, Users, Sparkles, Dumbbell } from 'lucide-react';
import { getClasses } from '../../../api/manager/classesApi';
import { getTrainerClasses } from '../../../api/trainer/trainerApi';
import { useAuth } from '../../../context/AuthContext';

const ClassesList = () => {
    const { role } = useAuth();
    const navigate = useNavigate();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        try {
            setLoading(true);
            const data = role === 'TRAINER' ? await getTrainerClasses() : await getClasses();
            setClasses(data || []);
        } catch (error) {
            console.error('Error loading classes:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredClasses = (classes || []).filter(cls => {
        const matchesSearch = (cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cls.trainerName?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'All' || cls.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 min-h-screen">
            {/* Premium Header with Gradient */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                                <Dumbbell className="text-violet-600" size={28} />
                                Classes Schedule
                            </h1>
                            <p className="text-slate-600 text-sm">Manage and organize your fitness classes</p>
                        </div>
                        {role !== 'TRAINER' && (
                            <button
                                className="group relative px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-violet-500/50 hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                                onClick={() => navigate('/classes/new')}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <Plus size={20} className="relative transition-transform duration-300 group-hover:rotate-90" />
                                <span className="relative">Create Class</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Glass Morphism Filter Bar */}
            <div className="mb-6 bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/50 p-5 hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 group-focus-within:scale-110 transition-all duration-300"
                        />
                        <input
                            type="text"
                            placeholder="Search by Class Name or Trainer..."
                            className="w-full pl-12 pr-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white transition-all duration-300 hover:border-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-48 relative group">
                        <Filter
                            size={20}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-all duration-300 pointer-events-none"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/80 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white transition-all duration-300 hover:border-slate-300 cursor-pointer appearance-none"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23cbd5e1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 0.75rem center',
                                backgroundSize: '1.25rem'
                            }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Full">Full</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Premium Table */}
            {loading ? (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-16 text-center">
                    <div className="flex flex-col items-center gap-4 text-violet-600">
                        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-lg font-bold uppercase tracking-widest">Loading Classes...</span>
                    </div>
                </div>
            ) : filteredClasses.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b-2 border-slate-200">
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Class Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Trainer</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Schedule</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Capacity</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredClasses.map((cls) => (
                                    <tr
                                        key={cls.id}
                                        className="group hover:bg-gradient-to-r hover:from-violet-50/50 hover:via-purple-50/30 hover:to-transparent transition-all duration-300 cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                                    {cls.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors duration-300">
                                                        {cls.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                        <MapPin size={12} /> {cls.location}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                    <User size={16} className="text-slate-600" />
                                                </div>
                                                <span className="font-medium text-slate-700">{cls.trainerName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-700">
                                                <Calendar size={16} className="text-slate-400" />
                                                <span className="font-medium">{cls.schedule}</span>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 ml-6">{cls.duration}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Users size={16} className="text-slate-400" />
                                                <span className="font-semibold text-slate-700">
                                                    {cls.enrolled} / {cls.capacity}
                                                </span>
                                            </div>
                                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${cls.enrolled >= cls.capacity
                                                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                                                        : 'bg-gradient-to-r from-violet-500 to-purple-600'
                                                        }`}
                                                    style={{ width: `${(cls.enrolled / cls.capacity) * 100}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300 ${cls.status === 'Scheduled'
                                                    ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 group-hover:shadow-blue-500/50'
                                                    : cls.status === 'Full'
                                                        ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200 group-hover:shadow-amber-500/50'
                                                        : cls.status === 'Completed'
                                                            ? 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border border-slate-200 group-hover:shadow-slate-500/50'
                                                            : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 group-hover:shadow-red-500/50'
                                                    }`}
                                            >
                                                {cls.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end">
                                                <button
                                                    className="px-4 py-2 bg-gradient-to-r from-violet-50 to-purple-50 text-violet-600 rounded-lg text-sm font-semibold hover:from-violet-600 hover:to-purple-600 hover:text-white hover:scale-110 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                                    onClick={() => navigate(`/classes/${cls.id}`)}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
                        <Search size={40} className="text-violet-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">No Classes Found</h3>
                    <p className="text-slate-600 mb-6">
                        {searchTerm || statusFilter !== 'All'
                            ? 'Try adjusting your search or filter criteria'
                            : 'No classes have been found.'}
                    </p>
                    {!searchTerm && statusFilter === 'All' && role !== 'TRAINER' && (
                        <button
                            className="group relative px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:shadow-violet-500/50 hover:scale-105 hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2"
                            onClick={() => navigate('/classes/new')}
                        >
                            <Plus size={20} className="transition-transform duration-300 group-hover:rotate-90" />
                            Create Class
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ClassesList;
