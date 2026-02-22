import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Send, Image, Paperclip, MoreVertical, CheckCheck, Smile, Phone, Video, Info, User, Plus } from 'lucide-react';
import { getChats, getMessages, sendMessage } from '../../api/manager/managerApi';

import Announcements from './Announcements';

const CommunicationPage = () => {
    const [activeModule, setActiveModule] = useState('chats'); // 'chats' or 'announcements'

    // Chat State
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [msgInput, setMsgInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [view, setView] = useState('list');

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const data = await getChats();
                setChats(data);
            } catch (error) {
                console.error("Failed to load chats:", error);
            }
        };
        fetchChats();
    }, []);

    useEffect(() => {
        const fetchMsgs = async () => {
            if (!selectedChat) return;
            try {
                const msgs = await getMessages(selectedChat.id);
                setMessages(msgs);
            } catch (error) {
                console.error("Failed to load messages:", error);
            }
        };
        fetchMsgs();
    }, [selectedChat]);

    const handleSend = async () => {
        if (!msgInput.trim() || !selectedChat) return;
        try {
            await sendMessage(selectedChat.id, msgInput);
            setMessages([...messages, {
                id: Date.now(),
                text: msgInput,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                sender: 'me',
                status: 'sent'
            }]);
            setMsgInput('');
        } catch (error) {
            console.error("Failed to send msg:", error);
        }
    };

    const filteredChats = chats.filter(chat => {
        const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'All' || (activeTab === 'Unread' && chat.unread > 0);
        return matchesSearch && matchesTab;
    });

    return (
        <div className="p-4 md:p-8 h-screen bg-slate-50 flex flex-col">
            {/* Module Switcher Tabs */}
            <div className="flex justify-center mb-6 shrink-0">
                <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex gap-2">
                    <button
                        onClick={() => setActiveModule('chats')}
                        className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeModule === 'chats'
                            ? 'bg-slate-900 text-white shadow-lg'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Live Chats
                    </button>
                    <button
                        onClick={() => setActiveModule('announcements')}
                        className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${activeModule === 'announcements'
                            ? 'bg-orange-500 text-white shadow-lg'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Announcements
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden relative">

                {activeModule === 'announcements' ? (
                    <Announcements />
                ) : (
                    <div className="flex h-full">
                        {/* Sidebar - Chat List */}
                        <div className={`${view === 'chat' ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-[400px] border-r border-slate-50 bg-slate-50/30`}>
                            <div className="p-8 pb-0">
                                <div className="flex items-center justify-between mb-6">
                                    <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                        <MessageSquare className="text-indigo-600" />
                                        Chats
                                    </h1>
                                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-sm">
                                        <Plus size={20} />
                                    </div>
                                </div>

                                <div className="relative group mb-6">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-all" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search members..."
                                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all shadow-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-4 border-b border-slate-100 mb-4">
                                    {['All', 'Unread', 'Archived'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`pb-4 text-xs font-black uppercase tracking-widest relative transition-all ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {tab}
                                            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar pb-8">
                                {filteredChats.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center opacity-40">
                                        <Search size={40} className="text-slate-300" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4">No conversations found</p>
                                    </div>
                                ) : (
                                    filteredChats.map(chat => (
                                        <div
                                            key={chat.id}
                                            onClick={() => {
                                                setSelectedChat(chat);
                                                setView('chat');
                                            }}
                                            className={`p-4 rounded-[24px] cursor-pointer transition-all flex items-center gap-4 group ${selectedChat?.id === chat.id
                                                ? 'bg-white shadow-xl shadow-indigo-500/10 border border-slate-100 scale-[1.02]'
                                                : 'hover:bg-white/60'
                                                }`}
                                        >
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg">
                                                    {chat.avatar}
                                                </div>
                                                {chat.status === 'online' ? (
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white" />
                                                ) : (
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-200 rounded-full border-4 border-white" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h3 className="font-bold text-slate-800 text-sm truncate">{chat.name}</h3>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{chat.time}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs text-slate-500 truncate font-medium">{chat.lastMsg}</p>
                                                    {chat.unread > 0 && (
                                                        <span className="min-w-[20px] h-5 px-1.5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg animate-pulse">
                                                            {chat.unread}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Main Chat Window */}
                        <div className={`${view === 'list' ? 'hidden' : 'flex'} md:flex flex-col flex-1 bg-white relative`}>
                            {selectedChat ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-50 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setView('list')} className="md:hidden p-2 text-slate-400 hover:text-slate-600">
                                                <ChevronLeft />
                                            </button>
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-400 flex items-center justify-center text-white font-black shadow-lg">
                                                {selectedChat.avatar}
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-black text-slate-800 tracking-tight">{selectedChat.name}</h2>
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedChat.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedChat.status === 'online' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                        {selectedChat.status === 'online' ? 'Active Now' : 'Recently Active'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-3 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all" title="Audio Call"><Phone size={20} /></button>
                                            <button className="p-3 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all" title="Video Call"><Video size={20} /></button>
                                            <button className="p-3 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all" title="Member Info"><Info size={20} /></button>
                                            <button className="p-3 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all" title="More Options"><MoreVertical size={20} /></button>
                                        </div>
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/20 custom-scrollbar">
                                        <div className="flex justify-center">
                                            <span className="px-4 py-1.5 bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-full border border-slate-100 shadow-sm">Today</span>
                                        </div>

                                        {messages.map(msg => (
                                            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                                                <div className={`max-w-[75%] md:max-w-md ${msg.sender === 'me'
                                                    ? 'bg-slate-900 text-white rounded-t-[28px] rounded-bl-[28px] shadow-2xl shadow-slate-900/10'
                                                    : 'bg-white text-slate-800 rounded-t-[28px] rounded-br-[28px] shadow-xl shadow-slate-200/50 border border-slate-100'
                                                    } p-5 relative group`}>
                                                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                                    <div className={`flex items-center gap-2 mt-3 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest ${msg.sender === 'me' ? 'text-slate-400' : 'text-slate-300'}`}>
                                                            {msg.time}
                                                        </span>
                                                        {msg.sender === 'me' && (
                                                            <CheckCheck size={14} className={msg.status === 'read' ? 'text-indigo-400' : 'text-slate-600'} />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chat Input */}
                                    <div className="p-6 md:p-8 border-t border-slate-50 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                                        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[28px] border-2 border-slate-50 focus-within:border-indigo-100 focus-within:bg-white transition-all shadow-sm">
                                            <div className="flex items-center gap-1 pl-2">
                                                <button className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors"><Smile size={22} /></button>
                                                <button className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors"><Paperclip size={22} /></button>
                                                <button className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors hidden md:block"><Image size={22} /></button>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Type a message..."
                                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 py-3"
                                                value={msgInput}
                                                onChange={(e) => setMsgInput(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                            />
                                            <button
                                                onClick={handleSend}
                                                className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all"
                                            >
                                                <Send size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/10">
                                    <div className="w-24 h-24 bg-white rounded-[32px] shadow-2xl flex items-center justify-center text-indigo-100 mb-8 animate-bounce delay-700 duration-[3000ms]">
                                        <MessageSquare size={48} />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Select a Conversation</h2>
                                    <p className="text-slate-500 mt-4 max-w-sm font-medium leading-relaxed">
                                        Connect with your members instantly. Select a chat from the sidebar to start messaging.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>;

export default CommunicationPage;
