import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail,
    Lock,
    Dumbbell,
    ArrowRight,
    UserCircle2,
    ShieldCheck,
    Zap,
    Briefcase
} from 'lucide-react';
import { ROLES } from '../config/roles';
import { loginUser } from '../api/auth/authApi';
import CustomDropdown from '../components/common/CustomDropdown';
import { useAuth } from '../context/AuthContext';

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

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await loginUser(email, password, selectedRole);
            login(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const quickFills = [
        { label: 'Admin', role: ROLES.SUPER_ADMIN, email: 'admin@newgym.com', pass: 'admin123' },
        { label: 'Branch', role: ROLES.BRANCH_ADMIN, email: 'testbranch@gym.com', pass: '123456' },
        { label: 'Manager', role: ROLES.MANAGER, email: 'manager@gym.com', pass: 'manager123' },
        { label: 'Staff', role: ROLES.STAFF, email: 'staff@gym.com', pass: 'staff123' },
        { label: 'Trainer', role: ROLES.TRAINER, email: 'trainer@gym.com', pass: 'trainer123' },
        { label: 'Member', role: ROLES.MEMBER, email: 'member@gym.com', pass: 'member123' },
    ];

    const fillForm = (item) => {
        setSelectedRole(item.role);
        setEmail(item.email);
        setPassword(item.pass);
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

                {/* Login Interface */}
                <div className="glass-card animate-slide-up">
                    <div className="card-top">
                        <h2>Authorized Access</h2>
                        <p>Enter your professional credentials</p>
                    </div>

                    <form onSubmit={handleLogin} className="portal-form">
                        <div className="input-field-group">
                            <label>SYSTEM ROLE</label>
                            <div className="custom-select-wrap">
                                <CustomDropdown
                                    options={roleOptions}
                                    value={selectedRole}
                                    onChange={setSelectedRole}
                                />
                            </div>
                        </div>

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

                    {/* Quick Access (Minimalist) */}
                    <div className="quick-access-box">
                        <div className="divider-label">
                            <span className="dash"></span>
                            <span>DEMO PROFILES</span>
                            <span className="dash"></span>
                        </div>
                        <div className="quick-nav-grid">
                            {quickFills.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => fillForm(item)}
                                    className={`nav-grid-item ${selectedRole === item.role && email === item.email ? 'is-active' : ''}`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="portal-footer">
                    <div className="security-tag">
                        <ShieldCheck size={12} className="text-highlight" />
                        <span>SECURE END-TO-END ENCRYPTION</span>
                    </div>
                    <p className="copyright">© 2026 GYMPRO GLOBAL SYSTEMS. V4.0.2</p>
                </div>
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

                /* Force Scrollbar visibility */
                html, body {
                    overflow-y: auto !important;
                    height: auto !important;
                    min-height: 100vh !important;
                    background: #020617;
                }

                .login-v3-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: #020617;
                    font-family: 'Outfit', sans-serif;
                    position: relative;
                    overflow-x: hidden;
                    padding: 40px 20px 80px; /* Extra bottom padding for scroll room */
                }

                /* High-Visibility Custom Scrollbar */
                ::-webkit-scrollbar {
                    width: 10px !important;
                    display: block !important;
                }
                ::-webkit-scrollbar-track {
                    background: #0f172a !important;
                }
                ::-webkit-scrollbar-thumb {
                    background: #3b82f6 !important;
                    border-radius: 5px !important;
                    border: 2px solid #0f172a !important;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #60a5fa !important;
                }

                .background-base {
                    position: fixed;
                    inset: 0;
                    z-index: 0;
                }

                .bg-photo {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transform: scale(1.05);
                    filter: brightness(0.4) saturate(1.2);
                }

                .bg-glaze {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at center, rgba(30, 64, 175, 0.1) 0%, rgba(2, 6, 23, 0.95) 100%);
                }

                .login-portal {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 400px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    flex-shrink: 0; /* Prevent portal from shrinking */
                    padding-bottom: 20px;
                }

                .portal-header {
                    text-align: center;
                    margin-bottom: 20px;
                    width: 100%;
                }

                .logo-emblem {
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 16px;
                    margin: 0 auto 10px;
                    box-shadow: 0 0 30px rgba(59, 130, 246, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .portal-header h1 {
                    font-size: 32px;
                    font-weight: 900;
                    color: white;
                    letter-spacing: -1.5px;
                    margin: 0 0 2px 0;
                    line-height: 1;
                }

                .portal-header p {
                    font-size: 10px;
                    font-weight: 800;
                    color: #60a5fa;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    opacity: 0.9;
                }

                .text-highlight { color: #3b82f6; }

                .glass-card {
                    width: 100%;
                    background: rgba(15, 23, 42, 0.75);
                    backdrop-filter: blur(25px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
                }

                .card-top {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .card-top h2 {
                    font-size: 16px;
                    font-weight: 700;
                    color: white;
                    margin: 0;
                }

                .card-top p {
                    font-size: 11px;
                    color: #94a3b8;
                }

                .portal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .input-field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .input-field-group label {
                    font-size: 9px;
                    font-weight: 800;
                    color: #475569;
                    letter-spacing: 1px;
                }

                .flex-header {
                    display: flex;
                    justify-content: space-between;
                }

                .forgot-link-btn {
                    background: none;
                    border: none;
                    color: #3b82f6;
                    font-size: 9px;
                    font-weight: 800;
                    cursor: pointer;
                }

                .iconic-input {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .icon-lead {
                    position: absolute;
                    left: 12px;
                    color: #334155;
                }

                .iconic-input input {
                    width: 100%;
                    background: rgba(2, 6, 23, 0.6);
                    border: 1.5px solid rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    padding: 10px 10px 10px 40px;
                    color: white;
                    font-size: 14px;
                }

                .iconic-input input:focus {
                    outline: none;
                    border-color: #3b82f6;
                }

                .portal-submit-btn {
                    margin-top: 4px;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border: none;
                    padding: 12px;
                    border-radius: 14px;
                    font-size: 13px;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .portal-submit-btn:hover {
                    filter: brightness(1.1);
                    transform: translateY(-1px);
                }

                .error-badge {
                    padding: 8px;
                    background: rgba(239, 68, 68, 0.1);
                    color: #fca5a5;
                    font-size: 10px;
                    border-radius: 8px;
                    text-align: center;
                }

                .quick-access-box {
                    margin-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    padding-top: 16px;
                }

                .divider-label {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 12px;
                }

                .divider-label span {
                    color: #475569;
                    font-size: 9px;
                    font-weight: 800;
                }

                .divider-label .dash {
                    height: 1px;
                    background: #1e293b;
                    flex: 1;
                }

                .quick-nav-grid {
                    display: grid !important;
                    grid-template-columns: 1fr 1fr !important;
                    grid-template-rows: auto auto auto !important;
                    gap: 8px !important;
                }

                .nav-grid-item {
                    all: unset;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background: rgba(255, 255, 255, 0.04) !important;
                    border: 1px solid rgba(255, 255, 255, 0.08) !important;
                    border-radius: 10px !important;
                    padding: 10px 4px !important;
                    color: #94a3b8 !important;
                    font-size: 10px !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    cursor: pointer !important;
                    transition: all 0.2s !important;
                }

                .nav-grid-item:hover {
                    background: rgba(255, 255, 255, 0.08) !important;
                    color: white !important;
                }

                .nav-grid-item.is-active {
                    background: rgba(59, 130, 246, 0.15) !important;
                    border-color: #3b82f6 !important;
                    color: #60a5fa !important;
                }

                .portal-footer {
                    margin-top: 20px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .security-tag {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    color: #475569;
                    font-size: 8px;
                    font-weight: 700;
                }

                .copyright {
                    color: #334155;
                    font-size: 8px;
                }

                .animate-entry { animation: fadeIn 1s; }
                .animate-slide-up { animation: slideUp 0.8s; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default Login;
