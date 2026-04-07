import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Tag, FileText, Trash2, Loader, Sparkles, Inbox, LayoutGrid } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import { fetchExpenseCategories, addExpenseCategory, deleteExpenseCategory } from '../../../api/finance/financeApi';
import { useBranchContext } from '../../../context/BranchContext';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium - White Aesthetic)
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
    card: { background: T.surface, borderRadius: 24, border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: '0.3s ease' },
    input: { width: '100%', height: 52, borderRadius: 16, border: `2.5px solid ${T.bg}`, background: T.bg, padding: '0 20px', fontSize: 13, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: '0.3s', outline: 'none' }
};

const ExpenseSettings = () => {
    const { selectedBranch } = useBranchContext();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

    useEffect(() => { loadCategories(); }, [selectedBranch]);

    const loadCategories = async () => {
        try { setLoading(true); const data = await fetchExpenseCategories(selectedBranch); setCategories(data || []); } 
        catch (error) { toast.error('Failed to load categories'); } finally { setLoading(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await addExpenseCategory({ ...formData, branchId: selectedBranch });
            toast.success('Category created'); setIsDrawerOpen(false); setFormData({ name: '', description: '' }); loadCategories();
        } catch (error) { toast.error(error.response?.data?.message || 'Failed'); } finally { setSubmitting(false); }
    };

    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await deleteExpenseCategory(confirmModal.id);
            toast.success('Category deleted'); setConfirmModal({ isOpen: false, id: null, loading: false }); loadCategories();
        } catch (error) { toast.error('Check dependency'); setConfirmModal(prev => ({ ...prev, loading: false })); }
    };

    return (
        <div style={{ fontFamily: S.ff }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.4s ease both }
                .fu1 { animation-delay: 0.1s } .fu2 { animation-delay: 0.2s }
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
                        <DollarSign size={30} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 30, fontWeight: 900, color: T.accent, margin: 0, letterSpacing: '-1.2px' }}>Expense Categories</h1>
                        <p style={{ margin: '4px 0 0', color: T.subtle, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Manage your financial classification and tracking</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsDrawerOpen(true)}
                    style={{ 
                        height: 52, padding: '0 32px', borderRadius: 16, 
                        background: `linear-gradient(135deg, ${T.accent}, ${T.accent3})`, 
                        color: '#fff', border: 'none', fontSize: 12, fontWeight: 900, 
                        textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, 
                        boxShadow: `0 10px 25px -8px ${T.accent}80`, transition: '0.3s'
                    }}
                >
                    <Plus size={18} strokeWidth={3} /> Add Category
                </button>
            </div>

            {/* Categories Grid (Compact) */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                    {[1, 2, 3].map(i => <div key={i} style={{ height: 220, borderRadius: 28, background: '#fff', border: `1px solid ${T.border}` }} className="animate-pulse" />)}
                </div>
            ) : categories.length === 0 ? (
                <div style={{ padding: '100px 0', textAlign: 'center', background: '#fff', borderRadius: 32, border: `2px dashed ${T.border}` }}>
                    <Inbox size={64} color={T.subtle} style={{ opacity: 0.3, marginBottom: 20 }} />
                    <h3 style={{ fontSize: 22, fontWeight: 900, color: T.text, margin: 0 }}>No Categories Identified</h3>
                    <p style={{ fontSize: 14, color: T.muted, margin: '8px 0 32px' }}>Categorize your outgoing cash flow for better reporting.</p>
                    <button onClick={() => setIsDrawerOpen(true)} style={{ height: 52, padding: '0 36px', borderRadius: 16, background: T.accent, color: '#fff', border: 'none', fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: T.shadow }}>Add First Category</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="fu1">
                    {categories.map((cat) => (
                        <div key={cat.id} style={{ ...S.card, padding: 28 }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                <div style={{ width: 52, height: 52, borderRadius: 16, background: T.bg, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Tag size={22} strokeWidth={2.5} />
                                </div>
                                <button onClick={() => setConfirmModal({ isOpen: true, id: cat.id, loading: false })} style={{ width: 36, height: 36, borderRadius: 10, background: T.roseLight, border: 'none', color: T.rose, cursor: 'pointer' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 900, color: T.text }}>{cat.name}</h3>
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.muted, lineHeight: 1.5, height: 36, overflow: 'hidden' }}>{cat.description || 'Global classification for tracking organizational expenses Across the network.'}</p>
                            <div style={{ marginTop: 20, padding: '6px 14px', borderRadius: 10, background: T.bg, display: 'inline-flex', fontSize: 9, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                ACTIVE CATEGORY
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Right Drawer - Add Category */}
            <RightDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="New Expense Node" subtitle="Define a classification for budgeting">
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 }}>Category Identity</label>
                        <input style={S.input} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Maintenance & Repairs" />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 }}>Functional Details</label>
                        <textarea style={{ ...S.input, height: 140, padding: 22, paddingTop: 18, resize: 'none' }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="What does this category cover?" />
                    </div>
                    <button type="submit" disabled={submitting} style={{ height: 64, borderRadius: 22, background: T.accent, color: '#fff', border: 'none', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: T.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12 }}>
                        {submitting ? <Loader className="animate-spin" size={20} /> : <Plus size={20} strokeWidth={3} />} {submitting ? 'Creating...' : 'Deploy Category'}
                    </button>
                </form>
            </RightDrawer>

            <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })} onConfirm={processDelete} title="Purge Category?" message="This will remove the classification from global settings." confirmText="Purge" type="danger" loading={confirmModal.loading} />
        </div>
    );
};

export default ExpenseSettings;
