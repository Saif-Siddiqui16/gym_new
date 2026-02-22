import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    MessageSquare,
    Send,
    Phone,
    MoreVertical,
    Paperclip,
    ChevronLeft,
    CheckCheck,
    Clock,
    User,
    FileText,
    Calendar
} from 'lucide-react';
import { MEMBERSHIPS } from '../../membership/data/mockMemberships';

const WhatsAppChat = () => {
    const [selectedMember, setSelectedMember] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [chatHistory, setChatHistory] = useState({});
    const [showSidebar, setShowSidebar] = useState(true);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, selectedMember]);

    // Responsive Sidebar Logic
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setShowSidebar(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const filteredMembers = MEMBERSHIPS.filter(m =>
        m.memberName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        if (!messageInput.trim() || !selectedMember) return;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newMessage = {
            id: Date.now(),
            text: messageInput,
            time: timestamp,
            sentBy: 'staff'
        };

        setChatHistory(prev => ({
            ...prev,
            [selectedMember.id]: [...(prev[selectedMember.id] || []), newMessage]
        }));
        setMessageInput('');
    };

    const applyTemplate = (type) => {
        if (!selectedMember) return;
        let text = '';
        if (type === 'payment') {
            text = `Hi ${selectedMember.memberName}, this is a friendly reminder that your gym membership payment for ${selectedMember.planName} is due. Please settle it via the app or at the front desk. - Gym Team`;
        } else if (type === 'booking') {
            text = `Hi ${selectedMember.memberName}, your booking is confirmed. We look forward to seeing you at the gym! - Gym Team`;
        }
        setMessageInput(text);
    };

    const currentMessages = selectedMember ? (chatHistory[selectedMember.id] || [
        { id: 'welcome', text: `Hi ${selectedMember.memberName}! How can we help you today?`, time: '09:00 AM', sentBy: 'member' }
    ]) : [];

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative">

            {/* Sidebar: Member List */}
            <div className={`
                ${showSidebar ? 'w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50' : 'hidden md:flex md:w-80 border-r border-slate-100 flex flex-col bg-slate-50'}
                absolute md:relative z-20 h-full transition-all duration-300
            `}>
                <div className="p-4 bg-white border-b border-slate-100">
                    <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                        <MessageSquare className="text-violet-600" size={24} />
                        WhatsApp Chat
                    </h2>
                    <div className="relative group">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 transition-all outline-none font-medium"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredMembers.map(member => (
                        <button
                            key={member.id}
                            onClick={() => {
                                setSelectedMember(member);
                                if (window.innerWidth < 768) setShowSidebar(false);
                            }}
                            className={`w-full p-4 flex items-center gap-3 hover:bg-white transition-all border-b border-slate-50/50 ${selectedMember?.id === member.id ? 'bg-white border-l-4 border-l-violet-600 shadow-sm' : ''}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                {member.memberName.charAt(0)}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <span className="font-bold text-slate-800 truncate">{member.memberName}</span>
                                    <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">09:41 AM</span>
                                </div>
                                <div className="text-xs text-slate-500 truncate font-medium">
                                    {member.planName}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col bg-[#f0f2f5] relative ${!selectedMember ? 'items-center justify-center' : ''}`}>
                {selectedMember ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowSidebar(true)}
                                    className="md:hidden p-2 -ml-2 text-slate-500 hover:text-violet-600 transition-colors"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                                    {selectedMember.memberName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 leading-tight tracking-tight">{selectedMember.memberName}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">Online</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                                    <Phone size={20} />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                            <div className="flex justify-center mb-6">
                                <span className="bg-white/80 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-200 shadow-sm">
                                    Today
                                </span>
                            </div>

                            {currentMessages.map((msg, idx) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sentBy === 'staff' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className={`
                                        max-w-[85%] md:max-w-[70%] p-3 rounded-2xl shadow-sm relative
                                        ${msg.sentBy === 'staff'
                                            ? 'bg-violet-600 text-white rounded-tr-none'
                                            : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}
                                    `}>
                                        <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                        <div className={`flex items-center justify-end gap-1 mt-1 ${msg.sentBy === 'staff' ? 'text-violet-200' : 'text-slate-400'}`}>
                                            <span className="text-[9px] font-bold uppercase">{msg.time}</span>
                                            {msg.sentBy === 'staff' && <CheckCheck size={12} />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-3">
                            {/* Template Buttons */}
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                <button
                                    onClick={() => applyTemplate('payment')}
                                    className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-600 rounded-lg text-[11px] font-bold border border-violet-100 hover:bg-violet-100 transition-colors shadow-sm"
                                >
                                    <FileText size={14} />
                                    Payment Reminder
                                </button>
                                <button
                                    onClick={() => applyTemplate('booking')}
                                    className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors shadow-sm"
                                >
                                    <Calendar size={14} />
                                    Booking Confirmation
                                </button>
                            </div>

                            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                <button type="button" className="p-2 text-slate-400 hover:text-violet-600 transition-colors">
                                    <Paperclip size={22} />
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-medium"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!messageInput.trim()}
                                    className={`p-3 rounded-xl transition-all shadow-lg active:scale-95 ${messageInput.trim() ? 'bg-violet-600 text-white shadow-violet-200 hover:bg-violet-700 hover:scale-105' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-8">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-50 rotate-3 animate-bounce shadow-violet-100/50">
                            <MessageSquare size={40} className="text-violet-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">My WhatsApp Chat</h2>
                        <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                            Select a member from the sidebar to start a conversation or send important updates.
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default WhatsAppChat;
