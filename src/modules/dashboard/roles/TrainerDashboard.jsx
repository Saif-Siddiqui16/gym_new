import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, User, CheckCircle, Clock, Users, TrendingUp,
    Dumbbell, Activity, ArrowRight, Zap, BarChart2, Star, CheckCircle2, Info, Plus, Save, X, BookmarkPlus, RefreshCcw, Shield, Utensils, UserCheck, MessageSquare, IndianRupee, Target, Radio, Layout, Fingerprint, Lock, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useBranchContext } from '../../../context/BranchContext';
import * as trainerApi from '../../../api/trainer/trainerApi';
import { toast } from 'react-hot-toast';

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

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, color, bg, subtitle, index }) => (
    <div style={{
        background: T.surface, borderRadius: 22, border: `1px solid ${T.border}`,
        padding: 24, boxShadow: '0 2px 14px rgba(124,92,252,0.04)', display: 'flex', flexDirection: 'column', gap: 12
    }} className={`fu fu${index + 2}`}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} strokeWidth={2.5} />
        </div>
        <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: '-0.5px' }}>{value}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2 }}>{title}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.subtle }}>{subtitle}</div>
        </div>
    </div>
);

const TrainerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { selectedBranch } = useBranchContext();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        stats: {
            activeGeneralClients: 0, ptClientsCount: 0, todaySessionsCount: 0, 
            completedToday: 0, pendingToday: 0, myClassesCount: 0, 
            completionRate: 0, monthlyCommission: 0, monthlyAttendance: 0, salary: 0
        },
        todaySessions: [],
        myClients: [],
        upcomingClass: null
    });

    useEffect(() => { loadDashboardData(); }, [selectedBranch]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const response = await trainerApi.getTrainerDashboardStats(selectedBranch);
            setData(response);
        } catch (error) {
            console.error(error);
            toast.error('Sync failure');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div style={{ background: T.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } } .sp { border: 3px solid ${T.accentMid}; border-top-color: ${T.accent}; animation: spin 0.8s linear infinite; }`}</style>
            <div className="sp" style={{ width: 44, height: 44, borderRadius: '50%' }} />
            <p style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '2px' }}>Analyzing Performance Ledger...</p>
        </div>
    );

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
                .fu { animation: fadeUp 0.38s ease both; }
                .fu1 { animation-delay: .05s; } .fu2 { animation-delay: .1s; } .fu3 { animation-delay: .15s; } .fu4 { animation-delay: .2s; }
            `}</style>

            <HeaderBanner 
                title={`Good Morning, Coach ${user?.name?.split(' ')[0] || 'Trainer'}!`} 
                sub="Your personalized performance matrix and daily roster" 
                icon={ShieldCheck}
                actions={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 18px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 10, backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                             <Activity size={16} color="#fff" />
                             <span style={{ fontSize: 11, fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>{data.stats.completionRate || 0}% Session Efficiency</span>
                        </div>
                    </div>
                }
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 30 }}>
                <MetricCard title="General Clients" value={data.stats.activeGeneralClients} icon={Users} color={T.accent} bg={T.accentLight} subtitle="Portfolio" index={0} />
                <MetricCard title="PT Clients" value={data.stats.ptClientsCount} icon={User} color={T.blue} bg={T.blueLight} subtitle="Personal" index={1} />
                <MetricCard title="Sessions Today" value={data.stats.todaySessionsCount} icon={Clock} color={T.amber} bg={T.amberLight} subtitle={`${data.stats.completedToday} Done`} index={2} />
                <MetricCard title="Completion" value={`${data.stats.completionRate}%`} icon={CheckCircle2} color={T.green} bg={T.greenLight} subtitle="Daily Goal" index={3} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 30 }} className="fu fu3">
                {/* Left: Schedule and Directives */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                    {/* Quick Directives */}
                    <div style={{ background: T.surface, padding: 24, borderRadius: 32, border: `1px solid ${T.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <h3 style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Zap size={16} color={T.accent} /> Quick Directives
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                            {[
                                { label: 'Diet Matrix', path: '/diet-plans', icon: Utensils, color: T.accent, bg: T.accentLight },
                                { label: 'Workouts', path: '/workout-plans', icon: Flame, color: T.amber, bg: T.amberLight },
                                { label: 'Attendance', path: '/trainer/attendance', icon: UserCheck, color: T.green, bg: T.greenLight },
                                { label: 'My Roster', path: '/trainer/members/assigned', icon: Users, color: T.blue, bg: T.blueLight },
                            ].map((btn, i) => (
                                <button key={i} onClick={() => navigate(btn.path)} style={{
                                    background: btn.bg, border: 'none', borderRadius: 20, padding: '20px 10px', 
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer', transition: '0.2s',
                                }}>
                                    <div style={{ color: btn.color }}><btn.icon size={22} /></div>
                                    <span style={{ fontSize: 10, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{btn.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Today's Schedule */}
                    <div style={{ background: T.surface, padding: 30, borderRadius: 32, border: `1px solid ${T.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h3 style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Daily Session Buffer</h3>
                            <span style={{ fontSize: 10, fontWeight: 800, color: T.subtle }}>Today, {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {data.todaySessions.length > 0 ? data.todaySessions.map((session, i) => (
                                <div key={i} style={{ padding: '20px 24px', borderRadius: 20, background: T.bg, border: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 14, background: T.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 900 }}>{session.member_name?.charAt(0)}</div>
                                        <div>
                                            <div style={{ fontSize: 15, fontWeight: 800, color: T.text }}>{session.member_name}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, fontSize: 11, fontWeight: 700, color: T.subtle }}>
                                                <Clock size={12} /> {session.session_time}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                         <div style={{ background: session.status === 'Completed' ? T.greenLight : T.amberLight, color: session.status === 'Completed' ? T.green : T.amber, padding: '4px 10px', borderRadius: 8, fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }}>{session.status}</div>
                                         <button onClick={() => navigate('/trainer/attendance')} style={{ width: 32, height: 32, borderRadius: 10, border: 'none', background: '#fff', color: T.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}><ArrowRight size={16} /></button>
                                    </div>
                                </div>
                            )) : (
                                <div style={{ padding: '60px 0', textAlign: 'center', border: `2px dashed ${T.border}`, borderRadius: 24 }}>
                                    <Calendar size={32} color={T.subtle} style={{ marginBottom: 12 }} />
                                    <p style={{ fontSize: 13, fontWeight: 700, color: T.muted }}>No sessions found for today</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Earnings & Upcoming Class */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                    {/* Finance Ledger */}
                    <div style={{ background: '#1A1533', padding: 32, borderRadius: 32, color: '#fff', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                        <h4 style={{ fontSize: 11, fontWeight: 900, color: T.accent2, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 24 }}>Monthly Earnings</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <div>
                                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 800, marginBottom: 4, textTransform: 'uppercase' }}>Total Estimated</div>
                                    <div style={{ fontSize: 36, fontWeight: 900 }}>₹{(data.stats.salary || 0).toLocaleString()}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 10, color: T.green, fontWeight: 900 }}>+{data.stats.monthlyAttendance || 0}d ATTENDANCE</div>
                                </div>
                            </div>
                            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase' }}>Commission</div><div style={{ fontSize: 16, fontWeight: 900 }}>₹{(data.stats.monthlyCommission || 0).toLocaleString()}</div></div>
                                <div style={{ textAlign: 'right' }}><div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase' }}>Base Payout</div><div style={{ fontSize: 16, fontWeight: 900 }}>₹{((data.stats.salary || 0) - (data.stats.monthlyCommission || 0)).toLocaleString()}</div></div>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming HQ Session */}
                    <div style={{ background: T.surface, padding: 30, borderRadius: 32, border: `1px solid ${T.border}`, flex: 1 }}>
                        <h3 style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 20 }}>Upcoming HQ Session</h3>
                        {data.upcomingClass ? (
                            <div style={{ background: T.bg, padding: 24, borderRadius: 24, border: `1px solid ${T.border}`, position: 'relative' }}>
                                <div style={{ fontSize: 11, fontWeight: 900, color: T.accent, textTransform: 'uppercase', marginBottom: 8 }}>NEXT CLASS</div>
                                <h4 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: '0 0 12px' }}>{data.upcomingClass.name}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 700, color: T.muted, marginBottom: 20 }}>
                                    <Clock size={16} /> {data.upcomingClass.time}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 800, color: T.muted }}><Users size={16} /> {data.upcomingClass.enrolled || 0} Registered</div>
                                    <button onClick={() => navigate(`/trainer/classes/${data.upcomingClass.id}`)} style={{ background: T.accent, color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 12, fontSize: 11, fontWeight: 900, cursor: 'pointer' }}>JOIN BOUT</button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '60px 20px', textAlign: 'center', border: `2px dashed ${T.border}`, borderRadius: 24 }}>
                                <Dumbbell size={32} color={T.subtle} style={{ marginBottom: 12 }} />
                                <p style={{ fontSize: 13, fontWeight: 700, color: T.muted }}>No HQ sessions scheduled</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
