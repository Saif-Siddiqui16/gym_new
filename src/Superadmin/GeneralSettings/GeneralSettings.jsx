import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Building2, Mail, Phone, MapPin, DollarSign, Sparkles, Server } from 'lucide-react';
import { fetchGlobalSettings, updateGlobalSettings } from '../../api/superadmin/superAdminApi';
import { toast } from 'react-hot-toast';

const GeneralSettings = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        orgName: '',
        address: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await fetchGlobalSettings();
            setFormData({
                orgName: data.siteName,
                address: data.contactAddress,
                email: data.supportEmail,
                phone: data.contactPhone
            });
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateGlobalSettings({
                siteName: formData.orgName,
                contactAddress: formData.address,
                supportEmail: formData.email,
                contactPhone: formData.phone
            });
            toast.success('Settings updated successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="w-full animate-fadeIn">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">General Settings</h1>
                    <p className="page-subtitle">Manage your organization's core profile information</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary"
                >
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>

            {/* Main Form Card */}
            <div className="saas-card">
                <div className="space-y-6">
                    {/* Organization Name */}
                    <div>
                        <label htmlFor="orgName">
                            Organization Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                                <Building2 size={18} />
                            </div>
                            <input
                                type="text"
                                id="orgName"
                                name="orgName"
                                className="w-full pl-12"
                                value={formData.orgName}
                                onChange={handleChange}
                                placeholder="Enter organization name"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label htmlFor="address">
                            Address
                        </label>
                        <div className="relative">
                            <div className="absolute top-3 left-4 pointer-events-none text-muted-foreground">
                                <MapPin size={18} />
                            </div>
                            <textarea
                                id="address"
                                name="address"
                                rows="3"
                                className="w-full pl-12 resize-none"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter full address"
                            />
                        </div>
                    </div>

                    {/* Email & Phone Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Contact Email */}
                        <div>
                            <label htmlFor="email">
                                Contact Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="w-full pl-12"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="support@example.com"
                                />
                            </div>
                        </div>

                        {/* Contact Phone */}
                        <div>
                            <label htmlFor="phone">
                                Contact Phone
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                                    <Phone size={18} />
                                </div>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className="w-full pl-12"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 00000 00000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Configuration Links */}
                    <div className="pt-6 border-t border-border">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Quick Configuration</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button
                                onClick={() => navigate('/superadmin/general-settings/booking')}
                                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-primary-light hover:border-primary/30 transition-colors"
                            >
                                <div className="p-2 rounded-lg bg-primary-light text-primary">
                                    <Sparkles size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-semibold text-title">Booking Rules</div>
                                    <div className="text-xs text-muted-foreground">Limits & Credits</div>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/superadmin/general-settings/invoice')}
                                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-primary-light hover:border-primary/30 transition-colors"
                            >
                                <div className="p-2 rounded-lg bg-primary-light text-primary">
                                    <DollarSign size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-semibold text-title">Invoice Settings</div>
                                    <div className="text-xs text-muted-foreground">GST & Tax Info</div>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/superadmin/general-settings/hardware')}
                                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-primary-light hover:border-primary/30 transition-colors"
                            >
                                <div className="p-2 rounded-lg bg-primary-light text-primary">
                                    <Server size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-semibold text-title">SmartAIoT Settings</div>
                                    <div className="text-xs text-muted-foreground">MIPS & SDK Config</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralSettings;
