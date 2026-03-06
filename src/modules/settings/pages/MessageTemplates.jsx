import React, { useState, useEffect, useCallback } from 'react';
import { Mail, MessageSquare, Plus, Tag, Trash2, Loader, X, Phone, Search, FileText, CheckCircle } from 'lucide-react';
import apiClient from '../../../api/apiClient';
import { toast } from 'react-hot-toast';

const CHANNELS = [
    { key: 'SMS', label: 'SMS Templates', icon: Phone, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600' },
    { key: 'Email', label: 'Email Templates', icon: Mail, color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600' },
    { key: 'WhatsApp', label: 'WhatsApp Templates', icon: MessageSquare, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600' },
];

const CATEGORIES = ['General', 'Welcome', 'Renewal', 'Payment', 'Class Reminder', 'Promotional', 'Follow-up'];

const MessageTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        tag: 'General',
        body: '',
        channel: 'SMS',
    });

    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/communication/templates');
            setTemplates(res.data || []);
        } catch {
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.body) {
            toast.error('Title and message body are required');
            return;
        }
        try {
            setSubmitting(true);
            await apiClient.post('/communication/templates', formData);
            toast.success(`${formData.channel} template created!`);
            setFormData({ title: '', tag: 'General', body: '', channel: 'SMS' });
            setShowForm(false);
            fetchTemplates();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to create template');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setDeleting(id);
            await apiClient.delete(`/communication/templates/${id}`);
            toast.success('Template deleted');
            setTemplates(prev => prev.filter(t => t.id !== id));
        } catch {
            toast.error('Failed to delete template');
        } finally {
            setDeleting(null);
        }
    };

    const filteredByChannel = (channel) =>
        templates.filter(t =>
            t.channel === channel &&
            (t.name?.toLowerCase().includes(search.toLowerCase()) ||
                t.content?.toLowerCase().includes(search.toLowerCase()) ||
                t.category?.toLowerCase().includes(search.toLowerCase()))
        );

    const totalCount = templates.length;

    return (
        <div className="space-y-6 p-0 md:p-6 animate-fadeIn">
            {/* Header */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl blur-3xl opacity-10 pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-[32px] shadow-2xl shadow-violet-500/10 border border-white/50 p-6 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent font-black tracking-tighter">
                            Communication Templates
                        </h1>
                        <p className="text-slate-400 text-[10px] sm:text-xs mt-1 uppercase tracking-widest font-bold">
                            Manage SMS, Email, and WhatsApp message templates · {totalCount} total
                        </p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center justify-center gap-3 px-8 py-3.5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white rounded-2xl text-sm font-black shadow-2xl shadow-violet-500/25 hover:scale-[1.02] active:scale-95 transition-all w-full sm:w-auto uppercase tracking-widest"
                    >
                        <Plus size={18} strokeWidth={3} /> Add Template
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                    type="text"
                    placeholder="Search templates by name, content, or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-400 transition-all shadow-sm"
                />
            </div>

            {/* Add Template Drawer */}
            {showForm && (
                <div className="fixed inset-0 z-[100] overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                                    <FileText size={20} className="text-violet-500" /> Create Template
                                </h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Define a reusable message template</p>
                            </div>
                            <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Channel Selection */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Channel</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {CHANNELS.map(ch => (
                                        <button
                                            key={ch.key}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, channel: ch.key })}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${formData.channel === ch.key
                                                ? `border-violet-500 ${ch.bg}`
                                                : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                                                }`}
                                        >
                                            <ch.icon size={18} className={formData.channel === ch.key ? ch.text : 'text-slate-400'} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${formData.channel === ch.key ? ch.text : 'text-slate-400'}`}>{ch.key}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Template Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Membership Renewal Reminder"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 transition-all"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Category</label>
                                <select
                                    value={formData.tag}
                                    onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                                    className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 transition-all appearance-none"
                                >
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Body */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Message Body *</label>
                                <textarea
                                    required
                                    rows={6}
                                    placeholder="Hi {name}, your membership expires on {date}. Renew now to continue enjoying our services!"
                                    value={formData.body}
                                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-violet-500 transition-all resize-none"
                                />
                                <p className="text-[10px] text-slate-400 font-bold mt-1">Use: {'{name}'}, {'{date}'}, {'{amount}'} as variables</p>
                            </div>
                        </form>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                            <button onClick={() => setShowForm(false)} className="flex-1 py-3.5 bg-white border-2 border-slate-200 text-slate-600 rounded-xl text-sm font-black hover:bg-slate-50 transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex-[2] py-3.5 bg-violet-600 text-white rounded-xl text-sm font-black shadow-md shadow-violet-200 hover:bg-violet-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                {submitting ? 'Creating...' : 'Create Template'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Sections by Channel */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader className="animate-spin text-violet-500" size={36} />
                </div>
            ) : (
                <div className="space-y-6">
                    {CHANNELS.map(({ key, label, icon: Icon, bg, text }) => {
                        const channelTemplates = filteredByChannel(key);
                        return (
                            <div key={key} className="bg-white rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-50 flex items-center gap-4">
                                    <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                                        <Icon size={20} className={text} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-slate-900">{label}</h2>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{channelTemplates.length} templates</p>
                                    </div>
                                </div>

                                {channelTemplates.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                                        <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center mb-3`}>
                                            <Icon size={22} className={text} />
                                        </div>
                                        <p className="text-slate-400 font-bold text-sm">No {key} templates yet</p>
                                        <p className="text-slate-300 text-xs mt-1">Click "Add Template" to create one</p>
                                    </div>
                                ) : (
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {channelTemplates.map(t => (
                                            <div key={t.id} className="border border-slate-100 rounded-2xl p-5 hover:border-violet-100 hover:shadow-md transition-all group">
                                                <div className="flex items-start justify-between gap-3 mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-slate-900 text-sm truncate">{t.name}</p>
                                                        <span className={`inline-block mt-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full ${bg} ${text}`}>
                                                            {t.category || 'General'}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(t.id)}
                                                        disabled={deleting === t.id}
                                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        {deleting === t.id ? <Loader size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                                    </button>
                                                </div>
                                                <p className="text-slate-500 text-xs font-bold leading-relaxed line-clamp-3 bg-slate-50 rounded-xl p-3">
                                                    {t.content}
                                                </p>
                                                <p className="text-[10px] text-slate-300 font-bold mt-2">
                                                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MessageTemplates;
