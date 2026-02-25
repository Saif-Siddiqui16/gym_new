import React, { useState, useEffect } from 'react';
import { Key, Save, Eye, EyeOff, ShieldCheck, Smartphone, CreditCard, MessageSquare } from 'lucide-react';
import { fetchTenantSettingsAPI, updateTenantSettingsAPI } from '../../../api/admin/adminApi';

const ApiKeySettings = () => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [showKeys, setShowKeys] = useState({});
    const [apiKeys, setApiKeys] = useState({
        sms: '',
        whatsapp: '',
        razorpay_id: '',
        razorpay_secret: ''
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await fetchTenantSettingsAPI();
                if (data.apiKeys) {
                    setApiKeys(prev => ({ ...prev, ...data.apiKeys }));
                }
            } catch (error) {
                console.error("Failed to load API keys:", error);
            } finally {
                setFetching(false);
            }
        };
        loadSettings();
    }, []);

    const toggleShow = (key) => {
        setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateTenantSettingsAPI({
                apiKeys: apiKeys
            });
            alert('API credentials updated successfully!');
        } catch (error) {
            console.error("Failed to save API keys:", error);
            alert("Failed to save keys: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const KeyInput = ({ label, icon: Icon, value, id, placeholder, onChange }) => (
        <div className="space-y-3 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon size={18} className="text-indigo-600" />
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-tight">{label}</label>
                </div>
                <button
                    type="button"
                    onClick={() => toggleShow(id)}
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    {showKeys[id] ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
            <input
                type={showKeys[id] ? "text" : "password"}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                        <Key size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">API Key Management</h1>
                        <p className="text-sm text-gray-500">Securely manage your 3rd party gateway credentials</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SMS Gateway */}
                    <KeyInput
                        id="sms"
                        label="SMS Gateway (Twilio/BulkSMS)"
                        icon={Smartphone}
                        value={apiKeys.sms}
                        onChange={(v) => setApiKeys({ ...apiKeys, sms: v })}
                        placeholder="Enter API Key or Secret"
                    />

                    {/* WhatsApp API */}
                    <KeyInput
                        id="whatsapp"
                        label="WhatsApp Business API"
                        icon={MessageSquare}
                        value={apiKeys.whatsapp}
                        onChange={(v) => setApiKeys({ ...apiKeys, whatsapp: v })}
                        placeholder="System User Access Token"
                    />

                    {/* Razorpay / Indian Gateways */}
                    <KeyInput
                        id="razorpay_id"
                        label="Razorpay Key ID"
                        icon={CreditCard}
                        value={apiKeys.razorpay_id}
                        onChange={(v) => setApiKeys({ ...apiKeys, razorpay_id: v })}
                        placeholder="Key ID"
                    />

                    <KeyInput
                        id="razorpay_secret"
                        label="Razorpay Secret"
                        icon={ShieldCheck}
                        value={apiKeys.razorpay_secret}
                        onChange={(v) => setApiKeys({ ...apiKeys, razorpay_secret: v })}
                        placeholder="Key Secret"
                    />
                </div>

                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-indigo-900">Security Note</h3>
                        <p className="text-xs text-indigo-700/70 mt-1">
                            Keys are encrypted at rest with AES-256. Never share your API keys or secrets in public repositories.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-10 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        <Save size={18} />
                        {loading ? 'Securing...' : 'Propagate API Keys'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeySettings;
