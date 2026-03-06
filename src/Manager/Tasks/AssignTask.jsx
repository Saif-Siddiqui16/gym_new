import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, UserPlus, FileText, BarChart, Calendar, CheckCircle2, ChevronDown, Check } from 'lucide-react';
import { createTask, getAllStaff } from '../../api/manager/managerApi';
import '../../styles/GlobalDesign.css';

// Custom Animated Select Component
const CustomSelect = ({ label, icon: Icon, options, value, onChange, name, placeholder, isObjectOptions }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        const val = isObjectOptions ? option.id : option;
        onChange({ target: { name, value: val } });
        setIsOpen(false);
    };

    const getDisplayValue = () => {
        if (!value) return placeholder;
        if (isObjectOptions) {
            const found = options.find(o => o.id === value);
            return found ? found.name : placeholder;
        }
        return value;
    };

    return (
        <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Icon size={16} className="text-indigo-500" />
                {label}
            </label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`saas-input w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 flex items-center justify-between cursor-pointer transition-all duration-300 hover:border-indigo-300 hover:shadow-md ${isOpen ? 'ring-2 ring-indigo-500 border-indigo-500 bg-white' : ''}`}
            >
                <span className={`text-sm ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {getDisplayValue()}
                </span>
                <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : ''}`} />
            </div>

            {/* Animated Dropdown Menu */}
            <div className={`absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-300 origin-top ${isOpen ? 'opacity-100 scale-100 translate-y-0 max-h-60' : 'opacity-0 scale-95 -translate-y-2 max-h-0 pointer-events-none'}`}>
                <div className="py-1 overflow-y-auto max-h-60">
                    {options.map((option) => {
                        const optVal = isObjectOptions ? option.id : option;
                        const optLabel = isObjectOptions ? option.name : option;
                        return (
                            <div
                                key={optVal}
                                onClick={() => handleSelect(option)}
                                className={`px-4 py-3 text-sm font-medium cursor-pointer flex items-center justify-between transition-colors ${value === optVal ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'}`}
                            >
                                {optLabel}
                                {value === optVal && <Check size={16} className="text-indigo-600" />}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const AssignTask = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        assignedToId: '',
        priority: 'Medium',
        dueDate: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [staffList, setStaffList] = useState([]);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const data = await getAllStaff();
                setStaffList(data);
            } catch (err) {
                console.error("Failed to load staff:", err);
            }
        };
        fetchStaff();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createTask({
                ...formData,
                assignedToId: parseInt(formData.assignedToId)
            });
            setSuccess(true);
            setFormData({
                title: '',
                description: '',
                assignedToId: '',
                priority: 'Medium',
                dueDate: ''
            });
            setTimeout(() => {
                setSuccess(false);
                navigate('/branchadmin/tasks/list');
            }, 1500);
        } catch (error) {
            console.error('Task Assignment Failed:', error);
            alert('Failed to assign task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans managerdashboard-assigntask">
            <div className="mb-8 animate-fade-in-down">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Assign Task</h1>
                <p className="text-sm text-gray-500 mt-1">Create and assign new tasks to team members.</p>
            </div>

            <div className="max-w-3xl animate-fade-in-up">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-500">
                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="space-y-6">
                            {/* Task Title */}
                            <div className="space-y-2 group">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2 transition-colors group-hover:text-indigo-600">
                                    <FileText size={16} className="text-indigo-500" />
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="e.g., Equipment Maintenance"
                                    className="saas-input w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-sm bg-gray-50/50 hover:bg-white hover:shadow-md"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2 group">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2 transition-colors group-hover:text-indigo-600">
                                    <BarChart size={16} className="text-indigo-500" />
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    placeholder="Enter detailed task instructions..."
                                    rows="4"
                                    className="saas-input w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-sm bg-gray-50/50 resize-none hover:bg-white hover:shadow-md"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-20">
                                {/* Custom Animated Selects */}
                                <CustomSelect
                                    label="Assign To"
                                    icon={UserPlus}
                                    name="assignedToId"
                                    value={formData.assignedToId}
                                    onChange={handleChange}
                                    options={staffList}
                                    placeholder="Select Staff"
                                    isObjectOptions={true}
                                />

                                <CustomSelect
                                    label="Priority"
                                    icon={BarChart}
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    options={['Low', 'Medium', 'High']}
                                    placeholder="Select Priority"
                                />
                            </div>

                            {/* Due Date */}
                            <div className="space-y-2 group relative z-10">
                                <label className="text-sm font-bold text-gray-700 flex items-center gap-2 transition-colors group-hover:text-indigo-600">
                                    <Calendar size={16} className="text-indigo-500" />
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    className="saas-input w-full h-11 px-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-sm bg-gray-50/50 hover:bg-white hover:shadow-md"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6">
                                {success && (
                                    <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-700 text-sm font-bold animate-bounce shadow-sm">
                                        <div className="p-1 bg-green-200 rounded-full">
                                            <CheckCircle2 size={16} className="text-green-700" />
                                        </div>
                                        Task assigned successfully!
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`saas-btn w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Send size={18} />
                                    )}
                                    {loading ? 'Assigning...' : 'Assign Task'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AssignTask;
