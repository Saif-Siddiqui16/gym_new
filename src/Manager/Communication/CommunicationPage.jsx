import React, { useState, useEffect } from 'react';
import { MessageSquare, Search, Send, Image, Paperclip, MoreVertical, CheckCheck, Smile, Phone, Video, Info, User, Plus } from 'lucide-react';
import { fetchChatContacts, fetchChatMessages, sendChatMessage } from '../../api/communication/communicationApi';
import toast from 'react-hot-toast';

import Announcements from './Announcements';
import Birthdays from './Birthdays';

const CommunicationPage = ({ initialModule = 'chats' }) => {
    const [activeModule, setActiveModule] = useState(initialModule); // 'chats', 'announcements' or 'birthdays'

    // Chat State
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [msgInput, setMsgInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [view, setView] = useState('list');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const data = await fetchChatContacts();
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
                const msgs = await fetchChatMessages(selectedChat.id, !selectedChat.isStaff);
                // Map to UI format
                const formatted = msgs.map(m => ({
                    id: m.id,
                    text: m.message,
                    time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    sender: m.senderId === JSON.parse(localStorage.getItem('userData'))?.id ? 'me' : 'them',
                    status: 'sent',
                    attachmentUrl: m.attachmentUrl,
                    attachmentType: m.attachmentType
                }));
                setMessages(formatted);
            } catch (error) {
                console.error("Failed to load messages:", error);
            }
        };
        fetchMsgs();
    }, [selectedChat]);

    const handleSend = async () => {
        if ((!msgInput.trim() && !selectedFile) || !selectedChat) return;

        try {
            const payload = {
                receiverId: selectedChat.id,
                message: msgInput,
                receiverType: selectedChat.isStaff ? 'STAFF' : 'MEMBER'
            };

            if (selectedFile) {
                payload.attachmentUrl = selectedFile.data;
                payload.attachmentType = selectedFile.type.startsWith('image/') ? 'image' : 'file';
            }

            await sendChatMessage(payload);
            toast.success("Message sent");
            
            setMessages([...messages, {
                id: Date.now(),
                text: msgInput,
                sender: 'me',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'sent',
                attachmentUrl: selectedFile?.data,
                attachmentType: selectedFile?.type.startsWith('image/') ? 'image' : 'file'
            }]);
            setMsgInput('');
            setSelectedFile(null);
        } catch (error) {
            console.error("Failed to send msg:", error);
            toast.error("Failed to send message");
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedFile({
                file,
                data: reader.result,
                name: file.name,
                type: file.type
            });
        };
        reader.readAsDataURL(file);
    };

    const addEmoji = (emoji) => {
        setMsgInput(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const emojis = ['😀', '😂', '😍', '👍', '🔥', '🙌', '🎉', '💪', '❤️', '✨', '🤔', '😊', '😎', '😜', '🙏', '💯', '🚀', '🎁', '🎈', '🍕'];

    const filteredChats = chats.filter(chat => {
        const matchesSearch = chat.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'All' || (activeTab === 'Unread' && chat.unread > 0);
        return matchesSearch && matchesTab;
    });

    return (
        <div className="h-[calc(100vh-120px)] bg-slate-50/50 flex flex-col overflow-hidden">
            <div className="flex-1 bg-white rounded-t-[40px] md:rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden relative mx-0 sm:mx-4 mb-0 sm:mb-4">

                {activeModule === 'announcements' ? (
                    <Announcements />
                ) : activeModule === 'birthdays' ? (
                    <Birthdays />
                ) : (
                    <div className="flex h-full">
                        {/* Sidebar - Chat List */}
                        <div className={`${view === 'chat' ? 'hidden' : 'flex'} md:flex flex-col w-full md:w-[380px] border-r border-slate-100 bg-white`}>
                            <div className="p-6 pb-2">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Messages</h1>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">Live Communication</p>
                                    </div>
                                </div>

                                <div className="relative group mb-6">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-all">
                                        <Search size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-6 border-b border-slate-50 mb-4 px-2">
                                    {['All', 'Unread'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`pb-3 text-[11px] font-black uppercase tracking-widest relative transition-all ${activeTab === tab ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            {tab}
                                            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar pb-8">
                                {filteredChats.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center opacity-40">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <Search size={24} className="text-slate-300" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No chats found</p>
                                    </div>
                                ) : (
                                    filteredChats.map(chat => (
                                        <div
                                            key={chat.id}
                                            onClick={() => {
                                                setSelectedChat(chat);
                                                setView('chat');
                                            }}
                                            className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-4 group mx-1 ${selectedChat?.id === chat.id
                                                ? 'bg-primary-light/50 border border-primary/10 shadow-sm'
                                                : 'hover:bg-slate-50/80'
                                                }`}
                                        >
                                            <div className="relative shrink-0">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-black shadow-md overflow-hidden border-2 border-white">
                                                    {chat.avatar && chat.avatar.length > 2 ? (
                                                        <img
                                                            src={chat.avatar}
                                                            alt={chat.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span>{(chat.name || '?').charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${chat.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <h3 className={`font-bold text-sm truncate ${selectedChat?.id === chat.id ? 'text-primary' : 'text-slate-800'}`}>{chat.name}</h3>
                                                    <span className="text-[9px] font-bold text-slate-400">{chat.time}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs text-slate-400 truncate font-medium">{chat.lastMsg || 'Tap to chat'}</p>
                                                    {chat.unread > 0 && (
                                                        <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-sm">
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
                                    <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-20">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setView('list')} className="md:hidden p-2 text-slate-400 hover:text-primary transition-colors">
                                                <ChevronLeft />
                                            </button>
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-black shadow-lg overflow-hidden border-2 border-white">
                                                {selectedChat.avatar && selectedChat.avatar.length > 2 ? (
                                                    <img
                                                        src={selectedChat.avatar}
                                                        alt={selectedChat.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span>{(selectedChat.name || '?').charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h2 className="text-base font-black text-slate-800 tracking-tight">{selectedChat.name}</h2>
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedChat.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedChat.status === 'online' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                        {selectedChat.status === 'online' ? 'Online Now' : 'Away'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hidden sm:flex items-center gap-1 relative">
                                            <div className="relative">
                                                <button 
                                                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                                                    className={`p-2.5 rounded-xl transition-all ${showMoreMenu ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-50 hover:text-primary'}`}
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {showMoreMenu && (
                                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                                                        <button 
                                                            onClick={() => {
                                                                setMessages([]);
                                                                toast.success("Chat cleared");
                                                                setShowMoreMenu(false);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary rounded-xl transition-all"
                                                        >
                                                            Clear Chat
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                toast.success("Notifications muted");
                                                                setShowMoreMenu(false);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary rounded-xl transition-all"
                                                        >
                                                            Mute Notifications
                                                        </button>
                                                        <div className="h-px bg-slate-50 my-1 mx-2" />
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedChat(null);
                                                                setView('list');
                                                                setShowMoreMenu(false);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                        >
                                                            Close Conversation
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chat Messages */}
                                    <div className="flex-1 p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/30 overflow-y-auto custom-scrollbar">
                                        <div className="flex justify-center my-8">
                                            <span className="px-5 py-1.5 bg-white/80 backdrop-blur-sm text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] rounded-full border border-slate-100 shadow-sm">
                                                Today
                                            </span>
                                        </div>

                                        {messages.map(msg => (
                                            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                                <div className={`max-w-[80%] md:max-w-[70%] px-5 py-3.5 shadow-sm relative group ${msg.sender === 'me'
                                                    ? 'bg-gradient-to-br from-primary to-purple-600 text-white rounded-[24px] rounded-tr-none'
                                                    : 'bg-white text-slate-800 rounded-[24px] rounded-tl-none border border-slate-100'
                                                    }`}>
                                                    <div className="flex flex-col gap-2">
                                                        {msg.attachmentUrl && msg.attachmentType === 'image' && (
                                                            <div className="rounded-xl overflow-hidden border border-slate-100/50 mb-1 max-w-[240px]">
                                                                <img src={msg.attachmentUrl} alt="attachment" className="w-full h-auto object-cover" />
                                                            </div>
                                                        )}
                                                        {msg.attachmentUrl && msg.attachmentType === 'file' && (
                                                            <div className="flex items-center gap-2 bg-slate-50/10 p-2 rounded-lg border border-white/20 mb-1">
                                                                <Paperclip size={14} />
                                                                <span className="text-[10px] font-bold truncate max-w-[150px]">File Attachment</span>
                                                            </div>
                                                        )}
                                                        {msg.text && (
                                                            <p className={`text-sm font-medium leading-relaxed ${msg.sender === 'me' ? 'text-white' : 'text-slate-800'}`}>{msg.text}</p>
                                                        )}
                                                    </div>
                                                    <div className={`flex items-center gap-2 mt-2 ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                                        <span className={`text-[9px] font-bold ${msg.sender === 'me' ? 'text-white/60' : 'text-slate-400'}`}>
                                                            {msg.time}
                                                        </span>
                                                        {msg.sender === 'me' && (
                                                            <CheckCheck size={12} className={msg.status === 'read' ? 'text-emerald-300' : 'text-white/40'} />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chat Input */}
                                    <div className="p-6 bg-white border-t border-slate-50">
                                        {/* File Preview */}
                                        {selectedFile && (
                                            <div className="mb-4 flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-primary/20 animate-in slide-in-from-bottom-2">
                                                {selectedFile.type.startsWith('image/') ? (
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200">
                                                        <img src={selectedFile.data} className="w-full h-full object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                        <Paperclip size={20} />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-black text-slate-700 truncate">{selectedFile.name}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{(selectedFile.file.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                                <button onClick={() => setSelectedFile(null)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                                                    <Plus className="rotate-45" size={20} />
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-primary/30 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/5 transition-all relative">
                                            <div className="flex items-center gap-0.5">
                                                <div className="relative">
                                                    <button 
                                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                                                        className={`p-2.5 transition-colors ${showEmojiPicker ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
                                                    >
                                                        <Smile size={20} />
                                                    </button>
                                                    
                                                    {showEmojiPicker && (
                                                        <div className="absolute bottom-full left-0 mb-4 bg-white border border-slate-100 shadow-2xl rounded-[24px] p-4 z-50 w-[240px] animate-in zoom-in-50 slide-in-from-bottom-4">
                                                            <div className="flex items-center justify-between mb-3 px-1">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Emojis</span>
                                                                <button onClick={() => setShowEmojiPicker(false)} className="text-slate-300 hover:text-slate-500"><Plus size={14} className="rotate-45" /></button>
                                                            </div>
                                                            <div className="grid grid-cols-5 gap-2">
                                                                {emojis.map(emoji => (
                                                                    <button 
                                                                        key={emoji} 
                                                                        onClick={() => addEmoji(emoji)}
                                                                        className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-50 rounded-lg transition-colors active:scale-90"
                                                                    >
                                                                        {emoji}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <button 
                                                    onClick={() => fileInputRef.current?.click()} 
                                                    className="p-2.5 text-slate-400 hover:text-primary transition-colors"
                                                >
                                                    <Paperclip size={20} />
                                                </button>
                                                <input 
                                                    type="file" 
                                                    ref={fileInputRef} 
                                                    className="hidden" 
                                                    onChange={handleFileSelect}
                                                    accept="image/*,application/pdf"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Write a message..."
                                                className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 py-2.5"
                                                value={msgInput}
                                                onChange={(e) => setMsgInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                            />
                                            <button
                                                onClick={handleSend}
                                                className="shrink-0 w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/20">
                                    <div className="w-24 h-24 bg-white rounded-[32px] shadow-2xl flex items-center justify-center text-primary/10 mb-8 border border-primary/5">
                                        <MessageSquare size={48} className="text-primary animate-pulse" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">Open a Conversation</h2>
                                    <p className="text-slate-500 mt-4 max-w-xs font-semibold leading-relaxed">
                                        Choose a member from the left palette to start a secure encryption chat.
                                    </p>
                                    <div className="mt-8 flex gap-3">
                                        <span className="px-4 py-2 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">End-to-End Encrypted</span>
                                    </div>
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
