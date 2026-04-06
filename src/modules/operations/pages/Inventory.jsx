import React, { useState, useEffect } from 'react';
import { inventoryApi } from '../../../api/inventoryApi';
import toast from 'react-hot-toast';
import { 
    AlertTriangle, 
    CheckCircle, 
    Package, 
    Search, 
    Filter, 
    Plus, 
    ArrowUpRight, 
    ArrowDownRight, 
    Box, 
    Trash2, 
    ChevronDown,
    RefreshCw,
    TrendingUp
} from 'lucide-react';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC',        
  accent2: '#9B7BFF',       
  accentLight: '#F0ECFF',   
  accentMid: '#E4DCFF',     
  border: '#EAE7FF',        
  bg: '#F6F5FF',            
  surface: '#FFFFFF',       
  text: '#1A1533',          
  muted: '#7B7A8E',         
  subtle: '#B0ADCC',        
  green: '#22C97A',         
  greenLight: '#E8FBF2',
  amber: '#F59E0B',         
  amberLight: '#FEF3C7',
  rose: '#F43F5E',          
  roseLight: '#FFF1F4',
  blue: '#3B82F6',          
  blueLight: '#EFF6FF',
  indigo: '#6366F1',
  indigoLight: '#EEF2FF',
  shadow: '0 10px 30px -10px rgba(124, 92, 252, 0.15)',
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
};

const Inventory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const data = await inventoryApi.getAllInventory();
            setInventory(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    const getStockBadge = (status) => {
        const isLow = status === 'Low Stock';
        const isOut = status === 'Out of Stock';
        
        let color = T.green;
        let bg = T.greenLight;
        let Icon = CheckCircle;

        if (isOut) { color = T.rose; bg = T.roseLight; Icon = AlertTriangle; }
        else if (isLow) { color = T.amber; bg = T.amberLight; Icon = AlertTriangle; }

        return (
            <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', 
                borderRadius: 20, background: bg, border: `1px solid ${color}20` 
            }}>
                <Icon size={12} color={color} strokeWidth={3} />
                <span style={{ fontSize: 10, fontWeight: 900, color: color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{status}</span>
            </div>
        );
    };

    const lowStockCount = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock').length;

    const filteredInventory = inventory.filter(item =>
        (filterCategory === 'All' || item.category === filterCategory) &&
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = ['All', ...new Set(inventory.map(item => item.category))];

    const ActionButton = ({ children, onClick, variant = 'primary', icon: Icon, style = {} }) => (
        <button
            onClick={onClick}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = T.shadow; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            style={{
                height: 48, padding: '0 24px', borderRadius: 14, border: variant === 'outline' ? `2px solid ${T.border}` : 'none',
                background: variant === 'outline' ? '#fff' : T.accent, color: variant === 'outline' ? T.text : '#fff',
                fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10, transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', ...style
            }}
        >
            {Icon && <Icon size={18} strokeWidth={2.5} />}
            {children}
        </button>
    );

    return (
        <div style={{ padding: 32, background: T.bg, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .inv-row:hover { background: ${T.accentLight}50 !important; cursor: pointer; }
                input::placeholder, select::placeholder { color: ${T.subtle}; opacity: 1; }
            `}</style>

            {/* Header Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 20, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: T.shadow }}>
                        <Package size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>Inventory Control</h1>
                        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13, fontWeight: 500 }}>Monitor stock levels, supplies and gym equipment</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <ActionButton 
                        onClick={async () => {
                            const name = prompt('Item Name:');
                            if (!name) return;
                            const cat = prompt('Category:', 'Supplies');
                            const qty = prompt('Quantity:', '10');
                            try {
                                await inventoryApi.addInventoryItem({
                                    itemName: name,
                                    category: cat,
                                    quantity: qty,
                                    unit: 'pcs',
                                    minThreshold: 5
                                });
                                toast.success('Item added');
                                fetchInventory();
                            } catch (e) {
                                toast.error('Failed to add item');
                            }
                        }}
                        icon={Plus}
                    >
                        New Product
                    </ActionButton>
                </div>
            </div>

            {/* Alert Banner */}
            {lowStockCount > 0 && (
                <div style={{ 
                    background: '#fff', padding: '16px 24px', borderRadius: 24, boxShadow: '0 10px 40px -10px rgba(244, 63, 94, 0.15)', 
                    border: `2px solid ${T.roseLight}`, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 20, animation: 'fadeIn 0.6s ease-out' 
                }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: T.roseLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.rose }}>
                        <AlertTriangle size={20} strokeWidth={2.5} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: 13, fontWeight: 900, color: T.rose, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Restock Alert</h4>
                        <p style={{ margin: '2px 0 0', color: T.muted, fontSize: 13, fontWeight: 500 }}><b>{lowStockCount} items</b> are currently below safety threshold or out of stock.</p>
                    </div>
                    <ActionButton variant="outline" style={{ height: 40, padding: '0 16px', fontSize: 11, borderColor: T.roseLight, color: T.rose }} onClick={() => setFilterCategory('Low Stock')}>Resolve Now</ActionButton>
                </div>
            )}

            {/* Main Content Area */}
            <div style={{ background: '#fff', borderRadius: 32, boxShadow: T.cardShadow, overflow: 'hidden', animation: 'fadeIn 0.7s ease-out' }}>
                {/* Search & Filters */}
                <div style={{ padding: 24, borderBottom: `1.5px solid ${T.bg}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 300 }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} size={18} />
                            <input 
                                type="text"
                                placeholder="Search products by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', height: 48, background: T.bg, border: 'none', borderRadius: 16, padding: '0 20px 0 52px', color: T.text, fontSize: 13, fontWeight: 600, outline: 'none' }}
                            />
                        </div>
                        <div style={{ position: 'relative', width: 220 }}>
                            <Filter style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} size={18} />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                style={{ width: '100%', height: 48, background: T.bg, border: 'none', borderRadius: 16, padding: '0 40px 0 48px', color: T.text, fontSize: 13, fontWeight: 600, outline: 'none', appearance: 'none', cursor: 'pointer' }}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <ChevronDown size={18} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle, pointerEvents: 'none' }} />
                        </div>
                    </div>
                    <button 
                        onClick={fetchInventory}
                        style={{ width: 44, height: 44, borderRadius: 14, border: `1.5px solid ${T.border}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted, cursor: 'pointer' }}
                    >
                        <RefreshCw size={18} style={{ animation: loading ? 'spin 1.5s linear infinite' : 'none' }} />
                    </button>
                </div>

                <div style={{ padding: 32 }}>
                    {loading ? (
                        <div style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                            <RefreshCw size={48} color={T.accent} style={{ animation: 'spin 2s linear infinite' }} />
                            <p style={{ fontSize: 12, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Syncing Warehouse...</p>
                        </div>
                    ) : filteredInventory.length === 0 ? (
                        <div style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            <div style={{ width: 100, height: 100, borderRadius: 40, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle, marginBottom: 24 }}>
                                <Package size={48} />
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: 0 }}>No Products Map</h3>
                            <p style={{ color: T.muted, fontSize: 14, fontWeight: 500, marginTop: 10 }}>We couldn't find any items matching your filters.</p>
                        </div>
                    ) : (
                        <div style={{ borderRadius: 24, border: `1.5px solid ${T.bg}`, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: T.bg }}>
                                        <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Product details</th>
                                        <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Category</th>
                                        <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Onhand Qty</th>
                                        <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Safety Floor</th>
                                        <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Stock Health</th>
                                        <th style={{ padding: '20px 24px', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Management</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInventory.map((item) => (
                                        <tr key={item.id} className="inv-row" style={{ borderBottom: `1.5px solid ${T.bg}`, transition: '0.2s', background: '#fff' }}>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Box size={22} strokeWidth={2.5} />
                                                    </div>
                                                    <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{item.itemName}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <span style={{ padding: '4px 10px', borderRadius: 8, background: T.bg, color: T.muted, fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>{item.category}</span>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ fontSize: 14, fontWeight: 900, color: T.text }}>{item.quantity}</span>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: T.subtle }}>{item.unit}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px', fontSize: 13, fontWeight: 700, color: T.muted }}>
                                                {item.minThreshold}
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                {getStockBadge(item.status)}
                                            </td>
                                            <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                    <button 
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            const qty = prompt('Add to stock:', '10');
                                                            if (qty) {
                                                                await inventoryApi.receiveStock({ itemId: item.id, quantity: qty });
                                                                toast.success('Added');
                                                                fetchInventory();
                                                            }
                                                        }}
                                                        style={{ height: 32, padding: '0 12px', borderRadius: 8, border: 'none', background: T.greenLight, color: T.green, fontSize: 10, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}
                                                    >
                                                        + Receive
                                                    </button>
                                                    <button 
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (confirm('Permanently remove this item?')) {
                                                                await inventoryApi.deleteInventoryItem(item.id);
                                                                toast.success('Deleted');
                                                                fetchInventory();
                                                            }
                                                        }}
                                                        style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: T.roseLight, color: T.rose, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                    >
                                                        <Trash2 size={16} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Inventory;
