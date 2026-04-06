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
    Loader2,
    Monitor,
    Zap,
    Hash
} from 'lucide-react';
import { fetchChatContacts, fetchCommLogs, sendBroadcastMessage } from '../../../api/communication/communicationApi';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC',        
  accent2: '#9B7BFF',       
  accentLight: '#F0ECFF',   
  accentMid: '#E4DCFF',     
  border: '#EAE7FF',        
  bg: '#F6F5FF',            
  surface: '#FFFFFF',       
  text: '#1A1533',          
  muted: '#7B7A8E',         
  subtle: '#B0ADCC',        
  green: '#22C97A',         
  greenLight: '#E8FBF2',
  rose: '#F43F5E',          
  roseLight: '#FFF1F4',
  blue: '#3B82F6',          
  blueLight: '#EFF6FF',
  indigo: '#6366F1',
  indigoLight: '#EEF2FF',
  shadow: '0 10px 30px -10px rgba(124, 92, 252, 0.15)',
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
};

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

    useEffect(() => {
        const timer = setTimeout(() => {
            loadContacts(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

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

    const handleClearChat = () => {
        setMessages([]);
        setShowOptions(false);
        toast.success("Chat cleared locally");
    };

    return (
        <div style={{ padding: 32, background: T.bg, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideIn { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 10px; }
            `}</style>

            {/* Header Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 20, background: `linear-gradient(135deg, ${T.accent}, ${T.indigo})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 30px -10px rgba(124, 92, 252, 0.3)' }}>
                        <MessageSquare size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>Communication Hub</h1>
                        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13, fontWeight: 500 }}>Secure endpoint for direct member engagement</p>
                    </div>
                </div>
            </div>

            {/* Main Application Interface */}
            <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 180px)', animation: 'fadeIn 0.7s ease-out' }}>
                
                {/* Contact Interface Sidebar */}
                <div style={{ width: 400, background: '#fff', borderRadius: 32, border: `1.5px solid #fff`, boxShadow: T.cardShadow, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: 24, borderBottom: `1.5px solid ${T.bg}` }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                            <input
                                type="text"
                                placeholder="Search identity or channel..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', height: 50, padding: '0 16px 0 48px', borderRadius: 14, border: `1.5px solid ${T.bg}`, background: T.bg + '50', fontSize: 13, fontWeight: 700, color: T.text, outline: 'none', transition: '0.3s' }}
                            />
                        </div>
                    </div>

                    <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                        {loading && contacts.length === 0 ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} style={{ padding: 16, borderRadius: 20, marginBottom: 8, display: 'flex', gap: 12, opacity: 0.5 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 16, background: T.bg }} />
                                    <div style={{ flex: 1, paddingTop: 4 }}>
                                        <div style={{ width: '60%', height: 12, borderRadius: 4, background: T.bg, marginBottom: 8 }} />
                                        <div style={{ width: '40%', height: 10, borderRadius: 4, background: T.bg }} />
                                    </div>
                                </div>
                            ))
                        ) : contacts.map(contact => (
                            <button
                                key={`${contact.type}-${contact.id}`}
                                onClick={() => setSelectedMember(contact)}
                                style={{ width: '100%', padding: 16, borderRadius: 24, border: 'none', background: selectedMember?.id === contact.id ? T.accentLight : 'transparent', display: 'flex', alignItems: 'center', gap: 16, transition: '0.2s', cursor: 'pointer', marginBottom: 4 }}
                            >
                                <div style={{ width: 52, height: 52, borderRadius: 18, background: contact.type === 'MEMBER' ? `linear-gradient(135deg, ${T.accent}, ${T.indigo})` : `linear-gradient(135deg, ${T.green}, #0CB88D)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 900, flexShrink: 0, boxShadow: T.cardShadow }}>
                                    {contact.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <span style={{ fontSize: 15, fontWeight: 800, color: selectedMember?.id === contact.id ? T.accent : T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.name}</span>
                                        <span style={{ fontSize: 10, fontWeight: 800, color: T.subtle }}>10:42 AM</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: contact.type === 'MEMBER' ? T.accent : T.green, background: contact.type === 'MEMBER' ? T.accentLight : T.greenLight, padding: '2px 8px', borderRadius: 6 }}>{contact.type}</span>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contact.phone || 'No identifier'}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Secure Messaging Interface */}
                <div style={{ flex: 1, background: '#fff', borderRadius: 40, border: `1.5px solid #fff`, boxShadow: T.cardShadow, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                    {selectedMember ? (
                        <>
                            {/* Entity Header */}
                            <div style={{ padding: '24px 32px', borderBottom: `1.5px solid ${T.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', zIndex: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 52, height: 52, borderRadius: 18, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, fontSize: 20, fontWeight: 900 }}>
                                        {selectedMember.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>{selectedMember.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.green }} />
                                            <span style={{ fontSize: 11, fontWeight: 800, color: T.green, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Node Active</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button onClick={handleClearChat} style={{ width: 44, height: 44, borderRadius: 14, border: 'none', background: T.bg, color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}>
                                        <Hash size={20} />
                                    </button>
                                    <button style={{ width: 44, height: 44, borderRadius: 14, border: 'none', background: T.bg, color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}>
                                        <MoreHorizontal size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Message Ledger Area */}
                            <div className="custom-scrollbar" style={{ flex: 1, padding: 32, overflowY: 'auto', background: `${T.bg}20`, display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {fetchingMessages ? (
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Loader2 size={32} className="animate-spin" style={{ color: T.accent }} />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                                        <Zap size={48} />
                                        <p style={{ marginTop: 16, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Secure Channel Initialized</p>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => (
                                        <div key={msg.id} style={{ display: 'flex', justifyContent: msg.type === 'sent' ? 'flex-end' : 'flex-start', animation: 'slideIn 0.3s ease-out' }}>
                                            <div style={{ maxWidth: '75%', position: 'relative' }}>
                                                <div style={{ padding: '16px 24px', borderRadius: 24, border: msg.type === 'sent' ? 'none' : `1.2px solid ${T.border}`, background: msg.type === 'sent' ? `linear-gradient(135deg, ${T.accent}, ${T.indigo})` : '#fff', color: msg.type === 'sent' ? '#fff' : T.text, boxShadow: T.cardShadow, fontSize: 14, fontWeight: 600, lineHeight: 1.6 }}>
                                                    {msg.text}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, justifyContent: msg.type === 'sent' ? 'flex-end' : 'flex-start' }}>
                                                    <span style={{ fontSize: 10, fontWeight: 800, color: T.subtle, textTransform: 'uppercase' }}>{msg.time}</span>
                                                    {msg.type === 'sent' && (
                                                        <CheckCheck size={14} style={{ color: msg.status === 'Pending' ? T.subtle : T.accent }} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Transmission Matrix Input */}
                            <div style={{ padding: 32, background: '#fff', borderTop: `1.5px solid ${T.bg}` }}>
                                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 16, alignItems: 'center', background: T.bg + '80', padding: 8, borderRadius: 24, border: `1.5px solid ${T.border}` }}>
                                    <button type="button" style={{ width: 44, height: 44, borderRadius: 18, border: 'none', background: 'transparent', color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Smile size={22} />
                                    </button>
                                    <button type="button" onClick={triggerFileSelect} style={{ width: 44, height: 44, borderRadius: 18, border: 'none', background: 'transparent', color: T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <Paperclip size={22} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={() => {}}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Formulate command..."
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        style={{ flex: 1, height: 50, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, fontWeight: 700, color: T.text, padding: '0 8px' }}
                                    />
                                    <button type="submit" disabled={!messageInput.trim()} style={{ width: 50, height: 50, borderRadius: 18, border: 'none', background: messageInput.trim() ? T.accent : T.subtle, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.3s', boxShadow: messageInput.trim() ? T.shadow : 'none' }}>
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        /* System Idle State */
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 60, textAlign: 'center' }}>
                            <div style={{ width: 100, height: 100, borderRadius: 40, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle, position: 'relative' }}>
                                <Monitor size={48} />
                                <div style={{ position: 'absolute', bottom: -5, right: -5, width: 30, height: 30, borderRadius: 12, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                    <Zap size={16} />
                                </div>
                            </div>
                            <div>
                                <h4 style={{ fontSize: 22, fontWeight: 900, color: T.text, margin: 0 }}>Terminal Standby</h4>
                                <p style={{ fontSize: 14, fontWeight: 600, color: T.muted, marginTop: 12, lineHeight: 1.6, maxWidth: 300 }}>Select a network identity from the directory to establish a secure link.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WhatsAppChat;
