import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, CameraOff, AlertCircle, Loader2, ScanLine } from 'lucide-react';
import RightDrawer from './RightDrawer';
import { Html5Qrcode } from 'html5-qrcode';

const QRScannerModal = ({ isOpen, onClose, onScanSuccess, title = "Scan Attendance QR" }) => {
    const [permissionState, setPermissionState] = useState('idle'); // idle | requesting | granted | denied
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);

    const startScanner = async () => {
        try {
            setPermissionState('requesting');
            setError(null);

            // Request camera permission explicitly first
            await navigator.mediaDevices.getUserMedia({ video: true });
            setPermissionState('granted');

            await new Promise(r => setTimeout(r, 300));

            const element = document.getElementById('qr-reader-inner');
            if (!element) return;

            scannerRef.current = new Html5Qrcode('qr-reader-inner');
            await scannerRef.current.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 230, height: 230 } },
                (decodedText) => {
                    stopScanner();
                    onScanSuccess(decodedText);
                },
                () => { } // silent scan errors
            );
            setScanning(true);
        } catch (err) {
            console.error('Camera error:', err);
            setPermissionState('denied');
            setError('Camera access was denied. Please allow camera permission in your browser settings.');
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                await scannerRef.current.clear();
            } catch (e) { }
            scannerRef.current = null;
        }
        setScanning(false);
        setPermissionState('idle');
    };

    useEffect(() => {
        if (!isOpen) {
            stopScanner();
        }
    }, [isOpen]);

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    const handleClose = () => {
        stopScanner();
        onClose();
    };

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={handleClose}
            title={title}
            subtitle="Point your camera at the gym attendance QR code"
            maxWidth="max-w-md"
        >
            <div className="flex flex-col items-center space-y-5 py-4">

                {/* Camera Viewfinder / Permission Area */}
                <div className="relative w-full aspect-square max-w-[320px] bg-slate-900 rounded-[2rem] overflow-hidden border-4 border-slate-200 shadow-2xl">

                    {/* QR scanner target */}
                    <div id="qr-reader-inner" className="w-full h-full" />

                    {/* IDLE: Show request camera button */}
                    {permissionState === 'idle' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 gap-5 px-6">
                            <div className="w-20 h-20 rounded-2xl bg-violet-600/20 border-2 border-violet-400/30 flex items-center justify-center">
                                <Camera size={36} className="text-violet-300" />
                            </div>
                            <div className="text-center">
                                <p className="text-white font-black text-sm uppercase tracking-widest mb-1">Camera Access Needed</p>
                                <p className="text-slate-400 text-[10px] font-bold leading-relaxed">Tap the button below to allow camera and start scanning.</p>
                            </div>
                            <button
                                onClick={startScanner}
                                className="px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-900/50 active:scale-95"
                            >
                                📷 Allow Camera
                            </button>
                        </div>
                    )}

                    {/* REQUESTING: Spinner */}
                    {permissionState === 'requesting' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-violet-400" />
                            <p className="text-white text-[10px] font-black uppercase tracking-widest">Starting Camera...</p>
                        </div>
                    )}

                    {/* GRANTED & SCANNING: Corner markers overlay */}
                    {permissionState === 'granted' && scanning && (
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Corner borders */}
                            <div className="absolute top-8 left-8 w-10 h-10 border-t-4 border-l-4 border-violet-400 rounded-tl-xl" />
                            <div className="absolute top-8 right-8 w-10 h-10 border-t-4 border-r-4 border-violet-400 rounded-tr-xl" />
                            <div className="absolute bottom-8 left-8 w-10 h-10 border-b-4 border-l-4 border-violet-400 rounded-bl-xl" />
                            <div className="absolute bottom-8 right-8 w-10 h-10 border-b-4 border-r-4 border-violet-400 rounded-br-xl" />
                            {/* Scan line */}
                            <div className="absolute inset-x-8 top-1/2 h-0.5 bg-violet-400/60 blur-sm animate-pulse" />
                        </div>
                    )}

                    {/* DENIED: Error state */}
                    {permissionState === 'denied' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-900/90 text-white p-6 text-center gap-4">
                            <CameraOff size={44} className="text-rose-300" />
                            <p className="text-xs font-black uppercase leading-tight">{error}</p>
                            <button
                                onClick={() => { setPermissionState('idle'); setError(null); }}
                                className="px-6 py-2.5 bg-white text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest"
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>

                {/* Info + Cancel */}
                <div className="w-full space-y-3">
                    <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100 flex items-start gap-3">
                        <AlertCircle className="text-violet-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                            Align the QR code within the box. Scanning will happen automatically once detected.
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-full py-4 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200 active:scale-95"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </RightDrawer>
    );
};

export default QRScannerModal;
