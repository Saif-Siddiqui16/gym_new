import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, User, Filter, MoreVertical, Mail, Phone, Briefcase, DollarSign, Edit, Download, Users, Shield, ArrowRight, Activity, Star } from 'lucide-react';
import Loader from '../../../components/common/Loader';
import { getAllStaff } from '../../../api/manager/managerApi';
import { exportPdf } from '../../../utils/exportPdf';
import { useBranchContext } from '../../../context/BranchContext';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF'
};

// Header Banner Component
const HeaderBanner = ({ title, sub, icon: Icon, actions }) => (
    <div style={{
        background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
        borderRadius: 24, padding: '24px 30px',
        boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, position: 'relative', overflow: 'hidden'
    }} className="fu fu1">
        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative', zIndex: 2 }}>
            <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', flexShrink: 0
            }}>
                <Icon size={28} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
                <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '6px 0 0', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{sub}</p>
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 2 }}>
            {actions}
        </div>
    </div>
);

const StaffList = () => {
    const navigate = useNavigate();
    const { selectedBranch } = useBranchContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);

    const departments = ['All', 'Training', 'Sales', 'Housekeeping', 'Operations'];

    const loadStaff = async () => {
        try {
            setLoading(true);
            const data = await getAllStaff(selectedBranch);
            setStaffList(data || []);
        } catch (error) {
            toast.error("Failed to fetch staff directory");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadStaff(); }, [selectedBranch]);

    const filteredStaff = staffList.filter(staff =>
        (departmentFilter === 'All' || staff.department === departmentFilter) &&
        ((staff.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (staff.role || '').toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleExport = () => {
        if (filteredStaff.length === 0) return toast.error("No staff data to export");
        const headers = ["ID", "Name", "Role", "Department", "Salary", "Status"];
        const rows = filteredStaff.map(s => [s.id, s.name, s.role, s.department, `₹${s.salary?.toLocaleString() || 0}`, s.status]);
        exportPdf({ title: 'Staff Directory Report', filename: `Staff_Report_${new Date().toISOString().split('T')[0]}`, headers, rows, gymName: "Roar Fitness" });
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.38s ease both; }
                .fu1 { animation-delay: .05s; } .fu2 { animation-delay: .1s; } .fu3 { animation-delay: .15s; }
                
                .grid-header {
                    display: grid; grid-template-columns: 2fr 1.2fr 1.2fr 0.8fr 80px;
                    padding: 14px 24px; background: ${T.accentLight}; color: ${T.accent};
                    font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;
                }
                .grid-row {
                    display: grid; grid-template-columns: 2fr 1.2fr 1.2fr 0.8fr 80px; 
                    padding: 18px 24px; border-bottom: 1px solid ${T.border}; align-items: center; transition: 0.2s;
                    background: ${T.surface};
                }
                .grid-row:hover { background: ${T.bg}; }
                .dept-tab { border: none; cursor: pointer; padding: 10px 18px; borderRadius: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; transition: 0.2s; }
            `}</style>

            <HeaderBanner 
                title="Staff Directory" 
                sub={`Managing ${staffList.length} professional workforce members in this branch`} 
                icon={Users}
                actions={
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button onClick={handleExport} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 18px', borderRadius: 12, color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Download size={16} /> Export
                        </button>
                        <button onClick={() => navigate('/hr/staff/add')} style={{ background: '#fff', border: 'none', padding: '10px 18px', borderRadius: 12, color: T.accent, fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                            <Plus size={16} /> Onboard Staff
                        </button>
                    </div>
                }
            />

            {/* Filter Hub */}
            <div className="fu fu2" style={{ display: 'flex', gap: 20, marginBottom: 24, background: T.surface, padding: 16, borderRadius: 24, border: `1px solid ${T.border}`, alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} color={T.subtle} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" placeholder="Search employees by name, role or ID..." 
                        style={{ width: '100%', padding: '12px 12px 12px 48px', borderRadius: 14, border: `1px solid ${T.border}`, background: T.bg, fontSize: 13, fontWeight: 600, color: T.text, outline: 'none' }}
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {departments.map(dept => (
                        <button key={dept} onClick={() => setDepartmentFilter(dept)} className="dept-tab" style={{ background: departmentFilter === dept ? T.accent : T.bg, color: departmentFilter === dept ? '#fff' : T.muted }}>
                            {dept}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="fu fu3" style={{ borderRadius: 24, border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.03)' }}>
                {loading ? (
                    <div style={{ padding: '100px 0', background: T.surface }}><Loader message="Analyzing Personnel Database..." /></div>
                ) : (
                    <>
                        <div className="grid-header">
                            {['Personnel Details', 'Department', 'Compensation', 'Status', 'Edit'].map(h => <span key={h}>{h}</span>)}
                        </div>
                        {filteredStaff.length > 0 ? filteredStaff.map((staff, i) => (
                            <div key={staff.id} className="grid-row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 16, background: i % 2 === 0 ? T.accentLight : T.blueLight, color: i % 2 === 0 ? T.accent : T.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: `1px solid ${T.border}` }}>
                                        {staff.avatar ? <img src={staff.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={22} />}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 900, color: T.text, letterSpacing: '-0.3px' }}>{staff.name}</div>
                                        <div style={{ fontSize: 10, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', marginTop: 2 }}>{staff.role} • ID: {staff.memberId || staff.id}</div>
                                    </div>
                                </div>
                                <div>
                                    <span style={{ fontSize: 10, fontWeight: 900, color: T.muted, background: T.bg, padding: '4px 12px', borderRadius: 8, textTransform: 'uppercase' }}>{staff.department}</span>
                                </div>
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 900, color: T.text }}>₹{staff.salary?.toLocaleString() || 0}</div>
                                    {staff.commission > 0 && <div style={{ fontSize: 10, fontWeight: 800, color: T.green }}>+{staff.commission}% Performance</div>}
                                </div>
                                <div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', padding: '5px 12px', borderRadius: 20, background: staff.status === 'Active' ? T.greenLight : T.amberLight, color: staff.status === 'Active' ? T.green : T.amber }}>
                                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: staff.status === 'Active' ? T.green : T.amber }} />
                                        {staff.status}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button onClick={() => navigate(`/hr/staff/edit/${staff.id}`)} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${T.border}`, background: '#fff', color: T.subtle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = T.accent} onMouseLeave={e => e.currentTarget.style.color = T.subtle}>
                                        <Edit size={16} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div style={{ padding: '80px 20px', textAlign: 'center', background: T.surface }}>
                                <div style={{ width: 64, height: 64, borderRadius: 20, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: T.subtle }}><Users size={32} /></div>
                                <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: '0 0 8px' }}>No matches found</h3>
                                <p style={{ fontSize: 13, color: T.muted }}>Adjust your filters or try a different search</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default StaffList;
