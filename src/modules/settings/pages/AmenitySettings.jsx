import React, { useState, useEffect } from 'react';
import { 
    Plus, Search, Edit2, Trash2, Wifi, Zap, Shield, Coffee, Music, Car, Tv, Bath, Wind, Waves, 
    Dumbbell, Layers, Check, MapPin, Clock, User, Minus, CreditCard, Save, X, MoreVertical, 
    Users, Eye, ToggleLeft, ToggleRight, CalendarDays, Info, Loader2, Sparkles, Building2, Phone, Mail
} from 'lucide-react';
import amenityApi from '../../../api/amenityApi';
import { toast } from 'react-hot-toast';
import { useBranchContext } from '../../../context/BranchContext';
import RightDrawer from '../../../components/common/RightDrawer';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium - White Banner Table Theme)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accent3: '#B06AB3',
  border: '#F1F0F9', bg: '#F9F8FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  shadow: '0 15px 45px -12px rgba(124, 92, 252, 0.12)',
  bannerShadow: '0 20px 60px -15px rgba(124, 92, 252, 0.18)',
  cardShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: T.surface, borderRadius: 48, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: '0.3s ease' },
    input: { width: '100%', height: 60, borderRadius: 22, border: `2.5px solid ${T.bg}`, background: T.bg, padding: '0 24px', fontSize: 13, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: '0.3s', outline: 'none' },
    th: { padding: '24px 32px', fontSize: 11, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: 'left', borderBottom: `1px solid ${T.border}` }
};

const ICON_OPTIONS = [
    { name: 'Wifi', icon: Wifi }, { name: 'Zap', icon: Zap }, { name: 'Shield', icon: Shield },
    { name: 'Coffee', icon: Coffee }, { name: 'Music', icon: Music }, { name: 'Car', icon: Car },
    { name: 'Tv', icon: Tv }, { name: 'Bath', icon: Bath }, { name: 'Wind', icon: Wind },
    { name: 'Waves', icon: Waves }, { name: 'Dumbbell', icon: Dumbbell }, { name: 'Layers', icon: Layers }
];

const AmenitySettings = () => {
    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', icon: 'Layers', status: 'Active', gender: 'UNISEX', slotEnabled: false, extraPrice: 0, slots: [] });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

    const { selectedBranch } = useBranchContext();

    useEffect(() => { fetchAmenities(); }, [selectedBranch]);

    const fetchAmenities = async () => {
        try { setLoading(true); const data = await amenityApi.getAll(); setAmenities(data); } 
        catch (e) { toast.error(e); } finally { setLoading(false); }
    };

    const handleOpenModal = (amenity = null) => {
        if (amenity) {
            setEditingAmenity(amenity);
            setFormData({ 
                name: amenity.name || '', description: amenity.description || '', icon: amenity.icon || 'Layers', 
                gender: amenity.gender || 'UNISEX', status: amenity.status || 'Active', slotEnabled: amenity.slotEnabled || false, 
                extraPrice: amenity.extraPrice || '0', slots: amenity.slots || [] 
            });
        } else {
            setEditingAmenity(null);
            setFormData({ name: '', description: '', icon: 'Layers', gender: 'UNISEX', status: 'Active', slotEnabled: false, extraPrice: '0', slots: [] });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAmenity) { await amenityApi.update(editingAmenity.id, formData); toast.success('Amenity updated'); } 
            else { await amenityApi.create(formData); toast.success('Amenity created'); }
            setIsModalOpen(false); fetchAmenities();
        } catch (e) { toast.error(e); }
    };

    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await amenityApi.delete(confirmModal.id);
            toast.success('Amenity deleted');
            setConfirmModal({ isOpen: false, id: null, loading: false }); fetchAmenities();
        } catch (e) { toast.error(e); setConfirmModal(prev => ({ ...prev, loading: false })); }
    };

    const filteredAmenities = amenities.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getIcon = (iconName) => {
        const option = ICON_OPTIONS.find(o => o.name === iconName);
        const IconComponent = option ? option.icon : Layers;
        return <IconComponent size={24} strokeWidth={2.5} />;
    };

    return (
        <div style={{ fontFamily: S.ff }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); filter: blur(4px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
                .fu { animation: fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
                .fu1 { animation-delay: 0.1s }
                .table-row:hover { background-color: ${T.bg} !important; transform: scale(1.002); }
            `}</style>

            {/* Premium Header Banner (Matches Screenshot Style) */}
            <div style={{
                background: '#fff',
                borderRadius: 40, padding: '48px 60px', marginBottom: 40,
                boxShadow: T.bannerShadow, border: `1px solid ${T.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative'
            }} className="fu">
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    <div style={{ 
                        width: 80, height: 80, borderRadius: 24, 
                        background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', boxShadow: `0 15px 35px -10px ${T.accent}80`
                    }}>
                        <Layers size={40} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 40, fontWeight: 900, color: T.accent, margin: 0, letterSpacing: '-1.5px' }}>Amenity Hub</h1>
                        <p style={{ margin: '8px 0 0', color: T.subtle, fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Configure and track your exclusive gym facilities</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    style={{ 
                        height: 64, padding: '0 40px', borderRadius: 22, 
                        background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, 
                        color: '#fff', border: 'none', fontSize: 14, fontWeight: 900, 
                        textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, 
                        boxShadow: `0 15px 35px -10px ${T.accent}80`, transition: '0.3s'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'none'}
                >
                    <Plus size={24} strokeWidth={3} /> Add Amenity
                </button>
            </div>

            {/* Content Card (Header & Table) */}
            <div className="fu1" style={{ ...S.card, borderRadius: 48, overflow: 'hidden' }}>
                <div style={{ padding: '40px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 16, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle }}><Sparkles size={24} /></div>
                        <div>
                             <h4 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: T.text }}>All Amenities</h4>
                             <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Database Records</p>
                        </div>
                    </div>
                    <div style={{ position: 'relative', width: 420 }}>
                        <Search size={22} style={{ position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                        <input style={{ ...S.input, paddingLeft: 68 }} placeholder="Search by name or facility type..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: T.bg }}>
                            <tr>
                                <th style={S.th}>Facility</th>
                                <th style={S.th}>Access Mode</th>
                                <th style={S.th}>Gender</th>
                                <th style={S.th}>Pricing</th>
                                <th style={S.th}>Status</th>
                                <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '120px 0', textAlign: 'center' }}><Loader2 size={40} className="animate-spin" style={{ color: T.accent, margin: '0 auto' }} /></td></tr>
                            ) : filteredAmenities.length > 0 ? (
                                filteredAmenities.map(amenity => (
                                    <tr key={amenity.id} style={{ transition: '0.2s', background: '#fff' }} className="table-row">
                                        <td style={{ padding: '24px 32px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                                <div style={{ width: 52, height: 52, borderRadius: 18, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>{getIcon(amenity.icon)}</div>
                                                <div>
                                                    <div style={{ fontWeight: 900, fontSize: 15, color: T.text }}>{amenity.name}</div>
                                                    <div style={{ fontSize: 12, color: T.subtle, fontWeight: 700 }}>{amenity.description?.substring(0, 40)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 10, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>{amenity.slotEnabled ? <Clock size={16} /> : <CalendarDays size={16} />}</div>
                                                <span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{amenity.slotEnabled ? `${amenity.slots?.length || 0} Slots` : 'Walk-in'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '24px' }}>
                                            <span style={{ fontSize: 10, fontWeight: 900, color: T.muted, background: T.bg, padding: '6px 14px', borderRadius: 10, textTransform: 'uppercase' }}>{amenity.gender || 'UNISEX'}</span>
                                        </td>
                                        <td style={{ padding: '24px' }}>
                                            <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{amenity.extraPrice > 0 ? `₹${amenity.extraPrice}` : 'FREE'}</div>
                                            <div style={{ fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase' }}>Unit Charge</div>
                                        </td>
                                        <td style={{ padding: '24px' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 16, background: T.greenLight, color: T.green }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green }} />
                                                <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>{amenity.status || 'Active'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                                             <div style={{ display: 'inline-flex', gap: 10 }}>
                                                <button onClick={() => handleOpenModal(amenity)} style={{ width: 44, height: 44, borderRadius: 14, background: T.bg, border: 'none', color: T.subtle, cursor: 'pointer' }}><Edit2 size={18} /></button>
                                                <button onClick={() => setConfirmModal({ isOpen: true, id: amenity.id, loading: false })} style={{ width: 44, height: 44, borderRadius: 14, background: T.roseLight, border: 'none', color: T.rose, cursor: 'pointer' }}><Trash2 size={18} /></button>
                                             </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" style={{ padding: '120px 0', textAlign: 'center', color: T.subtle, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>No Facilities Defined</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Drawer (Add/Edit) */}
            <RightDrawer isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAmenity ? 'Scale Facility' : 'New Core Amenity'} subtitle="Configure internal logic and identifiers">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 50 }}>
                     <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 }}>Amenity Title</label>
                        <input style={S.input} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Luxury Steam Suite" />
                     </div>
                     <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 }}>Access Policy</label>
                        <select style={S.input} value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                            <option value="UNISEX">Unisex (Global)</option>
                            <option value="MALE">Male Only</option>
                            <option value="FEMALE">Female Only</option>
                        </select>
                     </div>
                     <button type="submit" style={{ height: 64, borderRadius: 24, background: T.accent, color: '#fff', border: 'none', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: T.shadow }}>Confirm Creation</button>
                </form>
            </RightDrawer>

            <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })} onConfirm={processDelete} title="Purge Record?" message="Permeant decommissioning of system amenity." confirmText="Purge" type="danger" loading={confirmModal.loading} />
        </div>
    );
};

export default AmenitySettings;
