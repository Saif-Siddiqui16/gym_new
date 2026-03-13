import React, { useState, useEffect } from 'react';
import { Cake, Send, Ghost, Star, Calendar, Bell } from 'lucide-react';
import { triggerBirthdayCheck, triggerPersonalBirthdayWish } from '../../api/manager/managerApi';

const Birthdays = () => {
    const [birthdays, setBirthdays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [sendingPersonalTo, setSendingPersonalTo] = useState(null);

    useEffect(() => {
        fetchBirthdays();
    }, []);

    const fetchBirthdays = async () => {
        try {
            const data = await triggerBirthdayCheck();
            setBirthdays(data.wishes || []);
        } catch (error) {
            console.error("Failed to fetch birthdays:", error);
        } finally {
            setLoading(false);
        }
    };

    const sendWishes = async () => {
        setProcessing(true);
        try {
            await triggerBirthdayCheck();
            alert('Birthday wishes sent successfully!');
            fetchBirthdays();
        } catch (error) {
            console.error("Failed to send wishes:", error);
        } finally {
            setProcessing(false);
        }
    };

    const sendPersonalMessage = async (memberId, name) => {
        const message = prompt(`Enter a personal birthday message for ${name}:`, `Happy Birthday ${name}! Have a fantastic day ahead.`);
        if (!message) return; // User cancelled

        setSendingPersonalTo(memberId);
        try {
            await triggerPersonalBirthdayWish(memberId, message);
            alert(`Personal message sent to ${name}!`);
        } catch (error) {
            console.error("Failed to send personal message:", error);
            alert("Failed to send personal message. Please try again later.");
        } finally {
            setSendingPersonalTo(null);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/30">
            {/* Header */}
            <div className="p-8 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <Cake className="text-pink-500" />
                        Birthday Reminders
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Automatic & Manual Greetings</p>
                </div>
                <button 
                    onClick={sendWishes}
                    disabled={processing || birthdays.length === 0}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    <Send size={16} />
                    {processing ? 'Sending...' : 'Send All Wishes'}
                </button>
            </div>

            {/* List */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-pink-500 rounded-full animate-spin" />
                    </div>
                ) : birthdays.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <Ghost size={64} className="text-slate-300" />
                        <h3 className="text-xl font-black text-slate-800 mt-6 mt-4">No Birthdays Today</h3>
                        <p className="text-sm font-medium text-slate-500 max-w-xs mt-2">
                            Check back tomorrow! The system automatically sends wishes at midnight.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {birthdays.map((member) => (
                            <div key={member.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-xl transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                                    <Cake size={80} className="text-pink-500" />
                                </div>
                                
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-black text-2xl shadow-lg mb-4">
                                        {member.name.charAt(0)}
                                    </div>
                                    <h4 className="text-lg font-black text-slate-800">{member.name}</h4>
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="px-3 py-1 bg-pink-50 text-pink-600 text-[10px] font-black uppercase tracking-widest rounded-full">Today</span>
                                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                                            <Bell size={10} /> Notified
                                        </span>
                                    </div>
                                    
                                    <button 
                                        onClick={() => sendPersonalMessage(member.id, member.name)}
                                        disabled={sendingPersonalTo === member.id}
                                        className="w-full mt-6 py-4 bg-slate-50 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all disabled:opacity-50"
                                    >
                                        {sendingPersonalTo === member.id ? 'Sending...' : 'Send Personal Message'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Automation Info Card */}
                <div className="mt-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[40px] p-10 text-white relative overflow-hidden">
                    <div className="absolute top-[-20px] right-[-20px] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center">
                            <Star size={40} className="text-yellow-300 fill-yellow-300" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl font-black mb-2">Automation is Active</h3>
                            <p className="text-white/80 font-medium">
                                The system is configured to automatically detect member birthdays and send greetings every 24 hours.
                            </p>
                        </div>
                        <div className="flex flex-col items-center gap-2 px-8 py-4 bg-white/10 rounded-3xl border border-white/20">
                            <Calendar size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Next Run</span>
                            <span className="text-xl font-black">Daily Cycle</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Birthdays;
