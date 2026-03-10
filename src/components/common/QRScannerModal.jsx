import React, { useEffect, useState } from 'react';
import { X, Camera, CameraOff, AlertCircle, Loader2 } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import RightDrawer from './RightDrawer';

const QRScannerModal = ({ isOpen, onClose, onScanSuccess, title = "Scan Attendance QR" }) => {
    const [scannerLoaded, setScannerLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let scanner = null;
        if (isOpen) {
            const initScanner = async () => {
                try {
                    // Small delay to ensure DOM is ready for the reader element
                    await new Promise(r => setTimeout(r, 300));

                    const element = document.getElementById('qr-reader');
                    if (element) {
                        scanner = new Html5QrcodeScanner('qr-reader', {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0,
                            showTorchButtonIfSupported: true,
                        });

                        scanner.render((decodedText) => {
                            // On success
                            scanner.clear().catch(err => console.error("Failed to clear scanner:", err));
                            onScanSuccess(decodedText);
                        }, (err) => {
                            // Silent error for continuous scanning
                        });

                        setScannerLoaded(true);
                        setError(null);
                    }
                } catch (err) {
                    console.error("Scanner Initialization Error:", err);
                    setError("Could not start camera. Please check permissions.");
                }
            };
            initScanner();
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(err => console.error("Failed to clear scanner on cleanup:", err));
            }
        };
    }, [isOpen]);

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle="Point your camera at the gym attendance QR code"
            maxWidth="max-w-md"
        >
            <div className="flex flex-col items-center justify-center space-y-6 py-4">
                <div className="relative w-full aspect-square max-w-[320px] bg-slate-900 rounded-[2.5rem] overflow-hidden border-4 border-slate-100 shadow-2xl">
                    <div id="qr-reader" className="w-full h-full"></div>

                    {!scannerLoaded && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Initializing Camera...</p>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-500/90 text-white p-8 text-center gap-4">
                            <CameraOff size={48} />
                            <p className="text-sm font-black uppercase leading-tight">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-2 px-6 py-2 bg-white text-rose-600 rounded-xl text-[10px] font-black uppercase"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                </div>

                <div className="w-full space-y-4">
                    <div className="p-4 bg-primary-light/50 rounded-2xl border border-violet-100 flex items-start gap-3">
                        <AlertCircle className="text-primary shrink-0" size={20} />
                        <div className="space-y-1">
                            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">How to scan</h4>
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                                Align the QR code within the highlighted box. Scanning will happen automatically once detected.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </RightDrawer>
    );
};

export default QRScannerModal;
