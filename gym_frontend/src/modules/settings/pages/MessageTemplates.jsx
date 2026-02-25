import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Plus, Save, Trash2, Edit2, Layout, Tag, Check, X } from 'lucide-react';
import { fetchTenantSettingsAPI, updateTenantSettingsAPI } from '../../../api/admin/adminApi';

const MessageTemplates = () => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [templates, setTemplates] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editBuffer, setEditBuffer] = useState({});

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await fetchTenantSettingsAPI();
                if (data.messageTemplates) {
                    setTemplates(data.messageTemplates);
                } else {
                    // Default templates if none exist
                    setTemplates([
                        { id: 1, name: 'Membership Renewal Reminder', type: 'WhatsApp', text: 'Hi {{member_name}}, your membership {{plan_name}} expires in {{days}} days. Renew now at {{link}}' },
                        { id: 2, name: 'Payment Success', type: 'Email', text: 'Hello {{name}}, we have received your payment of {{amount}} for {{month}}.' },
                        { id: 3, name: 'Class Cancellation', type: 'SMS', text: 'Alert: The {{class_name}} on {{date}} has been cancelled. Credits refunded.' },
                    ]);
                }
            } catch (error) {
                console.error("Failed to load templates:", error);
            } finally {
                setFetching(false);
            }
        };
        loadSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateTenantSettingsAPI({
                messageTemplates: templates
            });
            alert('Templates saved successfully!');
        } catch (error) {
            console.error("Failed to save templates:", error);
            alert("Failed to save: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (template) => {
        setEditingId(template.id);
        setEditBuffer({ ...template });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditBuffer({});
    };

    const saveEdit = () => {
        setTemplates(prev => prev.map(t => t.id === editingId ? editBuffer : t));
        setEditingId(null);
        setEditBuffer({});
    };

    const deleteTemplate = (id) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            setTemplates(prev => prev.filter(t => t.id !== id));
        }
    };

    const addTemplate = () => {
        const newId = templates.length > 0 ? Math.max(...templates.map(t => t.id)) + 1 : 1;
        const newT = { id: newId, name: 'New Template', type: 'SMS', text: 'Enter template text here...' };
        setTemplates([...templates, newT]);
        startEdit(newT);
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Email': return <Mail size={16} />;
            case 'WhatsApp': return <MessageSquare size={16} className="text-emerald-500" />;
            case 'SMS': return <Tag size={16} className="text-blue-500" />;
            default: return <Layout size={16} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                            <Layout size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Communication Templates</h1>
                            <p className="text-sm text-gray-500">Manage automated message content for all channels</p>
                        </div>
                    </div>
                    <button
                        onClick={addTemplate}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-gray-700 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Plus size={18} />
                        Create Template
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {templates.map((template) => (
                        <div key={template.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 rounded-lg">
                                        {getTypeIcon(editingId === template.id ? editBuffer.type : template.type)}
                                    </div>
                                    {editingId === template.id ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={editBuffer.name}
                                                onChange={(e) => setEditBuffer({ ...editBuffer, name: e.target.value })}
                                                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm font-bold outline-none focus:border-indigo-500"
                                            />
                                            <select
                                                value={editBuffer.type}
                                                onChange={(e) => setEditBuffer({ ...editBuffer, type: e.target.value })}
                                                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-black outline-none"
                                            >
                                                <option>WhatsApp</option>
                                                <option>SMS</option>
                                                <option>Email</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="font-bold text-gray-800">{template.name}</h3>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-black uppercase tracking-tighter">
                                                {template.type}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {editingId === template.id ? (
                                        <>
                                            <button onClick={saveEdit} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all"><Check size={16} /></button>
                                            <button onClick={cancelEdit} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all"><X size={16} /></button>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(template)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                                            <button onClick={() => deleteTemplate(template.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {editingId === template.id ? (
                                <textarea
                                    value={editBuffer.text}
                                    onChange={(e) => setEditBuffer({ ...editBuffer, text: e.target.value })}
                                    className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-600 leading-relaxed mb-4 min-h-[100px] outline-none focus:border-indigo-500"
                                />
                            ) : (
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs text-slate-600 leading-relaxed mb-4">
                                    {template.text}
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Placeholders:</span>
                                <div className="flex gap-1.5 flex-wrap">
                                    {['member_name', 'plan_name', 'amount', 'date', 'days', 'link'].map(p => (
                                        <code key={p} className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold">{`{{${p}}}`}</code>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save All Templates'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageTemplates;
