import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, MapPin, Users, Edit2, UserPlus, Loader2 } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { getClassById, deleteClass } from '../../../api/manager/classesApi';
import { getTrainerClassById } from '../../../api/trainer/trainerApi';
import { fetchTenantSettings } from '../../../api/manager/managerApi';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { MessageSquareShare, Trash2 } from 'lucide-react';

const ClassDetails = () => {
    const { role } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [classData, setClassData] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClassDetails();
    }, [id]);

    const loadClassDetails = async () => {
        try {
            setLoading(true);
            const [data, settingsData] = await Promise.all([
                role === 'TRAINER' ? await getTrainerClassById(id) : await getClassById(id),
                fetchTenantSettings().catch(() => ({ messageTemplates: [] }))
            ]);
            setClassData(data);
            if (settingsData && settingsData.messageTemplates) {
                setTemplates(settingsData.messageTemplates);
            }
        } catch (error) {
            console.error('Error loading class details:', error);
            toast.error('Failed to load details');
            navigate('/classes');
        } finally {
            setLoading(false);
        }
    };

    const getDisplayDate = (dateStr) => {
        if (!dateStr) return null;
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
    );

    if (!classData) return <div className="p-6 text-center text-muted">Class not found.</div>;

    const enrolledMembers = classData.enrolledMembers || [];

    const handleNotifyCancellation = () => {
        const template = templates.find(t => t.name === 'Class Cancellation' || t.id === 3);
        if (!template) {
            toast.error("Cancellation template not found.");
            return;
        }

        if (enrolledMembers.length === 0) {
            toast.error("No members enrolled to notify.");
            return;
        }

        // For simplicity in this demo, we'll open WhatsApp for the first member or provide a bulk option
        // Realistically this might be a backend task to send SMS/WhatsApp via API
        const member = enrolledMembers[0];
        const formatValue = (val) => {
            if (!val) return 'Not set';
            if (typeof val === 'object') {
                if (val.days && val.time) return `${val.days} at ${val.time}`;
                if (Array.isArray(val)) return val.join(', ');
                return JSON.stringify(val);
            }
            return String(val);
        };

        const message = template.text
            .replace('{{class_name}}', classData.name)
            .replace('{{date}}', formatValue(classData.schedule, true)); // pass true to use full date

        const cleanPhone = (member.phone || '').replace(/\D/g, '');
        if (!cleanPhone) {
            toast.error("Member phone not found.");
            return;
        }

        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
        toast.success(`Opening notification for ${member.name}`);
    };

    const handleDeleteClass = async () => {
        if (!window.confirm("Are you sure you want to completely delete this class? This cannot be undone.")) return;
        try {
            await deleteClass(id);
            toast.success("Class deleted successfully");
            navigate('/classes');
        } catch (error) {
            toast.error(error.message || "Failed to delete class");
        }
    };

    return (
        <div className="fade-in px-4 sm:px-6 lg:px-8 py-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
            {/* Header & Breadcrumb */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <button
                        onClick={() => navigate('/classes')}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-indigo-600"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-1">{classData.name}</h2>
                        <div className="text-gray-500 font-medium" style={{ fontSize: '0.875rem' }}>Class ID: #{classData.id}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    {role !== 'TRAINER' && (
                        <>
                            <Button variant="outline" onClick={() => navigate(`/classes/${id}/assign-trainer`)}>
                                <User size={18} style={{ marginRight: '6px' }} />
                                Assign Trainer
                            </Button>
                            <Button variant="outline" onClick={() => navigate(`/classes/${id}/enroll`)}>
                                <UserPlus size={18} style={{ marginRight: '6px' }} />
                                Enroll Members
                            </Button>
                            <Button variant="primary" onClick={() => navigate(`/classes/${id}/edit`)}>
                                <Edit2 size={18} style={{ marginRight: '6px' }} />
                                Edit Class
                            </Button>
                            {classData.status === 'Cancelled' && (
                                <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50" onClick={handleNotifyCancellation}>
                                    <MessageSquareShare size={18} style={{ marginRight: '6px' }} />
                                    Notify Cancellation
                                </Button>
                            )}
                            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300" onClick={handleDeleteClass}>
                                <Trash2 size={18} style={{ marginRight: '6px' }} />
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-6)' }}>
                {/* Left Col: Overview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <Card title="Class Overview">
                        <p style={{ color: 'var(--text)', lineHeight: '1.6', marginBottom: '24px', fontSize: '1rem' }} className="text-gray-700">
                            {classData.description || 'No description provided for this class.'}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <InfoRow icon={Calendar} label="Schedule" value={classData.schedule} />
                            <InfoRow icon={ClockIcon} label="Duration" value={classData.duration || 'Not set'} />
                            <InfoRow icon={MapPin} label="Location" value={classData.location || 'Main Floor'} />
                            <InfoRow icon={Users} label="Capacity" value={`${enrolledMembers.length} / ${classData.capacity || 20}`} />
                        </div>
                    </Card>

                    <Card title="Trainer Information">
                        <div className="flex items-center gap-4 p-2">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                                <User size={28} />
                            </div>
                            <div>
                                <div className="text-lg font-bold text-gray-900 leading-tight">{classData.trainerName}</div>
                                <div className="text-indigo-600 font-semibold text-xs uppercase tracking-wider mt-1">Assigned Trainer</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Col: Enrollments */}
                <div>
                    <Card title={`Enrolled Members (${enrolledMembers.length})`}>
                        {enrolledMembers.length > 0 ? (
                            <div className="max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {enrolledMembers.map(member => (
                                        <li key={member.id} className="py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 px-2 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center shadow-sm">
                                                    <User size={18} className="text-indigo-500" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-800 block text-sm">{member.name}</span>
                                                    <span className="text-gray-500 text-xs">{member.email}</span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="text-gray-400 py-12 text-center flex flex-col items-center gap-3 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100 italic font-medium">
                                <Users size={32} className="opacity-20" />
                                No members enrolled yet.
                            </div>
                        )}

                        {role !== 'TRAINER' && (
                            <div className="mt-6 text-center border-t border-gray-100 pt-4">
                                <Button variant="outline" size="small" onClick={() => navigate(`/classes/${id}/enroll`)} className="w-full">
                                    Manage Enrollments
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

// Helper to format schedule or objects
const formatValue = (val, fullDate = false) => {
    if (!val) return 'Not set';
    let data = val;
    if (typeof val === 'string') {
        try {
            data = JSON.parse(val);
        } catch (e) {
            data = val;
        }
    }
    if (typeof data === 'object') {
        const time = data.time || 'TBD';
        if (data.date) {
            const [year, month, day] = data.date.split('-').map(Number);
            const dateObj = new Date(year, month - 1, day);
            const formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: fullDate ? 'long' : 'short',
                month: 'short',
                day: 'numeric',
                year: fullDate ? 'numeric' : undefined
            });
            return `${formattedDate} at ${time}`;
        }
        if (data.days) return `${data.days} at ${time}`;
        return JSON.stringify(data);
    }
    return String(val);
};

// Sub-component for icons
const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-indigo-100 transition-all duration-300 group">
        <span className="text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2" style={{ fontSize: '0.65rem' }}>
            {Icon && <Icon size={14} className="group-hover:text-indigo-600 transition-colors duration-300" />} {label}
        </span>
        <span className="text-gray-900 font-bold" style={{ fontSize: '0.95rem' }}>{formatValue(value)}</span>
    </div>
);

// Helper
const ClockIcon = ({ size }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size} height={size}
        viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

export default ClassDetails;
