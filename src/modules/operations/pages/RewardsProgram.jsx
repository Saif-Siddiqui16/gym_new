import React, { useState, useEffect } from 'react';
import { rewardApi } from '../../../api/rewardApi';
import toast from 'react-hot-toast';
import { Gift, Plus, Award, Settings, Trash2, Zap, Star, Users, Calendar, ChevronRight, Save, Coins } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import AddRewardDrawer from './AddRewardDrawer';
import { getTenantSettings } from '../../../api/admin/settingsApi';

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

const RewardsProgram = () => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pointsConfig, setPointsConfig] = useState({
        checkIn: 10,
        referral: 500,
        review: 100,
        classBooking: 20
    });
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        loadRewards();
        loadRewardSettings();
    }, []);

    const loadRewardSettings = async () => {
        try {
            const data = await getTenantSettings();
            if (data.referralReward) {
                setPointsConfig(prev => ({ ...prev, referral: data.referralReward }));
            }
        } catch (error) {
            console.error('Failed to load reward settings:', error);
        }
    };

    const loadRewards = async () => {
        try {
            setLoading(true);
            const data = await rewardApi.getAllRewards();
            const formatted = data.map(r => ({
                id: r.id,
                name: r.member, 
                points: r.points,
                description: r.description,
                category: 'Custom'
            }));
            setRewards(formatted || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load rewards');
        } finally {
            setLoading(false);
        }
    };

    const handleAddReward = async (newReward) => {
        try {
            await rewardApi.addReward({
                points: parseInt(newReward.points),
                description: newReward.name || newReward.description
            });
            toast.success('Reward added successfully');
            loadRewards();
            setIsDrawerOpen(false);
        } catch (error) {
            toast.error('Failed to add reward');
        }
    };

    const handleDeleteReward = (id) => {
        setRewards(rewards.filter(r => r.id !== id));
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

    const ConfigRow = ({ label, value, onChange, icon: Icon, color, bg }) => (
        <div style={{ background: T.bg, padding: 16, borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                    style={{ width: 60, height: 36, background: '#fff', border: `1.5px solid ${T.border}`, borderRadius: 10, textAlign: 'center', fontSize: 13, fontWeight: 900, color: T.text, outline: 'none' }}
                />
                <span style={{ fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase' }}>PTS</span>
            </div>
        </div>
    );

    return (
        <div style={{ padding: 32, background: T.bg, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .reward-card:hover { transform: translateY(-5px); box-shadow: ${T.shadow}; border-color: ${T.accentLight} !important; }
            `}</style>

            {/* Header Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 20, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: T.shadow }}>
                        <Gift size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>Rewards Hub</h1>
                        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13, fontWeight: 500 }}>Incentivize member loyalty with automation & point triggers</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <ActionButton onClick={() => setIsDrawerOpen(true)} icon={Plus}>Create Reward</ActionButton>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 32, animation: 'fadeIn 0.6s ease-out' }}>
                {/* Left: Configuration */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ background: '#fff', padding: 32, borderRadius: 32, boxShadow: T.cardShadow, border: `1.5px solid #fff` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
                                <Settings size={20} strokeWidth={2.5} />
                            </div>
                            <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>Earning Automations</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <ConfigRow 
                                label="Member Check-in" 
                                icon={Zap} color={T.green} bg={T.greenLight}
                                value={pointsConfig.checkIn} 
                                onChange={(val) => setPointsConfig({ ...pointsConfig, checkIn: val })} 
                            />
                            <ConfigRow 
                                label="Branch Referral" 
                                icon={Users} color={T.accent} bg={T.accentLight}
                                value={pointsConfig.referral} 
                                onChange={(val) => setPointsConfig({ ...pointsConfig, referral: val })} 
                            />
                            <ConfigRow 
                                label="Google Reviews" 
                                icon={Star} color={T.amber} bg={T.amberLight}
                                value={pointsConfig.review} 
                                onChange={(val) => setPointsConfig({ ...pointsConfig, review: val })} 
                            />
                            <ConfigRow 
                                label="Class Bookings" 
                                icon={Calendar} color={T.indigo} bg={T.indigoLight}
                                value={pointsConfig.classBooking} 
                                onChange={(val) => setPointsConfig({ ...pointsConfig, classBooking: val })} 
                            />
                        </div>

                        <ActionButton 
                            variant="primary" 
                            style={{ width: '100%', marginTop: 24, height: 52 }}
                            icon={Save}
                            onClick={() => toast.success('Configuration synchronized')}
                        >
                            Sync Triggers
                        </ActionButton>
                    </div>

                    <div style={{ background: `linear-gradient(135deg, ${T.accent}, ${T.indigo})`, padding: 32, borderRadius: 32, color: '#fff', position: 'relative', overflow: 'hidden' }}>
                        <Coins size={120} style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.1, transform: 'rotate(-15deg)' }} />
                        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>Loyalty Strategy</h4>
                        <p style={{ margin: '8px 0 0', fontSize: 13, fontWeight: 500, opacity: 0.8, lineHeight: 1.5 }}>
                            Points are calculated in real-time as members interact with the gym ecosystem.
                        </p>
                    </div>
                </div>

                {/* Right: Rewards Listing */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: 0 }}>Active Redemption Items</h3>
                        <span style={{ fontSize: 12, fontWeight: 800, color: T.muted }}>{rewards.length} Rewards Active</span>
                    </div>

                    {loading ? (
                        <div style={{ height: 400, background: '#fff', borderRadius: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Star size={40} color={T.accent} style={{ animation: 'spin 2s linear infinite' }} />
                        </div>
                    ) : rewards.length === 0 ? (
                        <div style={{ height: 400, background: '#fff', borderRadius: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
                            <div style={{ width: 100, height: 100, borderRadius: 40, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle, marginBottom: 24 }}>
                                <Award size={48} />
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: 0 }}>Catalog is Empty</h3>
                            <p style={{ color: T.muted, fontSize: 14, fontWeight: 500, marginTop: 10 }}>Add some redeemable rewards to start the loyalty program.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                            {rewards.map(reward => (
                                <div 
                                    key={reward.id} 
                                    className="reward-card"
                                    style={{ 
                                        background: '#fff', padding: 24, borderRadius: 28, boxShadow: T.cardShadow, border: `1.5px solid #fff`,
                                        transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative'
                                    }}
                                >
                                    <button 
                                        onClick={() => handleDeleteReward(reward.id)}
                                        style={{ position: 'absolute', top: 20, right: 20, width: 32, height: 32, borderRadius: 10, background: T.roseLight, color: T.rose, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                        <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg, ${T.amber}, ${T.amber}dd)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 8px 20px -5px rgba(245, 158, 11, 0.4)' }}>
                                            <Award size={26} strokeWidth={2.5} />
                                        </div>
                                        <div style={{ flex: 1, paddingRight: 40 }}>
                                            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: T.text }}>{reward.name}</h4>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: T.amberLight, borderRadius: 8, marginTop: 6 }}>
                                                <Star size={12} fill={T.amber} color={T.amber} />
                                                <span style={{ fontSize: 11, fontWeight: 900, color: T.amber }}>{reward.points} Points</span>
                                            </div>
                                            <p style={{ margin: '14px 0 0', fontSize: 13, color: T.muted, fontWeight: 500, lineHeight: 1.5, minHeight: 40 }}>
                                                {reward.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1.5px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: 11, fontWeight: 800, color: T.subtle, textTransform: 'uppercase' }}>Redeemable Item</span>
                                        <ChevronRight size={18} color={T.subtle} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <RightDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Create Reward">
                <AddRewardDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onAdd={handleAddReward} />
            </RightDrawer>
        </div>
    );
};

export default RewardsProgram;
