import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, Box, Plus, Edit2, Trash2, AlertTriangle, TrendingUp, 
    Tag, LayoutGrid, Package, ImageIcon, IndianRupee, ChevronDown, 
    ChevronLeft, ChevronRight, Download, Sparkles 
} from 'lucide-react';
import ProductDrawer from './ProductDrawer';
import { getStoreProducts, deleteStoreProduct, getCategories } from '../../api/storeApi';
import toast from 'react-hot-toast';
import { useBranchContext } from '../../context/BranchContext';
import ConfirmationModal from '../../components/common/ConfirmationModal';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
   ───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF',
};

/* ─────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────── */
const HeaderBanner = ({ title, sub, icon: Icon, actions }) => (
    <div style={{
        background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
        borderRadius: 20, padding: '20px 26px',
        boxShadow: '0 8px 32px rgba(124,92,252,0.28)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, position: 'relative'
    }} className="header-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexShrink: 0
            }}>
                <Icon size={26} color="#fff" strokeWidth={2.2} />
            </div>
            <div>
                <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>{title}</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', fontWeight: 500 }}>{sub}</p>
            </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>{actions}</div>
    </div>
);

const MetricCard = ({ title, value, icon: Icon, iconColor, iconBg, caption, isFirst = false }) => {
    const [hover, setHover] = useState(false);
    return (
        <div 
            style={{
                background: isFirst ? `linear-gradient(135deg, ${T.accent}, ${T.accent2})` : T.surface,
                borderRadius: 18, border: isFirst ? 'none' : `1px solid ${T.border}`,
                boxShadow: isFirst ? '0 8px 24px rgba(124,92,252,0.28)' : '0 2px 12px rgba(124,92,252,0.06)',
                padding: 22, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover ? 'translateY(-4px)' : 'translateY(0)',
                cursor: 'default'
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: isFirst ? 'rgba(255,255,255,0.2)' : iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={isFirst ? '#fff' : iconColor} strokeWidth={2.5} />
                </div>
                {caption && <span style={{ fontSize: 9, fontWeight: 800, color: isFirst ? '#fff' : T.muted, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{caption}</span>}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: isFirst ? '#fff' : T.text, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: isFirst ? 'rgba(255,255,255,0.7)' : T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</div>
        </div>
    );
};

const ActionBtn = ({ onClick, title, type = 'edit', children }) => {
    const config = {
        edit:   { color: T.blue,   bg: T.blueLight },
        delete: { color: T.rose,   bg: T.roseLight },
    }[type];
    const [hover, setHover] = useState(false);
    return (
        <button
            onClick={onClick} title={title}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                width: 32, height: 32, borderRadius: 8, border: `1px solid ${T.border}`,
                background: config.bg, color: config.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                transform: hover ? 'scale(1.08)' : 'scale(1)', flexShrink: 0,
            }}
        >
            {children}
        </button>
    );
};

const ProductList = () => {
    const { selectedBranch } = useBranchContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState('add');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

    const fetchData = async () => {
        try {
            setLoading(true);
            const branchParam = selectedBranch === 'all' ? 'all' : selectedBranch;
            const [prodData, catData] = await Promise.all([
                getStoreProducts({ search: searchTerm, category: filterCategory, branchId: branchParam, allStatus: 'true' }),
                getCategories({ branchId: branchParam })
            ]);
            setProducts(prodData || []);
            setCategories(catData || []);
        } catch (error) { toast.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => { fetchData(); }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm, filterCategory, selectedBranch]);

    const handleEdit = (product) => { setSelectedProduct(product); setDrawerMode('edit'); setIsDrawerOpen(true); };
    const handleAdd = () => { setSelectedProduct(null); setDrawerMode('add'); setIsDrawerOpen(true); };
    const handleDelete = (id) => { setConfirmModal({ isOpen: true, id, loading: false }); };

    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await deleteStoreProduct(confirmModal.id);
            toast.success('Product removed');
            setConfirmModal({ isOpen: false, id: null, loading: false });
            fetchData();
        } catch (error) { toast.error(error); setConfirmModal(prev => ({ ...prev, loading: false })); }
    };

    const totalStockValue = products.reduce((acc, p) => acc + (parseFloat(p.price || 0) * (p.stock || 0)), 0);

    if (loading && products.length === 0) return (
        <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, uppercase: true, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Synchronizing Catalog…</p>
        </div>
    );

    return (
        <div style={{
            background: T.bg, minHeight: '100vh', padding: '28px 28px 48px',
            fontFamily: "'Plus Jakarta Sans', sans-serif", animation: 'fadeUp 0.38s ease both'
        }} className="fu">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                
                .grid-table { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 100px; align-items: center; }
                
                @media (max-width: 1280px) {
                    .table-wrapper { overflow-x: auto !important; }
                    .table-content { min-width: 1100px; }
                }
                @media (max-width: 640px) {
                    .header-banner { flex-direction: column; align-items: flex-start !important; gap: 20px; padding: 16px 18px !important; }
                    .filter-bar { flex-direction: column; align-items: stretch !important; gap: 12px !important; }
                    .grid-table { grid-template-columns: 1fr !important; gap: 12px; padding: 18px !important; border-bottom: 8px solid ${T.bg} !important; position: relative; }
                    .table-header { display: none !important; }
                    .mobile-label { display: block !important; margin-bottom: 4px; font-size: 8px !important; color: ${T.subtle} !important; text-transform: uppercase; font-weight: 800; letter-spacing: 0.1em; }
                    .actions-cell { justify-content: flex-start !important; padding-top: 12px; border-top: 1px solid ${T.border}; }
                }
            `}</style>

            {/* ──────── HEADER ──────── */}
            <HeaderBanner 
                title="Product Catalog"
                sub="Manage inventory levels, retail pricing & categories"
                icon={Box}
                actions={
                    <button 
                        onClick={handleAdd}
                        style={{
                            background: '#fff', border: 'none', borderRadius: 10,
                            padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                            color: T.accent, fontSize: 13, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif",
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Plus size={16} strokeWidth={3} /> Add Product
                    </button>
                }
            />

            {/* ──────── METRICS ──────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }} className="grid-metrics">
                <MetricCard isFirst={true} title="Total SKU Count" value={products.length} icon={Package} />
                <MetricCard title="Inventory Value" value={`₹${totalStockValue.toLocaleString()}`} icon={IndianRupee} iconColor={T.green} iconBg={T.greenLight} caption="Retail Gross" />
                <MetricCard title="Low Stock Units" value={products.filter(p => p.stock < 10).length} icon={AlertTriangle} iconColor={T.rose} iconBg={T.roseLight} />
                <MetricCard title="Active Categories" value={categories.length} icon={Tag} iconColor={T.amber} iconBg={T.amberLight} />
            </div>

            {/* ──────── FILTERS ──────── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }} className="filter-bar">
                <div style={{ flex: 1, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Search size={18} color={T.subtle} strokeWidth={2.5} />
                    <input 
                        type="text" placeholder="Search by SKU, product name or barcode…" 
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                </div>
                <div style={{ height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 12px', display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <Filter size={16} color={T.subtle} style={{ marginRight: 8 }} />
                    <select 
                        value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 700, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '0 8px' }}
                    >
                        <option value="">All Departments</option>
                        {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                </div>
            </div>

            {/* ──────── TABLE ──────── */}
            <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(124,92,252,0.06)', overflow: 'hidden' }} className="table-wrapper">
                <div className="table-content">
                    {/* Header */}
                    <div style={{ padding: '12px 22px', background: T.bg, borderBottom: `1px solid ${T.border}` }} className="grid-table table-header">
                        {['Product Specs', 'Identifier', 'Branch/Hub', 'Metric', 'Commercials', 'Tax Layer', 'Action'].map((h, i) => (
                            <span key={h} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: i === 6 ? 'center' : 'left' }}>{h}</span>
                        ))}
                    </div>

                    {/* Body */}
                    {products.length > 0 ? products.map((p, i) => (
                        <div 
                            key={p.id}
                            style={{ padding: '16px 22px', borderBottom: i < products.length - 1 ? `1px solid ${T.border}` : 'none', transition: '0.1s' }}
                            className="grid-table"
                            onMouseEnter={e => { e.currentTarget.style.background = T.bg; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ 
                                    width: 44, height: 44, borderRadius: 12, background: T.bg, border: `1.5px solid ${T.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                                }}>
                                    {p.image ? <img src={p.image} style={{ width: '100%', height: '100%', objectCover: 'cover' }} /> : <ImageIcon size={20} color={T.subtle} />}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <span style={{ display: 'none' }} className="mobile-label">Product Specs</span>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>DEPT: {p.category || 'GENERAL'}</div>
                                </div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Identifier</span>
                                <div style={{ fontSize: 11, fontWeight: 800, color: T.accent, fontFamily: 'monospace' }}>{p.sku || 'NO-SKU'}</div>
                                <div style={{ fontSize: 9, fontWeight: 600, color: T.subtle }}>{String(p.id).slice(0,12)}</div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Branch/Hub</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent }} />
                                    <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{p.tenant?.name || 'Central Hub'}</span>
                                </div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Metric</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontSize: 13, fontWeight: 900, color: p.stock < 10 ? T.rose : T.text }}>{p.stock}</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: T.muted }}>in stock</span>
                                </div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Commercials</span>
                                <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>₹{parseFloat(p.price).toLocaleString()}</div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: T.green }}>Cost: ₹{parseFloat(p.costPrice || 0).toLocaleString()}</div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Tax Layer</span>
                                <span style={{ 
                                    fontSize: 9, fontWeight: 800, color: T.accent, background: T.accentLight, 
                                    padding: '4px 10px', borderRadius: 8, border: `1px solid ${T.accentMid}` 
                                }}>GST {p.taxRate || 0}%</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} className="actions-cell">
                                <ActionBtn type="edit" onClick={() => handleEdit(p)} title="Edit Configuration"><Edit2 size={13} strokeWidth={2.5} /></ActionBtn>
                                <ActionBtn type="delete" onClick={() => handleDelete(p.id)} title="Purge Record"><Trash2 size={13} strokeWidth={2.5} /></ActionBtn>
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Box size={24} color={T.subtle} /></div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.muted, margin: '0 0 4px' }}>Empty Catalog</h3>
                            <p style={{ fontSize: 11, color: T.subtle, italic: true }}>No records match the current synchronization filters</p>
                        </div>
                    )}
                </div>
            </div>

            <ProductDrawer 
                isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} 
                product={selectedProduct} mode={drawerMode} onSubmit={fetchData} 
            />

            <ConfirmationModal 
                isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })} 
                onConfirm={processDelete} title="Purge SKU Record?" 
                message="This will immediately remove the item from all point-of-sale terminals. This action cannot be reversed." 
                confirmText="Confirm Purge" type="danger" loading={confirmModal.loading} 
            />
        </div>
    );
};

export default ProductList;
