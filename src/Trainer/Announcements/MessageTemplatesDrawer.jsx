import React, { useState, useEffect } from 'react';
import { MessageCircle, Mail, Smartphone, Copy, Check, Search, PlusCircle, Trash2 } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import toast from 'react-hot-toast';
import { getTemplates, createTemplate, deleteTemplate } from '../../api/communication/communicationApi';

const MessageTemplatesDrawer = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('WhatsApp');
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const data = await getTemplates(null, activeTab);
            setTemplates(data);
        } catch (error) {
            console.error('Error fetching templates:', error);
            // toast.error('Failed to load templates');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) fetchTemplates();
    }, [isOpen, activeTab]);

    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Template copied!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        try {
            await deleteTemplate(id);
            toast.success('Template deleted');
            fetchTemplates();
        } catch (error) {
            toast.error(error || 'Failed to delete template');
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [isAddingTemplate, setIsAddingTemplate] = useState(false);
    const [newTemplate, setNewTemplate] = useState({ title: '', tag: 'General', body: '' });

    const handleSaveTemplate = async (e) => {
        e.preventDefault();
        try {
            await createTemplate({
                title: newTemplate.title,
                tag: newTemplate.tag,
                body: newTemplate.body,
                channel: activeTab
            });
            toast.success(`New ${activeTab} Template Created!`);
            setIsAddingTemplate(false);
            setNewTemplate({ title: '', tag: 'General', body: '' });
            fetchTemplates();
        } catch (error) {
            toast.error(error || 'Failed to create template');
        }
    };

    const footer = (
        <div className="p-4 bg-violet-50/50 rounded-2xl border-2 border-dashed border-violet-100 flex items-center justify-between overflow-hidden">
            <p className="text-[10px] font-black text-violet-900 uppercase tracking-widest leading-relaxed">
                {isAddingTemplate ? 'Drafting New Message' : 'Want to add more?'}<br />
                <span className="opacity-60">{isAddingTemplate ? 'Fill in details below' : 'Manage templates in system settings'}</span>
            </p>
            {!isAddingTemplate && (
                <button
                    onClick={() => setIsAddingTemplate(true)}
                    className="px-4 py-2 bg-white text-violet-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                    <PlusCircle size={14} /> New Template
                </button>
            )}
        </div>
    );

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={() => {
                setIsAddingTemplate(false);
                onClose();
            }}
            title={isAddingTemplate ? "Create Template" : "Message Templates"}
            subtitle={isAddingTemplate ? `Adding to ${activeTab}` : "Ready-to-use message formats"}
            maxWidth="max-w-md"
            footer={footer}
        >
            <div className="flex flex-col h-full bg-slate-50/20">
                {!isAddingTemplate && (
                    <div className="p-8 space-y-6 bg-white border-b border-slate-100 shrink-0 rounded-t-3xl">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search templates..."
                                className="w-full h-12 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-semibold focus:border-violet-500 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100">
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
                                        className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive
                                            ? 'bg-white text-violet-600 shadow-sm border border-slate-100'
                                            : 'text-slate-400 hover:text-slate-600'
                                            }`}
                                    >
                                        <Icon size={14} />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 custom-scrollbar">
                    {isAddingTemplate ? (
                        <form onSubmit={handleSaveTemplate} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="drawer-form-group">
                                <label className="drawer-label">
                                    Template Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. New Program Launch"
                                    className="drawer-input"
                                    value={newTemplate.title}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                                />
                            </div>

                            <div className="drawer-form-group">
                                <label className="drawer-label">
                                    Category / Tag
                                </label>
                                <select
                                    className="drawer-select"
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

                            <div className="drawer-form-group">
                                <label className="drawer-label">
                                    Message Body
                                </label>
                                <textarea
                                    required
                                    placeholder="Type your template message here..."
                                    className="drawer-textarea"
                                    value={newTemplate.body}
                                    onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddingTemplate(false)}
                                    className="drawer-btn drawer-btn-secondary flex-1"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    className="drawer-btn drawer-btn-primary flex-[2]"
                                >
                                    Save Template
                                </button>
                            </div>
                        </form>
                    ) : filteredTemplates.length > 0 ? (
                        filteredTemplates.map((template) => (
                            <div key={template.id} className="group bg-white rounded-3xl p-6 border-2 border-slate-100 transition-all hover:border-violet-100 hover:shadow-xl hover:shadow-violet-500/5">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-sm font-black text-slate-900 tracking-tight">{template.name}</h4>
                                    <div className="flex gap-2">
                                        <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${template.category === 'Welcome' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            template.category === 'Reminder' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                template.category === 'Promotion' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                                                    template.category === 'Followup' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                                                        'bg-slate-50 text-slate-500 border-slate-100'
                                            }`}>
                                            {template.category}
                                        </span>
                                        <button onClick={() => handleDelete(template.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-50 group-hover:bg-white group-hover:border-violet-50 transition-all">
                                    <p className="text-xs font-semibold text-slate-500 leading-relaxed whitespace-pre-wrap">
                                        {template.content}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleCopy(template.content, template.id)}
                                    className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border-2 ${copiedId === template.id
                                        ? 'bg-emerald-600 border-emerald-600 text-white'
                                        : 'bg-white border-slate-100 text-slate-900 hover:border-violet-600 hover:text-violet-600'
                                        }`}
                                >
                                    {copiedId === template.id ? (
                                        <>
                                            <Check size={14} />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={14} />
                                            <span>Copy Template</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Search size={40} className="text-slate-200 mb-4" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No templates match search</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
            `}</style>
        </RightDrawer>
    );
};

export default MessageTemplatesDrawer;
