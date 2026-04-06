import React, { useState, useEffect } from 'react';
import { fetchStaffMembers } from '../../../api/superadmin/superAdminApi';
import toast from 'react-hot-toast';
import { 
    Users, 
    Search, 
    Filter, 
    Calendar, 
    Clock, 
    User, 
    Shield, 
    Briefcase,
    ChevronRight,
    Search as SearchIcon,
    Box,
    MoreHorizontal
} from 'lucide-react';
import MobileCard from '../../../components/common/MobileCard';

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
  rose: '#F43F5E',          
  roseLight: '#FFF1F4',
  blue: '#3B82F6',          
  blueLight: '#EFF6FF',
  indigo: '#6366F1',
  indigoLight: '#EEF2FF',
  shadow: '0 10px 30px -10px rgba(124, 92, 252, 0.15)',
  cardShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
};

const StaffSchedule = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const data = await fetchStaffMembers();
            const formatted = data.map(s => ({
                id: s.id,
                name: s.name,
                role: s.role.charAt(0) + s.role.slice(1).toLowerCase(),
                shift: 'Full Day (9AM - 6PM)', // Mocking shift
                status: s.status === 'Active' ? 'On Duty' : 'Off Duty'
            }));
            setStaffList(formatted);
        } catch (error) {
            toast.error('Failed to load staff list');
        } finally {
            setLoading(false);
        }
    };

    const filteredStaff = staffList.filter(staff => {
        const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === '' || staff.role === filterRole || staff.role.toUpperCase() === filterRole.toUpperCase();
        const matchesStatus = filterStatus === '' || staff.status === filterStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'On Duty': return { bg: T.greenLight, color: T.green };
            case 'On Leave': return { bg: T.roseLight, color: T.rose };
            default: return { bg: T.bg, color: T.muted };
        }
    };

    return (
        <div style={{ padding: 32, background: T.bg, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .staff-row:hover { background: ${T.bg} !important; }
            `}</style>

            {/* Header Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 20, background: `linear-gradient(135deg, ${T.accent}, ${T.indigo})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 30px -10px rgba(124, 92, 252, 0.3)' }}>
                        <Users size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>Staff Deployment</h1>
                        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13, fontWeight: 500 }}>Global roster management and shift synchronization</p>
                    </div>
                </div>
                <div style={{ display: 'flex' }}>
                   <div style={{ padding: '4px 16px', borderRadius: 10, background: T.accentLight, color: T.accent, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>Active Roster</div>
                </div>
            </div>

            {/* Filters Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 200px 200px', gap: 16, marginBottom: 32, animation: 'fadeIn 0.6s ease-out' }}>
                <div style={{ position: 'relative' }}>
                    <SearchIcon size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                    <input
                        type="text"
                        placeholder="Search operators, roles, or IDs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', height: 52, padding: '0 16px 0 48px', borderRadius: 16, border: `1.5px solid #fff`, background: '#fff', boxShadow: T.cardShadow, fontSize: 14, fontWeight: 600, color: T.text, outline: 'none', transition: '0.3s' }}
                    />
                </div>

                <div style={{ position: 'relative' }}>
                    <Filter size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        style={{ width: '100%', height: 52, padding: '0 16px 0 44px', borderRadius: 16, border: `1.5px solid #fff`, background: '#fff', boxShadow: T.cardShadow, fontSize: 14, fontWeight: 700, color: T.text, outline: 'none', appearance: 'none', cursor: 'pointer' }}
                    >
                        <option value="">Functional Role</option>
                        <option value="Trainer">Trainer</option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Cleaner">Cleaner</option>
                    </select>
                </div>

                <div style={{ position: 'relative' }}>
                    <Shield size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ width: '100%', height: 52, padding: '0 16px 0 44px', borderRadius: 16, border: `1.5px solid #fff`, background: '#fff', boxShadow: T.cardShadow, fontSize: 14, fontWeight: 700, color: T.text, outline: 'none', appearance: 'none', cursor: 'pointer' }}
                    >
                        <option value="">Duty Status</option>
                        <option value="On Duty">On Duty</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Off Duty">Off Duty</option>
                    </select>
                </div>
            </div>

            {/* Desktop Table View */}
            <div style={{ background: '#fff', borderRadius: 32, boxShadow: T.cardShadow, border: `1.5px solid #fff`, overflow: 'hidden', animation: 'fadeIn 0.7s ease-out' }}>
                <div style={{ padding: '24px 32px', borderBottom: `1.5px solid ${T.bg}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
                        <Users size={20} strokeWidth={2.5} />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>Human Resource Ledger</h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: T.bg + '50' }}>
                                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Personnel Profile</th>
                                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Assigned Class</th>
                                <th style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Temporal Shift</th>
                                <th style={{ padding: '16px 32px', textAlign: 'right', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Operational State</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" style={{ padding: 100, textAlign: 'center' }}><div style={{ width: 40, height: 40, border: `4px solid ${T.accentLight}`, borderTopColor: T.accent, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></td></tr>
                            ) : filteredStaff.length === 0 ? (
                                <tr><td colSpan="4" style={{ padding: 100, textAlign: 'center' }}><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}><div style={{ width: 80, height: 80, borderRadius: 30, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle }}><User size={32} /></div><p style={{ fontSize: 15, fontWeight: 700, color: T.muted }}>No personnel detected in current matrix.</p></div></td></tr>
                            ) : (
                                filteredStaff.map((staff) => {
                                    const st = getStatusStyle(staff.status);
                                    return (
                                        <tr key={staff.id} className="staff-row" style={{ borderBottom: `1.2px solid ${T.bg}`, transition: '0.2s' }}>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                    <div style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg, ${T.accent}, ${T.indigo})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 900, boxShadow: T.shadow }}>
                                                        {staff.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{staff.name}</div>
                                                        <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, fontStyle: 'italic' }}>ID: {staff.id.slice(-6).toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12, background: T.accentLight, color: T.accent, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
                                                    <Briefcase size={12} strokeWidth={3} />
                                                    {staff.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>
                                                        <Clock size={16} />
                                                    </div>
                                                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{staff.shift}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 32px', textAlign: 'right' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12, background: st.bg, color: st.color, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', border: `1.2px solid ${st.color}20` }}>
                                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: st.color }} />
                                                    {staff.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Empty Grid Fallback (Handled by table conditional) */}
        </div>
    );
};

export default StaffSchedule;
