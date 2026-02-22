import React, { useState, useEffect } from 'react';
import { QrCode, ShieldCheck, Clock, Zap, Loader } from 'lucide-react';
import '../../styles/GlobalDesign.css';
import { getMemberQrProfile } from '../../api/member/memberApi';

const MemberCheckIn = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await getMemberQrProfile();
            setProfile(data);
        } catch (error) {
            console.error('Failed to load profile for QR code:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    if (loading || !profile) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader className="animate-spin text-violet-600" size={40} />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quick Check-In</h1>
                    <p className="text-gray-500 font-medium mt-1">Scan this code at the gym entrance to log your visit.</p>
                </div>

                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center">
                    {/* Mock QR Code */}
                    <div className="w-64 h-64 bg-gray-50 rounded-[32px] p-8 border-2 border-dashed border-gray-200 flex items-center justify-center relative group">
                        <QrCode size={160} className="text-gray-800" strokeWidth={1.5} />
                        <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[32px]">
                            <button onClick={loadProfile} className="bg-violet-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg">Refresh Code</button>
                        </div>
                    </div>

                    <div className="mt-8 text-center space-y-2">
                        <p className="text-lg font-black text-gray-900">{profile.id}</p>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{profile.name}</p>
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                        <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-3">
                            <ShieldCheck className="text-green-600" size={24} />
                            <div>
                                <p className="text-xs font-bold text-green-700 uppercase">Status</p>
                                <p className="text-sm font-black text-green-900">{profile.status || 'Active'}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                            <Clock className="text-blue-600" size={24} />
                            <div>
                                <p className="text-xs font-bold text-blue-700 uppercase">Late Entry</p>
                                <p className="text-sm font-black text-blue-900">Allowed</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-violet-50 p-6 rounded-[28px] flex items-start gap-4 border border-violet-100">
                    <div className="p-2 bg-white rounded-xl text-violet-600 shadow-sm">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-violet-900">Pro Tip</p>
                        <p className="text-xs text-violet-700 mt-1 leading-relaxed">Checking in consistently helps you maintain your <strong>Consistency Badge</strong> and earn extra reward points!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberCheckIn;
