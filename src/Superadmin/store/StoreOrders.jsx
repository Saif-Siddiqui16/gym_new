import React, { useState, useEffect } from 'react';
import { 
    ShoppingCart, Search, Filter, Download, ChevronRight, Eye, Calendar, 
    Clock, CheckCircle, Plus, Users, User, SearchIcon, ReceiptText, 
    ArrowRight, IndianRupee, Package, Sparkles, X
} from 'lucide-react';
import { getStoreOrders } from '../../api/storeApi';
import toast from 'react-hot-toast';
import { useBranchContext } from '../../context/BranchContext';
import { exportPdf } from '../../utils/exportPdf';

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
        marginBottom: 28, position: 'relative', overflow: 'hidden'
    }} className="fu">
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative', zIndex: 2 }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 2 }}>
            {actions}
        </div>
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
                padding: 20, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: hover ? 'translateY(-4px)' : 'translateY(0)',
                cursor: 'default'
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: isFirst ? 'rgba(255,255,255,0.2)' : iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} color={isFirst ? '#fff' : iconColor} strokeWidth={2.5} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: isFirst ? 'rgba(255,255,255,0.7)' : T.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</div>
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: isFirst ? '#fff' : T.text, marginBottom: 2 }}>{value}</div>
            {caption && <div style={{ fontSize: 9, fontWeight: 700, color: isFirst ? 'rgba(255,255,255,0.5)' : T.subtle }}>{caption}</div>}
        </div>
    );
};

const StoreOrders = () => {
    const { selectedBranch } = useBranchContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const branchParam = selectedBranch === 'all' ? 'all' : selectedBranch;
            const data = await getStoreOrders({ branchId: branchParam });
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) { toast.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, [selectedBranch]);

    const filteredOrders = orders.filter(o => {
        const matchesSearch = (o.memberName || 'Guest').toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toString().includes(searchTerm);
        const matchesStatus = filterStatus === '' || o.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleExport = () => {
        if (filteredOrders.length === 0) return toast.error('No orders to export');
        const headers = ['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status'];
        const rows = filteredOrders.map(o => [
            `#${o.id.toString().padStart(6, '0')}`,
            o.member?.name || o.guestName || 'Guest',
            o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A',
            o.itemsCount ? o.itemsCount.toString() : '0',
            `₹${(o.totalAmount || 0).toLocaleString()}`,
            o.status
        ]);
        exportPdf({ title: 'Store Orders Report', filename: `store_orders_${new Date().toISOString().split('T')[0]}`, headers, rows, gymName: "Roar Fitness" });
    };

    if (loading && orders.length === 0) return (
        <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 44, height: 44, border: `3px solid ${T.accentMid}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
            <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, uppercase: true, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Indexing Ledger…</p>
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
                @keyframes zoomIn { from { transform: scale(0.95); opacity: 0 } to { transform: scale(1); opacity: 1 } }
                
                .grid-table { display: grid; grid-template-columns: 120px 1.5fr 1fr 1fr 1fr 1fr 80px; align-items: center; }
                
                @media (max-width: 1280px) {
                    .table-wrapper { overflow-x: auto !important; }
                    .table-content { min-width: 1100px; }
                    .grid-metrics { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 640px) {
                    .header-banner { flex-direction: column; align-items: flex-start !important; gap: 20px; padding: 16px 18px !important; }
                    .filter-bar { flex-direction: column; align-items: stretch !important; gap: 12px !important; }
                    .grid-table { grid-template-columns: 1fr !important; gap: 10px; padding: 18px !important; border-bottom: 6px solid ${T.bg} !important; }
                    .table-header { display: none !important; }
                    .mobile-label { display: block !important; margin-bottom: 2px; font-size: 8px !important; color: ${T.subtle} !important; text-transform: uppercase; font-weight: 800; }
                    .actions-cell { border-top: 1px solid ${T.border}; padding-top: 10px !important; display: flex !important; justify-content: flex-start !important; }
                }
            `}</style>

            <HeaderBanner 
                title="Sales Ledger"
                sub="Live transaction stream & comprehensive order history"
                icon={ShoppingCart}
                actions={
                    <button 
                        onClick={handleExport}
                        style={{
                            background: '#fff', border: 'none', borderRadius: 10,
                            padding: '10px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                            color: T.accent, fontSize: 13, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif",
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Download size={16} strokeWidth={3} /> Export Ledger
                    </button>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }} className="grid-metrics">
                <MetricCard title="Gross Sales" value={`₹${orders.reduce((acc, o) => acc + parseFloat(o.totalAmount || 0), 0).toLocaleString()}`} icon={IndianRupee} iconColor={T.accent} iconBg={T.accentLight} isFirst={true} />
                <MetricCard title="Total Volume" value={orders.length} icon={ShoppingCart} iconColor={T.blue} iconBg={T.blueLight} caption="Transactions processed" />
                <MetricCard title="Pending Sync" value={orders.filter(o => o.status === 'Pending').length} icon={Clock} iconColor={T.amber} iconBg={T.amberLight} />
                <MetricCard title="Sync Success" value={orders.filter(o => o.status === 'Completed').length} icon={CheckCircle} iconColor={T.green} iconBg={T.greenLight} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }} className="filter-bar">
                <div style={{ flex: 1, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Search size={18} color={T.subtle} strokeWidth={2.5} />
                    <input 
                        type="text" placeholder="Search by reference ID or customer identity…" 
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    />
                </div>
                <div style={{ width: 220, height: 44, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '0 12px', display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <Filter size={16} color={T.subtle} style={{ marginRight: 8 }} />
                    <select 
                        value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: 13, fontWeight: 700, color: T.text, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        <option value="">Stream All</option>
                        <option value="Completed">Success</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Reversed</option>
                    </select>
                </div>
            </div>

            <div style={{ background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`, boxShadow: '0 2px 12px rgba(124,92,252,0.06)', overflow: 'hidden' }} className="table-wrapper">
                <div className="table-content">
                    <div style={{ padding: '12px 22px', background: T.bg, borderBottom: `1px solid ${T.border}` }} className="grid-table table-header">
                        {['Ref ID', 'Identifier', 'Timestamp', 'Payload', 'Commercials', 'Status', 'View'].map((h, i) => (
                            <span key={h} style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: i === 6 ? 'right' : 'left' }}>{h}</span>
                        ))}
                    </div>

                    {filteredOrders.length > 0 ? filteredOrders.map((o, i) => (
                        <div 
                            key={o.id}
                            style={{ padding: '16px 22px', borderBottom: i < filteredOrders.length - 1 ? `1px solid ${T.border}` : 'none', transition: '0.1s', cursor: 'default' }}
                            className="grid-table"
                            onMouseEnter={e => { e.currentTarget.style.background = T.bg; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Ref ID</span>
                                <div style={{ fontSize: 12, fontWeight: 800, color: T.accent, fontFamily: 'monospace' }}>#{String(o.id).slice(-6).toUpperCase()}</div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 10, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                                    <User size={14} />
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <span style={{ display: 'none' }} className="mobile-label">Identifier</span>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.member?.name || o.guestName || 'Public Checkout'}</div>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: T.subtle, textTransform: 'uppercase' }}>Account Holder</div>
                                </div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Timestamp</span>
                                <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                                <div style={{ fontSize: 10, fontWeight: 600, color: T.muted }}>{new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Payload</span>
                                <span style={{ fontSize: 10, fontWeight: 800, color: T.muted, background: T.bg, padding: '4px 10px', borderRadius: 20 }}>{o.itemsCount || 0} ITEMS</span>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Commercials</span>
                                <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>₹{parseFloat(o.totalAmount || 0).toLocaleString()}</div>
                            </div>

                            <div>
                                <span style={{ display: 'none' }} className="mobile-label">Status</span>
                                <span style={{ 
                                    fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
                                    padding: '4px 12px', borderRadius: 20, 
                                    background: o.status === 'Completed' ? T.greenLight : o.status === 'Pending' ? T.amberLight : T.roseLight,
                                    color: o.status === 'Completed' ? T.green : o.status === 'Pending' ? T.amber : T.rose,
                                    border: `1px solid ${o.status === 'Completed' ? '#A7F3D0' : o.status === 'Pending' ? '#FDE68A' : '#FECDD3'}`
                                }}>{o.status}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }} className="actions-cell">
                                <button 
                                    onClick={() => { setSelectedOrder(o); setShowModal(true); }}
                                    style={{ 
                                        width: 32, height: 32, borderRadius: 10, border: `1px solid ${T.border}`,
                                        background: '#fff', color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', transition: '0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.borderColor = T.accent; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = T.border; }}
                                >
                                    <Eye size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: 14, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><ReceiptText size={24} color={T.subtle} /></div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: T.muted, margin: '0 0 4px' }}>Empty Ledger</h3>
                            <p style={{ fontSize: 11, color: T.subtle, italic: true }}>No transactions identified in this synchronization window</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ──────── DETAIL MODAL ──────── */}
            {showModal && selectedOrder && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(26, 21, 51, 0.4)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ 
                        background: '#fff', width: '100%', maxWidth: 580, borderRadius: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                        overflow: 'hidden', animation: 'zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                    }}>
                        <div style={{ padding: '24px 30px', background: T.bg, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><ReceiptText size={20} /></div>
                                <div>
                                    <h2 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>Order Analysis</h2>
                                    <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', margin: '2px 0 0' }}>Ref: #{String(selectedOrder.id).slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: T.subtle }}><X size={24} /></button>
                        </div>

                        <div style={{ padding: '30px', maxHeight: '75vh', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 30 }}>
                                <div>
                                    <p style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Counterparty</p>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{selectedOrder.memberName || selectedOrder.guestName || 'Guest User'}</div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, marginTop: 2 }}>{selectedOrder.guestPhone || 'ID NOT RECOGNIZED'}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Network Stamp</p>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{new Date(selectedOrder.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, marginTop: 2 }}>{new Date(selectedOrder.createdAt).toLocaleTimeString()}</div>
                                </div>
                            </div>

                            <p style={{ fontSize: 9, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Items in Payload</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {selectedOrder.items?.map((item, idx) => (
                                    <div key={idx} style={{ padding: 16, borderRadius: 16, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#fff', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}><Package size={16} /></div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{item.productName}</div>
                                                <div style={{ fontSize: 10, fontWeight: 600, color: T.muted }}>Qty: {item.quantity} units @ ₹{item.price}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 14, fontWeight: 900, color: T.text }}>₹{(item.quantity * item.price).toLocaleString()}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: 30, padding: 22, borderRadius: 18, background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', boxShadow: '0 10px 24px rgba(124,92,252,0.25)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IndianRupee size={22} /></div>
                                    <div>
                                        <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', opacity: 0.8 }}>Settlement Total</div>
                                        <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.6 }}>Inclusive of all taxes</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 26, fontWeight: 900 }}>₹{parseFloat(selectedOrder.totalAmount || 0).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default StoreOrders;
