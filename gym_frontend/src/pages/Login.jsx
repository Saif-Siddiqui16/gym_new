import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail,
    Lock,
    Dumbbell
} from 'lucide-react';
import { ROLES } from '../config/roles';
import { loginUser } from '../api/auth/authApi';
import CustomDropdown from '../components/common/CustomDropdown';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [selectedRole, setSelectedRole] = useState(ROLES.BRANCH_ADMIN);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getRoleDashboard = (role) => {
        return '/dashboard';
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await loginUser(email, password, selectedRole);
            login(data);
            navigate(getRoleDashboard(data.role));
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = (e) => {
        e.preventDefault();
        // Signup logic would go here
        alert("Signup is disabled in this demo.");
    };

    const handleSuperadminFill = () => {
        setSelectedRole(ROLES.SUPER_ADMIN);
        setEmail('admin@newgym.com');
        setPassword('admin123');
    };

    const handleBranchAdminFill = () => {
        setSelectedRole(ROLES.BRANCH_ADMIN);
        setEmail('testbranch@gym.com');
        setPassword('123456');
    };

    const handleManagerFill = () => {
        setSelectedRole(ROLES.MANAGER);
        setEmail('manager@gym.com');
        setPassword('manager123');
    };

    const handleStaffFill = () => {
        setSelectedRole(ROLES.STAFF);
        setEmail('staff@gym.com');
        setPassword('staff123');
    };

    const handleTrainerFill = () => {
        setSelectedRole(ROLES.TRAINER);
        setEmail('trainer@gym.com');
        setPassword('trainer123');
    };

    const handleMemberFill = () => {
        setSelectedRole(ROLES.MEMBER);
        setEmail('member@gym.com');
        setPassword('member123');
    };

    const roleOptions = Object.values(ROLES).map(role => ({ value: role, label: role }));

    return (
        <div style={styles.container}>
            {/* Animated Background */}
            <div style={styles.backgroundOverlay}>
                <div style={styles.circle1}></div>
                <div style={styles.circle2}></div>
                <div style={styles.circle3}></div>
            </div>

            {/* Login Card */}
            <div style={styles.card}>
                {/* Logo & Header */}
                <div style={styles.header}>
                    <div style={styles.logoContainer}>
                        <Dumbbell size={32} color="#fff" strokeWidth={2.5} />
                    </div>
                    <h1 style={styles.title}>Welcome Back!</h1>
                    <p style={styles.subtitle}>Sign in to continue to New Gym</p>
                    <div style={styles.quickAccess}>
                        <button type="button" onClick={handleSuperadminFill} style={styles.quickButton}>Admin</button>
                        <button type="button" onClick={handleBranchAdminFill} style={styles.quickButton}>Branch</button>
                        <button type="button" onClick={handleManagerFill} style={styles.quickButton}>Manager</button>
                    </div>
                    <div style={{ ...styles.quickAccess, marginTop: '8px' }}>
                        <button type="button" onClick={handleStaffFill} style={styles.quickButton}>Staff</button>
                        <button type="button" onClick={handleTrainerFill} style={styles.quickButton}>Trainer</button>
                        <button type="button" onClick={handleMemberFill} style={styles.quickButton}>Member</button>
                    </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} style={styles.form}>
                    {/* Role Selector */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Select Role (Demo)</label>
                        <div style={styles.dropdownWrapper}>
                            <CustomDropdown
                                options={roleOptions}
                                value={selectedRole}
                                onChange={setSelectedRole}
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email Address</label>
                        <div style={styles.inputWrapper}>
                            <Mail size={20} style={styles.inputIcon} />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div style={styles.inputGroup}>
                        <div style={styles.labelRow}>
                            <label style={styles.label}>Password</label>
                            <a href="#" style={styles.forgotLink}>Forgot Password?</a>
                        </div>
                        <div style={styles.inputWrapper}>
                            <Lock size={20} style={styles.inputIcon} />
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    {/* Remember Me */}
                    <div style={styles.rememberRow}>
                        <label style={styles.checkboxLabel}>
                            <input type="checkbox" style={styles.checkbox} />
                            <span style={styles.checkboxText}>Remember me</span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" style={styles.submitButton}>
                        Sign In
                    </button>
                </form>

                {/* Sign Up Link */}
                <div style={styles.footer}>
                    <span style={styles.footerText}>Don't have an account? </span>
                    <a href="#" onClick={handleSignup} style={styles.signupLink}>
                        Create Account
                    </a>
                </div>
            </div>

            {/* Inline Styles for Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -30px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                input:focus {
                    outline: none;
                    border-color: #667eea !important;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
                }

                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
                }

                button:active {
                    transform: translateY(0);
                }

                a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px',
        position: 'relative',
        overflowY: 'auto',
    },
    backgroundOverlay: {
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
    },
    circle1: {
        position: 'absolute',
        top: '-10%',
        left: '-5%',
        width: '400px',
        height: '400px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 8s ease-in-out infinite',
    },
    circle2: {
        position: 'absolute',
        bottom: '-15%',
        right: '-10%',
        width: '500px',
        height: '500px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        filter: 'blur(80px)',
        animation: 'float 10s ease-in-out infinite',
        animationDelay: '2s',
    },
    circle3: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
        height: '300px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'float 6s ease-in-out infinite',
        animationDelay: '4s',
    },
    card: {
        width: '100%',
        maxWidth: '460px',
        background: '#ffffff',
        borderRadius: '24px',
        padding: '48px 40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 10,
        animation: 'fadeIn 0.6s ease-out',
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
    },
    logoContainer: {
        width: '80px',
        height: '80px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
    },
    title: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#1a1a1a',
        margin: '0 0 8px 0',
        letterSpacing: '-0.5px',
    },
    subtitle: {
        fontSize: '15px',
        color: '#6b7280',
        margin: 0,
    },
    quickAccess: {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
    },
    quickButton: {
        padding: '8px 16px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#667eea',
        background: 'rgba(102, 126, 234, 0.1)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '4px',
    },
    labelRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '4px',
    },
    forgotLink: {
        fontSize: '13px',
        color: '#667eea',
        fontWeight: '600',
        textDecoration: 'none',
        transition: 'color 0.2s',
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    dropdownWrapper: {
        width: '100%',
    },
    inputIcon: {
        position: 'absolute',
        left: '16px',
        color: '#9ca3af',
        pointerEvents: 'none',
        zIndex: 1,
    },
    input: {
        width: '100%',
        padding: '14px 16px 14px 48px',
        fontSize: '15px',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        background: '#f9fafb',
        color: '#1f2937',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
    },
    rememberRow: {
        display: 'flex',
        alignItems: 'center',
        marginTop: '-8px',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        userSelect: 'none',
    },
    checkbox: {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
        accentColor: '#667eea',
    },
    checkboxText: {
        fontSize: '14px',
        color: '#6b7280',
    },
    submitButton: {
        width: '100%',
        padding: '16px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#ffffff',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
        marginTop: '8px',
    },
    footer: {
        textAlign: 'center',
        marginTop: '32px',
        fontSize: '14px',
    },
    footerText: {
        color: '#6b7280',
    },
    signupLink: {
        color: '#667eea',
        fontWeight: '600',
        textDecoration: 'none',
        transition: 'color 0.2s',
    },
};

// Media Query for Mobile
if (window.innerWidth <= 640) {
    styles.card.padding = '32px 24px';
    styles.title.fontSize = '28px';
}

export default Login;
