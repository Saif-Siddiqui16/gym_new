import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import CustomDropdown from '../../../components/common/CustomDropdown';
import { createClass, updateClass, getClassById } from '../../../api/manager/classesApi';
import { getAllStaff } from '../../../api/manager/managerApi';
import { toast } from 'react-hot-toast';

const ClassForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        trainerId: '',
        schedule: '',
        duration: '60 mins',
        capacity: 20,
        status: 'Scheduled',
        location: 'Studio A',
        requiredBenefit: ''
    });

    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const [errors, setErrors] = useState({});

    // Load Data for Edit Mode and Trainers
    useEffect(() => {
        loadTrainers();
        if (isEditMode) {
            loadClassData();
        }
    }, [isEditMode, id]);

    const loadTrainers = async () => {
        try {
            const data = await getAllStaff();
            // Filter only trainers if role is present, or show all staff if preferred
            const filteredTrainers = data.filter(s => s.role === 'TRAINER' || s.role === 'STAFF');
            setTrainers(filteredTrainers);
        } catch (error) {
            console.error('Error loading trainers:', error);
            toast.error('Failed to load trainers');
        }
    };

    const loadClassData = async () => {
        try {
            setInitialLoading(true);
            const cls = await getClassById(id);
            if (cls) {
                setFormData({
                    name: cls.name,
                    description: cls.description || '',
                    trainerId: cls.trainerId || '',
                    schedule: cls.schedule || '',
                    duration: cls.duration || '60 mins',
                    capacity: cls.capacity || cls.maxCapacity || 20,
                    status: cls.status || 'Scheduled',
                    location: cls.location || '',
                    requiredBenefit: cls.requiredBenefit || ''
                });
            }
        } catch (error) {
            console.error('Error loading class:', error);
            toast.error('Failed to load class details');
            navigate('/classes');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Class name is required';
        }
        if (!formData.trainerId) {
            newErrors.trainerId = 'Trainer is required';
        }
        if (!formData.schedule) {
            newErrors.schedule = 'Schedule is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                maxCapacity: parseInt(formData.capacity)
            };

            if (isEditMode) {
                await updateClass(id, payload);
                toast.success('Class updated successfully!');
            } else {
                await createClass(payload);
                toast.success('Class created successfully!');
            }
            navigate('/classes');
        } catch (error) {
            console.error('Error saving class:', error);
            toast.error(error.response?.data?.message || 'Failed to save class');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/classes');
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
            {/* Page Header - Back Button */}
            <div className="w-full max-w-4xl mb-6">
                <button
                    onClick={handleCancel}
                    className="group flex items-center text-gray-500 hover:text-indigo-600 transition-all duration-300 hover:scale-105"
                >
                    <div className="p-1 rounded-full group-hover:bg-indigo-50 transition-all duration-300 mr-2 group-hover:scale-110 group-hover:-translate-x-1">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Back to Classes</span>
                </button>
            </div>

            {/* Form Card with Scrolling */}
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-500 max-h-[calc(100vh-120px)] flex flex-col">
                <div className="px-6 py-6 sm:px-10 border-b border-gray-100 bg-gradient-to-r from-indigo-50/30 to-purple-50/30 flex-shrink-0">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {isEditMode ? 'Edit Class' : 'Create New Class'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-2">Define the details and schedule for this class.</p>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-8 sm:px-10 space-y-8 overflow-y-auto flex-1 custom-scrollbar">

                    {/* Class Name */}
                    <div className="space-y-3 group">
                        <label className="block text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Class Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="name"
                                className={`block w-full px-5 py-4 bg-gradient-to-br from-white to-indigo-50/30 border-2 border-gray-200 rounded-2xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 shadow-md focus:scale-[1.02] group-hover:border-indigo-200 ${errors.name ? 'border-red-500 bg-red-50/30 focus:ring-red-500/20' : ''}`}
                                placeholder="e.g., Morning Yoga"
                                value={formData.name}
                                onChange={handleInputChange}
                            />
                        </div>
                        {errors.name && <p className="text-xs text-red-600 mt-1 font-medium animate-pulse">{errors.name}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-3 group">
                        <label className="block text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            Description
                        </label>
                        <textarea
                            name="description"
                            className="block w-full px-5 py-4 bg-gradient-to-br from-white to-blue-50/30 border-2 border-gray-200 rounded-2xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 hover:shadow-lg transition-all duration-300 shadow-md resize-none focus:scale-[1.01] group-hover:border-blue-200"
                            placeholder="Describe the class activities and benefits..."
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                        />
                    </div>

                    {/* Schedule & Duration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Schedule */}
                        <div className="space-y-3 group">
                            <label className="block text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Schedule <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="schedule"
                                className={`block w-full px-5 py-4 bg-gradient-to-br from-white to-indigo-50/30 border-2 border-gray-200 rounded-2xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 shadow-md focus:scale-[1.02] group-hover:border-indigo-200 ${errors.schedule ? 'border-red-500 bg-red-50/30 focus:ring-red-500/20' : ''}`}
                                placeholder="e.g., Mon 7AM"
                                value={formData.schedule}
                                onChange={handleInputChange}
                            />
                            {errors.schedule && <p className="text-xs text-red-600 mt-1 font-medium">{errors.schedule}</p>}
                        </div>

                        {/* Duration */}
                        <div className="space-y-3 group">
                            <label className="block text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Duration
                            </label>
                            <div className="relative z-20">
                                <CustomDropdown
                                    options={[
                                        { value: '30 mins', label: '30 mins' },
                                        { value: '45 mins', label: '45 mins' },
                                        { value: '60 mins', label: '60 mins' },
                                        { value: '90 mins', label: '90 mins' }
                                    ]}
                                    value={formData.duration}
                                    onChange={(val) => handleInputChange({ target: { name: 'duration', value: val } })}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Trainer & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Trainer */}
                        <div className="space-y-3 group">
                            <label className="block text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                Assigned Trainer <span className="text-red-500">*</span>
                            </label>
                            <div className="relative z-10">
                                <CustomDropdown
                                    options={[
                                        { value: '', label: '-- Select Trainer --' },
                                        ...trainers.map(t => ({ value: t.id, label: t.name }))
                                    ]}
                                    value={formData.trainerId}
                                    onChange={(val) => handleInputChange({ target: { name: 'trainerId', value: val } })}
                                    className={`w-full ${errors.trainerId ? 'border-red-500' : ''}`}
                                />
                                {errors.trainerId && <p className="text-xs text-red-600 mt-1 font-medium">{errors.trainerId}</p>}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-3 group">
                            <label className="block text-sm font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                Location / Studio
                            </label>
                            <input
                                type="text"
                                name="location"
                                className="block w-full px-5 py-4 bg-gradient-to-br from-white to-cyan-50/30 border-2 border-gray-200 rounded-2xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 hover:border-cyan-300 hover:shadow-lg transition-all duration-300 shadow-md focus:scale-[1.02] group-hover:border-cyan-200"
                                placeholder="e.g., Studio A"
                                value={formData.location}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Capacity, Status, Required Benefit */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Capacity */}
                        <div className="space-y-3 group">
                            <label className="block text-sm font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                Max Capacity
                            </label>
                            <input
                                type="number"
                                name="capacity"
                                className="block w-full px-5 py-4 bg-gradient-to-br from-white to-orange-50/30 border-2 border-gray-200 rounded-2xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 hover:shadow-lg transition-all duration-300 shadow-md focus:scale-[1.02] group-hover:border-orange-200"
                                placeholder="20"
                                value={formData.capacity}
                                onChange={handleInputChange}
                                min="1"
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-3 group">
                            <label className="block text-sm font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                Status
                            </label>
                            <div className="relative z-10">
                                <CustomDropdown
                                    options={[
                                        { value: 'Scheduled', label: 'Scheduled' },
                                        { value: 'Full', label: 'Full' },
                                        { value: 'Completed', label: 'Completed' },
                                        { value: 'Cancelled', label: 'Cancelled' }
                                    ]}
                                    value={formData.status}
                                    onChange={(val) => handleInputChange({ target: { name: 'status', value: val } })}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Required Benefit */}
                        <div className="space-y-3 group">
                            <label className="block text-sm font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                                Required Benefit
                            </label>
                            <div className="relative z-10">
                                <CustomDropdown
                                    options={[
                                        { value: '', label: '-- Open to All --' },
                                        { value: 'group_classes', label: 'Group Classes Access' },
                                        { value: 'yoga_access', label: 'Yoga Studio Access' },
                                        { value: 'gym_access', label: 'General Gym Access' }
                                    ]}
                                    value={formData.requiredBenefit}
                                    onChange={(val) => handleInputChange({ target: { name: 'requiredBenefit', value: val } })}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl border-2 border-indigo-100">
                        <p className="text-xs text-gray-600">
                            <span className="font-semibold text-indigo-700">Booking Rule:</span> If a required benefit is selected, only members with that benefit in their plan can book this class.
                        </p>
                    </div>

                    {/* Form Actions */}
                    <div className="pt-6 flex flex-col-reverse md:flex-row items-center justify-end gap-4 border-t border-gray-100 mt-2 sticky bottom-0 bg-white pb-4 -mb-8 -mx-6 px-6 sm:-mx-10 sm:px-10">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            className="w-full md:w-auto px-8 py-3 bg-white border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto flex items-center justify-center px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-xl text-sm font-semibold text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            ) : (
                                <Save size={18} className="mr-2 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                            )}
                            {loading ? 'Saving...' : 'Save Class'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClassForm;
