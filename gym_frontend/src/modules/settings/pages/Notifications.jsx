import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ROLES } from '../../../config/roles';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Mail, MessageSquare, Smartphone, Plus, Save, Trash2, Edit2 } from 'lucide-react';
import BranchScopeSelector from '../../../components/common/BranchScopeSelector';
import RightDrawer from '../../../components/common/RightDrawer';
import { BRANCHES } from '../data/mockSettingsData';

const Notifications = () => {
    const context = useOutletContext();
    const role = context?.role;
    const isReadOnly = role === ROLES.MANAGER;
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [activeTab, setActiveTab] = useState('channels'); // channels | templates
    const [templates, setTemplates] = useState([
        { id: 1, name: 'Welcome Email', type: 'Email', subject: 'Welcome to Gym!', body: 'Hi {name}, thanks for joining...' },
        { id: 2, name: 'Payment Reminder', type: 'WhatsApp', subject: '', body: 'Dear {name}, your payment of {amount} is due.' }
    ]);
    const [gateways, setGateways] = useState({
        whatsapp: { provider: 'Twilio', apiKey: 'sk_test_...', number: '+1234567890' },
        sms: { provider: 'MSG91', apiKey: 'auth_key_...', senderId: 'GYMAPP' },
        email: { provider: 'AWS SES', apiKey: 'AKIA...', region: 'us-east-1' }
    });

    const handleSave = () => {
        alert("Communication configuration saved successfully!");
    };

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        type: 'WhatsApp',
        subject: '',
        body: ''
    });

    const handleCreateTemplate = () => {
        if (!newTemplate.name || !newTemplate.body) {
            alert("Please fill in the template name and message body.");
            return;
        }

        const template = {
            id: templates.length + 1,
            ...newTemplate
        };

        setTemplates([...templates, template]);
        setIsDrawerOpen(false);
        setNewTemplate({ name: '', type: 'WhatsApp', subject: '', body: '' });
        alert("New message template created successfully!");
    };

    const handleDeleteTemplate = (id) => {
        if (window.confirm("Are you sure you want to delete this template?")) {
            setTemplates(templates.filter(t => t.id !== id));
        }
    };

    const handleUpdateTemplate = (id, field, value) => {
        setTemplates(templates.map(t =>
            t.id === id ? { ...t, [field]: value } : t
        ));
    };

    const handleSaveTemplate = (template) => {
        // In a real app, this would make an API call
        console.log("Saving template:", template);
        alert(`Template "${template.name}" updated successfully!`);
    };

    return (
        <div className="fade-in space-y-4 sm:space-y-6 p-4 sm:p-6" >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Communication</h2>
                    {isReadOnly && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold rounded border border-slate-200 uppercase tracking-wide">
                            Read-Only 🔒
                        </span>
                    )}
                </div>
                <p className="text-sm sm:text-base text-gray-500 font-bold mt-1">
                    {isReadOnly ? 'View communication templates & settings.' : 'Manage SMS, Email & WhatsApp templates.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                        variant={activeTab === 'channels' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('channels')}
                        className="w-full sm:w-auto"
                    >
                        Gateway Channels
                    </Button>
                    <Button
                        variant={activeTab === 'templates' ? 'primary' : 'outline'}
                        onClick={() => setActiveTab('templates')}
                        className="w-full sm:w-auto"
                    >
                        Message Templates
                    </Button>
                </div>
            </div>

            <BranchScopeSelector
                value={selectedBranch}
                onChange={setSelectedBranch}
                branches={BRANCHES}
            />

            {activeTab === 'channels' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* WhatsApp */}
                    <Card title="WhatsApp Integration">
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                <div className="p-2 sm:p-3 bg-green-100 text-green-600 rounded-lg shrink-0"><MessageSquare size={20} className="sm:w-6 sm:h-6" /></div>
                                <div>
                                    <h3 className="font-bold text-sm sm:text-base text-gray-900">WhatsApp Business</h3>
                                    <p className="text-xs sm:text-sm text-gray-500">Configure Twilio or Meta API</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Provider</label>
                                <select
                                    className={`w-full p-2 border rounded-lg mt-1 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-gray-50'}`}
                                    disabled={isReadOnly}
                                >
                                    <option>Twilio</option>
                                    <option>Meta Cloud API</option>
                                    <option>Interakt</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">API Key / Auth Token</label>
                                <input
                                    type="password"
                                    value={gateways.whatsapp.apiKey}
                                    className={`w-full p-2 border rounded-lg mt-1 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                                    disabled={isReadOnly}
                                    placeholder={isReadOnly ? "••••••••••••••••" : "Enter API Key"}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Sender Number</label>
                                <input
                                    type="text"
                                    value={gateways.whatsapp.number}
                                    className={`w-full p-2 border rounded-lg mt-1 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                                    disabled={isReadOnly}
                                    placeholder={isReadOnly ? "••••••••••••••••" : "Enter Sender Number"}
                                />
                            </div>
                            <Button
                                variant="primary"
                                className="w-full mt-2"
                                onClick={handleSave}
                                disabled={isReadOnly}
                            >
                                Save Configuration
                            </Button>
                        </div>
                    </Card>

                    {/* SMS */}
                    <Card title="SMS Gateway">
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                <div className="p-2 sm:p-3 bg-blue-100 text-blue-600 rounded-lg shrink-0"><Smartphone size={20} className="sm:w-6 sm:h-6" /></div>
                                <div>
                                    <h3 className="font-bold text-sm sm:text-base text-gray-900">SMS Gateway</h3>
                                    <p className="text-xs sm:text-sm text-gray-500">DLT Registered Headers required (India)</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Provider</label>
                                <select
                                    className={`w-full p-2 border rounded-lg mt-1 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'bg-gray-50'}`}
                                    disabled={isReadOnly}
                                >
                                    <option>MSG91</option>
                                    <option>Kaleyra</option>
                                    <option>Twilio</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Auth Key</label>
                                <input
                                    type="password"
                                    value={gateways.sms.apiKey}
                                    className={`w-full p-2 border rounded-lg mt-1 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                                    disabled={isReadOnly}
                                    placeholder={isReadOnly ? "••••••••••••••••" : "Enter Auth Key"}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Sender ID (6 chars)</label>
                                <input
                                    type="text"
                                    value={gateways.sms.senderId}
                                    className={`w-full p-2 border rounded-lg mt-1 text-sm ${isReadOnly ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                                    disabled={isReadOnly}
                                    placeholder={isReadOnly ? "••••••••••••••••" : "Enter Sender ID"}
                                />
                            </div>
                            <Button
                                variant="primary"
                                className="w-full mt-2"
                                onClick={handleSave}
                                disabled={isReadOnly}
                            >
                                Save Configuration
                            </Button>
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="space-y-4 sm:space-y-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-gray-800">Message Templates</h3>
                        {!isReadOnly && (
                            <Button
                                onClick={() => setIsDrawerOpen(true)}
                                variant="primary"
                                className="bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                            >
                                <Plus size={18} className="mr-2" />
                                New Template
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {templates.map(tpl => (
                            <Card key={tpl.id} className="relative group">
                                <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!isReadOnly && (
                                            <>
                                                <button
                                                    onClick={() => handleSaveTemplate(tpl)}
                                                    className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                                    title="Save Changes"
                                                >
                                                    <Save size={14} className="sm:w-4 sm:h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTemplate(tpl.id)}
                                                    className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-full"
                                                    title="Delete Template"
                                                >
                                                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${tpl.type === 'Email' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                        {tpl.type}
                                    </span>
                                    <h4 className="font-bold text-sm sm:text-base text-gray-900">{tpl.name}</h4>
                                </div>
                                {tpl.type === 'Email' && (
                                    <div className="mb-2">
                                        <label className="text-xs text-gray-400 uppercase">Subject</label>
                                        <input
                                            type="text"
                                            value={tpl.subject}
                                            onChange={(e) => handleUpdateTemplate(tpl.id, 'subject', e.target.value)}
                                            className={`w-full text-xs sm:text-sm p-1 border-b focus:outline-none focus:border-indigo-500 ${isReadOnly ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                                            disabled={isReadOnly}
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="text-xs text-gray-400 uppercase">Body Content (Supports {`{variables}`})</label>
                                    <textarea
                                        value={tpl.body}
                                        onChange={(e) => handleUpdateTemplate(tpl.id, 'body', e.target.value)}
                                        rows={3}
                                        className={`w-full text-xs sm:text-sm p-2 border rounded bg-gray-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none mt-1 ${isReadOnly ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                                        disabled={isReadOnly}
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Create Message Template"
                subtitle="Design new notification templates"
                maxWidth="max-w-lg"
                footer={
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setIsDrawerOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={handleCreateTemplate}
                        >
                            Create Template
                        </Button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Template Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Membership Renewal Reminder"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                            value={newTemplate.name}
                            onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Channel Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['WhatsApp', 'Email', 'SMS'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setNewTemplate({ ...newTemplate, type })}
                                    className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all ${newTemplate.type === type
                                        ? 'border-violet-600 bg-violet-50 text-violet-700'
                                        : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {newTemplate.type === 'Email' && (
                        <div className="animate-in slide-in-from-top-2 duration-200">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email Subject</label>
                            <input
                                type="text"
                                placeholder="e.g. Important Update regarding your membership"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                                value={newTemplate.subject}
                                onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Message Body</label>
                        <div className="mb-2 flex gap-2 overflow-x-auto pb-2">
                            {['{name}', '{amount}', '{date}', '{branch}'].map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setNewTemplate(prev => ({ ...prev, body: prev.body + ' ' + tag }))}
                                    className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase hover:bg-slate-200 whitespace-nowrap"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                        <textarea
                            placeholder="Type your message here..."
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all min-h-[150px] resize-none"
                            value={newTemplate.body}
                            onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                        />
                        <p className="text-xs text-slate-400 mt-2 text-right">
                            {newTemplate.body.length} characters
                        </p>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                        <div className="shrink-0 text-amber-500 mt-0.5">
                            <MessageSquare size={16} />
                        </div>
                        <p className="text-xs text-amber-700 leading-relaxed font-medium">
                            <strong>Note:</strong> WhatsApp templates require approval from Meta before they can be sent. Email and SMS templates are active immediately.
                        </p>
                    </div>
                </div>
            </RightDrawer>
        </div >
    );
};

export default Notifications;
