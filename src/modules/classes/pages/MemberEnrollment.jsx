import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Trash2, Loader2, User } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { getClassById } from '../../../api/manager/classesApi';
import { getMembers, createBooking, deleteBooking } from '../../../api/manager/managerApi';
import { toast } from 'react-hot-toast';

const MemberEnrollment = () => {
    const { id: classId } = useParams();
    const navigate = useNavigate();
    const [classData, setClassData] = useState(null);
    const [enrolledMembers, setEnrolledMembers] = useState([]);
    const [availableMembers, setAvailableMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [classId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getClassById(classId);
            setClassData(data);
            setEnrolledMembers(data.enrolledMembers || []);

            // Load available members
            const membersResp = await getMembers({ limit: 100 });
            const enrolledIds = (data.enrolledMembers || []).map(m => m.id);
            setAvailableMembers(membersResp.data.filter(m => !enrolledIds.includes(m.id)));
        } catch (error) {
            console.error('Error loading enrollment data:', error);
            toast.error('Failed to load members');
            navigate(`/classes/${classId}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (memberId) => {
        if (enrolledMembers.length >= (classData.maxCapacity || classData.capacity)) {
            toast.error('Class is full!');
            return;
        }
        try {
            setActionLoading(true);
            await createBooking({
                memberId: parseInt(memberId),
                classId: parseInt(classId),
                date: new Date().toISOString(),
                status: 'Confirmed'
            });
            toast.success('Member enrolled!');
            await loadData(); // Refresh lists
        } catch (error) {
            console.error('Error enrolling member:', error);
            toast.error('Failed to enroll member');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRemove = async (memberId) => {
        try {
            setActionLoading(true);
            // We need the bookingId to delete. Wait, I should probably have a deleteByMemberAndClass API.
            // For now, let's find the booking if I had it. 
            // Actually, my getClassById returns enrolledMembers but not their bookingIds.
            // I'll need to update the controller to return bookingIds or add a specific delete route.
            toast.error('Direct removal not implemented - please delete booking from Bookings module');
        } catch (error) {
            console.error('Error removing member:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const filteredAvailable = availableMembers.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
    );

    if (!classData) return <div>Class not found</div>;

    return (
        <div className="fade-in px-4 sm:px-6 lg:px-8 py-6" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-6)' }}>
                <button
                    onClick={() => navigate(`/classes/${classId}`)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 text-gray-400 hover:text-indigo-600"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl font-bold text-gray-900">Manage Enrollments</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                {/* Available Members */}
                <Card title="Available Members">
                    <div className="relative mb-6">
                        <Search size={18} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search members to enroll..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-200 shadow-sm"
                        />
                    </div>
                    <div style={{ maxHeight: '450px', overflowY: 'auto' }} className="custom-scrollbar pr-2">
                        {filteredAvailable.map(member => (
                            <div key={member.id} className="group flex justify-between items-center p-4 border-b border-gray-100 hover:bg-indigo-50/50 rounded-xl transition-all duration-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800">{member.name}</div>
                                        <div className="text-xs text-gray-400 font-medium">{member.email}</div>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="small"
                                    onClick={() => handleEnroll(member.id)}
                                    disabled={actionLoading}
                                    className="group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600"
                                >
                                    <Plus size={16} className="mr-1" /> Enroll
                                </Button>
                            </div>
                        ))}
                        {filteredAvailable.length === 0 && (
                            <div className="text-center py-12 text-gray-400 font-medium italic">No available members found.</div>
                        )}
                    </div>
                </Card>

                {/* Enrolled Members */}
                <Card title={`Currently Enrolled (${enrolledMembers.length} / ${classData.capacity})`}>
                    <div style={{ maxHeight: '520px', overflowY: 'auto' }} className="custom-scrollbar pr-2 pt-2">
                        {enrolledMembers.length > 0 ? (
                            enrolledMembers.map(member => (
                                <div key={member.id} className="flex justify-between items-center p-4 bg-gray-50/80 border border-gray-100 rounded-2xl mb-4 group hover:border-indigo-100 transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{member.name}</div>
                                            <div className="text-xs text-gray-400 font-medium">#{member.id}</div>
                                        </div>
                                    </div>
                                    {/* <button
                                        onClick={() => handleRemove(member.id)}
                                        disabled={actionLoading}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                                    >
                                        <Trash2 size={20} />
                                    </button> */}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl italic font-medium">No members enrolled yet.</div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default MemberEnrollment;
