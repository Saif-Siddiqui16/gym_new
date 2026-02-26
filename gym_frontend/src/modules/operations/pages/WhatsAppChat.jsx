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
import { getChatUsers } from '../../../api/manager/managerApi';
import { toast } from 'react-hot-toast';

const WhatsAppChat = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
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
        const loadUsers = async () => {
            try {
                setLoading(true);
                const data = await getChatUsers();
                setUsers(data || []);
            } catch (err) {
                console.error("Failed to load chat users:", err);
                toast.error("Failed to load users");
            } finally {
                setLoading(false);
            }
        };
        loadUsers();

        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setShowSidebar(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const filteredUsers = (users || []).filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        if (!messageInput.trim() || !selectedUser) return;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newMessage = {
            id: Date.now(),
            text: messageInput,
            time: timestamp,
            sentBy: 'staff'
        };

        setChatHistory(prev => ({
            ...prev,
            [selectedUser.id]: [...(prev[selectedUser.id] || []), newMessage]
        }));
        setMessageInput('');
    };

    const applyTemplate = (type) => {
        if (!selectedUser) return;
        let text = '';
        if (type === 'payment') {
            text = `Hi ${selectedUser.name}, regarding the branch management...`;
        } else if (type === 'booking') {
            text = `Hi ${selectedUser.name}, the training schedule has been updated.`;
        }
        setMessageInput(text);
    };

    const currentMessages = selectedUser ? (chatHistory[selectedUser.id] || [
        { id: 'welcome', text: `Hi ${selectedUser.name}! How can we help you today?`, time: '09:00 AM', sentBy: 'member' }
    ]) : [];

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, selectedUser]);

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
                    {loading ? (
                        <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Users...</div>
                    ) : filteredUsers.map(user => (
                        <button
                            key={user.id}
                            onClick={() => {
                                setSelectedUser(user);
                                if (window.innerWidth < 768) setShowSidebar(false);
                            }}
                            className={`w-full p-4 flex items-center gap-3 hover:bg-white transition-all border-b border-slate-50/50 ${selectedUser?.id === user.id ? 'bg-white border-l-4 border-l-violet-600 shadow-sm' : ''}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <span className="font-bold text-slate-800 truncate">{user.name}</span>
                                    <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">Now</span>
                                </div>
                                <div className="text-xs text-slate-500 truncate font-black uppercase tracking-tighter opacity-70">
                                    {user.role.replace('_', ' ')}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col bg-[#f0f2f5] relative ${!selectedUser ? 'items-center justify-center' : ''}`}>
                {selectedUser ? (
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
                                    {selectedUser.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 leading-tight tracking-tight">{selectedUser.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">{selectedUser.role.replace('_', ' ')}</span>
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
                            Select a Superadmin or Branch Staff from the sidebar to start a conversation.
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
