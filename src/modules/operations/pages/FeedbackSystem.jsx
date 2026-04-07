import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import {
    MessageSquare,
    Star,
    Clock,
    CheckCircle2,
    Search,
    Filter,
    BarChart3,
    ArrowUpRight,
    MoreHorizontal,
    Loader2,
    Check,
    X,
    ExternalLink,
    Share2,
    MapPin,
    ChevronRight,
    Search as SearchIcon
} from 'lucide-react';
import { feedbackApi } from '../../../api/feedbackApi';
import RightDrawer from '../../../components/common/RightDrawer';
import toast from 'react-hot-toast';

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

const FeedbackSystem = ({ role }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [newFeedback, setNewFeedback] = useState({ rating: 5, comment: '' });
    const [googleConfig, setGoogleConfig] = useState({ enabled: false, link: '' });
    const [showGoogleSuccess, setShowGoogleSuccess] = useState(false);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            setLoading(true);
            const data = await feedbackApi.getAllFeedback();
            setFeedback(data.feedback || []);
            setGoogleConfig({
                enabled: data.googleBusinessEnabled,
                link: data.googleReviewLink
            });
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePublishToGoogle = async (id) => {
        try {
            await feedbackApi.publishToGoogle(id);
            fetchFeedback();
            toast.success('Feedback marked as published to Google');
        } catch (error) {
            console.error('Error publishing to Google:', error);
            toast.error('Failed to mark as published');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await feedbackApi.updateFeedbackStatus(id, status);
            fetchFeedback();
            setActiveMenu(null);
            toast.success('Feedback status updated');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        try {
            toast.loading('Submitting feedback...', { id: 'submit-feedback' });
            await feedbackApi.addFeedback(newFeedback);
            toast.success('Feedback submitted successfully!', { id: 'submit-feedback' });
            setIsSubmitModalOpen(false);
            setNewFeedback({ rating: 5, comment: '' });
            fetchFeedback();
            if (newFeedback.rating >= 4 && googleConfig.enabled && googleConfig.link) {
                setShowGoogleSuccess(true);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            toast.error('Failed to submit feedback. Try again.', { id: 'submit-feedback' });
        }
    };

    const stats = {
        total: feedback.length,
        avgRating: feedback.length > 0
            ? (feedback.reduce((acc, curr) => acc + curr.rating, 0) / feedback.length).toFixed(1)
            : '0',
        pending: feedback.filter(f => f.status === 'Pending').length,
        resolved: feedback.filter(f => f.status === 'Resolved').length
    };

    const filteredFeedback = feedback.filter(f => {
        const searchLow = searchTerm.toLowerCase();
        const matchesSearch =
            (f.member || '').toLowerCase().includes(searchLow) ||
            (f.comment || '').toLowerCase().includes(searchLow);
        const matchesStatus = statusFilter === 'All Status' || f.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Resolved': return { bg: T.greenLight, color: T.green };
            case 'Pending': return { bg: T.amberLight, color: T.amber };
            case 'Reviewed': return { bg: T.accentLight, color: T.accent };
            default: return { bg: '#F1F5F9', color: '#64748B' };
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

    const StatCard = ({ label, value, icon: Icon, color, subValue }) => (
        <div style={{ background: '#fff', padding: 24, borderRadius: 28, boxShadow: T.cardShadow, border: `1.5px solid #fff`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: T.text }}>{value}</h3>
                    {subValue && <span style={{ fontSize: 14, fontWeight: 700, color: T.muted, paddingBottom: 6 }}>{subValue}</span>}
                </div>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
        </div>
    );

    return (
        <div className="feedback-container" style={{ padding: 32, background: T.bg, minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* ... style tags ... */}

            {/* Header Section */}
            <div className="header-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 60, height: 60, borderRadius: 20, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: T.shadow }}>
                        <MessageSquare size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="banner-title" style={{ fontSize: 32, fontWeight: 900, color: T.text, margin: 0, letterSpacing: '-0.02em' }}>
                            {role === 'MEMBER' ? 'My Feedback' : 'Member Feedback'}
                        </h1>
                        <p style={{ margin: '4px 0 0', color: T.muted, fontSize: 13, fontWeight: 500 }}>
                            {role === 'MEMBER' ? 'Your direct channel to gym management & suggestions' : 'Manage member satisfaction and bridge communication gaps'}
                        </p>
                    </div>
                </div>
                {role === 'MEMBER' && (
                    <div className="header-actions">
                        <ActionButton onClick={() => setIsSubmitModalOpen(true)} icon={MessageSquare}>Submit Feedback</ActionButton>
                    </div>
                )}
            </div>

            {/* KPI Cards */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32, animation: 'fadeIn 0.6s ease-out' }}>
                <StatCard label="Total Submissions" value={stats.total} icon={MessageSquare} color={T.accent} />
                <StatCard label="Average Customer Satisfaction" value={stats.avgRating} icon={Star} color={T.amber} subValue="/ 5.0" />
                <StatCard label="Pending Moderation" value={stats.pending} icon={Clock} color={T.blue} />
                <StatCard label="Resolved Tickets" value={stats.resolved} icon={CheckCircle2} color={T.green} />
            </div>

            {/* Filter & Table Area */}
            <div style={{ background: '#fff', borderRadius: 32, boxShadow: T.cardShadow, border: `1.5px solid #fff`, overflow: 'hidden', animation: 'fadeIn 0.7s ease-out' }}>
                <div className="filter-bar" style={{ padding: '24px 32px', borderBottom: `1.5px solid ${T.bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent }}>
                            <BarChart3 size={20} strokeWidth={2.5} />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0 }}>Feedback Records</h3>
                    </div>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <div className="search-container" style={{ position: 'relative', width: 280 }}>
                            <SearchIcon size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                            <input
                                type="text"
                                placeholder="Search comments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', height: 48, padding: '0 16px 0 48px', borderRadius: 14, border: `1.5px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.text, outline: 'none', transition: '0.3s' }}
                            />
                        </div>
                        <div className="filter-container" style={{ position: 'relative', width: 180 }}>
                            <Filter size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: T.subtle }} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ width: '100%', height: 48, padding: '0 16px 0 48px', borderRadius: 14, border: `1.5px solid ${T.border}`, fontSize: 13, fontWeight: 800, color: T.text, outline: 'none', transition: '0.3s', cursor: 'pointer', appearance: 'none' }}
                            >
                                <option>All Status</option>
                                <option>Pending</option>
                                <option>Reviewed</option>
                                <option>Resolved</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: T.bg + '50' }}>
                                {role !== 'MEMBER' && <th className="mobile-table-header" style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Member</th>}
                                <th className="mobile-table-header" style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Rating</th>
                                <th className="mobile-table-header" style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Feedback</th>
                                <th className="mobile-table-header hide-on-mobile" style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Status</th>
                                <th className="mobile-table-header hide-on-mobile" style={{ padding: '16px 32px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Date</th>
                                {role !== 'MEMBER' && <th className="mobile-table-header" style={{ padding: '16px 32px', textAlign: 'right', fontSize: 11, fontWeight: 800, color: T.muted, textTransform: 'uppercase' }}>Resolve Hub</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: 100, textAlign: 'center' }}>
                                        <Loader2 size={40} color={T.accent} style={{ animation: 'spin 2s linear infinite' }} />
                                    </td>
                                </tr>
                            ) : filteredFeedback.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: 100, textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                                            <div style={{ width: 80, height: 80, borderRadius: 30, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle }}>
                                                <MessageSquare size={32} />
                                            </div>
                                            <p style={{ fontSize: 15, fontWeight: 700, color: T.muted }}>No feedback found meeting criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredFeedback.map((item) => {
                                    const st = getStatusStyle(item.status);
                                    return (
                                        <tr key={item.id} className="feedback-row" style={{ borderBottom: `1.2px solid ${T.bg}`, transition: '0.2s' }}>
                                            {role !== 'MEMBER' && (
                                                <td className="mobile-table-cell" style={{ padding: '20px 32px' }}>
                                                    <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{item.member}</div>
                                                    <div style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>Verified Client</div>
                                                </td>
                                            )}
                                            <td className="mobile-table-cell" style={{ padding: '20px 32px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <div style={{ display: 'flex', gap: 2 }}>
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <Star 
                                                                key={s} 
                                                                size={14} 
                                                                fill={item.rating >= s ? T.amber : 'none'} 
                                                                color={item.rating >= s ? T.amber : T.border} 
                                                                strokeWidth={2.5}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span style={{ fontSize: 12, fontWeight: 900, color: T.text, marginLeft: 4 }}>{item.rating}.0</span>
                                                </div>
                                                {item.isPublishedToGoogle && (
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: T.accentLight, borderRadius: 6, marginTop: 8 }}>
                                                        <ExternalLink size={10} color={T.accent} />
                                                        <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: T.accent }}>Google Published</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="mobile-table-cell" style={{ padding: '20px 32px' }}>
                                                <p style={{ margin: 0, fontSize: 14, color: T.muted, fontWeight: 500, lineHeight: 1.5, maxWidth: 400 }}>
                                                    {item.comment}
                                                </p>
                                            </td>
                                            <td className="mobile-table-cell hide-on-mobile" style={{ padding: '20px 32px' }}>
                                                <span style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: 10, background: st.bg, color: st.color, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', border: `1.2px solid ${st.color}20` }}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="mobile-table-cell hide-on-mobile" style={{ padding: '20px 32px', fontSize: 13, fontWeight: 600, color: T.muted }}>{item.date}</td>
                                            {role !== 'MEMBER' && (
                                                <td className="mobile-table-cell" style={{ padding: '20px 32px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                        {item.status === 'Pending' && (
                                                            <button 
                                                                onClick={() => handleStatusUpdate(item.id, 'Reviewed')}
                                                                style={{ padding: '8px 16px', borderRadius: 10, background: T.bg, border: 'none', color: T.text, fontSize: 11, fontWeight: 800, cursor: 'pointer', transition: '0.2s' }}
                                                            >
                                                                Mark Reviewed
                                                            </button>
                                                        )}
                                                        {item.status !== 'Resolved' ? (
                                                            <button 
                                                                onClick={() => handleStatusUpdate(item.id, 'Resolved')}
                                                                style={{ padding: '8px 16px', borderRadius: 10, background: T.greenLight, border: 'none', color: T.green, fontSize: 11, fontWeight: 800, cursor: 'pointer', transition: '0.2s' }}
                                                            >
                                                                Resolve
                                                            </button>
                                                        ) : (
                                                            item.rating >= 4 && !item.isPublishedToGoogle && googleConfig.enabled && (
                                                                <button 
                                                                    onClick={() => handlePublishToGoogle(item.id)}
                                                                    style={{ padding: '8px 16px', borderRadius: 10, background: T.accent, border: 'none', color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                                                                >
                                                                    <Share2 size={12} strokeWidth={3} />
                                                                    Promote
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Submit Drawer */}
            <RightDrawer
                isOpen={isSubmitModalOpen}
                onClose={() => setIsSubmitModalOpen(false)}
                title="Send Feedback"
                footer={<ActionButton style={{ width: '100%' }} icon={Check} onClick={handleFeedbackSubmit}>Confirm Submission</ActionButton>}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 4 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: T.muted, textTransform: 'uppercase', marginBottom: 12 }}>Rate your Experience</label>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewFeedback({ ...newFeedback, rating: star })}
                                    style={{
                                        width: 54, height: 54, borderRadius: 16, border: 'none', transition: '0.2s', cursor: 'pointer',
                                        background: newFeedback.rating >= star ? T.amberLight : T.bg,
                                        color: newFeedback.rating >= star ? T.amber : T.subtle,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <Star size={24} fill={newFeedback.rating >= star ? T.amber : 'none'} strokeWidth={2.5} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: T.muted, textTransform: 'uppercase', marginBottom: 12 }}>Detailed Thoughts</label>
                        <textarea
                            required
                            placeholder="How can we improve? What did you love?"
                            value={newFeedback.comment}
                            onChange={(e) => setNewFeedback({ ...newFeedback, comment: e.target.value })}
                            style={{ width: '100%', minHeight: 180, padding: 16, borderRadius: 16, border: `2px solid ${T.border}`, fontSize: 14, color: T.text, outline: 'none', resize: 'none', transition: '0.3s' }}
                        />
                    </div>
                </div>
            </RightDrawer>

            <GoogleSuccessModal isOpen={showGoogleSuccess} onClose={() => setShowGoogleSuccess(false)} link={googleConfig.link} />
        </div>
    );
};

/* Google Success Modal */
const GoogleSuccessModal = ({ isOpen, onClose, link }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showCloseButton={false}>
            <div style={{ padding: 40, textAlign: 'center', position: 'relative', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <button 
                    onClick={onClose}
                    style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: 12, background: T.bg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: T.muted }}
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                <div style={{ width: 80, height: 80, borderRadius: 32, background: T.amberLight, color: T.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 12px 30px -10px rgba(245, 158, 11, 0.4)' }}>
                    <Star size={40} fill={T.amber} strokeWidth={1} />
                </div>

                <h2 style={{ fontSize: 26, fontWeight: 900, color: T.text, margin: 0 }}>Amazing Experience!</h2>
                <p style={{ margin: '12px 0 32px', fontSize: 15, color: T.muted, fontWeight: 500, lineHeight: 1.6 }}>
                    We're so glad you're happy! Would you mind sharing your review on Google? It helps others find our community.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        style={{ height: 60, borderRadius: 18, background: T.text, color: '#fff', fontSize: 14, fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, transition: '0.3s' }}
                    >
                        <MapPin size={20} />
                        Review us on Google Maps
                    </a>
                    <button 
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', padding: 12, fontSize: 12, fontWeight: 800, color: T.subtle, textTransform: 'uppercase', cursor: 'pointer' }}
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default FeedbackSystem;
