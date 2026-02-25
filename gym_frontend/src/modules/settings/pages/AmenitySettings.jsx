import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Wifi,
    Zap,
    Shield,
    Coffee,
    Music,
    Car,
    Tv,
    Bath,
    Wind,
    Waves,
    Dumbbell,
    Layers,
    Save,
    X,
    MoreVertical,
    Check
} from 'lucide-react';
import amenityApi from '../../../api/amenityApi';
import { toast } from 'react-hot-toast';

const ICON_OPTIONS = [
    { name: 'Wifi', icon: Wifi },
    { name: 'Zap', icon: Zap },
    { name: 'Shield', icon: Shield },
    { name: 'Coffee', icon: Coffee },
    { name: 'Music', icon: Music },
    { name: 'Car', icon: Car },
    { name: 'Tv', icon: Tv },
    { name: 'Bath', icon: Bath },
    { name: 'Wind', icon: Wind },
    { name: 'Waves', icon: Waves },
    { name: 'Dumbbell', icon: Dumbbell },
    { name: 'Layers', icon: Layers }
];

const AmenitySettings = () => {
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'Layers',
        status: 'Active',
        gender: 'UNISEX'
    });

    useEffect(() => {
        fetchAmenities();
    }, []);

    const fetchAmenities = async () => {
        try {
            setLoading(true);
            const data = await amenityApi.getAll();
            setAmenities(data);
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (amenity = null) => {
        if (amenity) {
            setEditingAmenity(amenity);
            setFormData({
                name: amenity.name,
                description: amenity.description || '',
                icon: amenity.icon || 'Layers',
                status: amenity.status || 'Active',
                gender: amenity.gender || 'UNISEX'
            });
        } else {
            setEditingAmenity(null);
            setFormData({
                name: '',
                description: '',
                icon: 'Layers',
                status: 'Active',
                gender: 'UNISEX'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAmenity) {
                await amenityApi.update(editingAmenity.id, formData);
                toast.success('Amenity updated successfully');
            } else {
                await amenityApi.create(formData);
                toast.success('Amenity created successfully');
            }
            setIsModalOpen(false);
            fetchAmenities();
        } catch (error) {
            toast.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this amenity?')) {
            try {
                await amenityApi.delete(id);
                toast.success('Amenity deleted successfully');
                fetchAmenities();
            } catch (error) {
                toast.error(error);
            }
        }
    };

    const filteredAmenities = amenities.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getIcon = (iconName) => {
        const option = ICON_OPTIONS.find(o => o.name === iconName);
        const IconComponent = option ? option.icon : Layers;
        return <IconComponent size={20} />;
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Layers className="text-violet-600" size={28} />
                        Amenity Management
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Create and manage facilities available at your gym</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={20} />
                    Add New Amenity
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search amenities..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-white rounded-2xl border border-slate-100 animate-pulse"></div>
                    ))}
                </div>
            ) : filteredAmenities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAmenities.map((amenity) => (
                        <div
                            key={amenity.id}
                            className="group relative bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-violet-200 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-violet-50 text-violet-600 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                                    {getIcon(amenity.icon)}
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(amenity)}
                                        className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(amenity.id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-1">{amenity.name}</h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{amenity.description || 'No description provided'}</p>

                            <div className="flex items-center justify-between mt-auto gap-2 flex-wrap">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${amenity.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {amenity.status}
                                </span>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${amenity.gender === 'MALE' ? 'bg-blue-50 text-blue-600' :
                                    amenity.gender === 'FEMALE' ? 'bg-pink-50 text-pink-600' :
                                        'bg-purple-50 text-purple-600'
                                    }`}>
                                    {amenity.gender === 'MALE' ? '♂ MALE' : amenity.gender === 'FEMALE' ? '♀ FEMALE' : '⚧ UNISEX'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">
                                    Gym Scope 📍
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Layers size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">No amenities found</h3>
                    <p className="text-slate-500 mt-1 mb-6">Start by adding your first gym facility</p>
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all"
                    >
                        Create Now
                    </button>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                            <h2 className="text-xl font-black text-slate-800">
                                {editingAmenity ? 'Edit Amenity' : 'New Amenity'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Amenity Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Luxury Sauna"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-bold"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Description</label>
                                <textarea
                                    rows="3"
                                    placeholder="Brief details about the facility..."
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Choose Icon</label>
                                <div className="grid grid-cols-6 gap-2">
                                    {ICON_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.name}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: opt.name })}
                                            className={`p-3 rounded-xl flex items-center justify-center transition-all ${formData.icon === opt.name
                                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 ring-2 ring-violet-600 ring-offset-2'
                                                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                                }`}
                                        >
                                            <opt.icon size={20} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Gender Scope</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-bold appearance-none"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                    >
                                        <option value="UNISEX">Unisex</option>
                                        <option value="MALE">Male Only</option>
                                        <option value="FEMALE">Female Only</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Status</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-bold appearance-none"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-violet-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-violet-700 shadow-lg shadow-violet-200 transition-all"
                                >
                                    <Save size={18} />
                                    {editingAmenity ? 'Save Changes' : 'Create Amenity'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AmenitySettings;
