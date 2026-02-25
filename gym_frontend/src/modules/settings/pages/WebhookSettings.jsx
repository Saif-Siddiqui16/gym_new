import React, { useState, useEffect } from 'react';
import { Terminal, Save, Copy, CheckCircle, RefreshCcw, Bell } from 'lucide-react';
import { fetchTenantSettingsAPI, updateTenantSettingsAPI } from '../../../api/admin/adminApi';

const WebhookSettings = () => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [copied, setCopied] = useState(null);
    const [webhooks, setWebhooks] = useState({
        paymentWebhook: '',
        whatsappWebhook: '',
        attendanceWebhook: '',
        secret: 'whsec_5f8a9b2c3d4e5f6g7h8i9j0k'
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await fetchTenantSettingsAPI();
                if (data.webhooks) {
                    setWebhooks(prev => ({ ...prev, ...data.webhooks }));
                }
            } catch (error) {
                console.error("Failed to load webhook settings:", error);
            } finally {
                setFetching(false);
            }
        };
        loadSettings();
    }, []);

    const handleCopy = (val, key) => {
        if (!val) return;
        navigator.clipboard.writeText(val);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateTenantSettingsAPI({
                webhooks: webhooks
            });
            alert('Webhook configurations saved successfully!');
        } catch (error) {
            console.error("Failed to save webhooks:", error);
            alert("Failed to save webhooks: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <Terminal size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Webhook Configurations</h1>
                        <p className="text-sm text-gray-500">Configure real-time triggers for payments and communication</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            <Bell size={18} className="text-indigo-600" />
                            <h2 className="font-bold text-gray-800">Endpoint Settings</h2>
                        </div>
                        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                            Real-time Sync Active
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Payment Webhook */}
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">Payment Status Webhook</label>
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Trigger: razorpay.payment.captured</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={webhooks.paymentWebhook}
                                    onChange={(e) => setWebhooks({ ...webhooks, paymentWebhook: e.target.value })}
                                    placeholder="https://your-domain.com/webhook"
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                />
                                <button
                                    onClick={() => handleCopy(webhooks.paymentWebhook, 'payment')}
                                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500"
                                >
                                    {copied === 'payment' ? <CheckCircle size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* WhatsApp Webhook */}
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">WhatsApp Trigger Webhook</label>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Trigger: message.received</span>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={webhooks.whatsappWebhook}
                                    onChange={(e) => setWebhooks({ ...webhooks, whatsappWebhook: e.target.value })}
                                    placeholder="https://your-domain.com/whatsapp-hook"
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                />
                                <button
                                    onClick={() => handleCopy(webhooks.whatsappWebhook, 'whatsapp')}
                                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-500"
                                >
                                    {copied === 'whatsapp' ? <CheckCircle size={18} className="text-emerald-500" /> : <Copy size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Secret Key Row */}
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-amber-500 shadow-sm">
                                    <RefreshCcw size={16} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Webhook Signing Secret</p>
                                    <p className="text-sm font-mono font-bold text-amber-900 mt-0.5 mt-1">whsec_***********************</p>
                                </div>
                            </div>
                            <button className="text-xs font-bold text-amber-700 hover:underline">Regenerate</button>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                        >
                            <Save size={18} />
                            {loading ? 'Saving...' : 'Save Endpoints'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WebhookSettings;
