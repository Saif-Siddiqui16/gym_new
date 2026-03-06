import React, { useState } from 'react';
import {
    CreditCard,
    Phone,
    Mail,
    MessageSquare,
    Globe,
    Settings,
    XCircle,
    Cpu,
    Server,
    Zap,
    Cloud,
    Send,
    MessageCircle,
    Layout,
    MapPin,
    Share2,
    Save
} from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';

const IntegrationsSettings = () => {
    const [activeTab, setActiveTab] = useState('Payment');
    const [isRazorpayDrawerOpen, setIsRazorpayDrawerOpen] = useState(false);
    const [isPhonePeDrawerOpen, setIsPhonePeDrawerOpen] = useState(false);
    const [isCCAvenueDrawerOpen, setIsCCAvenueDrawerOpen] = useState(false);
    const [isPayUDrawerOpen, setIsPayUDrawerOpen] = useState(false);
    const [isMSG91DrawerOpen, setIsMSG91DrawerOpen] = useState(false);
    const [isGupshupDrawerOpen, setIsGupshupDrawerOpen] = useState(false);
    const [isTwilioDrawerOpen, setIsTwilioDrawerOpen] = useState(false);
    const [isCustomSMSDrawerOpen, setIsCustomSMSDrawerOpen] = useState(false);
    const [isSMTPDrawerOpen, setIsSMTPDrawerOpen] = useState(false);
    const [isSendGridDrawerOpen, setIsSendGridDrawerOpen] = useState(false);
    const [isSESDrawerOpen, setIsSESDrawerOpen] = useState(false);
    const [isMailgunDrawerOpen, setIsMailgunDrawerOpen] = useState(false);
    const [isWATIDrawerOpen, setIsWATIDrawerOpen] = useState(false);
    const [isInteraktDrawerOpen, setIsInteraktDrawerOpen] = useState(false);
    const [isGupshupWhatsappDrawerOpen, setIsGupshupWhatsappDrawerOpen] = useState(false);
    const [isCustomWhatsappDrawerOpen, setIsCustomWhatsappDrawerOpen] = useState(false);
    const [isGoogleBusinessDrawerOpen, setIsGoogleBusinessDrawerOpen] = useState(false);
    const [razorpayConfig, setRazorpayConfig] = useState({
        enabled: false,
        webhookUrl: '',
        keyId: '',
        keySecret: '',
        merchantId: ''
    });
    const [phonepeConfig, setPhonepeConfig] = useState({
        enabled: false,
        webhookUrl: '',
        keyId: '',
        keySecret: '',
        merchantId: ''
    });
    const [ccavenueConfig, setCcavenueConfig] = useState({
        enabled: false,
        webhookUrl: '',
        keyId: '',
        keySecret: '',
        merchantId: ''
    });
    const [payuConfig, setPayuConfig] = useState({
        enabled: false,
        webhookUrl: '',
        keyId: '',
        keySecret: '',
        merchantId: ''
    });
    const [msg91Config, setMsg91Config] = useState({
        enabled: false,
        senderId: '',
        dltEntityId: '',
        dltTemplateId: '',
        apiUrl: '',
        apiKey: '',
        authToken: ''
    });
    const [gupshupConfig, setGupshupConfig] = useState({
        enabled: false,
        senderId: '',
        dltEntityId: '',
        dltTemplateId: '',
        apiUrl: '',
        authKey: '',
        authToken: ''
    });
    const [twilioConfig, setTwilioConfig] = useState({
        enabled: false,
        senderId: '',
        dltEntityId: '',
        dltTemplateId: '',
        apiUrl: '',
        apiKey: '',
        authToken: ''
    });
    const [customSMSConfig, setCustomSMSConfig] = useState({
        enabled: false,
        senderId: '',
        dltEntityId: '',
        dltTemplateId: '',
        apiUrl: '',
        apiKey: '',
        authToken: ''
    });
    const [smtpConfig, setSmtpConfig] = useState({
        enabled: false,
        host: '',
        port: '',
        fromEmail: '',
        fromName: '',
        username: '',
        password: ''
    });
    const [sendGridConfig, setSendGridConfig] = useState({
        enabled: false,
        fromEmail: '',
        fromName: '',
        apiKey: ''
    });
    const [sesConfig, setSesConfig] = useState({
        enabled: false,
        fromEmail: '',
        fromName: '',
        apiKey: ''
    });
    const [mailgunConfig, setMailgunConfig] = useState({
        enabled: false,
        fromEmail: '',
        fromName: '',
        apiKey: ''
    });
    const [watiConfig, setWatiConfig] = useState({
        enabled: false,
        phoneNumberId: '',
        businessAccountId: '',
        webhookVerifyToken: '',
        accessToken: '',
        apiKey: ''
    });
    const [interaktConfig, setInteraktConfig] = useState({
        enabled: false,
        phoneNumberId: '',
        businessAccountId: '',
        webhookVerifyToken: '',
        accessToken: '',
        apiKey: ''
    });
    const [gupshupWhatsappConfig, setGupshupWhatsappConfig] = useState({
        enabled: false,
        phoneNumberId: '',
        businessAccountId: '',
        webhookVerifyToken: '',
        accessToken: '',
        apiKey: ''
    });
    const [customWhatsappConfig, setCustomWhatsappConfig] = useState({
        enabled: false,
        phoneNumberId: '',
        businessAccountId: '',
        webhookVerifyToken: '',
        accessToken: '',
        apiKey: ''
    });
    const [googleBusinessConfig, setGoogleBusinessConfig] = useState({
        enabled: false,
        accountId: '',
        locationId: '',
        autoSyncApproved: '',
        apiKey: '',
        clientId: '',
        clientSecret: ''
    });

    const stats = [
        { label: 'Payment Gateways', value: 0, icon: CreditCard },
        { label: 'SMS Providers', value: 0, icon: Phone },
        { label: 'Email Providers', value: 0, icon: Mail },
        { label: 'WhatsApp', value: 0, icon: MessageSquare },
        { label: 'Google Business', value: 0, icon: Globe },
    ];

    const tabs = ['Payment', 'SMS', 'Email', 'WhatsApp', 'Google'];

    const gateways = [
        { name: 'Razorpay', status: 'Inactive', color: 'blue' },
        { name: 'PhonePe', status: 'Inactive', color: 'purple' },
        { name: 'CCAvenue', status: 'Inactive', color: 'emerald' },
        { name: 'PayU', status: 'Inactive', color: 'amber' },
    ];

    const smsProviders = [
        { name: 'MSG91', desc: 'Indian SMS with DLT support', color: 'rose' },
        { name: 'Gupshup', desc: 'Enterprise SMS platform', color: 'blue' },
        { name: 'Twilio', desc: 'Global SMS provider', color: 'red' },
        { name: 'Custom API', desc: 'Your own SMS API', color: 'slate' },
    ];

    const emailProviders = [
        { name: 'Custom SMTP', desc: 'Use your own SMTP server', icon: Server, color: 'slate' },
        { name: 'SendGrid', desc: 'Email API service', icon: Zap, color: 'blue' },
        { name: 'Amazon SES', desc: 'AWS email service', icon: Cloud, color: 'orange' },
        { name: 'Mailgun', desc: 'Developer email platform', icon: Send, color: 'red' },
    ];

    const whatsappProviders = [
        { name: 'WATI', desc: 'Official WhatsApp API', icon: MessageCircle, color: 'emerald' },
        { name: 'Interakt', desc: 'WhatsApp Business API', icon: MessageSquare, color: 'blue' },
        { name: 'Gupshup', desc: 'WhatsApp messaging', icon: Layout, color: 'indigo' },
        { name: 'Custom API', desc: 'Your own WhatsApp API', icon: Cpu, color: 'slate' },
    ];

    const handleSaveRazorpay = (e) => {
        e.preventDefault();
        setIsRazorpayDrawerOpen(false);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto font-sans animate-in fade-in duration-500 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Integrations</h1>
                <p className="text-slate-500 text-sm font-medium">Configure payment gateways, SMS, email and WhatsApp</p>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-md transition-all h-[130px]">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-slate-500 text-xs font-bold leading-tight max-w-[80px]">{stat.label}</span>
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors border border-slate-100/50">
                                    <Icon size={20} />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 leading-none">{stat.value}</h2>
                        </div>
                    );
                })}
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                {/* Custom Styled Tabs */}
                <div className="p-2 bg-slate-50/50 flex flex-wrap gap-1 border-b border-slate-100">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                                ? 'bg-white shadow-sm text-slate-900 ring-1 ring-slate-100/50'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-10">
                    {activeTab === 'Payment' && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <CreditCard className="text-slate-900" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Payment Gateways</h2>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Configure payment gateways with webhook support</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {gateways.map((gw, idx) => (
                                    <div key={idx} className="bg-white rounded-[24px] border border-slate-100 p-8 hover:shadow-lg transition-all group relative overflow-hidden flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center p-2.5 shadow-inner`}>
                                                    <div className={`w-full h-full rounded-full bg-gradient-to-br transition-transform group-hover:scale-110
                                                        ${gw.color === 'blue' ? 'from-blue-400 to-blue-600' :
                                                            gw.color === 'purple' ? 'from-purple-400 to-purple-600' :
                                                                gw.color === 'emerald' ? 'from-emerald-400 to-emerald-600' :
                                                                    'from-amber-400 to-amber-600'
                                                        } shadow-lg`} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{gw.name}</h3>
                                                    <p className="text-slate-400 text-xs font-medium">Not configured</p>
                                                </div>
                                            </div>
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100/50 shrink-0">
                                                <XCircle size={12} strokeWidth={3} />
                                                Inactive
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (gw.name === 'Razorpay') setIsRazorpayDrawerOpen(true);
                                                if (gw.name === 'PhonePe') setIsPhonePeDrawerOpen(true);
                                                if (gw.name === 'CCAvenue') setIsCCAvenueDrawerOpen(true);
                                                if (gw.name === 'PayU') setIsPayUDrawerOpen(true);
                                            }}
                                            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:from-indigo-700 hover:to-violet-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] mt-auto"
                                        >
                                            <Settings size={18} />
                                            Setup
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'SMS' && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <Phone className="text-slate-900" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">SMS Providers</h2>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Configure SMS providers with DLT registration</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {smsProviders.map((provider, idx) => (
                                    <div key={idx} className="bg-white rounded-[24px] border border-slate-100 p-8 hover:shadow-lg transition-all group relative overflow-hidden flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center p-2.5 shadow-inner`}>
                                                    {provider.name === 'Custom API' ? (
                                                        <Cpu className="text-slate-400 transition-transform group-hover:scale-110" size={24} />
                                                    ) : (
                                                        <div className={`w-full h-full rounded-full bg-gradient-to-br transition-transform group-hover:scale-110
                                                            ${provider.color === 'rose' ? 'from-rose-400 to-rose-600' :
                                                                provider.color === 'blue' ? 'from-blue-400 to-blue-600' :
                                                                    provider.color === 'red' ? 'from-red-400 to-red-600' :
                                                                        'from-slate-400 to-slate-600'
                                                            } shadow-lg`} />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{provider.name}</h3>
                                                    <p className="text-slate-400 text-xs font-medium">{provider.desc}</p>
                                                </div>
                                            </div>
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100/50 shrink-0">
                                                <XCircle size={12} strokeWidth={3} />
                                                Inactive
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (provider.name === 'MSG91') setIsMSG91DrawerOpen(true);
                                                if (provider.name === 'Gupshup') setIsGupshupDrawerOpen(true);
                                                if (provider.name === 'Twilio') setIsTwilioDrawerOpen(true);
                                                if (provider.name === 'Custom API') setIsCustomSMSDrawerOpen(true);
                                            }}
                                            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:from-indigo-700 hover:to-violet-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] mt-auto"
                                        >
                                            <Settings size={18} />
                                            Configure
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Email' && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <Mail className="text-slate-900" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Email Providers</h2>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Configure email sending with custom SMTP or API</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {emailProviders.map((provider, idx) => (
                                    <div key={idx} className="bg-white rounded-[24px] border border-slate-100 p-8 hover:shadow-lg transition-all group relative overflow-hidden flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center p-2.5 shadow-inner`}>
                                                    <provider.icon className="text-slate-400 transition-transform group-hover:scale-110" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{provider.name}</h3>
                                                    <p className="text-slate-400 text-xs font-medium">{provider.desc}</p>
                                                </div>
                                            </div>
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100/50 shrink-0">
                                                <XCircle size={12} strokeWidth={3} />
                                                Inactive
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (provider.name === 'Custom SMTP') setIsSMTPDrawerOpen(true);
                                                if (provider.name === 'SendGrid') setIsSendGridDrawerOpen(true);
                                                if (provider.name === 'Amazon SES') setIsSESDrawerOpen(true);
                                                if (provider.name === 'Mailgun') setIsMailgunDrawerOpen(true);
                                            }}
                                            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:from-indigo-700 hover:to-violet-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] mt-auto"
                                        >
                                            <Settings size={18} />
                                            Configure
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'WhatsApp' && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl">
                                    <MessageSquare className="text-slate-900" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">WhatsApp Business API</h2>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Configure WhatsApp for chat and messaging</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {whatsappProviders.map((provider, idx) => (
                                    <div key={idx} className="bg-white rounded-[24px] border border-slate-100 p-8 hover:shadow-lg transition-all group relative overflow-hidden flex flex-col h-full">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center p-2.5 shadow-inner`}>
                                                    <provider.icon className="text-slate-400 transition-transform group-hover:scale-110" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{provider.name}</h3>
                                                    <p className="text-slate-400 text-xs font-medium">{provider.desc}</p>
                                                </div>
                                            </div>
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100/50 shrink-0">
                                                <XCircle size={12} strokeWidth={3} />
                                                Inactive
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (provider.name === 'WATI') setIsWATIDrawerOpen(true);
                                                if (provider.name === 'Interakt') setIsInteraktDrawerOpen(true);
                                                if (provider.name === 'Gupshup') setIsGupshupWhatsappDrawerOpen(true);
                                                if (provider.name === 'Custom API') setIsCustomWhatsappDrawerOpen(true);
                                            }}
                                            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:from-indigo-700 hover:to-violet-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] mt-auto"
                                        >
                                            <Settings size={18} />
                                            Configure
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Google' && (
                        <div className="space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                    <Globe size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Google Business Profile</h2>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Sync approved reviews to your Google Maps listing</p>
                                </div>
                            </div>

                            <div className="max-w-2xl bg-white rounded-[32px] border border-slate-100 p-10 hover:shadow-xl transition-all group relative overflow-hidden">
                                <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center p-3.5 shadow-inner">
                                            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 via-red-400 to-yellow-400 shadow-lg shadow-blue-100 animate-pulse transition-transform group-hover:scale-110" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2">Google Business Profile</h3>
                                            <p className="text-slate-400 text-sm font-medium">Sync reviews to Google Maps</p>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100/50">
                                        <XCircle size={14} strokeWidth={3} />
                                        Inactive
                                    </span>
                                </div>

                                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 mb-10">
                                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                                        Configure Google Business Profile API to automatically sync approved reviews from the Feedback page to your Google Maps listing.
                                    </p>
                                </div>

                                <button
                                    onClick={() => setIsGoogleBusinessDrawerOpen(true)}
                                    className="w-full sm:w-auto px-12 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:from-indigo-700 hover:to-violet-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Share2 size={18} />
                                    Setup
                                </button>
                            </div>

                            {/* Info Feature Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { title: 'Auto Sync', desc: 'Real-time review updates', icon: Zap },
                                    { title: 'Maps Presence', desc: 'Boost local SEO visibility', icon: MapPin },
                                    { title: 'Approved Only', desc: 'Control which reviews show', icon: Settings }
                                ].map((feature, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-white border border-slate-50 group hover:border-indigo-100 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                            <feature.icon size={20} />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900 mb-1">{feature.title}</h4>
                                        <p className="text-xs text-slate-400 font-medium">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div >

            {/* Razorpay Configuration Drawer */}
            < RightDrawer
                isOpen={isRazorpayDrawerOpen}
                onClose={() => setIsRazorpayDrawerOpen(false)}
                title="Configure Razorpay"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-10">
                    {/* Enable Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Enable Integration</h3>
                            <p className="text-sm text-slate-400 font-medium">Activate this integration</p>
                        </div>
                        <button
                            onClick={() => setRazorpayConfig({ ...razorpayConfig, enabled: !razorpayConfig.enabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${razorpayConfig.enabled ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${razorpayConfig.enabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Configuration</h4>

                            <div className="space-y-2">
                                <label className="text-base font-bold text-slate-800 ml-1">Webhook Url</label>
                                <input
                                    type="text"
                                    placeholder="Enter webhook url"
                                    value={razorpayConfig.webhookUrl}
                                    onChange={(e) => setRazorpayConfig({ ...razorpayConfig, webhookUrl: e.target.value })}
                                    className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Credentials</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Key Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter key id"
                                        value={razorpayConfig.keyId}
                                        onChange={(e) => setRazorpayConfig({ ...razorpayConfig, keyId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Key Secret</label>
                                    <input
                                        type="password"
                                        placeholder="Enter key secret"
                                        value={razorpayConfig.keySecret}
                                        onChange={(e) => setRazorpayConfig({ ...razorpayConfig, keySecret: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Merchant Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter merchant id"
                                        value={razorpayConfig.merchantId}
                                        onChange={(e) => setRazorpayConfig({ ...razorpayConfig, merchantId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            onClick={handleSaveRazorpay}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[16px] text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </RightDrawer >

            {/* PhonePe Configuration Drawer */}
            < RightDrawer
                isOpen={isPhonePeDrawerOpen}
                onClose={() => setIsPhonePeDrawerOpen(false)}
                title="Configure PhonePe"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-10">
                    {/* Enable Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Enable Integration</h3>
                            <p className="text-sm text-slate-400 font-medium">Activate this integration</p>
                        </div>
                        <button
                            onClick={() => setPhonepeConfig({ ...phonepeConfig, enabled: !phonepeConfig.enabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${phonepeConfig.enabled ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${phonepeConfig.enabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Configuration</h4>

                            <div className="space-y-2">
                                <label className="text-base font-bold text-slate-800 ml-1">Webhook Url</label>
                                <input
                                    type="text"
                                    placeholder="Enter webhook url"
                                    value={phonepeConfig.webhookUrl}
                                    onChange={(e) => setPhonepeConfig({ ...phonepeConfig, webhookUrl: e.target.value })}
                                    className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Credentials</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Key Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter key id"
                                        value={phonepeConfig.keyId}
                                        onChange={(e) => setPhonepeConfig({ ...phonepeConfig, keyId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Key Secret</label>
                                    <input
                                        type="password"
                                        placeholder="Enter key secret"
                                        value={phonepeConfig.keySecret}
                                        onChange={(e) => setPhonepeConfig({ ...phonepeConfig, keySecret: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Merchant Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter merchant id"
                                        value={phonepeConfig.merchantId}
                                        onChange={(e) => setPhonepeConfig({ ...phonepeConfig, merchantId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => setIsPhonePeDrawerOpen(false)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[16px] text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </RightDrawer >

            {/* CCAvenue Configuration Drawer */}
            < RightDrawer
                isOpen={isCCAvenueDrawerOpen}
                onClose={() => setIsCCAvenueDrawerOpen(false)}
                title="Configure CCAvenue"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-10">
                    {/* Enable Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Enable Integration</h3>
                            <p className="text-sm text-slate-400 font-medium">Activate this integration</p>
                        </div>
                        <button
                            onClick={() => setCcavenueConfig({ ...ccavenueConfig, enabled: !ccavenueConfig.enabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${ccavenueConfig.enabled ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${ccavenueConfig.enabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Configuration</h4>

                            <div className="space-y-2">
                                <label className="text-base font-bold text-slate-800 ml-1">Webhook Url</label>
                                <input
                                    type="text"
                                    placeholder="Enter webhook url"
                                    value={ccavenueConfig.webhookUrl}
                                    onChange={(e) => setCcavenueConfig({ ...ccavenueConfig, webhookUrl: e.target.value })}
                                    className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Credentials</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Key Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter key id"
                                        value={ccavenueConfig.keyId}
                                        onChange={(e) => setCcavenueConfig({ ...ccavenueConfig, keyId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Key Secret</label>
                                    <input
                                        type="password"
                                        placeholder="Enter key secret"
                                        value={ccavenueConfig.keySecret}
                                        onChange={(e) => setCcavenueConfig({ ...ccavenueConfig, keySecret: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Merchant Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter merchant id"
                                        value={ccavenueConfig.merchantId}
                                        onChange={(e) => setCcavenueConfig({ ...ccavenueConfig, merchantId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => setIsCCAvenueDrawerOpen(false)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[16px] text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </RightDrawer >

            {/* PayU Configuration Drawer */}
            < RightDrawer
                isOpen={isPayUDrawerOpen}
                onClose={() => setIsPayUDrawerOpen(false)}
                title="Configure PayU"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-10">
                    {/* Enable Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Enable Integration</h3>
                            <p className="text-sm text-slate-400 font-medium">Activate this integration</p>
                        </div>
                        <button
                            onClick={() => setPayuConfig({ ...payuConfig, enabled: !payuConfig.enabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${payuConfig.enabled ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${payuConfig.enabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Configuration</h4>

                            <div className="space-y-2">
                                <label className="text-base font-bold text-slate-800 ml-1">Webhook Url</label>
                                <input
                                    type="text"
                                    placeholder="Enter webhook url"
                                    value={payuConfig.webhookUrl}
                                    onChange={(e) => setPayuConfig({ ...payuConfig, webhookUrl: e.target.value })}
                                    className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Credentials</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Key Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter key id"
                                        value={payuConfig.keyId}
                                        onChange={(e) => setPayuConfig({ ...payuConfig, keyId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Key Secret</label>
                                    <input
                                        type="password"
                                        placeholder="Enter key secret"
                                        value={payuConfig.keySecret}
                                        onChange={(e) => setPayuConfig({ ...payuConfig, keySecret: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Merchant Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter merchant id"
                                        value={payuConfig.merchantId}
                                        onChange={(e) => setPayuConfig({ ...payuConfig, merchantId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => setIsPayUDrawerOpen(false)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[16px] text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </RightDrawer >

            {/* MSG91 Configuration Drawer */}
            < RightDrawer
                isOpen={isMSG91DrawerOpen}
                onClose={() => setIsMSG91DrawerOpen(false)}
                title="Configure MSG91"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-10">
                    {/* Enable Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Enable Integration</h3>
                            <p className="text-sm text-slate-400 font-medium">Activate this integration</p>
                        </div>
                        <button
                            onClick={() => setMsg91Config({ ...msg91Config, enabled: !msg91Config.enabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${msg91Config.enabled ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${msg91Config.enabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Configuration</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Sender Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter sender id"
                                        value={msg91Config.senderId}
                                        onChange={(e) => setMsg91Config({ ...msg91Config, senderId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">DLT Entity Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter dlt entity id"
                                        value={msg91Config.dltEntityId}
                                        onChange={(e) => setMsg91Config({ ...msg91Config, dltEntityId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">DLT Template Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter dlt template id"
                                        value={msg91Config.dltTemplateId}
                                        onChange={(e) => setMsg91Config({ ...msg91Config, dltTemplateId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">API URL</label>
                                    <input
                                        type="text"
                                        placeholder="Enter api url"
                                        value={msg91Config.apiUrl}
                                        onChange={(e) => setMsg91Config({ ...msg91Config, apiUrl: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Credentials</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">API Key</label>
                                    <input
                                        type="text"
                                        placeholder="Enter api key"
                                        value={msg91Config.apiKey}
                                        onChange={(e) => setMsg91Config({ ...msg91Config, apiKey: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Auth Token</label>
                                    <input
                                        type="password"
                                        placeholder="Enter auth token"
                                        value={msg91Config.authToken}
                                        onChange={(e) => setMsg91Config({ ...msg91Config, authToken: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => setIsMSG91DrawerOpen(false)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[16px] text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </RightDrawer >

            {/* Gupshup Configuration Drawer */}
            < RightDrawer
                isOpen={isGupshupDrawerOpen}
                onClose={() => setIsGupshupDrawerOpen(false)}
                title="Configure Gupshup"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-10">
                    {/* Enable Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Enable Integration</h3>
                            <p className="text-sm text-slate-400 font-medium">Activate this integration</p>
                        </div>
                        <button
                            onClick={() => setGupshupConfig({ ...gupshupConfig, enabled: !gupshupConfig.enabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${gupshupConfig.enabled ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${gupshupConfig.enabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Configuration</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Sender Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter sender id"
                                        value={gupshupConfig.senderId}
                                        onChange={(e) => setGupshupConfig({ ...gupshupConfig, senderId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">DLT Entity Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter dlt entity id"
                                        value={gupshupConfig.dltEntityId}
                                        onChange={(e) => setGupshupConfig({ ...gupshupConfig, dltEntityId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">DLT Template Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter dlt template id"
                                        value={gupshupConfig.dltTemplateId}
                                        onChange={(e) => setGupshupConfig({ ...gupshupConfig, dltTemplateId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">API URL</label>
                                    <input
                                        type="text"
                                        placeholder="Enter api url"
                                        value={gupshupConfig.apiUrl}
                                        onChange={(e) => setGupshupConfig({ ...gupshupConfig, apiUrl: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Credentials</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">API Key</label>
                                    <input
                                        type="text"
                                        placeholder="Enter api key"
                                        value={gupshupConfig.apiKey}
                                        onChange={(e) => setGupshupConfig({ ...gupshupConfig, apiKey: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Auth Token</label>
                                    <input
                                        type="password"
                                        placeholder="Enter auth token"
                                        value={gupshupConfig.authToken}
                                        onChange={(e) => setGupshupConfig({ ...gupshupConfig, authToken: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => setIsGupshupDrawerOpen(false)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[16px] text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </RightDrawer >

            {/* Twilio Configuration Drawer */}
            < RightDrawer
                isOpen={isTwilioDrawerOpen}
                onClose={() => setIsTwilioDrawerOpen(false)}
                title="Configure Twilio"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-10">
                    {/* Enable Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Enable Integration</h3>
                            <p className="text-sm text-slate-400 font-medium">Activate this integration</p>
                        </div>
                        <button
                            onClick={() => setTwilioConfig({ ...twilioConfig, enabled: !twilioConfig.enabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${twilioConfig.enabled ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${twilioConfig.enabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Configuration</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Sender Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter sender id"
                                        value={twilioConfig.senderId}
                                        onChange={(e) => setTwilioConfig({ ...twilioConfig, senderId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">DLT Entity Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter dlt entity id"
                                        value={twilioConfig.dltEntityId}
                                        onChange={(e) => setTwilioConfig({ ...twilioConfig, dltEntityId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">DLT Template Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter dlt template id"
                                        value={twilioConfig.dltTemplateId}
                                        onChange={(e) => setTwilioConfig({ ...twilioConfig, dltTemplateId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">API URL</label>
                                    <input
                                        type="text"
                                        placeholder="Enter api url"
                                        value={twilioConfig.apiUrl}
                                        onChange={(e) => setTwilioConfig({ ...twilioConfig, apiUrl: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Credentials</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">API Key</label>
                                    <input
                                        type="text"
                                        placeholder="Enter api key"
                                        value={twilioConfig.apiKey}
                                        onChange={(e) => setTwilioConfig({ ...twilioConfig, apiKey: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Auth Token</label>
                                    <input
                                        type="password"
                                        placeholder="Enter auth token"
                                        value={twilioConfig.authToken}
                                        onChange={(e) => setTwilioConfig({ ...twilioConfig, authToken: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => setIsTwilioDrawerOpen(false)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[16px] text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </RightDrawer >

            {/* Custom SMS Configuration Drawer */}
            < RightDrawer
                isOpen={isCustomSMSDrawerOpen}
                onClose={() => setIsCustomSMSDrawerOpen(false)}
                title="Configure Custom SMS API"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-10">
                    {/* Enable Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Enable Integration</h3>
                            <p className="text-sm text-slate-400 font-medium">Activate this integration</p>
                        </div>
                        <button
                            onClick={() => setCustomSMSConfig({ ...customSMSConfig, enabled: !customSMSConfig.enabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${customSMSConfig.enabled ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${customSMSConfig.enabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Configuration</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Sender Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter sender id"
                                        value={customSMSConfig.senderId}
                                        onChange={(e) => setCustomSMSConfig({ ...customSMSConfig, senderId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">DLT Entity Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter dlt entity id"
                                        value={customSMSConfig.dltEntityId}
                                        onChange={(e) => setCustomSMSConfig({ ...customSMSConfig, dltEntityId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">DLT Template Id</label>
                                    <input
                                        type="text"
                                        placeholder="Enter dlt template id"
                                        value={customSMSConfig.dltTemplateId}
                                        onChange={(e) => setCustomSMSConfig({ ...customSMSConfig, dltTemplateId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">API URL</label>
                                    <input
                                        type="text"
                                        placeholder="Enter api url"
                                        value={customSMSConfig.apiUrl}
                                        onChange={(e) => setCustomSMSConfig({ ...customSMSConfig, apiUrl: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Credentials</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">API Key</label>
                                    <input
                                        type="text"
                                        placeholder="Enter api key"
                                        value={customSMSConfig.apiKey}
                                        onChange={(e) => setCustomSMSConfig({ ...customSMSConfig, apiKey: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Auth Token</label>
                                    <input
                                        type="password"
                                        placeholder="Enter auth token"
                                        value={customSMSConfig.authToken}
                                        onChange={(e) => setCustomSMSConfig({ ...customSMSConfig, authToken: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => setIsCustomSMSDrawerOpen(false)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[16px] text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </RightDrawer>

            {/* Custom SMTP Configuration Drawer */}
            <RightDrawer
                isOpen={isSMTPDrawerOpen}
                onClose={() => setIsSMTPDrawerOpen(false)}
                title="Configure Custom SMTP"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-10">
                    {/* Enable Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Enable Integration</h3>
                            <p className="text-sm text-slate-400 font-medium">Activate this integration</p>
                        </div>
                        <button
                            onClick={() => setSmtpConfig({ ...smtpConfig, enabled: !smtpConfig.enabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${smtpConfig.enabled ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${smtpConfig.enabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Configuration</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Host</label>
                                    <input
                                        type="text"
                                        placeholder="Enter host"
                                        value={smtpConfig.host}
                                        onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Port</label>
                                    <input
                                        type="text"
                                        placeholder="Enter port"
                                        value={smtpConfig.port}
                                        onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">From Email</label>
                                    <input
                                        type="email"
                                        placeholder="Enter from email"
                                        value={smtpConfig.fromEmail}
                                        onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">From Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter from name"
                                        value={smtpConfig.fromName}
                                        onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Credentials</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Username</label>
                                    <input
                                        type="text"
                                        placeholder="Enter username"
                                        value={smtpConfig.username}
                                        onChange={(e) => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Password</label>
                                    <input
                                        type="password"
                                        placeholder="Enter password"
                                        value={smtpConfig.password}
                                        onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => setIsSMTPDrawerOpen(false)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[16px] text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </RightDrawer>

            {/* SendGrid Configuration Drawer */}
            <RightDrawer
                isOpen={isSendGridDrawerOpen}
                onClose={() => setIsSendGridDrawerOpen(false)}
                title="Configure SendGrid"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-10">
                    {/* Enable Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Enable Integration</h3>
                            <p className="text-sm text-slate-400 font-medium">Activate this integration</p>
                        </div>
                        <button
                            onClick={() => setSendGridConfig({ ...sendGridConfig, enabled: !sendGridConfig.enabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${sendGridConfig.enabled ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${sendGridConfig.enabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Configuration</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">From Email</label>
                                    <input
                                        type="email"
                                        placeholder="Enter from email"
                                        value={sendGridConfig.fromEmail}
                                        onChange={(e) => setSendGridConfig({ ...sendGridConfig, fromEmail: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">From Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter from name"
                                        value={sendGridConfig.fromName}
                                        onChange={(e) => setSendGridConfig({ ...sendGridConfig, fromName: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Credentials</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">API Key</label>
                                    <input
                                        type="password"
                                        placeholder="Enter api key"
                                        value={sendGridConfig.apiKey}
                                        onChange={(e) => setSendGridConfig({ ...sendGridConfig, apiKey: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => setIsSendGridDrawerOpen(false)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[16px] text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </RightDrawer>

            {/* Amazon SES Configuration Drawer */}
            <RightDrawer
                isOpen={isSESDrawerOpen}
                onClose={() => setIsSESDrawerOpen(false)}
                title="Configure Amazon SES"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-10">
                    {/* Enable Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Enable Integration</h3>
                            <p className="text-sm text-slate-400 font-medium">Activate this integration</p>
                        </div>
                        <button
                            onClick={() => setSesConfig({ ...sesConfig, enabled: !sesConfig.enabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${sesConfig.enabled ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${sesConfig.enabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Configuration</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">From Email</label>
                                    <input
                                        type="email"
                                        placeholder="Enter from email"
                                        value={sesConfig.fromEmail}
                                        onChange={(e) => setSesConfig({ ...sesConfig, fromEmail: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">From Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter from name"
                                        value={sesConfig.fromName}
                                        onChange={(e) => setSesConfig({ ...sesConfig, fromName: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Credentials</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">API Key</label>
                                    <input
                                        type="password"
                                        placeholder="Enter api key"
                                        value={sesConfig.apiKey}
                                        onChange={(e) => setSesConfig({ ...sesConfig, apiKey: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => setIsSESDrawerOpen(false)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[16px] text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </RightDrawer>

            {/* Mailgun Configuration Drawer */}
            <RightDrawer
                isOpen={isMailgunDrawerOpen}
                onClose={() => setIsMailgunDrawerOpen(false)}
                title="Configure Mailgun"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-10">
                    {/* Enable Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Enable Integration</h3>
                            <p className="text-sm text-slate-400 font-medium">Activate this integration</p>
                        </div>
                        <button
                            onClick={() => setMailgunConfig({ ...mailgunConfig, enabled: !mailgunConfig.enabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${mailgunConfig.enabled ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${mailgunConfig.enabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Configuration</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">From Email</label>
                                    <input
                                        type="email"
                                        placeholder="Enter from email"
                                        value={mailgunConfig.fromEmail}
                                        onChange={(e) => setMailgunConfig({ ...mailgunConfig, fromEmail: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">From Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter from name"
                                        value={mailgunConfig.fromName}
                                        onChange={(e) => setMailgunConfig({ ...mailgunConfig, fromName: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Credentials</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">API Key</label>
                                    <input
                                        type="password"
                                        placeholder="Enter api key"
                                        value={mailgunConfig.apiKey}
                                        onChange={(e) => setMailgunConfig({ ...mailgunConfig, apiKey: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => setIsMailgunDrawerOpen(false)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[16px] text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </RightDrawer>

            {/* WATI Configuration Drawer */}
            <RightDrawer
                isOpen={isWATIDrawerOpen}
                onClose={() => setIsWATIDrawerOpen(false)}
                title="Configure WATI"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-10">
                    {/* Enable Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Enable Integration</h3>
                            <p className="text-sm text-slate-400 font-medium">Activate this integration</p>
                        </div>
                        <button
                            onClick={() => setWatiConfig({ ...watiConfig, enabled: !watiConfig.enabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${watiConfig.enabled ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${watiConfig.enabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Configuration</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Phone Number ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter phone number id"
                                        value={watiConfig.phoneNumberId}
                                        onChange={(e) => setWatiConfig({ ...watiConfig, phoneNumberId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Business Account ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter business account id"
                                        value={watiConfig.businessAccountId}
                                        onChange={(e) => setWatiConfig({ ...watiConfig, businessAccountId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Webhook Verify Token</label>
                                    <input
                                        type="text"
                                        placeholder="Enter webhook verify token"
                                        value={watiConfig.webhookVerifyToken}
                                        onChange={(e) => setWatiConfig({ ...watiConfig, webhookVerifyToken: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Credentials</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Access Token</label>
                                    <input
                                        type="password"
                                        placeholder="Enter access token"
                                        value={watiConfig.accessToken}
                                        onChange={(e) => setWatiConfig({ ...watiConfig, accessToken: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">API Key</label>
                                    <input
                                        type="password"
                                        placeholder="Enter api key"
                                        value={watiConfig.apiKey}
                                        onChange={(e) => setWatiConfig({ ...watiConfig, apiKey: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => setIsWATIDrawerOpen(false)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[16px] text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </RightDrawer>

            {/* Interakt Configuration Drawer */}
            <RightDrawer
                isOpen={isInteraktDrawerOpen}
                onClose={() => setIsInteraktDrawerOpen(false)}
                title="Configure Interakt"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-10">
                    {/* Enable Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Enable Integration</h3>
                            <p className="text-sm text-slate-400 font-medium">Activate this integration</p>
                        </div>
                        <button
                            onClick={() => setInteraktConfig({ ...interaktConfig, enabled: !interaktConfig.enabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${interaktConfig.enabled ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${interaktConfig.enabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Configuration</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Phone Number ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter phone number id"
                                        value={interaktConfig.phoneNumberId}
                                        onChange={(e) => setInteraktConfig({ ...interaktConfig, phoneNumberId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Business Account ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter business account id"
                                        value={interaktConfig.businessAccountId}
                                        onChange={(e) => setInteraktConfig({ ...interaktConfig, businessAccountId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Webhook Verify Token</label>
                                    <input
                                        type="text"
                                        placeholder="Enter webhook verify token"
                                        value={interaktConfig.webhookVerifyToken}
                                        onChange={(e) => setInteraktConfig({ ...interaktConfig, webhookVerifyToken: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Credentials</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Access Token</label>
                                    <input
                                        type="password"
                                        placeholder="Enter access token"
                                        value={interaktConfig.accessToken}
                                        onChange={(e) => setInteraktConfig({ ...interaktConfig, accessToken: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">API Key</label>
                                    <input
                                        type="password"
                                        placeholder="Enter api key"
                                        value={interaktConfig.apiKey}
                                        onChange={(e) => setInteraktConfig({ ...interaktConfig, apiKey: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => setIsInteraktDrawerOpen(false)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[16px] text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </RightDrawer>

            {/* Gupshup WhatsApp Configuration Drawer */}
            <RightDrawer
                isOpen={isGupshupWhatsappDrawerOpen}
                onClose={() => setIsGupshupWhatsappDrawerOpen(false)}
                title="Configure Gupshup WhatsApp"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-10">
                    {/* Enable Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Enable Integration</h3>
                            <p className="text-sm text-slate-400 font-medium">Activate this integration</p>
                        </div>
                        <button
                            onClick={() => setGupshupWhatsappConfig({ ...gupshupWhatsappConfig, enabled: !gupshupWhatsappConfig.enabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${gupshupWhatsappConfig.enabled ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${gupshupWhatsappConfig.enabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Configuration</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Phone Number ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter phone number id"
                                        value={gupshupWhatsappConfig.phoneNumberId}
                                        onChange={(e) => setGupshupWhatsappConfig({ ...gupshupWhatsappConfig, phoneNumberId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Business Account ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter business account id"
                                        value={gupshupWhatsappConfig.businessAccountId}
                                        onChange={(e) => setGupshupWhatsappConfig({ ...gupshupWhatsappConfig, businessAccountId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Webhook Verify Token</label>
                                    <input
                                        type="text"
                                        placeholder="Enter webhook verify token"
                                        value={gupshupWhatsappConfig.webhookVerifyToken}
                                        onChange={(e) => setGupshupWhatsappConfig({ ...gupshupWhatsappConfig, webhookVerifyToken: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Credentials</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Access Token</label>
                                    <input
                                        type="password"
                                        placeholder="Enter access token"
                                        value={gupshupWhatsappConfig.accessToken}
                                        onChange={(e) => setGupshupWhatsappConfig({ ...gupshupWhatsappConfig, accessToken: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">API Key</label>
                                    <input
                                        type="password"
                                        placeholder="Enter api key"
                                        value={gupshupWhatsappConfig.apiKey}
                                        onChange={(e) => setGupshupWhatsappConfig({ ...gupshupWhatsappConfig, apiKey: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => setIsGupshupWhatsappDrawerOpen(false)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[16px] text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </RightDrawer>

            {/* Custom WhatsApp Configuration Drawer */}
            <RightDrawer
                isOpen={isCustomWhatsappDrawerOpen}
                onClose={() => setIsCustomWhatsappDrawerOpen(false)}
                title="Configure Custom WhatsApp"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-10">
                    {/* Enable Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Enable Integration</h3>
                            <p className="text-sm text-slate-400 font-medium">Activate this integration</p>
                        </div>
                        <button
                            onClick={() => setCustomWhatsappConfig({ ...customWhatsappConfig, enabled: !customWhatsappConfig.enabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${customWhatsappConfig.enabled ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${customWhatsappConfig.enabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Configuration</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Phone Number ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter phone number id"
                                        value={customWhatsappConfig.phoneNumberId}
                                        onChange={(e) => setCustomWhatsappConfig({ ...customWhatsappConfig, phoneNumberId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Business Account ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter business account id"
                                        value={customWhatsappConfig.businessAccountId}
                                        onChange={(e) => setCustomWhatsappConfig({ ...customWhatsappConfig, businessAccountId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Webhook Verify Token</label>
                                    <input
                                        type="text"
                                        placeholder="Enter webhook verify token"
                                        value={customWhatsappConfig.webhookVerifyToken}
                                        onChange={(e) => setCustomWhatsappConfig({ ...customWhatsappConfig, webhookVerifyToken: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Credentials</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Access Token</label>
                                    <input
                                        type="password"
                                        placeholder="Enter access token"
                                        value={customWhatsappConfig.accessToken}
                                        onChange={(e) => setCustomWhatsappConfig({ ...customWhatsappConfig, accessToken: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">API Key</label>
                                    <input
                                        type="password"
                                        placeholder="Enter api key"
                                        value={customWhatsappConfig.apiKey}
                                        onChange={(e) => setCustomWhatsappConfig({ ...customWhatsappConfig, apiKey: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => setIsCustomWhatsappDrawerOpen(false)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[16px] text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </RightDrawer>

            {/* Google Business Configuration Drawer */}
            <RightDrawer
                isOpen={isGoogleBusinessDrawerOpen}
                onClose={() => setIsGoogleBusinessDrawerOpen(false)}
                title="Configure Google Business"
                maxWidth="max-w-md"
            >
                <div className="p-8 space-y-10">
                    {/* Enable Section */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-800 tracking-tight">Enable Integration</h3>
                            <p className="text-sm text-slate-400 font-medium">Activate this integration</p>
                        </div>
                        <button
                            onClick={() => setGoogleBusinessConfig({ ...googleBusinessConfig, enabled: !googleBusinessConfig.enabled })}
                            className={`w-14 h-7 rounded-full transition-all relative ${googleBusinessConfig.enabled ? 'bg-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${googleBusinessConfig.enabled ? 'left-8' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {/* Configuration Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Configuration</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Account ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter account id"
                                        value={googleBusinessConfig.accountId}
                                        onChange={(e) => setGoogleBusinessConfig({ ...googleBusinessConfig, accountId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Location ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter location id"
                                        value={googleBusinessConfig.locationId}
                                        onChange={(e) => setGoogleBusinessConfig({ ...googleBusinessConfig, locationId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Auto Sync Approved</label>
                                    <input
                                        type="text"
                                        placeholder="Enter auto sync approved"
                                        value={googleBusinessConfig.autoSyncApproved}
                                        onChange={(e) => setGoogleBusinessConfig({ ...googleBusinessConfig, autoSyncApproved: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Credentials Section */}
                        <div className="space-y-6">
                            <h4 className="text-lg font-bold text-slate-800 tracking-tight border-b border-slate-100 pb-2">Credentials</h4>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">API Key</label>
                                    <input
                                        type="password"
                                        placeholder="Enter api key"
                                        value={googleBusinessConfig.apiKey}
                                        onChange={(e) => setGoogleBusinessConfig({ ...googleBusinessConfig, apiKey: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Client ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter client id"
                                        value={googleBusinessConfig.clientId}
                                        onChange={(e) => setGoogleBusinessConfig({ ...googleBusinessConfig, clientId: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-bold text-slate-800 ml-1">Client Secret</label>
                                    <input
                                        type="password"
                                        placeholder="Enter client secret"
                                        value={googleBusinessConfig.clientSecret}
                                        onChange={(e) => setGoogleBusinessConfig({ ...googleBusinessConfig, clientSecret: e.target.value })}
                                        className="w-full px-5 py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            onClick={() => setIsGoogleBusinessDrawerOpen(false)}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-blue-600 text-white rounded-[16px] text-base font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                        >
                            <Save size={20} />
                            Save Configuration
                        </button>
                    </div>
                </div>
            </RightDrawer>
        </div>
    );
};

export default IntegrationsSettings;
