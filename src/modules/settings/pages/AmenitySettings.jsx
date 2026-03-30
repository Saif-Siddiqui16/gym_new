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
    Check,
    MapPin
} from 'lucide-react';
import amenityApi from '../../../api/amenityApi';
import { toast } from 'react-hot-toast';
import { useBranchContext } from '../../../context/BranchContext';
import RightDrawer from '../../../components/common/RightDrawer';
import Button from '../../../components/ui/Button';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

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
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

    const { selectedBranch } = useBranchContext();

    useEffect(() => {
        fetchAmenities();
    }, [selectedBranch]);

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

    const handleDelete = (id) => {
        setConfirmModal({ isOpen: true, id, loading: false });
    };

    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await amenityApi.delete(confirmModal.id);
            toast.success('Amenity deleted successfully');
            setConfirmModal({ isOpen: false, id: null, loading: false });
            fetchAmenities();
        } catch (error) {
            toast.error(error);
            setConfirmModal(prev => ({ ...prev, loading: false }));
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
        <div className="min-h-full bg-slate-50/50 p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Layers className="text-primary" size={28} />
                        Amenity Management
                    </h1>
                    <p className="text-slate-500 text-sm font-medium">Create and manage facilities available at your gym</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    variant="primary"
                    icon={Plus}
                    className="px-6 h-11 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all transform active:scale-95"
                >
                    Add Amenity
                </Button>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search amenities..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                    {filteredAmenities.map((amenity) => (
                        <div
                            key={amenity.id}
                            className="group relative bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:border-violet-200 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-primary-light text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                    {getIcon(amenity.icon)}
                                </div>
                                <div className="flex items-center gap-2 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(amenity)}
                                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary-light rounded-lg transition-all"
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
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${amenity.gender === 'MALE' ? 'bg-primary-light text-primary' :
                                    amenity.gender === 'FEMALE' ? 'bg-pink-50 text-pink-600' :
                                        'bg-purple-50 text-primary'
                                    }`}>
                                    {amenity.gender === 'MALE' ? '♂ MALE' : amenity.gender === 'FEMALE' ? '♀ FEMALE' : '⚧ UNISEX'}
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase truncate max-w-[120px]">
                                    <MapPin size={10} />
                                    {amenity.tenant?.name || 'Local Branch'}
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
                    <Button
                        onClick={() => handleOpenModal()}
                        variant="primary"
                        className="px-8 h-11 rounded-xl"
                    >
                        Create Now
                    </Button>
                </div>
            )}

            {/* Amenity Drawer */}
            <RightDrawer
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingAmenity ? 'Edit Amenity' : 'New Amenity'}
                subtitle={editingAmenity ? 'Update facility details and visibility' : 'Create a new facility for your gym'}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleSubmit} className="space-y-6 pb-10">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Amenity Name</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Luxury Sauna"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Description</label>
                        <textarea
                            rows="3"
                            placeholder="Brief details about the facility..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Choose Icon</label>
                        <div className="grid grid-cols-4 gap-2">
                            {ICON_OPTIONS.map((opt) => (
                                <button
                                    key={opt.name}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon: opt.name })}
                                    className={`p-3 rounded-xl flex items-center justify-center transition-all ${formData.icon === opt.name
                                        ? 'bg-primary text-white shadow-lg shadow-violet-200 ring-2 ring-primary ring-offset-2'
                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                        }`}
                                >
                                    <opt.icon size={20} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Gender Scope</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold appearance-none"
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            >
                                <option value="UNISEX">Unisex</option>
                                <option value="MALE">Male Only</option>
                                <option value="FEMALE">Female Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Status</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold appearance-none"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 h-12 rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            icon={Save}
                            className="flex-1 h-12 rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all transform active:scale-95"
                        >
                            {editingAmenity ? 'Save Changes' : 'Create Amenity'}
                        </Button>
                    </div>
                </form>
            </RightDrawer>
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
                onConfirm={processDelete}
                title="Delete Amenity?"
                message="This facility will be permanently removed from your gym."
                confirmText="Delete"
                type="danger"
                loading={confirmModal.loading}
            />
        </div>
    );
};

export default AmenitySettings;
