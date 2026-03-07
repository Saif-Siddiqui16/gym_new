import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Shield, Save, Loader } from 'lucide-react';
import { ROLES } from '../../../config/roles';
import { useBranchContext } from '../../../context/BranchContext';
import apiClient from '../../../api/apiClient';
import { toast } from 'react-hot-toast';

const SecuritySettings = () => {
    const context = useOutletContext();
    const role = context?.role;
    const isReadOnly = role === ROLES.MANAGER;
    const { selectedBranch } = useBranchContext();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [securityConfig, setSecurityConfig] = useState({
        twoFactorAuth: false,
        sessionTimeout: true,
        sessionDuration: '8',
        loginAlerts: true
    });

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const branchId = selectedBranch?.id;
            const headers = branchId ? { 'x-tenant-id': branchId } : {};

            const res = await apiClient.get('/admin/settings/security', { headers });
            if (res.data) {
                setSecurityConfig({
                    twoFactorAuth: res.data.twoFactorAuth ?? false,
                    sessionTimeout: res.data.sessionTimeout ?? true,
                    sessionDuration: res.data.sessionDuration || '8',
                    loginAlerts: res.data.loginAlerts ?? true
                });
            }
        } catch (error) {
            console.error('Error fetching security settings:', error);
            // Fallback to defaults on error
            setSecurityConfig({
                twoFactorAuth: false,
                sessionTimeout: true,
                sessionDuration: '8',
                loginAlerts: true
            });
        } finally {
            setLoading(false);
        }
    }, [selectedBranch]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const toggleSetting = (key) => {
        if (isReadOnly) return;
        setSecurityConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleInputChange = (key, value) => {
        if (isReadOnly) return;
        setSecurityConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (isReadOnly) return;
        try {
            setSaving(true);
            const branchId = selectedBranch?.id;
            const headers = branchId ? { 'x-tenant-id': branchId } : {};

            await apiClient.patch('/admin/settings/security', securityConfig, { headers });
            toast.success('Security settings saved successfully!');
        } catch (error) {
            console.error('Error saving security settings:', error);
            toast.error(error?.response?.data?.message || 'Failed to save settings');
        } finally {
            setSaving(false);
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
                <h1 className="text-page-title">Security Settings</h1>
                <p className="text-muted mt-1">Configure security and access controls</p>
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Access Policy</h2>
                        <p className="text-muted text-sm mt-0.5">Manage global security and session rules</p>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-slate-800">Two-Factor Authentication</h3>
                            <p className="text-slate-500 text-sm mt-0.5">Require 2FA for all admin users</p>
                        </div>
                        <Toggle
                            active={securityConfig.twoFactorAuth}
                            onToggle={() => toggleSetting('twoFactorAuth')}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-slate-800">Session Timeout</h3>
                            <p className="text-slate-500 text-sm mt-0.5">Auto logout after inactivity</p>
                        </div>
                        <Toggle
                            active={securityConfig.sessionTimeout}
                            onToggle={() => toggleSetting('sessionTimeout')}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700">Session Duration (hours)</label>
                        <input
                            type="number"
                            value={securityConfig.sessionDuration}
                            onChange={(e) => handleInputChange('sessionDuration', e.target.value)}
                            disabled={isReadOnly}
                            className="w-full sm:w-96 p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium"
                        />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-slate-800">Login Alerts</h3>
                            <p className="text-slate-500 text-sm mt-0.5">Notify on new device logins</p>
                        </div>
                        <Toggle
                            active={securityConfig.loginAlerts}
                            onToggle={() => toggleSetting('loginAlerts')}
                        />
                    </div>
                </div>
            </div>

            {/* Footer Save Button */}
            <div className="flex justify-end pt-6 pb-10">
                <button
                    onClick={handleSave}
                    disabled={saving || isReadOnly}
                    className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-primary to-primary text-white font-black rounded-xl shadow-xl shadow-primary/30/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {saving ? <Loader size={20} className="animate-spin" /> : <Save size={20} />}
                    {saving ? 'Saving Security Policy...' : 'Save Security Policy'}
                </button>
            </div>
        </div>
    );
};

export default SecuritySettings;
