import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Mail, Bell, Clock, Play, Save, Loader } from 'lucide-react';
import { ROLES } from '../../../config/roles';
import { useBranchContext } from '../../../context/BranchContext';
import apiClient from '../../../api/apiClient';
import { toast } from 'react-hot-toast';

const Notifications = () => {
    const context = useOutletContext();
    const role = context?.role;
    const isReadOnly = role === ROLES.MANAGER;
    const { selectedBranch } = useBranchContext();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [runningReminders, setRunningReminders] = useState(false);

    const [emailSettings, setEmailSettings] = useState({
        membershipReminders: true,
        paymentReceipts: true,
        classNotifications: true,
        announcements: true
    });

    const [systemSettings, setSystemSettings] = useState({
        lowStockAlerts: true,
        newLeadAlerts: true,
        paymentAlerts: true,
        taskReminders: true
    });

    const [selectedReminderType, setSelectedReminderType] = useState('Payment Due');
    const reminderTypes = [
        'Payment Due', 'Birthdays', 'Membership Expiry',
        'Class Reminders', 'PT Sessions', 'Benefit Bookings'
    ];

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const branchId = selectedBranch?.id;
            const headers = branchId ? { 'x-tenant-id': branchId } : {};

            const res = await apiClient.get('/admin/settings/notifications', { headers });
            if (res.data) {
                setEmailSettings({
                    membershipReminders: res.data.membershipReminders ?? true,
                    paymentReceipts: res.data.paymentReceipts ?? true,
                    classNotifications: res.data.classNotifications ?? true,
                    announcements: res.data.announcements ?? true
                });
                setSystemSettings({
                    lowStockAlerts: res.data.lowStockAlerts ?? true,
                    newLeadAlerts: res.data.newLeadAlerts ?? true,
                    paymentAlerts: res.data.paymentAlerts ?? true,
                    taskReminders: res.data.taskReminders ?? true
                });
            }
        } catch (error) {
            console.error('Error fetching notification settings:', error);
            // Will fallback to defaults
        } finally {
            setLoading(false);
        }
    }, [selectedBranch]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const toggleEmailSetting = (key) => {
        if (isReadOnly) return;
        setEmailSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleSystemSetting = (key) => {
        if (isReadOnly) return;
        setSystemSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const branchId = selectedBranch?.id;
            const headers = branchId ? { 'x-tenant-id': branchId } : {};

            await apiClient.patch('/admin/settings/notifications', {
                ...emailSettings,
                ...systemSettings
            }, { headers });

            toast.success('Notification settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error(error?.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleRunReminders = async () => {
        if (isReadOnly) return;
        try {
            setRunningReminders(true);
            const branchId = selectedBranch?.id;
            const headers = branchId ? { 'x-tenant-id': branchId } : {};

            const res = await apiClient.post('/admin/settings/reminders/run', {
                type: selectedReminderType
            }, { headers });

            toast.success(res.data.message || `Triggered ${selectedReminderType} reminders`);
        } catch (error) {
            console.error('Error running reminders:', error);
            toast.error(error?.response?.data?.message || 'Failed to trigger reminders');
        } finally {
            setRunningReminders(false);
        }
    };

    const Toggle = ({ active, onToggle }) => (
        <button
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${active ? 'bg-primary' : 'bg-slate-200'}`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${active ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div>
                <h1 className="text-page-title">Notification Settings</h1>
                <p className="text-muted mt-1">Configure email and system notifications</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Email Notifications */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 sm:p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-primary-light text-primary rounded-2xl">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Email Notifications</h2>
                            <p className="text-muted text-sm mt-0.5">Configure email alerts for member events</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {[
                            { key: 'membershipReminders', title: 'Membership Reminders', desc: 'Send expiry reminders to members' },
                            { key: 'paymentReceipts', title: 'Payment Receipts', desc: 'Send receipts after payments' },
                            { key: 'classNotifications', title: 'Class Notifications', desc: 'Send class booking confirmations' },
                            { key: 'announcements', title: 'Announcements', desc: 'Receive gym announcements via email' }
                        ].map(({ key, title, desc }) => (
                            <div key={key} className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-semibold text-slate-800">{title}</h3>
                                    <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                                </div>
                                <Toggle active={emailSettings[key]} onToggle={() => toggleEmailSetting(key)} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Alerts */}
                <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 sm:p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-primary-light text-primary rounded-2xl">
                            <Bell size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">System Alerts</h2>
                            <p className="text-muted text-sm mt-0.5">Manage inner-app notification triggers</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {[
                            { key: 'lowStockAlerts', title: 'Low Stock Alerts', desc: 'Get notified when inventory is low' },
                            { key: 'newLeadAlerts', title: 'New Lead Alerts', desc: 'Get notified about new leads' },
                            { key: 'paymentAlerts', title: 'Payment Alerts', desc: 'Get notified about overdue payments' },
                            { key: 'taskReminders', title: 'Task Reminders', desc: 'Get reminders for assigned tasks' }
                        ].map(({ key, title, desc }) => (
                            <div key={key} className="flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-semibold text-slate-800">{title}</h3>
                                    <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                                </div>
                                <Toggle active={systemSettings[key]} onToggle={() => toggleSystemSetting(key)} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Automated Reminders */}
            <div className="bg-white rounded-[24px] border border-slate-100 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                        <Clock size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Reminders Engine</h2>
                        <p className="text-muted text-xs sm:text-sm mt-0.5">Manually trigger system reminders</p>
                    </div>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    Manually trigger all pending reminders (payments, birthdays, membership expiry, class/PT/benefit bookings).
                </p>

                <div className="space-y-8">
                    <div className="flex flex-wrap gap-2">
                        {reminderTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setSelectedReminderType(type)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedReminderType === type
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleRunReminders}
                        disabled={runningReminders || isReadOnly}
                        className="w-full sm:w-auto px-6 py-3.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {runningReminders ? <Loader size={18} className="animate-spin text-primary" /> : <Play size={18} fill="currentColor" className="text-primary" />}
                        {runningReminders ? 'Triggering...' : 'Run Reminders Now'}
                    </button>
                </div>
            </div>

            {/* Save Action */}
            <div className="flex justify-end pt-6 pb-10">
                <button
                    onClick={handleSave}
                    disabled={saving || isReadOnly}
                    className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-primary to-primary text-white font-black rounded-xl shadow-xl shadow-primary/30/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {saving ? <Loader size={20} className="animate-spin" /> : <Save size={20} />}
                    {saving ? 'Saving Changes...' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
};

export default Notifications;
