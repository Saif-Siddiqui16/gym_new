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
import { getChatUsers, getChats, getMessages, sendMessage } from '../../../api/manager/managerApi';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import BaseUrl from '../../../api/BaseUrl/BaseUrl';

const WhatsAppChat = () => {
    const [chats, setChats] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [chatHistory, setChatHistory] = useState({});
    const [showSidebar, setShowSidebar] = useState(true);
    const messagesEndRef = useRef(null);
    const socket = useRef();
    const currentUserId = JSON.parse(localStorage.getItem('userData'))?.id;

    // Establishing Socket Connection
    useEffect(() => {
        if (currentUserId) {
            // Extract domain from BaseUrl (remove /api/v1)
            const socketUrl = BaseUrl.replace(/\/api\/v1$/, '');
            socket.current = io(socketUrl);
            socket.current.emit('join', currentUserId);

            socket.current.on('new_message', (msg) => {
                setChatHistory(prev => {
                    const convId = msg.conversationId;
                    const existing = prev[convId] || [];
                    // Avoid duplicates
                    if (existing.some(m => m.id === msg.id)) return prev;
                    return {
                        ...prev,
                        [convId]: [...existing, msg]
                    };
                });

                // Refresh chats to show last message in sidebar
                loadChats();
            });
        }
        return () => socket.current?.disconnect();
    }, [currentUserId]);

    const loadChats = async () => {
        try {
            const data = await getChats();
            setChats(data || []);
        } catch (err) {
            console.error("Failed to load chats:", err);
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await loadChats();
            setLoading(false);
        };
        init();

        const handleResize = () => {
            if (window.innerWidth >= 768) setShowSidebar(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle Search
    useEffect(() => {
        const search = async () => {
            if (!searchTerm.trim()) {
                setSearchResults([]);
                return;
            }
            try {
                const users = await getChatUsers();
                const filtered = users.filter(u =>
                    u.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    !chats.some(c => c.receiverId === u.id)
                );
                setSearchResults(filtered);
            } catch (err) {
                console.error("Search failed:", err);
            }
        };
        const timer = setTimeout(search, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, chats]);

    const fetchMessages = async (chatId) => {
        try {
            const msgs = await getMessages(chatId);
            setChatHistory(prev => ({ ...prev, [chatId]: msgs }));
        } catch (err) {
            console.error("Failed to load messages:", err);
        }
    };

    const handleSelectChat = (chat) => {
        setSelectedUser(chat);
        if (!chatHistory[chat.id]) {
            fetchMessages(chat.id);
        }
        if (window.innerWidth < 768) setShowSidebar(false);
    };

    const handleStartNewChat = (user) => {
        // Create a temporary chat object
        const newChat = {
            id: null, // Indicates new chat
            receiverId: user.id,
            name: user.name,
            role: user.role,
            avatar: user.avatar || user.name.charAt(0),
            lastMsg: 'Start a conversation...',
            time: 'Now'
        };
        setSelectedUser(newChat);
        setSearchTerm('');
        if (window.innerWidth < 768) setShowSidebar(false);
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!messageInput.trim() || !selectedUser) return;

        const text = messageInput;
        const tempId = `temp-${Date.now()}`;
        
        // Optimistic UI update could go here, but focusing on fixing the API flow first
        setMessageInput('');

        try {
            const res = await sendMessage(
                selectedUser.id && selectedUser.id !== 'undefined' ? selectedUser.id : null, 
                text,
                selectedUser.receiverId ? selectedUser.receiverId : null
            );

            // Backend returns: { success: true, message: '...', data: messageObject }
            const msgData = res.data?.data || res.data; // fallback in case structure varies
            const actualChatId = msgData.conversationId;

            const newMessage = {
                id: msgData.id || tempId,
                text: text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sentBy: 'staff'
            };

            // If it was a new chat, update selectedUser and refresh list
            if (!selectedUser.id || selectedUser.id === 'undefined') {
                setSelectedUser(prev => ({ ...prev, id: actualChatId }));
                await loadChats();
            }

            setChatHistory(prev => ({
                ...prev,
                [actualChatId]: [...(prev[actualChatId] || []), newMessage]
            }));

        } catch (err) {
            console.error("Failed to send message:", err);
            const errorMsg = err.response?.data?.message || "Failed to send message";
            toast.error(errorMsg);
            // Put text back if failed
            setMessageInput(text);
        }
    };

    const currentMessages = selectedUser && selectedUser.id ? (chatHistory[selectedUser.id] || []) : [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentMessages]);

    const displayList = searchTerm.trim() ? searchResults : chats;

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
                            placeholder="Search members or staff..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-violet-500/20 transition-all outline-none font-medium"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Loading...</div>
                    ) : (
                        displayList.map(item => (
                            <button
                                key={item.id || item.receiverId}
                                onClick={() => searchTerm ? handleStartNewChat(item) : handleSelectChat(item)}
                                className={`w-full p-4 flex items-center gap-3 hover:bg-white transition-all border-b border-slate-50/50 ${selectedUser?.id === item.id || selectedUser?.receiverId === item.id ? 'bg-white border-l-4 border-l-violet-600 shadow-sm' : ''}`}
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                    {(item.avatar && typeof item.avatar === 'string' && item.avatar.length === 1) ? item.avatar : (item.name?.charAt(0) || 'U')}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-start mb-0.5">
                                        <span className="font-bold text-slate-800 truncate">{item.name}</span>
                                        <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{item.time}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 truncate font-medium opacity-70">
                                        {item.lastMsg || item.role?.replace('_', ' ')}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                    {!loading && displayList.length === 0 && (
                        <div className="p-10 text-center text-slate-400 text-xs font-bold uppercase tracking-tighter">No results found</div>
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col bg-[#f0f2f5] relative ${!selectedUser ? 'items-center justify-center' : ''}`}>
                {selectedUser ? (
                    <>
                        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowSidebar(true)} className="md:hidden p-2 -ml-2 text-slate-500 hover:text-violet-600 transition-colors">
                                    <ChevronLeft size={24} />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                                    {selectedUser.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 leading-tight tracking-tight">{selectedUser.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">{selectedUser.role?.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all"><Phone size={20} /></button>
                                <button className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
                            {currentMessages.map((msg, idx) => (
                                <div key={msg.id} className={`flex ${msg.sentBy === 'staff' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl shadow-sm relative ${msg.sentBy === 'staff' ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
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

                        <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-3">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                <button type="button" className="p-2 text-slate-400 hover:text-violet-600 transition-colors"><Paperclip size={22} /></button>
                                <div className="flex-1 relative">
                                    <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type a message..." className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-medium" />
                                </div>
                                <button type="submit" disabled={!messageInput.trim()} className={`p-3 rounded-xl transition-all shadow-lg active:scale-95 ${messageInput.trim() ? 'bg-violet-600 text-white shadow-violet-200 hover:bg-violet-700 hover:scale-105' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}><Send size={20} /></button>
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
                            Search for members or staff in the sidebar to start a conversation.
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
