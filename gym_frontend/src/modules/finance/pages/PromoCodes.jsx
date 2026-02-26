import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react';
import { promoApi } from '../../../api/promoApi';
import toast from 'react-hot-toast';

const PromoCodes = () => {
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        type: 'PERCENTAGE',
        value: '',
        usageLimit: '',
        expiryDate: '',
        status: 'Active'
    });

    const fetchPromos = async () => {
        try {
            const data = await promoApi.getAllPromos();
            setPromos(data);
        } catch (error) {
            toast.error(error.message || "Failed to fetch promos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromos();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (promo) => {
        setFormData({
            ...promo,
            expiryDate: promo.expiryDate ? promo.expiryDate.split('T')[0] : '',
        });
        setEditingId(promo.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this promo code?")) return;
        try {
            await promoApi.deletePromo(id);
            toast.success("Promo deleted successfully");
            fetchPromos();
        } catch (error) {
            toast.error(error.message || "Failed to delete promo");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await promoApi.updatePromo(editingId, formData);
                toast.success("Promo updated successfully");
            } else {
                await promoApi.createPromo(formData);
                toast.success("Promo created successfully");
            }
            setShowModal(false);
            setEditingId(null);
            setFormData({ code: '', type: 'PERCENTAGE', value: '', usageLimit: '', expiryDate: '', status: 'Active' });
            fetchPromos();
        } catch (error) {
            toast.error(error.message || "Failed to save promo");
        }
    };

    const filteredPromos = promos.filter(p => !search || p.code.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-4 sm:p-6 pb-12">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Promo Codes</h1>
                    <p className="text-sm text-slate-500">Manage discounts and rewards</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ code: '', type: 'PERCENTAGE', value: '', usageLimit: '', expiryDate: '', status: 'Active' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
                >
                    <Plus size={16} /> Create Promo
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="p-4 border-b border-slate-200">
                    <div className="relative max-w-sm">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by code..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500/20"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">CODE</th>
                                <th className="px-6 py-4">DISCOUNT</th>
                                <th className="px-6 py-4">USAGE LIMIT</th>
                                <th className="px-6 py-4">USED</th>
                                <th className="px-6 py-4">STATUS</th>
                                <th className="px-6 py-4">EXPIRY</th>
                                <th className="px-6 py-4">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-slate-500">Loading...</td>
                                </tr>
                            ) : filteredPromos.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-slate-500">No promo codes found</td>
                                </tr>
                            ) : (
                                filteredPromos.map(promo => (
                                    <tr key={promo.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="px-6 py-4 font-bold text-slate-900">{promo.code}</td>
                                        <td className="px-6 py-4">
                                            {promo.type === 'PERCENTAGE' ? `${promo.value}%` : `₹${promo.value}`} OFF
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{promo.usageLimit || 'Unlimited'}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">{promo.usedCount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${promo.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {promo.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                {promo.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {promo.expiryDate ? promo.expiryDate.split('T')[0].split('-').reverse().join('/') : 'Never'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-3">
                                                <button onClick={() => handleEdit(promo)} className="text-indigo-600 hover:text-indigo-800">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(promo.id)} className="text-rose-600 hover:text-rose-800">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Promo' : 'New Promo Code'}</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Code / Name</label>
                                <input required type="text" name="code" value={formData.code} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500" placeholder="e.g. SUMMER25" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                                    <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FLAT">Flat Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Discount Value</label>
                                    <input required type="number" min="0" step="0.01" name="value" value={formData.value} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="10" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Max Limits</label>
                                    <input type="number" min="1" name="usageLimit" value={formData.usageLimit} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g. 100" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">Expiry Date</label>
                                    <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg font-semibold hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700">Save Promo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromoCodes;
