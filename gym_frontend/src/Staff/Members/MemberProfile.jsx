import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Phone, CreditCard, Activity, Calendar, LogOut, Lock } from 'lucide-react';
import { getMemberById } from '../../api/staff/memberApi';
import '../../styles/GlobalDesign.css';

const MemberProfile = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [member, setMember] = useState(state?.member || null);
    const [loading, setLoading] = useState(!state?.member);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!member && id) {
            loadMember();
        }
    }, [id, member]);

    const loadMember = async () => {
        setLoading(true);
        try {
            const data = await getMemberById(id);
            setMember(data);
        } catch (error) {
            console.error("Failed to load member profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log('Selected file for Face ID:', file.name);
            alert(`Selected file: ${file.name}\nIn a real app, this would be uploaded for member Face ID.`);
        }
    };

    if (loading) {
        return (
            <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-indigo-600 font-bold">Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">Member Not Found</h2>
                <button
                    onClick={() => navigate('/staff/members/lookup')}
                    className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-md">
                    Back to Lookup
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
            <div className="mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                    <ChevronLeft size={16} />
                    Back to Member Lookup
                </button>
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold">
                                {(member.name || '?').charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold">{member.name}</h1>
                                <p className="text-indigo-100 text-sm mt-1">Member ID: {member.id}</p>
                            </div>
                            {member.lockerId ? (
                                <button
                                    onClick={() => navigate('/staff/lockers/release')}
                                    className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95 border border-rose-400"
                                >
                                    <LogOut size={18} />
                                    Release Locker
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/staff/lockers/assign', { state: { memberName: member.name } })}
                                    className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 border border-white/30 shadow-lg active:scale-95"
                                >
                                    <Lock size={18} />
                                    Assign Locker
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Member Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Phone Number</p>
                                    <p className="text-sm font-bold text-gray-900">{member.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Membership Plan</p>
                                    <p className="text-sm font-bold text-gray-900">{member.plan}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                    <Activity size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Status</p>
                                    <p className="text-sm font-bold text-gray-900">{member.status}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Expiry Date</p>
                                    <p className="text-sm font-bold text-gray-900">{member.expiry || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Face ID Section */}
                            <div className="md:col-span-2 mt-2">
                                <h3 className="text-sm font-bold text-gray-900 mb-3 ml-1">Biometric Access</h3>
                                <div
                                    onClick={handleUploadClick}
                                    className="border-2 border-dashed border-indigo-200 bg-indigo-50/50 rounded-xl p-6 flex items-center justify-between group cursor-pointer hover:bg-indigo-50 transition-colors"
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                                            <Activity size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-indigo-900 group-hover:text-indigo-600 transition-colors">Face ID Avatar</h4>
                                            <p className="text-xs text-indigo-600/80">
                                                {member.hasFaceId ? 'Registered & Active' : 'Not setup yet'}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-white text-indigo-600 text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all">
                                        {member.hasFaceId ? 'Update Photo' : 'Upload Photo'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <p className="text-xs text-blue-700 font-medium">
                                <strong>Note:</strong> This is a premium member profile view. All information is fetched in real-time.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberProfile;
