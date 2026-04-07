import React, { useState, useEffect } from 'react';
import { 
    Plus, Edit2, MapPin, Search, Building2, Phone, Mail, Eye, Trash2, 
    Loader, Clock, User, Globe, Navigation, Hash, Sparkles, LayoutGrid, List,
    TrendingUp, ShieldCheck, Map, ArrowRight, MoreVertical, CreditCard, Layers
} from 'lucide-react';
import { fetchBranches, createBranch, updateBranch, deleteBranch } from '../../../api/superadmin/branchApi';
import { getAllStaff } from '../../../api/manager/managerApi';
import { toast } from 'react-hot-toast';
import RightDrawer from '../../../components/common/RightDrawer';
import { useBranchContext } from '../../../context/BranchContext';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium - White Banner Table Theme)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accent3: '#B06AB3',
  border: '#F1F0F9', bg: '#F9F8FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  rose: '#F43F5E', roseLight: '#FFF1F4',
  shadow: '0 15px 45px -12px rgba(124, 92, 252, 0.12)',
  bannerShadow: '0 20px 60px -15px rgba(124, 92, 252, 0.18)',
  cardShadow: '0 4px 24px rgba(0, 0, 0, 0.04)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: T.surface, borderRadius: 40, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: '0.3s ease' },
    input: { width: '100%', height: 60, borderRadius: 20, border: `2.5px solid ${T.bg}`, background: T.bg, padding: '0 24px', fontSize: 14, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: '0.3s', outline: 'none' },
    th: { padding: '24px 32px', fontSize: 11, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: 'left', borderBottom: `1px solid ${T.border}` }
};

const BranchList = () => {
    const { refreshBranches } = useBranchContext();
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [branches, setBranches] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

    const [formData, setFormData] = useState({
        branchName: '', branchCode: '', address: '', city: '', state: '', postalCode: '',
        country: 'India', branchPhone: '', branchEmail: '', openingTime: '06:00',
        closingTime: '22:00', managerId: 'No manager', managerName: '', managerEmail: '',
        managerPhone: '', status: 'Active'
    });

    useEffect(() => { loadBranches(); loadStaff(); }, []);
    const loadStaff = async () => { try { const data = await getAllStaff(); setStaffList(data || []); } catch (e) {} };
    const loadBranches = async () => {
        try { setLoading(true); const data = await fetchBranches(); setBranches(data.gyms || []); } 
        catch (e) { toast.error('Failed to load branches'); } finally { setLoading(false); }
    };

    const handleSaveBranch = async () => {
        try {
            if (!formData.branchName || !formData.managerEmail) { toast.error('Required fields missing'); return; }
            const combinedLocation = `${formData.address}${formData.city ? ', ' + formData.city : ''}${formData.state ? ', ' + formData.state : ''}${formData.postalCode ? ' - ' + formData.postalCode : ''}, ${formData.country}`;
            const payload = {
                gymName: formData.branchName, branchName: formData.branchName, branchCode: formData.branchCode,
                owner: formData.managerName, manager: formData.managerName, email: formData.managerEmail,
                phone: formData.managerPhone || formData.branchPhone, location: combinedLocation,
                address: formData.address, city: formData.city, state: formData.state,
                postalCode: formData.postalCode, country: formData.country,
                openingTime: formData.openingTime, closingTime: formData.closingTime, status: formData.status
            };
            await createBranch(payload);
            toast.success('Branch Created'); setIsAddDrawerOpen(false); resetForm(); loadBranches(); refreshBranches();
        } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    };

    const resetForm = () => setFormData({ branchName: '', branchCode: '', address: '', city: '', state: '', postalCode: '', country: 'India', branchPhone: '', branchEmail: '', openingTime: '06:00', closingTime: '22:00', managerId: 'No manager', managerName: '', managerEmail: '', managerPhone: '', status: 'Active' });

    const filteredBranches = branches.filter(b => 
        (b.branchName || b.gymName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.branchCode || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ fontFamily: S.ff }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); filter: blur(4px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
                .fu { animation: fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
                .fu1 { animation-delay: 0.1s } .fu2 { animation-delay: 0.2s }
                input::placeholder { color: ${T.subtle}; opacity: 0.7; }
                .table-row:hover { background-color: ${T.bg} !important; transform: scale(1.002); }
            `}</style>

            {/* Premium Header Banner (Matches Screenshot Style) */}
            <div style={{
                background: '#fff',
                borderRadius: 40, padding: '48px 60px', marginBottom: 40,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: T.bannerShadow, border: `1px solid ${T.border}`, position: 'relative'
            }} className="fu">
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    <div style={{ 
                        width: 80, height: 80, borderRadius: 24, 
                        background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', boxShadow: `0 15px 35px -10px ${T.accent}80`
                    }}>
                        <Building2 size={40} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 40, fontWeight: 900, color: T.accent, margin: 0, letterSpacing: '-1.5px' }}>Branch Management</h1>
                        <p style={{ margin: '8px 0 0', color: T.subtle, fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Manage your gym locations across the network</p>
                    </div>
                </div>
                <button 
                    onClick={() => { resetForm(); setIsAddDrawerOpen(true); }}
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
                    <Plus size={24} strokeWidth={3} /> Add Branch
                </button>
            </div>

            {/* Content Card (Header & Table) */}
            <div className="fu1" style={{ ...S.card, borderRadius: 48, overflow: 'hidden' }}>
                <div style={{ padding: '40px 60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 16, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle }}><MapPin size={24} /></div>
                        <div>
                             <h4 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: T.text }}>All Branches</h4>
                             <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Database Records</p>
                        </div>
                    </div>
                    <div style={{ position: 'relative', width: 420 }}>
                        <Search size={22} style={{ position: 'absolute', left: 28, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                        <input style={{ ...S.input, paddingLeft: 68 }} placeholder="Search by branch name or code..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: T.bg }}>
                            <tr>
                                <th style={S.th}>Branch</th>
                                <th style={{ ...S.th, textAlign: 'center' }}>Code</th>
                                <th style={S.th}>Manager</th>
                                <th style={S.th}>Location</th>
                                <th style={S.th}>Contact</th>
                                <th style={S.th}>Status</th>
                                <th style={{ ...S.th, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="7" style={{ padding: '120px 0', textAlign: 'center' }}><Loader size={40} className="animate-spin" style={{ color: T.accent, margin: '0 auto' }} /></td></tr>
                            ) : filteredBranches.length > 0 ? (
                                filteredBranches.map(branch => (
                                    <tr key={branch.id} style={{ transition: '0.2s', background: '#fff' }} className="table-row">
                                        <td style={{ padding: '24px 32px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                                <div style={{ width: 52, height: 52, borderRadius: 18, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, fontWeight: 900, fontSize: 18 }}>{ (branch.branchName || branch.gymName)[0] }</div>
                                                <div>
                                                    <div style={{ fontWeight: 900, fontSize: 15, color: T.text }}>{branch.branchName || branch.gymName}</div>
                                                    <div style={{ fontSize: 12, color: T.subtle, fontWeight: 700 }}>{branch.gymName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '24px', textAlign: 'center' }}>
                                             <span style={{ fontSize: 10, fontWeight: 900, color: T.muted, background: T.bg, padding: '6px 12px', borderRadius: 10 }}>BR-{branch.id?.toString().padStart(3, '0')}</span>
                                        </td>
                                        <td style={{ padding: '24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 10, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: T.subtle }}>{ (branch.managerName || branch.owner || 'U')[0] }</div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: 14, color: T.text }}>{branch.managerName || branch.owner || 'Update Manager'}</div>
                                                    {branch.managerEmail && <div style={{ fontSize: 11, color: T.subtle, fontWeight: 600 }}>{branch.managerEmail}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '24px', maxWidth: 220 }}>
                                            <div style={{ fontSize: 14, fontWeight: 800, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{branch.address || branch.location || 'N/A'}</div>
                                            <div style={{ fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Primary Address</div>
                                        </td>
                                        <td style={{ padding: '24px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                <div style={{ fontSize: 12, fontWeight: 800, color: T.muted, display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={14} opacity={0.5} /> {branch.phone || 'N/A'}</div>
                                                <div style={{ fontSize: 12, fontWeight: 800, color: T.muted, display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={14} opacity={0.5} /> {branch.email || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '24px' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 20px', borderRadius: 18, background: T.greenLight, color: T.green }}>
                                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, boxShadow: `0 0 10px ${T.green}` }} />
                                                <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{branch.status || 'Active'}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                                             <div style={{ display: 'inline-flex', gap: 10 }}>
                                                <button onClick={() => { setSelectedBranch(branch); setIsViewDrawerOpen(true); }} style={{ width: 44, height: 44, borderRadius: 14, background: T.bg, border: 'none', color: T.subtle, cursor: 'pointer' }}><Eye size={18} /></button>
                                                <button onClick={() => { setSelectedBranch(branch); setIsEditDrawerOpen(true); }} style={{ width: 44, height: 44, borderRadius: 14, background: T.bg, border: 'none', color: T.subtle, cursor: 'pointer' }}><Edit2 size={18} /></button>
                                                <button onClick={() => setConfirmModal({ isOpen: true, id: branch.id })} style={{ width: 44, height: 44, borderRadius: 14, background: T.roseLight, border: 'none', color: T.rose, cursor: 'pointer' }}><Trash2 size={18} /></button>
                                             </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="7" style={{ padding: '120px 0', textAlign: 'center', color: T.subtle, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>No Branches Found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Drawers & Modals */}
            <RightDrawer isOpen={isAddDrawerOpen} onClose={() => setIsAddDrawerOpen(false)} title="New System Node" subtitle="Register a new gym location to the network">
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}>
                     <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 }}>Branch Display Name</label>
                        <input style={S.input} name="branchName" value={formData.branchName} onChange={(e) => setFormData({...formData, branchName: e.target.value})} placeholder="e.g. Roar Fitness Central" />
                     </div>
                     <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 }}>Primary Address</label>
                        <textarea style={{ ...S.input, height: 120, padding: 22, paddingTop: 18, resize: 'none' }} name="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Full physical details..." />
                     </div>
                     <button onClick={handleSaveBranch} style={{ height: 64, borderRadius: 22, background: T.accent, color: '#fff', border: 'none', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: T.shadow }}>Submit Profile</button>
                 </div>
            </RightDrawer>

            <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })} onConfirm={async () => { try { await deleteBranch(confirmModal.id); toast.success('Branch Deleted'); loadBranches(); setConfirmModal({isOpen:false,id:null,loading:false}); } catch(e){} }} title="Decommission Branch?" message="Permeant deletion from the network registry." confirmText="Delete" type="danger" loading={confirmModal.loading} />
        </div>
    );
};

export default BranchList;
