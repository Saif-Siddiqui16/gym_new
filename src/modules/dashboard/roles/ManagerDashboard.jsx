import React, { useEffect, useState } from 'react';
import { Clock, Users, Dumbbell, AlertTriangle, Bell, ArrowRight, IndianRupee, Wallet, TrendingUp, Calendar, AlertCircle, Sparkles, RefreshCw, Activity, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import StatsCard from '../components/StatsCard';
import DashboardGrid from '../components/DashboardGrid';
import SectionHeader from '../components/SectionHeader';
import FacilityStatusOverview from '../../operations/components/widgets/FacilityStatusOverview';
import SmartAIoTSummary from '../components/SmartAIoTSummary';
import { EQUIPMENT_INVENTORY } from '../../operations/data/equipmentData';
import apiClient from '../../../api/apiClient';
import { useBranchContext } from '../../../context/BranchContext';
import { toast } from 'react-hot-toast';
import Loader from '../../../components/common/Loader';

const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
};

const S = {
  ff: "'Plus Jakarta Sans', sans-serif",
  card: {
    background: T.surface, borderRadius: 18, border: `1px solid ${T.border}`,
    boxShadow: '0 2px 12px rgba(124,92,252,0.06)', padding: 22, transition: 'all 0.3s ease'
  },
  metricValue: { fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px' },
  iconBox: { width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }
};

const INITIAL_MANAGER_DATA = {
    stats: [
        { id: 1, title: 'Active Members', value: '0', icon: Users, color: 'primary' },
        { id: 2, title: 'Classes Today', value: '0', icon: Calendar, color: 'success' },
        { id: 3, title: 'Payments Due', value: '0', icon: AlertCircle, color: 'warning' },
    ],
    attendance: [],
    financials: { collectionToday: 0, pendingDuesAmount: 0, localExpenses: 0 },
    equipmentStats: { totalAssets: 0, operational: 0, outOfOrder: 0 },
    tasksAndNotices: [],
    taskStats: { total: 0, pending: 0, inProgress: 0, completed: 0, approved: 0, overdue: 0 }
};

const ManagerDashboard = () => {
    const navigate = useNavigate();
    const { selectedBranch } = useBranchContext();
    const [data, setData] = useState(INITIAL_MANAGER_DATA);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const branchId = selectedBranch?.id;
                const headers = branchId ? { 'x-tenant-id': branchId } : {};
                const response = await apiClient.get('/dashboard/manager', { headers });
                const apiData = response.data;
                setData(prev => ({
                    ...prev,
                    stats: [
                        { ...prev.stats[0], value: apiData.activeMembers?.toString() || '0' },
                        { ...prev.stats[1], value: apiData.classesToday?.toString() || '0' },
                        { ...prev.stats[2], value: apiData.paymentsDue?.toString() || '0' }
                    ],
                    attendance: apiData.attendance || prev.attendance,
                    financials: {
                        collectionToday: apiData.collectionToday || 0,
                        pendingDuesAmount: apiData.pendingDuesAmount || 0,
                        localExpenses: apiData.localExpenses || 0
                    },
                    equipmentStats: apiData.equipmentStats || { totalAssets: 0, operational: 0, outOfOrder: 0 },
                    tasksAndNotices: apiData.tasksAndNotices || [],
                    taskStats: apiData.taskStats || INITIAL_MANAGER_DATA.taskStats
                }));
            } catch (error) {
                console.error('Failed to fetch manager dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [selectedBranch]);

    if (loading) return <Loader message="Accessing manager intelligence..." />;

    return (
        <div className="dashboard-container" style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
                .fu { animation: fadeUp 0.38s ease both }
                .fu1 { animation-delay: .05s } .fu2 { animation-delay: .1s } .fu3 { animation-delay: .15s }
                .card-h:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(124,92,252,0.12) !important; }

                .revenue-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                }

                .main-dashboard-grid {
                    display: grid;
                    grid-template-columns: 1.8fr 1fr;
                    gap: 24px;
                    align-items: start;
                }

                @media (max-width: 1200px) {
                    .revenue-grid { grid-template-columns: repeat(2, 1fr); }
                    .main-dashboard-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 768px) {
                    .dashboard-header {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 20px;
                        padding: 24px !important;
                    }
                    .dashboard-header-btn { width: 100%; justify-content: center; }
                    .revenue-grid { grid-template-columns: 1fr; }
                }

                @media (max-width: 480px) {
                    .dashboard-container { padding: 16px 16px 40px !important; }
                    .task-grid-mobile { flex-direction: column; }
                }
            `}</style>

            {/* HEADER BANNER */}
            <div className="fu fu1 dashboard-header" style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
                borderRadius: 22, padding: '24px 30px', boxShadow: '0 8px 32px rgba(124,92,252,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <Sparkles size={28} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 900, color: 'white', margin: 0, letterSpacing: '-0.2px' }}>Manager Dashboard</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0, fontWeight: 500 }}>Daily branch performance and operations</p>
                    </div>
                </div>
                <button className="dashboard-header-btn" onClick={() => window.location.reload()} style={{
                    background: 'white', border: 'none', borderRadius: 12, padding: '10px 20px',
                    color: T.accent, fontWeight: 800, fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* FINANCIAL OVERVIEW */}
            <div className="fu fu2" style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <div style={{ width: 3, height: 16, background: T.accent, borderRadius: 3 }}></div>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: T.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue Protection Today</h3>
                </div>

                <div className="revenue-grid">
                    <div className="card-h" style={{ ...S.card, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                            <div style={{ ...S.iconBox, background: T.greenLight, color: T.green }}><IndianRupee size={20} /></div>
                            <span style={{ fontSize: 10, fontWeight: 800, color: T.green, background: T.greenLight, padding: '4px 10px', borderRadius: 20 }}>Healthy</span>
                        </div>
                        <div style={{ ...S.metricValue }}>₹{data.financials?.collectionToday.toLocaleString()}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginTop: 4 }}>Today's Collection</div>
                    </div>

                    <div className="card-h" style={{ ...S.card, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                            <div style={{ ...S.iconBox, background: T.amberLight, color: T.amber }}><Wallet size={20} /></div>
                            <button onClick={() => navigate('/finance/invoices')} style={{ fontSize: 10, fontWeight: 800, color: T.accent, background: T.accentLight, padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer' }}>Send Reminders</button>
                        </div>
                        <div style={{ ...S.metricValue }}>₹{data.financials?.pendingDuesAmount.toLocaleString()}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginTop: 4 }}>Pending Dues</div>
                    </div>

                    <div className="card-h" style={{ ...S.card, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                            <div style={{ ...S.iconBox, background: T.roseLight, color: T.rose }}><TrendingUp size={20} /></div>
                        </div>
                        <div style={{ ...S.metricValue }}>₹{data.financials?.localExpenses.toLocaleString()}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', marginTop: 4 }}>Local Expenses</div>
                    </div>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="fu fu3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
                {/* STATS CARDS */}
                {data.stats.map((stat, i) => (
                    <div key={i} className="card-h" style={{
                       ...S.card,
                       background: i === 0 ? `linear-gradient(135deg, ${T.accent}, ${T.accent2})` : T.surface,
                       border: i === 0 ? 'none' : S.card.border,
                       color: i === 0 ? 'white' : T.text
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                            <div style={{
                                ...S.iconBox,
                                background: i === 0 ? 'rgba(255,255,255,0.2)' : T.accentLight,
                                color: i === 0 ? 'white' : T.accent
                            }}>
                                <stat.icon size={22} />
                            </div>
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: i === 0 ? 'white' : T.text }}>{stat.value}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: i === 0 ? 'rgba(255,255,255,0.8)' : T.muted, textTransform: 'uppercase' }}>{stat.title}</div>
                    </div>
                ))}
            </div>

            {/* AIOT & FACILITY & MORE */}
            <div className="main-dashboard-grid fu fu3">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="card-h" style={S.card}><SmartAIoTSummary /></div>
                    
                    <div className="card-h" style={S.card}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Dumbbell size={20} color={T.accent} />
                                <h3 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}>Today's Classes</h3>
                            </div>
                            <button onClick={() => navigate('/classes')} style={{ background: 'none', border: 'none', color: T.accent, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                View Schedule <ArrowRight size={14} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {data.attendance.length > 0 ? data.attendance.map((cls, i) => (
                               <div key={i} style={{ background: T.bg, padding: 16, borderRadius: 16 }}>
                                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                       <span style={{ fontWeight: 800, fontSize: 14, color: T.text }}>{cls.name}</span>
                                       <span style={{ fontSize: 12, color: T.muted }}>{cls.time}</span>
                                   </div>
                                   <div style={{ fontSize: 12, color: T.subtle }}>Members enrolled: {cls.count || 0}</div>
                               </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '20px 0', color: T.subtle, fontSize: 12, fontWeight: 700 }}>No classes today</div>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="card-h" style={S.card}><FacilityStatusOverview equipmentStats={data.equipmentStats} /></div>
                    
                    <div className="card-h" style={S.card}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
                             <Bell size={20} color={T.rose} />
                             <h3 style={{ fontSize: 16, fontWeight: 900, color: T.text, margin: 0 }}>Recent Intelligence</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {data.tasksAndNotices.slice(0, 3).map((task, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'start', gap: 12, padding: '12px', background: T.bg, borderRadius: 12 }}>
                                    <Zap size={14} color={T.accent} style={{ marginTop: 2 }} />
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: T.text }}>{task.title}</div>
                                        <div style={{ fontSize: 11, color: T.subtle, marginTop: 2 }}>{task.time || 'Review required'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
