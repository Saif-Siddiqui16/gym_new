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
    Check,
    MapPin,
    Clock,
    User,
    Minus,
    CreditCard,
    Save,
    X,
    MoreVertical,
    Users,
    Eye,
    ToggleLeft,
    ToggleRight,
    CalendarDays,
    Info
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
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState(null);
    const [selectedAmenityView, setSelectedAmenityView] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'Layers',
        status: 'Active',
        gender: 'UNISEX',
        slotEnabled: false,
        extraPrice: 0,
        slots: []
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
                name: amenity.name || '',
                description: amenity.description || '',
                icon: amenity.icon || 'Layers',
                gender: amenity.gender || 'UNISEX',
                status: amenity.status || 'Active',
                slotEnabled: amenity.slotEnabled || false,
                extraPrice: amenity.extraPrice || '0',
                slots: amenity.slots || []
            });
        } else {
            setEditingAmenity(null);
            setFormData({
                name: '',
                description: '',
                icon: 'Layers',
                gender: 'UNISEX',
                status: 'Active',
                slotEnabled: false,
                extraPrice: '0',
                slots: []
            });
        }
        setIsModalOpen(true);
    };

    const handleViewAmenity = (amenity) => {
        setSelectedAmenityView(amenity);
        setIsViewDrawerOpen(true);
    };

    const addSlot = () => {
        setFormData(prev => ({
            ...prev,
            slots: [...prev.slots, { startTime: '06:00', endTime: '07:00', capacity: 5 }]
        }));
    };

    const removeSlot = (index) => {
        setFormData(prev => ({
            ...prev,
            slots: prev.slots.filter((_, i) => i !== index)
        }));
    };

    const updateSlot = (index, field, value) => {
        setFormData(prev => {
            const newSlots = [...prev.slots];
            const slot = { ...newSlots[index] };

            if (field === 'startTime' || field === 'endTime') {
                slot[field] = value;
            } else if (field === 'startAMPM' || field === 'endAMPM') {
                const timeField = field === 'startAMPM' ? 'startTime' : 'endTime';
                let [hh, mm] = (slot[timeField] || '06:00').split(':');
                let hour = parseInt(hh);

                if (value === 'PM' && hour < 12) hour += 12;
                if (value === 'AM' && hour >= 12) hour -= 12;

                const finalHH = hour.toString().padStart(2, '0');
                slot[timeField] = `${finalHH}:${mm}`;
            } else {
                slot[field] = value;
            }

            newSlots[index] = slot;
            return { ...prev, slots: newSlots };
        });
    };

    const getAMPM = (timeStr) => {
        if (!timeStr) return 'AM';
        const hour = parseInt(timeStr.split(':')[0]);
        return hour >= 12 ? 'PM' : 'AM';
    };

    const get12Hour = (timeStr) => {
        if (!timeStr) return '06:00';
        let [hh, mm] = timeStr.split(':');
        let hour = parseInt(hh) % 12;
        hour = hour ? hour : 12;
        return `${hour.toString().padStart(2, '0')}:${mm}`;
    };

    const formatTime12 = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        let hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12;
        return `${hour}:${minutes} ${ampm}`;
    };

    const handle12HourChange = (index, field, newValue) => {
        const ampm = getAMPM(formData.slots[index][field]);
        let [hh, mm] = newValue.split(':');
        let hour = parseInt(hh);

        if (ampm === 'PM' && hour < 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;

        const finalHH = hour.toString().padStart(2, '0');
        updateSlot(index, field, `${finalHH}:${mm}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.slotEnabled && formData.slots.length === 0) {
            toast.error('Please add at least one time slot or disable slot booking');
            return;
        }

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
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                    <button
                                        onClick={() => handleViewAmenity(amenity)}
                                        className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all shadow-sm hover:shadow active:scale-95"
                                        title="View Details"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleOpenModal(amenity)}
                                        className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl transition-all shadow-sm hover:shadow active:scale-95"
                                        title="Edit Facility"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => setConfirmModal({ isOpen: true, id: amenity.id, loading: false })}
                                        className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-all shadow-sm hover:shadow active:scale-95"
                                        title="Delete Facility"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-1">{amenity.name}</h3>
                            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{amenity.description || 'No description provided'}</p>

                            {/* Slot Info Badge */}
                            <div className="flex items-center gap-2 mb-4">
                                {amenity.slotEnabled ? (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600">
                                        <Clock size={10} />
                                        {amenity.slots?.length || 0} Slots
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-400">
                                        <CalendarDays size={10} />
                                        Walk-in
                                    </span>
                                )}
                                {amenity.extraPrice > 0 && (
                                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600">
                                        <CreditCard size={10} />
                                        ₹{amenity.extraPrice}
                                    </span>
                                )}
                            </div>

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

            {/* Amenity Create/Edit Drawer */}
            <RightDrawer
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingAmenity ? 'Edit Amenity' : 'New Amenity'}
                subtitle={editingAmenity ? 'Update facility details and slot configuration' : 'Create a new facility with booking slots'}
                maxWidth="max-w-lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6 pb-10">
                    {/* Step 1: Basic Info */}
                    <div className="space-y-1 px-1">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">1</div>
                            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Basic Information</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Amenity Name</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Luxury Sauna, Steam Room, Spa"
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
                        <div className="grid grid-cols-6 gap-2">
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

                    {/* Step 2: Slot Configuration */}
                    <div className="pt-6 border-t border-slate-100">
                        <div className="space-y-1 px-1 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">2</div>
                                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Slot Configuration</span>
                            </div>
                        </div>

                        {/* Slot Enable Toggle */}
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-800">Enable Time Slots</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {formData.slotEnabled
                                                ? 'Members will book specific time slots'
                                                : 'Members can book anytime (walk-in style)'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, slotEnabled: !formData.slotEnabled })}
                                    className={`w-14 h-7 rounded-full transition-all duration-300 relative flex-shrink-0 ${formData.slotEnabled ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-slate-200'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${formData.slotEnabled ? 'left-8' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>

                        {!formData.slotEnabled && (
                            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start gap-3">
                                <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-relaxed">
                                    Walk-in mode: Members can book this amenity for any date without selecting a specific time. Enable time slots to let members pick a specific session time with capacity limits.
                                </p>
                            </div>
                        )}

                        {formData.slotEnabled && (
                            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                {/* Extra Price */}
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Extra Usage Price (₹)</label>
                                    <div className="relative">
                                        <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            placeholder="e.g. 200"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold"
                                            value={formData.extraPrice}
                                            onChange={(e) => setFormData({ ...formData, extraPrice: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-[9px] text-slate-400 mt-1 ml-1 uppercase font-bold tracking-widest">Charged when member exceeds their plan's monthly limit</p>
                                </div>

                                {/* Time Slots */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black text-slate-800 uppercase tracking-widest">
                                            Time Slots ({formData.slots.length})
                                        </label>
                                        <Button
                                            type="button"
                                            onClick={addSlot}
                                            variant="outline"
                                            icon={Plus}
                                            className="h-9 rounded-xl text-[10px] border-slate-200 hover:border-primary px-4 bg-white hover:bg-primary-light transition-all"
                                        >
                                            Add Slot
                                        </Button>
                                    </div>

                                    {formData.slots.length === 0 && (
                                        <div className="text-center py-10 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
                                            <CalendarDays size={32} className="text-slate-200 mx-auto mb-3" />
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">No Slots Added</p>
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4">Add time slots so members can book sessions</p>
                                            <Button
                                                type="button"
                                                onClick={addSlot}
                                                variant="primary"
                                                icon={Plus}
                                                className="h-9 rounded-xl text-[10px] px-6 mx-auto"
                                            >
                                                Add First Slot
                                            </Button>
                                        </div>
                                    )}

                                    {formData.slots.map((slot, index) => (
                                        <div key={index} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-primary/20 hover:shadow-lg transition-all animate-in slide-in-from-right-1 duration-300">
                                            {/* Slot Number */}
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded-lg">
                                                    Slot {index + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeSlot(index)}
                                                    className="flex items-center gap-1 px-3 py-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-all font-black text-[10px] uppercase tracking-widest"
                                                >
                                                    <Trash2 size={12} />
                                                    Remove
                                                </button>
                                            </div>

                                            {/* Time Range */}
                                            <div className="flex items-end gap-2 mb-4">
                                                <div className="flex-1 space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                                                    <div className="relative">
                                                        <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" />
                                                        <input
                                                            type="time"
                                                            className="w-full pl-9 pr-2 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none"
                                                            value={slot.startTime}
                                                            onChange={(e) => updateSlot(index, 'startTime', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-slate-300 font-bold pb-3">→</span>
                                                <div className="flex-1 space-y-1.5">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Time</label>
                                                    <div className="relative">
                                                        <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" />
                                                        <input
                                                            type="time"
                                                            className="w-full pl-9 pr-2 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none"
                                                            value={slot.endTime}
                                                            onChange={(e) => updateSlot(index, 'endTime', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Capacity */}
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Capacity (members per slot)</label>
                                                <div className="relative w-40">
                                                    <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none"
                                                        value={slot.capacity}
                                                        onChange={(e) => updateSlot(index, 'capacity', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
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

            {/* View Details Drawer */}
            <RightDrawer
                isOpen={isViewDrawerOpen}
                onClose={() => setIsViewDrawerOpen(false)}
                title="Facility Details"
                subtitle="Overview of configuration and availability"
                maxWidth="max-w-md"
            >
                {selectedAmenityView && (
                    <div className="space-y-8 pb-10">
                        {/* Header Info */}
                        <div className="flex items-center gap-6 p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                            <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                                {getIcon(selectedAmenityView.icon)}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest leading-tight mb-1">{selectedAmenityView.name}</h3>
                                <div className="flex gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${selectedAmenityView.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {selectedAmenityView.status}
                                    </span>
                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-wider">
                                        {selectedAmenityView.gender}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${selectedAmenityView.slotEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                        {selectedAmenityView.slotEnabled ? 'Slot Booking' : 'Walk-in'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">About Facility</label>
                            <p className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-600 font-medium leading-relaxed italic pr-8">
                                {selectedAmenityView.description || 'No description provided for this facility.'}
                            </p>
                        </div>

                        {/* Usage Info */}
                        {selectedAmenityView.slotEnabled && (
                            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CreditCard size={18} className="text-amber-600" />
                                    <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Extra Session Price</span>
                                </div>
                                <span className="text-lg font-black text-amber-600">₹{selectedAmenityView.extraPrice}</span>
                            </div>
                        )}

                        {/* Time Slots */}
                        <div>
                            <div className="flex items-center justify-between mb-4 px-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {selectedAmenityView.slotEnabled ? 'Configured Time Slots' : 'Booking Mode'}
                                </label>
                                {selectedAmenityView.slotEnabled && (
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">
                                        {selectedAmenityView.slots?.length || 0} Slots
                                    </span>
                                )}
                            </div>

                            {!selectedAmenityView.slotEnabled ? (
                                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl text-center">
                                    <CalendarDays size={32} className="text-blue-300 mx-auto mb-3" />
                                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Walk-in Mode</p>
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Members can book for any date without time slots</p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {selectedAmenityView.slots?.length > 0 ? selectedAmenityView.slots.map((slot, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-primary/20 transition-all shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <Clock size={16} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-slate-800">{formatTime12(slot.startTime)}</span>
                                                        <span className="text-slate-300 font-bold">→</span>
                                                        <span className="text-sm font-black text-slate-800">{formatTime12(slot.endTime)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                                <Users size={12} className="text-slate-400" />
                                                <span className="text-xs font-black text-slate-700">{slot.capacity}</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No slots configured — edit to add slots</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-xl"
                                onClick={() => setIsViewDrawerOpen(false)}
                            >
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                icon={Edit2}
                                className="flex-1 h-12 rounded-xl"
                                onClick={() => {
                                    setIsViewDrawerOpen(false);
                                    handleOpenModal(selectedAmenityView);
                                }}
                            >
                                Edit
                            </Button>
                        </div>
                    </div>
                )}
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
