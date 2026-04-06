import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Dumbbell, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { ROLES } from '../config/roles';
import { loginUser } from '../api/auth/authApi';
import { useAuth } from '../context/AuthContext';
import SuspensionModal from '../components/common/SuspensionModal';

const Login = () => {
    const navigate = useNavigate();
    const { login, role: currentRole } = useAuth();

    useEffect(() => {
        if (currentRole) navigate('/dashboard');
    }, [currentRole, navigate]);

    const [selectedRole, setSelectedRole] = useState(ROLES.BRANCH_ADMIN);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuspendedModalOpen, setIsSuspendedModalOpen] = useState(false);
    const [supportNumber, setSupportNumber] = useState('');
    const [focusEmail, setFocusEmail] = useState(false);
    const [focusPass, setFocusPass] = useState(false);

    const quickLogins = [
        { label: 'Super Admin', email: 'superadmin@gmail.com', role: ROLES.SUPER_ADMIN, color: '#7C5CFC', glow: 'rgba(124,92,252,0.5)' },
        { label: 'Admin',       email: 'admin@gmail.com',      role: ROLES.BRANCH_ADMIN, color: '#9B7BFF', glow: 'rgba(155,123,255,0.5)' },
        { label: 'Manager',     email: 'manager@gmail.com',    role: ROLES.MANAGER,      color: '#C084FC', glow: 'rgba(192,132,252,0.5)' },
        { label: 'Trainer',     email: 'trainer@gmail.com',    role: ROLES.TRAINER,      color: '#F59E0B', glow: 'rgba(245,158,11,0.5)' },
        { label: 'Staff',       email: 'staff@gmail.com',      role: ROLES.STAFF,        color: '#22C97A', glow: 'rgba(34,201,122,0.5)' },
        { label: 'Member',      email: 'albert@gmail.com',     role: ROLES.MEMBER,       color: '#3B82F6', glow: 'rgba(59,130,246,0.5)' },
    ];

    const fillCredentials = (email, role) => {
        setEmail(email);
        setPassword([ROLES.MANAGER, ROLES.TRAINER, ROLES.STAFF, ROLES.MEMBER].includes(role) ? '123456' : '123');
        setSelectedRole(role);
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await loginUser(email, password, selectedRole);
            login(data);
            const pendingScan = localStorage.getItem('pendingQRScan');
            if (pendingScan) window.location.href = pendingScan;
            else navigate('/dashboard');
        } catch (err) {
            if (err.response?.status === 403) {
                setSupportNumber(err.response?.data?.supportNumber || '');
                setIsSuspendedModalOpen(true);
            } else {
                setError(err.response?.data?.message || err.message || 'Invalid credentials. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                html, body { height: 100%; font-family: 'Plus Jakarta Sans', sans-serif; }

                @keyframes floatUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes shimmer {
                    0%   { transform: translateX(-100%) rotate(25deg); }
                    100% { transform: translateX(300%) rotate(25deg); }
                }
                @keyframes pulseRing {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50%       { opacity: 0.9; transform: scale(1.18); }
                }
                @keyframes gridDrift {
                    0%   { transform: translate(0, 0); }
                    50%  { transform: translate(-12px, -8px); }
                    100% { transform: translate(0, 0); }
                }
                @keyframes orb1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33%      { transform: translate(40px, -30px) scale(1.1); }
                    66%      { transform: translate(-20px, 20px) scale(0.95); }
                }
                @keyframes orb2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33%      { transform: translate(-50px, 20px) scale(1.05); }
                    66%      { transform: translate(30px, -40px) scale(1.1); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%      { transform: translateX(-6px); }
                    40%      { transform: translateX(6px); }
                    60%      { transform: translateX(-4px); }
                    80%      { transform: translateX(4px); }
                }

                .l-wrap {
                    min-height: 100vh;
                    min-height: 100dvh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                    background: #07050F;
                    padding: 32px 20px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                /* ── Background Layers ── */
                .bg-photo {
                    position: fixed; inset: 0; z-index: 0;
                    background-image: url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1800&q=80&auto=format&fit=crop');
                    background-size: cover;
                    background-position: center;
                    transform: scale(1.04);
                    filter: brightness(0.22) saturate(1.15);
                    transition: filter 0.4s;
                }
                .bg-overlay {
                    position: fixed; inset: 0; z-index: 1;
                    background:
                        radial-gradient(ellipse at 20% 50%, rgba(124,92,252,0.28) 0%, transparent 55%),
                        radial-gradient(ellipse at 80% 20%, rgba(192,132,252,0.14) 0%, transparent 45%),
                        linear-gradient(180deg, rgba(7,5,15,0.5) 0%, rgba(7,5,15,0.82) 100%);
                }
                .bg-grid {
                    position: fixed; inset: 0; z-index: 2;
                    background-image:
                        linear-gradient(rgba(124,92,252,0.06) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(124,92,252,0.06) 1px, transparent 1px);
                    background-size: 52px 52px;
                    animation: gridDrift 18s ease-in-out infinite;
                }
                .bg-orb1 {
                    position: fixed; z-index: 2;
                    width: 500px; height: 500px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(124,92,252,0.18) 0%, transparent 70%);
                    top: -120px; left: -100px;
                    animation: orb1 14s ease-in-out infinite;
                    filter: blur(1px);
                }
                .bg-orb2 {
                    position: fixed; z-index: 2;
                    width: 420px; height: 420px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(192,132,252,0.12) 0%, transparent 70%);
                    bottom: -100px; right: -80px;
                    animation: orb2 18s ease-in-out infinite;
                    filter: blur(1px);
                }
                .bg-orb3 {
                    position: fixed; z-index: 2;
                    width: 280px; height: 280px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%);
                    top: 50%; right: 18%;
                    animation: orb2 22s ease-in-out infinite reverse;
                }

                /* ── Portal ── */
                .portal {
                    position: relative; z-index: 20;
                    width: 100%; max-width: 420px;
                    display: flex; flex-direction: column; align-items: center; gap: 20px;
                }

                /* ── Logo ── */
                .logo-block {
                    text-align: center;
                    animation: floatUp 0.5s ease both;
                }
                .logo-ring {
                    position: relative;
                    width: 72px; height: 72px;
                    margin: 0 auto 14px;
                    display: flex; align-items: center; justify-content: center;
                }
                .logo-ring::before {
                    content: '';
                    position: absolute; inset: -4px;
                    border-radius: 50%;
                    background: conic-gradient(from 0deg, #7C5CFC, #C084FC, #9B7BFF, #7C5CFC);
                    animation: spin 4s linear infinite;
                    opacity: 0.7;
                }
                .logo-ring::after {
                    content: '';
                    position: absolute; inset: -1px;
                    border-radius: 50%;
                    background: #07050F;
                }
                .logo-inner {
                    position: relative; z-index: 2;
                    width: 64px; height: 64px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #7C5CFC, #9B7BFF);
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 0 32px rgba(124,92,252,0.5);
                }
                .brand-name {
                    font-size: 30px; font-weight: 900;
                    color: #fff; letter-spacing: -1.5px;
                    line-height: 1;
                }
                .brand-name span { color: #9B7BFF; }
                .brand-tagline {
                    font-size: 9px; font-weight: 700;
                    color: rgba(155,123,255,0.7);
                    letter-spacing: 4px; text-transform: uppercase;
                    margin-top: 6px;
                }

                /* ── Quick Access ── */
                .quick-bar {
                    width: 100%;
                    animation: floatUp 0.5s 0.1s ease both;
                }
                .quick-label {
                    font-size: 8px; font-weight: 800;
                    color: rgba(255,255,255,0.25);
                    letter-spacing: 3px; text-transform: uppercase;
                    text-align: center; margin-bottom: 10px;
                }
                .quick-grid {
                    display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px;
                }
                .q-chip {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 9px; padding: 9px 6px;
                    cursor: pointer; display: flex; align-items: center;
                    justify-content: center; gap: 6px;
                    transition: all 0.18s ease; position: relative; overflow: hidden;
                }
                .q-chip:hover {
                    background: rgba(255,255,255,0.07);
                    transform: translateY(-2px);
                }
                .q-chip::after {
                    content: '';
                    position: absolute; top: 0; left: 0;
                    width: 40%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
                    animation: shimmer 2.5s infinite;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .q-chip:hover::after { opacity: 1; }
                .q-dot {
                    width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
                }
                .q-text {
                    font-size: 9.5px; font-weight: 800;
                    color: rgba(255,255,255,0.75);
                    text-transform: uppercase; letter-spacing: 0.4px;
                }

                /* ── Glass Card ── */
                .glass-card {
                    width: 100%;
                    background: rgba(12, 8, 28, 0.75);
                    backdrop-filter: blur(28px);
                    -webkit-backdrop-filter: blur(28px);
                    border: 1px solid rgba(124,92,252,0.2);
                    border-radius: 22px;
                    padding: 30px 28px;
                    box-shadow:
                        0 32px 64px rgba(0,0,0,0.5),
                        inset 0 1px 0 rgba(255,255,255,0.06);
                    animation: floatUp 0.5s 0.18s ease both;
                    position: relative; overflow: hidden;
                }
                .glass-card::before {
                    content: '';
                    position: absolute; top: 0; left: 0; right: 0; height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(124,92,252,0.6), rgba(192,132,252,0.4), transparent);
                }

                .card-head {
                    text-align: center; margin-bottom: 24px;
                }
                .card-head h2 {
                    font-size: 19px; font-weight: 900;
                    color: #fff; letter-spacing: -0.4px; margin-bottom: 5px;
                }
                .card-head p {
                    font-size: 12px; color: rgba(255,255,255,0.4); font-weight: 500;
                }

                /* ── Form ── */
                .form-body { display: flex; flex-direction: column; gap: 14px; }

                .field-group { display: flex; flex-direction: column; gap: 6px; }
                .field-label {
                    font-size: 9px; font-weight: 800;
                    color: rgba(255,255,255,0.35);
                    letter-spacing: 1.5px; text-transform: uppercase;
                    display: flex; justify-content: space-between; align-items: center;
                }
                .forgot-btn {
                    background: none; border: none; cursor: pointer;
                    color: #9B7BFF; font-size: 9px; font-weight: 800;
                    letter-spacing: 1px; text-transform: uppercase;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    transition: color 0.15s;
                }
                .forgot-btn:hover { color: #C084FC; }

                .input-wrap {
                    position: relative; display: flex; align-items: center;
                }
                .input-icon {
                    position: absolute; left: 14px; z-index: 2;
                    transition: color 0.15s;
                }
                .l-input {
                    width: 100%;
                    background: rgba(255,255,255,0.04);
                    border: 1.5px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 13px 16px 13px 44px;
                    color: #fff;
                    font-size: 14px; font-weight: 600;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    transition: all 0.18s ease;
                    outline: none;
                }
                .l-input::placeholder { color: rgba(255,255,255,0.2); font-weight: 500; }
                .l-input:focus {
                    background: rgba(124,92,252,0.08);
                    border-color: #7C5CFC;
                    box-shadow: 0 0 0 3px rgba(124,92,252,0.15);
                }
                .l-input.focused { border-color: #7C5CFC; }

                /* ── Submit ── */
                .submit-btn {
                    margin-top: 6px;
                    width: 100%;
                    background: linear-gradient(135deg, #7C5CFC, #9B7BFF);
                    color: #fff; border: none;
                    padding: 15px; border-radius: 13px;
                    font-size: 12px; font-weight: 800;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    cursor: pointer; letter-spacing: 1.5px; text-transform: uppercase;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                    box-shadow: 0 6px 24px rgba(124,92,252,0.4);
                    transition: all 0.2s ease; position: relative; overflow: hidden;
                }
                .submit-btn::before {
                    content: '';
                    position: absolute; top: 0; left: -100%;
                    width: 60%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
                    transition: left 0.4s ease;
                }
                .submit-btn:hover:not(:disabled)::before { left: 150%; }
                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 32px rgba(124,92,252,0.55);
                }
                .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

                /* ── Error ── */
                .error-pill {
                    background: rgba(244,63,94,0.1);
                    border: 1px solid rgba(244,63,94,0.25);
                    border-radius: 10px; padding: 11px 14px;
                    font-size: 12px; font-weight: 600;
                    color: #FDA4AF; text-align: center;
                    animation: shake 0.4s ease;
                }

                /* ── Divider ── */
                .divider {
                    display: flex; align-items: center; gap: 10px; margin: 4px 0;
                }
                .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
                .divider-text { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.2); letter-spacing: 1px; text-transform: uppercase; }

                /* ── Footer ── */
                .login-footer {
                    text-align: center; display: flex; flex-direction: column; gap: 8px;
                    animation: floatUp 0.5s 0.28s ease both;
                }
                .sec-tag {
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                    font-size: 9px; font-weight: 700;
                    color: rgba(255,255,255,0.2); letter-spacing: 0.8px; text-transform: uppercase;
                }
                .sec-tag svg { color: #7C5CFC; }
                .copy-text { font-size: 9px; color: rgba(255,255,255,0.12); letter-spacing: 0.5px; }

                /* ── Spinner ── */
                .spin-ring {
                    width: 16px; height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                    flex-shrink: 0;
                }

                /* ── Responsive ── */
                @media (max-width: 480px) {
                    .l-wrap { padding: 24px 16px; }
                    .glass-card { padding: 24px 20px; border-radius: 18px; }
                    .brand-name { font-size: 26px; }
                    .logo-inner { width: 56px; height: 56px; }
                    .logo-ring { width: 64px; height: 64px; }
                    .quick-grid { grid-template-columns: repeat(3, 1fr); gap: 6px; }
                }
                @media (max-height: 700px) {
                    .l-wrap { align-items: flex-start; }
                    .logo-block { margin-bottom: -4px; }
                }
            `}</style>

            <div className="l-wrap">
                {/* Background */}
                <div className="bg-photo" />
                <div className="bg-overlay" />
                <div className="bg-grid" />
                <div className="bg-orb1" />
                <div className="bg-orb2" />
                <div className="bg-orb3" />

                <main className="portal">
                    {/* Logo */}
                    <div className="logo-block">
                        <div className="logo-ring">
                            <div className="logo-inner">
                                <Dumbbell size={26} color="#fff" strokeWidth={2.5} />
                            </div>
                        </div>
                        <h1 className="brand-name">ROAR<span>PRO</span></h1>
                        <p className="brand-tagline">Ultimate Fitness Management</p>
                    </div>

                    {/* Quick Access */}
                    <div className="quick-bar">
                        <p className="quick-label">Quick Test Access</p>
                        <div className="quick-grid">
                            {quickLogins.map(item => (
                                <button key={item.role} type="button" className="q-chip"
                                    onClick={() => fillCredentials(item.email, item.role)}
                                    style={{ borderColor: selectedRole === item.role ? item.color : undefined,
                                             boxShadow: selectedRole === item.role ? `0 0 12px ${item.glow}` : undefined }}
                                >
                                    <span className="q-dot" style={{ background: item.color, boxShadow: `0 0 7px ${item.glow}` }} />
                                    <span className="q-text">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Card */}
                    <div className="glass-card">
                        <div className="card-head">
                            <h2>Authorized Access</h2>
                            <p>Enter your professional credentials to continue</p>
                        </div>

                        <form className="form-body" onSubmit={handleLogin}>
                            {/* Email */}
                            <div className="field-group">
                                <span className="field-label">Identification (Email)</span>
                                <div className="input-wrap">
                                    <Mail className="input-icon" size={15} color={focusEmail ? '#9B7BFF' : 'rgba(255,255,255,0.25)'} />
                                    <input
                                        className={`l-input${focusEmail ? ' focused' : ''}`}
                                        type="email" placeholder="name@roarpro.com"
                                        value={email} onChange={e => setEmail(e.target.value)}
                                        onFocus={() => setFocusEmail(true)} onBlur={() => setFocusEmail(false)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="field-group">
                                <span className="field-label">
                                    Security Key (Password)
                                    <button type="button" className="forgot-btn">Forgot?</button>
                                </span>
                                <div className="input-wrap">
                                    <Lock className="input-icon" size={15} color={focusPass ? '#9B7BFF' : 'rgba(255,255,255,0.25)'} />
                                    <input
                                        className={`l-input${focusPass ? ' focused' : ''}`}
                                        type="password" placeholder="••••••••"
                                        value={password} onChange={e => setPassword(e.target.value)}
                                        onFocus={() => setFocusPass(true)} onBlur={() => setFocusPass(false)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Error */}
                            {error && <div className="error-pill">{error}</div>}

                            {/* Submit */}
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spin-ring" />
                                        Verifying…
                                    </>
                                ) : (
                                    <>
                                        <Zap size={15} strokeWidth={2.5} />
                                        Initialize Dashboard
                                        <ArrowRight size={15} strokeWidth={2.5} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="login-footer">
                        <div className="sec-tag">
                            <ShieldCheck size={11} />
                            Secure End-to-End Encryption
                        </div>
                        <p className="copy-text">© 2026 ROAR FITNESS GLOBAL SYSTEMS · V4.0.2</p>
                    </div>
                </main>
            </div>

            <SuspensionModal
                isOpen={isSuspendedModalOpen}
                onClose={() => setIsSuspendedModalOpen(false)}
                supportNumber={supportNumber}
            />
        </>
    );
};

export default Login;