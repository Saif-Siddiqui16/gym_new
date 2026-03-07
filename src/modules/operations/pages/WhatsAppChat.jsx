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
    Calendar,
    Smile,
    Command,
    Bell,
    Moon,
    X,
    MoreHorizontal,
    Loader2
} from 'lucide-react';
import { fetchChatContacts, fetchCommLogs, sendBroadcastMessage } from '../../../api/communication/communicationApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const WhatsAppChat = () => {
    const { user } = useAuth();
    const [selectedMember, setSelectedMember] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [showSidebar, setShowSidebar] = useState(true);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [fetchingMessages, setFetchingMessages] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);
    const optionsRef = useRef(null);
    const emojiRef = useRef(null);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadContacts = async (search = '') => {
        try {
            setLoading(true);
            const data = await fetchChatContacts({
                branchId: user?.tenantId,
                search: search
            });
            setContacts(data || []);
        } catch (error) {
            console.error('Failed to load chat contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        if (!selectedMember) return;
        try {
            setFetchingMessages(true);
            const data = await fetchCommLogs({
                branchId: user?.tenantId,
                memberId: selectedMember.id
            });
            const formatted = data.map(log => ({
                id: log.id,
                text: log.message,
                time: new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: log.senderId === user.id ? 'sent' : 'received',
                status: log.status
            }));
            setMessages(formatted);
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setFetchingMessages(false);
        }
    };

    useEffect(() => {
        loadContacts();
    }, [user?.tenantId]);

    useEffect(() => {
        if (selectedMember) {
            loadMessages();
        } else {
            setMessages([]);
        }
    }, [selectedMember]);

    // Handle search input with debouncing simulated by typing
    useEffect(() => {
        const timer = setTimeout(() => {
            loadContacts(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Close menus on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                setShowOptions(false);
            }
            if (emojiRef.current && !emojiRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEmojiSelect = (emoji) => {
        setMessageInput(prev => prev + emoji);
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedMember) return;

        const originalText = messageInput;
        const tempMsg = {
            id: Date.now(),
            text: originalText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'sent',
            status: 'Pending'
        };
        setMessages(prev => [...prev, tempMsg]);
        setMessageInput('');
        setTimeout(scrollToBottom, 50);

        try {
            await sendBroadcastMessage({
                channel: 'WhatsApp',
                message: originalText,
                memberId: selectedMember.id,
                audience: selectedMember.name
            });
            loadMessages();
        } catch (error) {
            toast.error("Failed to send message");
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
            setMessageInput(originalText);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            toast.success(`File "${file.name}" selected`);
        }
    };

    const handleExportChat = () => {
        if (messages.length === 0) return toast.error("No messages to export");
        const chatContent = messages.map(m => `[${m.time}] ${m.type === 'sent' ? 'Me' : selectedMember.name}: ${m.text}`).join('\n');
        const element = document.createElement("a");
        const file = new Blob([chatContent], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `chat_with_${selectedMember.name.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(element);
        element.click();
        setShowOptions(false);
    };

    const handleClearChat = () => {
        setMessages([]);
        setShowOptions(false);
        toast.success("Chat cleared locally");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-8 space-y-8 animate-fadeIn text-slate-900 font-sans">

            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 text-white">
                    <MessageSquare size={24} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                    {user?.role === 'MEMBER' ? 'My Messages' : 'Member Messages'}
                </h1>
            </div>

            {/* Main Chat Container */}
            <div className="flex gap-6 h-[calc(100vh-180px)]">

                {/* Contact Sidebar */}
                <div className={`
                    ${showSidebar ? 'w-full lg:w-96 flex' : 'hidden lg:flex lg:w-96'} 
                    bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex-col
                `}>
                    {/* Sidebar Search Area */}
                    <div className="p-6 border-b border-slate-50">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, phone or role..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-12 pl-12 pr-5 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:border-violet-500 transition-all shadow-inner"
                            />
                            {loading && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 size={16} className="animate-spin text-violet-500" /></div>}
                        </div>
                    </div>

                    {/* Contact List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {contacts.length > 0 ? (
                            contacts.map(contact => (
                                <button
                                    key={`${contact.type}-${contact.id}`}
                                    onClick={() => setSelectedMember(contact)}
                                    className={`w-full p-4 rounded-[1.5rem] flex items-start gap-4 transition-all duration-300 group ${selectedMember?.id === contact.id && selectedMember?.type === contact.type ? 'bg-violet-50 shadow-sm border border-violet-100' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="relative">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-110 transition-transform ${contact.type === 'MEMBER' ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-emerald-400 to-teal-500'}`}>
                                            {contact.name.charAt(0)}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className={`text-[13px] font-black tracking-tight ${selectedMember?.id === contact.id ? 'text-violet-900' : 'text-slate-800'}`}>
                                                {contact.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${contact.type === 'MEMBER' ? 'bg-violet-100 text-violet-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {contact.type}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 truncate">{contact.phone || 'No phone'}</span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full space-y-4 py-10 opacity-60">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-200 shadow-inner">
                                    <Search size={28} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">No contacts found</h4>
                                    <p className="text-[10px] font-bold text-slate-300 uppercase mt-1">Try another search term</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main View Area */}
                <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col relative">
                    {selectedMember ? (
                        <>
                            {/* Chat Header */}
                            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-600 font-black shadow-inner">
                                        {selectedMember.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800 tracking-tight">{selectedMember.name}</h3>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Active Now</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 relative">
                                    <div ref={optionsRef}>
                                        <button
                                            onClick={() => setShowOptions(!showOptions)}
                                            className={`p-3 rounded-2xl transition-all ${showOptions ? 'bg-violet-600 text-white shadow-lg shadow-violet-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>

                                        {showOptions && (
                                            <div className="absolute right-0 top-16 w-56 bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/50 p-2 z-50 animate-in fade-in zoom-in duration-200">
                                                <button onClick={handleClearChat} className="w-full text-left px-5 py-3.5 hover:bg-rose-50 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-500 transition-colors flex items-center gap-3">
                                                    <Clock size={14} className="text-rose-400" /> Clear Chat
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Messages View */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30 custom-scrollbar relative">
                                {fetchingMessages ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-20">
                                        <Loader2 className="animate-spin text-violet-600" size={32} />
                                    </div>
                                ) : messages.length > 0 ? (
                                    messages.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                                            <div className={`max-w-[70%] p-5 rounded-[2rem] shadow-sm border ${msg.type === 'sent' ? 'bg-violet-600 text-white border-violet-500 rounded-tr-none' : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'}`}>
                                                <p className="text-[13px] font-bold leading-relaxed">{msg.text}</p>
                                                <div className={`mt-2 flex items-center gap-2 ${msg.type === 'sent' ? 'text-violet-200' : 'text-slate-400'}`}>
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{msg.time}</span>
                                                    {msg.type === 'sent' && (
                                                        msg.status === 'Pending' ? <Clock size={12} className="animate-pulse" /> : <CheckCheck size={14} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-slate-200">
                                            <MessageSquare size={32} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No messages yet. Say hi!</p>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-8 border-t border-slate-50 bg-white">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-[2rem] px-6 py-3 shadow-inner group focus-within:border-violet-400 transition-all relative">
                                    <div ref={emojiRef} className="relative">
                                        <button
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className={`p-2 transition-colors ${showEmojiPicker ? 'text-violet-600' : 'text-slate-300 hover:text-violet-500'}`}
                                        >
                                            <Smile size={22} />
                                        </button>

                                        {showEmojiPicker && (
                                            <div className="absolute bottom-16 left-0 bg-white border border-slate-100 rounded-3xl shadow-2xl p-4 grid grid-cols-6 gap-2 w-72 z-50 animate-in slide-in-from-bottom-2">
                                                {['😊', '😂', '🔥', '👍', '❤️', '🙏', '🙌', '🎉', '👋', '💪', '✨', '✅', '❌', '📢', ' gym', '⌚', '💧', '🍎'].map(emoji => (
                                                    <button
                                                        key={emoji}
                                                        onClick={() => { handleEmojiSelect(emoji); setShowEmojiPicker(false); }}
                                                        className="text-2xl hover:bg-slate-50 p-2 rounded-xl transition-all hover:scale-125"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={triggerFileSelect}
                                        className="p-2 text-slate-300 hover:text-violet-500 transition-colors"
                                    >
                                        <Paperclip size={22} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Type your message here..."
                                        className="flex-1 bg-transparent border-none outline-none text-[13px] font-bold text-slate-700 placeholder:text-slate-300"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!messageInput.trim()}
                                        className={`p-3 rounded-2xl transition-all ${messageInput.trim() ? 'bg-violet-600 text-white shadow-lg shadow-violet-100 scale-110 active:scale-95' : 'bg-slate-200 text-slate-400'}`}
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        /* Empty State (Matching Screenshot) */
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white relative">
                            <div className="space-y-6 animate-in fade-in zoom-in duration-1000">
                                <div className="w-24 h-24 bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center justify-center text-slate-200 mx-auto shadow-inner relative group cursor-default">
                                    <MessageSquare size={44} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute -inset-4 bg-violet-500/5 rounded-full blur-3xl animate-pulse"></div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-slate-400 text-sm font-black uppercase tracking-[0.2em]">Select a conversation to start chatting</h4>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e2e8f0; }
            `}</style>
        </div >
    );
};

export default WhatsAppChat;
