import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ROLES } from '../../config/roles';
import { useNavigate } from 'react-router-dom';
import { Save, FileText, Loader2, Receipt, Hash, Percent, Eye, ArrowLeft } from 'lucide-react';
import { fetchInvoiceSettings, updateInvoiceSettings } from '../../api/superadmin/superAdminApi';
import CustomDropdown from '../../components/common/CustomDropdown';
import BranchScopeSelector from '../../components/common/BranchScopeSelector';
import { BRANCHES } from '../../modules/settings/data/mockSettingsData';

const InvoiceSettings = () => {
    const navigate = useNavigate();
    const context = useOutletContext();
    const role = context?.role;
    const isReadOnly = role === ROLES.MANAGER;
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [formData, setFormData] = useState({
        prefix: 'INV-',
        startNumber: '1001',
        gstPercent: '18'
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const data = await fetchInvoiceSettings();
            setFormData(data);
        } catch (error) {
            console.error('Error fetching invoice settings:', error);
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
        setIsSaving(true);
        try {
            await updateInvoiceSettings(formData);
            alert('Invoice settings updated successfully!');
        } catch (error) {
            console.error('Error saving invoice settings:', error);
            alert('Failed to save invoice settings.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-violet-600 mb-4" size={48} />
                    <span className="text-lg font-semibold text-slate-600">Loading settings...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6 flex flex-col items-center">
            {/* Page Header - Back Button */}
            <div className="w-full max-w-6xl mb-6">
                <button
                    onClick={() => navigate('/superadmin/general-settings/general')}
                    className="group flex items-center text-slate-500 hover:text-violet-600 transition-all duration-300 hover:scale-105"
                >
                    <div className="p-1 rounded-full group-hover:bg-violet-50 transition-all duration-300 mr-2 group-hover:scale-110">
                        <ArrowLeft size={20} className="transition-transform duration-300 group-hover:-translate-x-1" />
                    </div>
                    <span className="font-semibold">Back to Settings</span>
                </button>
            </div>
            {/* Premium Header with Gradient */}
            <div className="max-w-6xl mx-auto mb-6 sm:mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                            <Receipt size={24} className="sm:w-7 sm:h-7" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                Invoice Settings
                            </h1>
                            <p className="text-slate-600 text-xs sm:text-sm mt-0.5 sm:mt-1">Configure invoice numbering and tax details</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto w-full px-4 mb-6">
                <BranchScopeSelector
                    value={selectedBranch}
                    onChange={setSelectedBranch}
                    branches={BRANCHES}
                />
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Settings Form */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-100">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-violet-600 shadow-md transition-all duration-300 hover:scale-110 hover:rotate-6">
                            <FileText size={20} className="sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Configuration</h2>
                                {isReadOnly && (
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold rounded border border-slate-200 uppercase tracking-wide">
                                        Read-Only 🔒
                                    </span>
                                )}
                            </div>
                            <p className="text-xs sm:text-sm text-slate-500">
                                {isReadOnly ? 'View invoice numbering and tax details.' : 'Set up invoice numbering and tax details'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-5 sm:space-y-6">
                        {/* Invoice Prefix */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 sm:mb-3" htmlFor="prefix">
                                Invoice Prefix
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 group-focus-within:scale-110 transition-all duration-300">
                                    <Hash size={18} className="sm:w-5 sm:h-5" />
                                </div>
                                <input
                                    type="text"
                                    id="prefix"
                                    name="prefix"
                                    className={`block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 transition-all duration-300 shadow-sm focus:shadow-lg ${isReadOnly ? 'cursor-not-allowed bg-slate-50 text-slate-500' : ''}`}
                                    value={formData.prefix}
                                    onChange={handleChange}
                                    placeholder="e.g. INV-"
                                    disabled={isReadOnly}
                                />
                            </div>
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 sm:mt-2 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block"></span>
                                Prefix for all generated invoice numbers
                            </p>
                        </div>

                        {/* Starting Number */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 sm:mb-3" htmlFor="startNumber">
                                Starting Number
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 group-focus-within:scale-110 transition-all duration-300">
                                    <Hash size={18} className="sm:w-5 sm:h-5" />
                                </div>
                                <input
                                    type="number"
                                    id="startNumber"
                                    name="startNumber"
                                    className={`block w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 hover:border-slate-300 transition-all duration-300 shadow-sm focus:shadow-lg ${isReadOnly ? 'cursor-not-allowed bg-slate-50 text-slate-500' : ''}`}
                                    value={formData.startNumber}
                                    onChange={handleChange}
                                    placeholder="e.g. 1001"
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>

                        {/* Tax Settings */}
                        <div>
                            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2 sm:mb-3" htmlFor="gstPercent">
                                Tax Settings (GST %)
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-600 group-focus-within:scale-110 transition-all duration-300 z-10">
                                    <Percent size={18} className="sm:w-5 sm:h-5" />
                                </div>
                                <CustomDropdown
                                    options={[
                                        { value: '0', label: '0% (Tax Exempt)' },
                                        { value: '5', label: '5%' },
                                        { value: '12', label: '12%' },
                                        { value: '18', label: '18% (Standard)' },
                                        { value: '28', label: '28%' }
                                    ]}
                                    value={formData.gstPercent}
                                    onChange={(val) => handleChange({ target: { name: 'gstPercent', value: val } })}
                                    className={`w-full pl-10 sm:pl-12 ${isReadOnly ? 'cursor-not-allowed bg-slate-50 text-slate-500' : ''}`}
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-100">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isReadOnly}
                            className="group relative flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-full md:w-auto bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-violet-500/50"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin relative mr-2" />
                            ) : (
                                <Save className="w-4 h-4 sm:w-5 sm:h-5 relative mr-2 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                            )}
                            <span className="relative">{isSaving ? 'Saving...' : 'Save Configuration'}</span>
                        </button>
                    </div>
                </div>

                {/* Template Preview */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-600 shadow-md transition-all duration-300 hover:scale-110 hover:rotate-6">
                                <Eye size={16} className="sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2">
                                    Live Preview
                                    <span className="text-[9px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
                                        Updated
                                    </span>
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Preview Card */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-slate-200 shadow-inner">
                        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-4 sm:mb-6">
                                <div className="text-left">
                                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                                            <span className="text-white font-bold text-xs sm:text-sm">G</span>
                                        </div>
                                        <span className="font-bold text-slate-800 text-base sm:text-lg">GymName</span>
                                    </div>
                                    <div className="h-1.5 sm:h-2 w-24 sm:w-32 bg-slate-200 rounded mb-1 sm:mb-1.5"></div>
                                    <div className="h-1.5 sm:h-2 w-20 sm:w-24 bg-slate-200 rounded"></div>
                                </div>
                                <div className="text-left sm:text-right w-full sm:w-auto">
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-300 tracking-wider">INVOICE</h3>
                                    <p className="font-mono text-xs sm:text-sm text-violet-600 font-bold mt-1.5 sm:mt-2 bg-violet-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-violet-200 inline-block">
                                        #{formData.prefix}{formData.startNumber}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex justify-between border-b border-slate-100 pb-2 sm:pb-3 hover:bg-slate-50 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded transition-colors">
                                    <span className="text-xs sm:text-sm text-slate-500 font-semibold">Date Issued</span>
                                    <span className="text-xs sm:text-sm font-bold text-slate-700">{new Date().toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-2 sm:pb-3 hover:bg-slate-50 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded transition-colors">
                                    <span className="text-xs sm:text-sm text-slate-500 font-semibold">Total Amount</span>
                                    <span className="text-xs sm:text-sm font-black text-slate-900">₹0.00</span>
                                </div>
                                <div className="flex justify-between pt-1 sm:pt-2 hover:bg-slate-50 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded transition-colors">
                                    <span className="text-xs sm:text-sm text-slate-500 font-semibold">Tax ({formData.gstPercent}%)</span>
                                    <span className="text-xs sm:text-sm font-bold text-emerald-600">Included</span>
                                </div>
                            </div>

                            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-100 text-center">
                                <p className="text-[10px] sm:text-xs text-slate-600 font-semibold">This is how your invoice header will look to customers.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceSettings;
