import React, { useState, useEffect } from 'react';
import { MessageCircle, Mail, Smartphone, Copy, Check, Search, Plus, Loader2, ArrowLeft } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import { fetchMessageTemplates } from '../../../api/communication/communicationApi';
import { useAuth } from '../../../context/AuthContext';
import apiClient from '../../../api/apiClient';
import toast from 'react-hot-toast';

const MessageTemplatesDrawer = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('WhatsApp');
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [backendTemplates, setBackendTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Form state for new template
    const [newTemplate, setNewTemplate] = useState({
        title: '',
        tag: 'General',
        body: '',
        channel: 'WhatsApp'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadTemplates();
        }
    }, [isOpen]);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const data = await fetchMessageTemplates({ branchId: user?.tenantId });
            setBackendTemplates(data || []);
        } catch (error) {
            console.error('Failed to load templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTemplate = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await apiClient.post('/communication/templates', {
                ...newTemplate,
                channel: activeTab // Use currently active tab as channel
            });
            toast.success("Template created successfully!");
            setIsCreating(false);
            setNewTemplate({ title: '', tag: 'General', body: '', channel: 'WhatsApp' });
            loadTemplates();
        } catch (error) {
            toast.error("Failed to create template");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Template copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredTemplates = backendTemplates.filter(t =>
        t.channel === activeTab &&
        ((t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.content || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={isCreating ? "Create Template" : "Message Templates"}
            subtitle={isCreating ? "Define a new reusable message" : "Manage and reuse your common messages"}
            maxWidth="max-w-2xl"
        >
            <div className="flex flex-col h-full bg-slate-50/30">
                {isCreating ? (
                    <div className="p-8 space-y-6 bg-white flex-1 ">
                        <button
                            onClick={() => setIsCreating(false)}
                            className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors mb-4"
                        >
                            <ArrowLeft size={14} /> Back to list
                        </button>

                        <form onSubmit={handleCreateTemplate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Template Title</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g., Welcome Message"
                                    className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-semibold focus:border-primary transition-all outline-none"
                                    value={newTemplate.title}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category / Tag</label>
                                <select
                                    className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-semibold focus:border-primary transition-all outline-none"
                                    value={newTemplate.tag}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, tag: e.target.value })}
                                >
                                    <option>General</option>
                                    <option>Welcome</option>
                                    <option>Reminder</option>
                                    <option>Promotion</option>
                                    <option>Followup</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Message Body</label>
                                <textarea
                                    required
                                    rows={8}
                                    placeholder="Hi {{name}}, welcome to..."
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-primary transition-all outline-none resize-none"
                                    value={newTemplate.body}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                                />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available variables: {'{{name}}'}, {'{{member_id}}'}</p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-14 bg-primary text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg shadow-violet-100 hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : "Save Template"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <>
                        {/* Search and Tabs Header */}
                        <div className="p-8 space-y-6 bg-white border-b border-slate-100 shrink-0">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Channel Overview</h3>
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-hover transition-all shadow-lg shadow-violet-100"
                                >
                                    <Plus size={14} /> New Template
                                </button>
                            </div>

                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search templates..."
                                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-semibold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100 justify-between">
                                {[
                                    { name: 'WhatsApp', icon: MessageCircle },
                                    { name: 'SMS', icon: Smartphone },
                                    { name: 'Email', icon: Mail }
                                ].map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.name;
                                    return (
                                        <button
                                            key={tab.name}
                                            onClick={() => setActiveTab(tab.name)}
                                            className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive
                                                ? 'bg-white text-slate-900 shadow-xl shadow-slate-200 border border-slate-100 scale-[1.02]'
                                                : 'text-slate-400 hover:text-slate-600'
                                                }`}
                                        >
                                            <Icon size={16} className={isActive ? 'text-primary' : ''} />
                                            {tab.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Templates List */}
                        <div className="flex-1  px-8 py-8 space-y-6 custom-scrollbar">
                            {loading ? (
                                <div className="h-64 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="animate-spin text-primary" size={32} />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading branch templates...</p>
                                </div>
                            ) : filteredTemplates.length > 0 ? (
                                filteredTemplates.map((template) => (
                                    <div key={template.id} className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>

                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <h4 className="text-lg font-black text-slate-900 tracking-tight pr-4">{template.name}</h4>
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${template.category === 'Welcome' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                template.category === 'Reminder' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    template.category === 'Promotion' ? 'bg-primary-light text-primary border-violet-100' :
                                                        template.category === 'Followup' ? 'bg-primary-light text-primary border-violet-100' :
                                                            'bg-slate-50 text-slate-600 border-slate-100'
                                                }`}>
                                                {template.category}
                                            </span>
                                        </div>

                                        <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 mb-6 group-hover:bg-white transition-colors duration-300">
                                            <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                                                {template.content}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleCopy(template.content, template.id)}
                                            className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest transition-all border-2 ${copiedId === template.id
                                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200'
                                                : 'bg-white border-slate-100 text-slate-900 hover:border-primary hover:text-primary hover:shadow-lg hover:shadow-violet-100 active:scale-[0.98]'
                                                }`}
                                        >
                                            {copiedId === template.id ? (
                                                <>
                                                    <Check size={18} />
                                                    <span>Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                                                    <span>Copy Template</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300">
                                        <Search size={32} />
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest">No templates found</h5>
                                        <p className="text-xs text-slate-400 mt-1 font-medium italic">Create one to get started with {activeTab}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </RightDrawer>
    );
};

export default MessageTemplatesDrawer;
