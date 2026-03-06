import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Building2, Mail, Phone, MapPin, ArrowLeft, Globe, DollarSign, Sparkles } from 'lucide-react';
import { fetchGlobalSettings, updateGlobalSettings } from '../../api/superadmin/superAdminApi';

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
            alert('Settings updated successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-16 w-16 bg-gradient-to-br from-violet-200 to-purple-200 rounded-full mb-4 animate-spin"></div>
                    <div className="h-4 w-48 bg-slate-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
            {/* Page Header - Back Button */}
            <div className="w-full max-w-4xl mb-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="group flex items-center text-slate-500 hover:text-violet-600 transition-all duration-300 hover:scale-105"
                >
                    <div className="p-1 rounded-full group-hover:bg-violet-50 transition-all duration-300 mr-2 group-hover:scale-110">
                        <ArrowLeft size={20} className="transition-transform duration-300 group-hover:-translate-x-1" />
                    </div>
                    <span className="font-semibold">Back to Dashboard</span>
                </button>
            </div>

            {/* Premium Header with Gradient */}
            <div className="w-full max-w-4xl mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                            <Building2 size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                General Settings
                            </h1>
                            <p className="text-slate-600 text-sm mt-1">Manage your organization's core profile information</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Form Card */}
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
                <div className="p-8 sm:p-10 space-y-8">
                    {/* Organization Name */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3" htmlFor="orgName">
                            Organization Name
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 group-focus-within:scale-110 transition-all duration-300">
                                <Building2 size={20} />
                            </div>
                            <input
                                type="text"
                                id="orgName"
                                name="orgName"
                                className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 transition-all duration-300 shadow-sm focus:shadow-lg"
                                value={formData.orgName}
                                onChange={handleChange}
                                placeholder="Enter organization name"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3" htmlFor="address">
                            Address
                        </label>
                        <div className="relative group">
                            <div className="absolute top-3.5 left-4 flex items-start pointer-events-none text-slate-400 group-focus-within:text-violet-600 group-focus-within:scale-110 transition-all duration-300">
                                <MapPin size={20} />
                            </div>
                            <textarea
                                id="address"
                                name="address"
                                rows="3"
                                className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 transition-all duration-300 shadow-sm resize-none focus:shadow-lg"
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
                            <label className="block text-sm font-bold text-slate-700 mb-3" htmlFor="email">
                                Contact Email
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 group-focus-within:scale-110 transition-all duration-300">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 transition-all duration-300 shadow-sm focus:shadow-lg"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="support@example.com"
                                />
                            </div>
                        </div>

                        {/* Contact Phone */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-3" htmlFor="phone">
                                Contact Phone
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 group-focus-within:scale-110 transition-all duration-300">
                                    <Phone size={20} />
                                </div>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className="block w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 transition-all duration-300 shadow-sm focus:shadow-lg"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 00000 00000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Configuration Links */}
                    {/* <div className="pt-8 border-t border-slate-100">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">Quick Configuration</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button
                                onClick={() => navigate('/superadmin/general-settings/booking')}
                                className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 hover:border-violet-200 hover:bg-violet-50 transition-all group"
                            >
                                <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-violet-600 transition-colors">
                                    <Sparkles size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-slate-700 group-hover:text-violet-700">Booking Rules</div>
                                    <div className="text-[10px] text-slate-500">Limits & Credits</div>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/superadmin/general-settings/invoice')}
                                className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 hover:border-violet-200 hover:bg-violet-50 transition-all group"
                            >
                                <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-violet-600 transition-colors">
                                    <DollarSign size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-slate-700 group-hover:text-violet-700">Invoice Settings</div>
                                    <div className="text-[10px] text-slate-500">GST & Tax Info</div>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/superadmin/general-settings/hardware')}
                                className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-100 hover:border-violet-200 hover:bg-violet-50 transition-all group"
                            >
                                <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-violet-600 transition-colors">
                                    <Building2 size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-slate-700 group-hover:text-violet-700">Hardware Info</div>
                                    <div className="text-[10px] text-slate-500">Biometric & RFID</div>
                                </div>
                            </button>
                        </div>
                    </div> */}

                    {/* Save Button */}
                    <div className="flex justify-end pt-6 border-t border-slate-100">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="group relative flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full sm:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-violet-500/50"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Save size={20} className="mr-2 relative transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                            <span className="relative">{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralSettings;
