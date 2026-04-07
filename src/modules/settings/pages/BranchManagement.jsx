import React, { useState, useEffect } from 'react';
import { 
    Plus, Edit2, MapPin, Users, Briefcase, TrendingUp, MoreVertical, 
    Sparkles, Search, Building2, Phone, Mail, Globe, Trash2, Eye, ShieldCheck, 
    Clock, Loader2, ArrowRight, CalendarDays, CreditCard, LayoutGrid, List
} from 'lucide-react';
import { fetchAllGyms, addGym } from '../../../api/superadmin/superAdminApi';
import { getAllStaff } from '../../../api/manager/managerApi';
import { toast } from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium - Card Aesthetic)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accent3: '#B06AB3',
  border: '#F1F0F9', bg: '#F9F8FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  rose: '#F43F5E', roseLight: '#FFF1F4',
  shadow: '0 10px 40px -10px rgba(124, 92, 252, 0.15)',
  bannerShadow: '0 20px 60px -15px rgba(124, 92, 252, 0.18)',
  cardShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'default' },
    input: { width: '100%', height: 48, borderRadius: 16, border: `2.5px solid ${T.bg}`, background: T.bg, padding: '0 20px', fontSize: 13, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: '0.3s', outline: 'none' }
};

const BranchManagement = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ gymName: '', branchName: '', owner: '', phone: '', email: '', location: '' });
    const [staffList, setStaffList] = useState([]);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const data = await fetchAllGyms();
            const gymList = data.gyms || [];
            setBranches(gymList.map(gym => ({
                id: gym.id,
                name: gym.gymName,
                branch: gym.branchName || 'Main',
                code: `BR-${String(gym.id).padStart(3, '0')}`,
                location: gym.location || 'N/A',
                manager: gym.owner || 'N/A',
                email: gym.email || '',
                phone: gym.phone || '',
                status: gym.status || 'Active',
                members: gym.members || 0
            })));
        } catch (e) { toast.error("Failed to load branches"); } finally { setLoading(false); }
    };

    const fetchStaff = async () => {
         try { const data = await getAllStaff(); setStaffList(data || []); } catch (e) {} 
    };

    useEffect(() => { fetchBranches(); fetchStaff(); }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addGym(formData);
            setShowModal(false);
            setFormData({ gymName: '', branchName: '', owner: '', phone: '', email: '', location: '' });
            fetchBranches();
            toast.success("Branch created successfully!");
        } catch (e) { toast.error("Failed to add branch"); }
    };

    const filteredBranches = branches.filter(b => 
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ fontFamily: S.ff }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.4s ease both }
                .fu1 { animation-delay: 0.1s } .fu2 { animation-delay: 0.15s }
                input::placeholder { color: ${T.subtle}; opacity: 0.8; }
            `}</style>

            {/* Premium Header Banner (Compact Version) */}
            <div style={{
                background: '#fff', borderRadius: 32, padding: '28px 40px', marginBottom: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: T.bannerShadow, border: `1px solid ${T.border}`, position: 'relative'
            }} className="fu">
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ 
                        width: 64, height: 64, borderRadius: 18, background: T.accent,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 10px 25px -8px ${T.accent}80`
                    }}>
                        <Building2 size={30} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 30, fontWeight: 900, color: T.accent, margin: 0, letterSpacing: '-1.2px' }}>Branch Hub</h1>
                        <p style={{ margin: '4px 0 0', color: T.subtle, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Configure and track your exclusive gym locations</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    style={{ 
                        height: 52, padding: '0 32px', borderRadius: 16, 
                        background: `linear-gradient(135deg, ${T.accent}, ${T.accent3})`, 
                        color: '#fff', border: 'none', fontSize: 12, fontWeight: 900, 
                        textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, 
                        boxShadow: `0 10px 25px -8px ${T.accent}80`, transition: '0.3s'
                    }}
                >
                    <Plus size={18} strokeWidth={3} /> Add Branch
                </button>
            </div>

            {/* Search Filter Area (Compact) */}
            <div className="fu1" style={{ position: 'relative', marginBottom: 28 }}>
                <div style={{ position: 'relative', width: '100%', background: '#fff', borderRadius: 24, boxShadow: T.cardShadow, border: `1px solid ${T.border}`, height: 60 }}>
                    <Search size={20} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                    <input 
                        style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', paddingLeft: 64, paddingRight: 24, fontSize: 15, fontWeight: 800, color: T.text, outline: 'none' }} 
                        placeholder="Filter branches..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Grid Layout (Matching Amenities Theme) */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
                    {[1, 2, 3].map(i => <div key={i} style={{ height: 420, borderRadius: 32, background: '#fff', border: `1px solid ${T.border}` }} className="animate-pulse" />)}
                </div>
            ) : filteredBranches.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="fu2">
                    {filteredBranches.map((branch) => (
                        <div key={branch.id} style={S.card} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-6px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                            <div style={{ padding: 32 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                                    <div style={{ 
                                        width: 60, height: 60, borderRadius: 18, 
                                        background: T.bg, color: T.accent, 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: `0 6px 20px rgba(124, 92, 252, 0.08)`
                                    }}>
                                        <Building2 size={28} strokeWidth={2.5} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button style={{ width: 40, height: 40, borderRadius: 12, background: T.bg, border: 'none', color: T.muted, cursor: 'pointer' }}><Eye size={18} /></button>
                                        <button style={{ width: 40, height: 40, borderRadius: 12, background: T.bg, border: 'none', color: T.muted, cursor: 'pointer' }}><Edit2 size={18} /></button>
                                        <button style={{ width: 40, height: 40, borderRadius: 12, background: T.roseLight, border: 'none', color: T.rose, cursor: 'pointer' }}><Trash2 size={18} /></button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: 28 }}>
                                    <h3 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: '0 0 8px' }}>{branch.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 9, fontWeight: 900, color: T.subtle, background: T.bg, padding: '4px 10px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{branch.code}</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: T.muted }}>{branch.branch}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 12, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle }}><MapPin size={16} /></div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{branch.location}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 12, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle }}><Users size={16} /></div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{branch.manager}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 12, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle }}><Phone size={16} /></div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{branch.phone || 'Contact N/A'}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${T.bg}`, paddingTop: 32 }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 12, background: T.greenLight, color: T.green }}>
                                         <div style={{ width: 5, height: 5, borderRadius: '50%', background: T.green }} />
                                         <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>{branch.status}</span>
                                    </div>
                                    <div style={{ fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ROAR NETWORK</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ padding: '140px 0', textAlign: 'center', background: '#fff', borderRadius: 40, border: `2px dashed ${T.border}` }}>
                    <Building2 size={72} color={T.subtle} style={{ opacity: 0.3, marginBottom: 24 }} />
                    <h3 style={{ fontSize: 26, fontWeight: 900, color: T.text, margin: 0 }}>No Locations Found</h3>
                    <p style={{ fontSize: 15, color: T.muted, margin: '10px 0 40px' }}>Your gym network is ready to expand with new branches.</p>
                    <button onClick={() => setShowModal(true)} style={{ height: 60, padding: '0 44px', borderRadius: 20, background: T.accent, color: '#fff', border: 'none', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: T.shadow }}>Launch First Branch</button>
                </div>
            )}

            {/* Modal for Adding Branch (Matching Theme) */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(26,21,51,0.5)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ ...S.card, width: '100%', maxWidth: 680, background: '#fff', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.2)' }} className="fu">
                        <div style={{ padding: '32px 40px', background: T.bg, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                 <div style={{ width: 6, height: 32, background: T.accent, borderRadius: 6 }} />
                                 <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: T.text }}>Launch New Location</h3>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: T.subtle, cursor: 'pointer' }}><Plus size={32} style={{ transform: 'rotate(45deg)' }} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: 40 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 }}>Gym Brand Name</label>
                                    <input style={S.input} name="gymName" value={formData.gymName} onChange={handleChange} required placeholder="e.g. Roar Fitness" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 }}>Branch Reference</label>
                                    <input style={S.input} name="branchName" value={formData.branchName} onChange={handleChange} required placeholder="e.g. London Central" />
                                </div>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 }}>Legal Manager</label>
                                    <select style={S.input} name="owner" value={formData.owner} onChange={handleChange}>
                                        <option value="">Select Internal User</option>
                                        {staffList.map(s => <option key={s.id} value={s.name}>{s.name} ({s.email})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 }}>Primary Phone</label>
                                    <input style={S.input} name="phone" value={formData.phone} onChange={handleChange} required placeholder="+44 20 7123 4567" />
                                </div>
                            </div>

                            <div style={{ marginBottom: 24 }}>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 }}>Manager Email</label>
                                <input style={S.input} name="email" value={formData.email} onChange={handleChange} required placeholder="branch.manager@roarfitness.com" />
                            </div>

                            <div style={{ marginBottom: 40 }}>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 }}>Physical Address</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={20} style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                                    <input style={{ ...S.input, paddingLeft: 56 }} name="location" value={formData.location} onChange={handleChange} required placeholder="City Square, 12th Floor, London" />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 20 }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, height: 60, borderRadius: 20, border: `2.5px solid ${T.border}`, background: '#fff', color: T.text, fontSize: 14, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>Discard</button>
                                <button type="submit" style={{ flex: 1, height: 60, borderRadius: 20, background: T.accent, color: '#fff', border: 'none', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: T.shadow }}>Submit Profile</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchManagement;
