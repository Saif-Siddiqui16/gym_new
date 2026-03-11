import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { scanAttendance } from '../api/member/attendanceApi';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const ScanHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();
    const [status, setStatus] = useState('Initializing scan...');

    useEffect(() => {
        if (authLoading) return;

        const processScan = async () => {
            const searchParams = new URLSearchParams(location.search);
            const branchId = searchParams.get('branchId');
            const token = searchParams.get('token');

            if (!branchId || !token) {
                toast.error('Invalid QR Code. Missing parameters.');
                navigate('/');
                return;
            }

            if (!user) {
                // Not logged in. Save URL and redirect to login.
                setStatus('Redirecting to login...');
                localStorage.setItem('pendingQRScan', window.location.href);
                navigate('/login');
                return;
            }

            // Logged in. Process the scan immediately.
            setStatus('Marking Attendance...');
            const loadingToast = toast.loading('Processing QR code...');

            try {
                const qrContent = window.location.href;
                const result = await scanAttendance(qrContent);

                if (result.success) {
                    toast.success(result.message || 'Attendance marked successfully!', { id: loadingToast });
                } else {
                    toast.error(result.message || 'Failed to mark attendance', { id: loadingToast });
                }
            } catch (error) {
                toast.error('An unexpected error occurred during scan.', { id: loadingToast });
            } finally {
                // Always clear pending scan
                localStorage.removeItem('pendingQRScan');
                // Redirect to dashboard
                setTimeout(() => navigate('/dashboard'), 1500);
            }
        };

        processScan();
    }, [user, authLoading, location, navigate]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full border border-slate-100">
                <div className="w-16 h-16 bg-primary-light/30 rounded-full flex items-center justify-center mb-6">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <h2 className="text-xl font-black text-slate-800 mb-2 tracking-tight">Processing Scan</h2>
                <p className="text-slate-500 text-sm font-medium text-center">{status}</p>
            </div>
        </div>
    );
};

export default ScanHandler;
