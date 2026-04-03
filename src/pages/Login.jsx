import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail,
    Lock,
    Dumbbell,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';
import { ROLES } from '../config/roles';
import { loginUser } from '../api/auth/authApi';
import CustomDropdown from '../components/common/CustomDropdown';
import { useAuth } from '../context/AuthContext';
import SuspensionModal from '../components/common/SuspensionModal';

const Login = () => {
    const navigate = useNavigate();
    const { login, role: currentRole } = useAuth();

    useEffect(() => {
        if (currentRole) {
            navigate('/dashboard');
        }
    }, [currentRole, navigate]);

    const [selectedRole, setSelectedRole] = useState(ROLES.BRANCH_ADMIN);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuspendedModalOpen, setIsSuspendedModalOpen] = useState(false);
    const [supportNumber, setSupportNumber] = useState('');

    const quickLogins = [
        { label: 'SuperAdmin', email: 'superadmin@gmail.com', role: ROLES.SUPER_ADMIN, color: '#3b82f6' },
        { label: 'Admin', email: 'admin@gmail.com', role: ROLES.BRANCH_ADMIN, color: '#8b5cf6' },
        { label: 'Manager', email: 'manager@gmail.com', role: ROLES.MANAGER, color: '#ec4899' },
        { label: 'Trainer', email: 'trainer@gmail.com', role: ROLES.TRAINER, color: '#f59e0b' },
        { label: 'Staff', email: 'staff@gmail.com', role: ROLES.STAFF, color: '#10b981' },
        { label: 'Member', email: 'albert@gmail.com', role: ROLES.MEMBER, color: '#6366f1' }
    ];

    const fillCredentials = (email, role) => {
        setEmail(email);
        if ([ROLES.MANAGER, ROLES.TRAINER, ROLES.STAFF, ROLES.MEMBER].includes(role)) {
            setPassword('123456');
        } else {
            setPassword('123');
        }
        setSelectedRole(role);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await loginUser(email, password, selectedRole);
            login(data);

            const pendingScan = localStorage.getItem('pendingQRScan');
            if (pendingScan) {
                window.location.href = pendingScan;
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.response?.status === 403) {
                setSupportNumber(err.response?.data?.supportNumber || '');
                setIsSuspendedModalOpen(true);
            } else {
                const errorMessage = err.response?.data?.message || err.message || 'Invalid credentials. Please try again.';
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const roleOptions = Object.values(ROLES).map(role => ({ value: role, label: role }));

    return (
        <div className="login-v3-container">
            {/* Immersive Background */}
            <div className="background-base">
                <img
                    src="/luxury_gym_login_bg_1772642129417.png"
                    alt="Luxury Gym"
                    className="bg-photo"
                />
                <div className="bg-glaze"></div>
            </div>

            <main className="login-portal">
                {/* Brand Identity */}
                <div className="portal-header animate-entry">
                    <div className="logo-emblem">
                        <Dumbbell size={28} />
                    </div>
                    <h1>GYM<span className="text-highlight">PRO</span></h1>
                    <p>ULTIMATE MANAGEMENT SUITE</p>
                </div>

                {/* Quick Access Grid */}
                <div className="quick-access-bar animate-entry" style={{ animationDelay: '0.1s' }}>
                    <div className="bar-label">QUICK TEST ACCESS</div>
                    <div className="quick-grid">
                        {quickLogins.map((item) => (
                            <button
                                key={item.role}
                                type="button"
                                className="quick-chip"
                                onClick={() => fillCredentials(item.email, item.role)}
                                style={{ '--chip-color': item.color }}
                            >
                                <span className="chip-dot"></span>
                                <span className="chip-text">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Login Interface */}
                <div className="glass-card animate-slide-up">
                    <div className="card-top">
                        <h2>Authorized Access</h2>
                        <p>Enter your professional credentials</p>
                    </div>

                    <form onSubmit={handleLogin} className="portal-form">
                        <div className="input-field-group">
                            <label>IDENTIFICATION (EMAIL)</label>
                            <div className="iconic-input">
                                <Mail className="icon-lead" size={16} />
                                <input
                                    type="email"
                                    placeholder="name@gympro.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-field-group">
                            <div className="flex-header">
                                <label>SECURITY KEY (PASSWORD)</label>
                                <button type="button" className="forgot-link-btn">FORGOT?</button>
                            </div>
                            <div className="iconic-input">
                                <Lock className="icon-lead" size={16} />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && <div className="error-badge shake-animation">{error}</div>}

                        <button disabled={loading} type="submit" className="portal-submit-btn">
                            {loading ? "VERIFYING..." : (
                                <>
                                    <span>INITIALIZE DASHBOARD</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Suspension Modal */}
                <SuspensionModal 
                    isOpen={isSuspendedModalOpen} 
                    onClose={() => setIsSuspendedModalOpen(false)} 
                    supportNumber={supportNumber}
                />

                <div className="portal-footer">
                    <div className="security-tag">
                        <ShieldCheck size={12} className="text-highlight" />
                        <span>SECURE END-TO-END ENCRYPTION</span>
                    </div>
                    <p className="copyright">© 2026 GYMPRO GLOBAL SYSTEMS. V4.0.2</p>
                </div>
            </main>

            <style>{`
                /* Standardized Login Layout */
                :root {
                    --primary: #2563eb;
                    --primary-hover: #1d4ed8;
                    --muted: #94a3b8;
                    --space-xs: 8px;
                    --space-sm: 12px;
                    --space-md: 16px;
                    --space-lg: 24px;
                    --space-xl: 32px;
                    --radius-md: 8px;
                    --radius-lg: 12px;
                    --radius-xl: 16px;
                    --radius-2xl: 24px;
                }

                html, body {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                    overflow: hidden;
                    background: #020617;
                }

                .login-v3-container {
                    height: 100vh;
                    height: 100dvh;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    padding: 60px 20px;
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;
                }

                .background-base {
                    position: fixed;
                    inset: 0;
                    z-index: 0;
                    pointer-events: none;
                }

                .bg-photo {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transform: scale(1.05);
                    filter: brightness(0.25) saturate(1.1);
                }

                .bg-glaze {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at center, rgba(37, 99, 235, 0.08) 0%, rgba(2, 6, 23, 0.95) 100%);
                }

                .login-portal {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 420px;
                    margin: auto;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .portal-header {
                    text-align: center;
                    margin-bottom: var(--space-lg);
                    width: 100%;
                }

                .logo-emblem {
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, var(--primary) 0%, #1e40af 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-xl);
                    margin: 0 auto var(--space-md);
                    box-shadow: 0 0 30px rgba(37, 99, 235, 0.3);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .portal-header h1 {
                    font-size: 32px;
                    font-weight: 800;
                    color: white;
                    letter-spacing: -2px;
                    margin: 0;
                }

                .portal-header p {
                    font-size: 10px;
                    font-weight: 700;
                    color: var(--primary);
                    letter-spacing: 4px;
                    text-transform: uppercase;
                    margin-top: 8px;
                    opacity: 0.8;
                }

                .text-highlight { color: var(--primary); }

                .glass-card {
                    width: 100%;
                    background: rgba(15, 23, 42, 0.7);
                    backdrop-filter: blur(25px);
                    -webkit-backdrop-filter: blur(25px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: var(--radius-2xl);
                    padding: var(--space-xl);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
                }

                .card-top {
                    text-align: center;
                    margin-bottom: var(--space-lg);
                }

                .card-top h2 {
                    font-size: 18px;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 4px;
                }

                .card-top p {
                    font-size: 13px;
                    color: var(--muted);
                }

                .portal-form {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-md);
                }

                .input-field-group {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-xs);
                }

                .input-field-group label {
                    font-size: 10px;
                    font-weight: 700;
                    color: #94a3b8;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .flex-header {
                    display: flex;
                    justify-content: space-between;
                }

                .forgot-link-btn {
                    background: none;
                    border: none;
                    color: var(--primary);
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    padding: 0;
                }

                .iconic-input {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .icon-lead {
                    position: absolute;
                    left: 16px;
                    color: #64748b;
                    z-index: 1;
                }

                .iconic-input input {
                    width: 100%;
                    background: rgba(2, 6, 23, 0.4) !important;
                    border: 1.5px solid rgba(255, 255, 255, 0.05);
                    border-radius: var(--radius-lg);
                    padding: 14px 16px 14px 48px;
                    color: white;
                    font-size: 15px;
                    transition: all 0.2s ease;
                }

                .iconic-input input:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: rgba(2, 6, 23, 0.7) !important;
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
                }

                .portal-submit-btn {
                    margin-top: var(--space-sm);
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 16px;
                    border-radius: var(--radius-lg);
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .portal-submit-btn:hover:not(:disabled) {
                    background: var(--primary-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
                }

                .portal-submit-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .error-badge {
                    padding: 12px;
                    background: rgba(239, 68, 68, 0.1);
                    color: #fca5a5;
                    font-size: 12px;
                    border-radius: var(--radius-md);
                    text-align: center;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }

                .portal-footer {
                    margin-top: var(--space-xl);
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    width: 100%;
                }

                .security-tag {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: #475569;
                    font-size: 9px;
                    font-weight: 600;
                }

                .copyright {
                    color: #334155;
                    font-size: 9px;
                    letter-spacing: 0.5px;
                }

                @media (max-width: 480px) {
                    .login-v3-container {
                        padding: 30px var(--space-md);
                    }
                    .portal-header h1 {
                        font-size: 28px;
                    }
                    .glass-card {
                        padding: var(--space-lg);
                    }
                    .logo-emblem {
                        width: 54px;
                        height: 54px;
                    }
                }

                @media (max-height: 700px) {
                    .login-v3-container {
                        justify-content: flex-start;
                    }
                    .portal-header {
                        margin-bottom: var(--space-md);
                    }
                }

                .quick-access-bar {
                    width: 100%;
                    margin-bottom: var(--space-lg);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--space-sm);
                }

                .bar-label {
                    font-size: 9px;
                    font-weight: 800;
                    color: rgba(255, 255, 255, 0.4);
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }

                .quick-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    width: 100%;
                }

                .quick-chip {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: var(--radius-md);
                    padding: 8px 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                }

                .quick-chip:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: var(--chip-color);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .chip-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--chip-color);
                    box-shadow: 0 0 8px var(--chip-color);
                }

                .chip-text {
                    font-size: 10px;
                    font-weight: 700;
                    color: rgba(255, 255, 255, 0.8);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                @media (max-width: 480px) {
                    .quick-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
