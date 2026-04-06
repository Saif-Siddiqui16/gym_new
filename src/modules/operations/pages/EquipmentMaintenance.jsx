import React, { useState, useEffect } from 'react';
import { equipmentApi } from '../../../api/equipmentApi';
import toast from 'react-hot-toast';
import { 
    Wrench, 
    CheckCircle, 
    AlertTriangle, 
    Plus, 
    Sparkles, 
    Calendar,
    Settings,
    MoreHorizontal,
    Box,
    ChevronRight,
    Search
} from 'lucide-react';
import MobileCard from '../../../components/common/MobileCard';
import RightDrawer from '../../../components/common/RightDrawer';
import AddEquipmentDrawer from './AddEquipmentDrawer';

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

const EquipmentMaintenance = () => {
    const [equipment, setEquipment] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadEquipment();
    }, []);

    const loadEquipment = async () => {
        try {
            setLoading(true);
            const data = await equipmentApi.getAllEquipment();
            const formatted = data.map(item => ({
                id: item.id,
                name: item.name,
                status: item.status === 'Operational' ? 'Working' :
                    item.status === 'Under Maintenance' ? 'Under Maintenance' :
                    item.status === 'Out of Order' ? 'Out of Order' : 'Working',
                lastMaintenance: item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'N/A',
                nextMaintenance: item.warrantyExpiry ? new Date(item.warrantyExpiry).toLocaleDateString() : 'N/A',
                category: item.category || 'Standard'
            }));
            setEquipment(formatted);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load equipment");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (newItem) => {
        try {
            await equipmentApi.addEquipment({
                name: newItem.name,
                status: newItem.status === 'Working' ? 'Operational' : newItem.status,
                purchaseDate: newItem.purchaseDate,
                warrantyExpiry: newItem.warrantyExpiry,
                brand: newItem.brand,
                category: newItem.category
            });
            toast.success("Equipment added successfully");
            loadEquipment();
            setIsDrawerOpen(false);
        } catch (error) {
            toast.error("Failed to add equipment");
        }
    };

    const handleInternalStatusUpdate = async (id, newStatus) => {
        try {
            const apiStatus = newStatus === 'Working' ? 'Operational' : newStatus;
            await equipmentApi.updateEquipment(id, { status: apiStatus });
            toast.success(`Status updated to ${newStatus}`);
            loadEquipment();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Working': return { bg: T.greenLight, color: T.green, icon: CheckCircle };
            case 'Under Maintenance': return { bg: T.amberLight, color: T.amber, icon: Wrench };
            case 'Out of Order': return { bg: T.roseLight, color: T.rose, icon: AlertTriangle };
            default: return { bg: T.bg, color: T.muted, icon: Settings };
        }
    };

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

    const filteredEquipment = equipment.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: 32, background: T.bg, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .equipment-row:hover { background: ${T.bg} !important; }
            `}</style>

            {/* Header Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 20, background: `linear-gradient(135deg, ${T.accent}, ${T.indigo})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 30px -10px rgba(124, 92, 252, 0.3)' }}>
                        <Wrench size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>Asset Engineering</h1>
                        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13, fontWeight: 500 }}>Monitor and optimize machine reliability across zones</p>
                    </div>
                </div>
                <ActionButton onClick={() => setIsDrawerOpen(true)} icon={Plus}>Catalog New Unit</ActionButton>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, animation: 'fadeIn 0.6s ease-out' }}>
                <div style={{ position: 'relative', width: 400 }}>
                    <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                    <input
                        type="text"
                        placeholder="Search assets or categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', height: 52, padding: '0 16px 0 48px', borderRadius: 16, border: `1.5px solid #fff`, background: '#fff', boxShadow: T.cardShadow, fontSize: 14, fontWeight: 600, color: T.text, outline: 'none', transition: '0.3s' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ display: 'flex', background: '#fff', padding: 6, borderRadius: 14, boxShadow: T.cardShadow, border: `1.5px solid #fff` }}>
                        <div style={{ padding: '8px 16px', borderRadius: 10, background: T.bg, color: T.accent, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>All Zones</div>
                    </div>
                </div>
            </div>

            {/* Desktop Table */}
            <div style={{ background: '#fff', borderRadius: 32, boxShadow: T.cardShadow, border: `1.5px solid #fff`, overflow: 'hidden', animation: 'fadeIn 0.7s ease-out' }}>
                <div style={{ padding: '24px 32px', borderBottom: `1.5px solid ${T.bg}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
                        <Box size={20} strokeWidth={2.5} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>Registry Logs</h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: T.bg + '50' }}>
                                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Machine Node</th>
                                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Operational State</th>
                                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Last Refurb</th>
                                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Predicted Service</th>
                                <th style={{ padding: '16px 32px', textAlign: 'right', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: 100, textAlign: 'center' }}><div style={{ width: 40, height: 40, border: `4px solid ${T.accentLight}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></td></tr>
                            ) : filteredEquipment.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: 100, textAlign: 'center' }}><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}><div style={{ width: 80, height: 80, borderRadius: 30, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle }}><Wrench size={32} /></div><p style={{ fontSize: 15, fontWeight: 700, color: T.muted }}>No equipment identified.</p></div></td></tr>
                            ) : (
                                filteredEquipment.map((item) => {
                                    const st = getStatusStyle(item.status);
                                    return (
                                        <tr key={item.id} className="equipment-row" style={{ borderBottom: `1.2px solid ${T.bg}`, transition: '0.2s' }}>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
                                                        <Box size={22} />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{item.name}</div>
                                                        <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, textTransform: 'uppercase' }}>{item.category}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12, background: st.bg, color: st.color, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
                                                    <st.icon size={12} strokeWidth={3} />
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: T.text }}>
                                                    <Calendar size={14} style={{ color: T.subtle }} />
                                                    {item.lastMaintenance}
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800, color: T.accent }}>
                                                    <Calendar size={14} style={{ color: T.accent2 }} />
                                                    {item.nextMaintenance}
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => handleInternalStatusUpdate(item.id, e.target.value)}
                                                    style={{ height: 40, padding: '0 12px', borderRadius: 12, border: `1.5px solid ${T.border}`, fontSize: 11, fontWeight: 800, color: T.text, outline: 'none', cursor: 'pointer', background: '#fff' }}
                                                >
                                                    <option value="Working">Operational</option>
                                                    <option value="Under Maintenance">Maintenance</option>
                                                    <option value="Out of Order">Out of Order</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Right Side Drawer */}
            <AddEquipmentDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onAdd={handleAdd}
            />
        </div>
    );
};

export default EquipmentMaintenance;
