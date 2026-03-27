import { getTenantSettings } from '../api/admin/settingsApi';

// PDF toast notification helper
export const showPdfToast = (message, type = 'success') => {
    const toastId = `pdf-toast-${Date.now()}`;
    const colors = {
        success: { bg: '#f0fdf4', border: '#86efac', icon: '#16a34a', text: '#15803d' },
        error: { bg: '#fef2f2', border: '#fca5a5', icon: '#dc2626', text: '#dc2626' },
        loading: { bg: '#eff6ff', border: '#bfdbfe', icon: '#1e40af', text: '#1e3a8a' } // Dark Blue for loading
    };
    const c = colors[type];
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 99999;
        background: ${c.bg}; border: 1.5px solid ${c.border};
        border-radius: 16px; padding: 14px 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
        display: flex; align-items: center; gap: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 13px; font-weight: 600; color: ${c.text};
        min-width: 260px; max-width: 360px;
        animation: slideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        transform-origin: top right;
    `;
    const iconMap = {
        success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${c.icon}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${c.icon}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
        loading: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${c.icon}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>`
    };
    toast.innerHTML = `${iconMap[type]}<span>${message}</span>`;
    if (!document.getElementById('pdf-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'pdf-toast-styles';
        style.textContent = `@keyframes slideIn{from{opacity:0;transform:translateX(100%) scale(0.8)}to{opacity:1;transform:translateX(0) scale(1)}} @keyframes spin{to{transform:rotate(360deg)}}`;
        document.head.appendChild(style);
    }
    document.body.appendChild(toast);
    return toastId;
};

export const removePdfToast = (toastId) => {
    const el = document.getElementById(toastId);
    if (el) {
        el.style.animation = 'none';
        el.style.opacity = '0';
        el.style.transform = 'translateX(100%) scale(0.8)';
        el.style.transition = 'all 0.3s ease';
        setTimeout(() => el?.remove(), 300);
    }
};

/**
 * Helper to convert image URL to base64
 */
const getBase64ImageFromURL = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
        };
        img.onerror = (error) => reject(error);
        img.src = url;
    });
};

/**
 * Flexible PDF Export function with Premium Black + Dark Blue Theme.
 */
export const exportPdf = async (arg1, arg2, arg3) => {
    let title = 'Report';
    let filename = 'Report';
    let headers = null;
    let body = null;
    let branding = null;

    // Handle Signature 2: Single object argument
    if (typeof arg1 === 'object' && !Array.isArray(arg1) && arg1 !== null && !arg2) {
        title = arg1.title || 'Report';
        filename = arg1.filename || title;
        headers = arg1.headers || null;
        body = arg1.rows || arg1.data || null;
        branding = arg1.branding || null;
    }
    // Handle Signature 1: Positional arguments (tableName, data, branding)
    else {
        title = arg1 || 'Report';
        filename = title;
        body = arg2 || null;
        branding = arg3 || null;
    }

    // Validation
    if (!body || !Array.isArray(body) || body.length === 0) {
        const errorToastId = showPdfToast('No data available to export.', 'error');
        setTimeout(() => removePdfToast(errorToastId), 3000);
        return;
    }

    const loadingToastId = showPdfToast('Preparing Premium Export...', 'loading');

    try {
        // Fetch branding if not provided
        if (!branding) {
            try {
                branding = await getTenantSettings();
            } catch (e) {
                console.warn('Failed to fetch branding, using defaults:', e);
                branding = { name: 'Gym Administration' };
            }
        }

        const jsPDFModule = await import('jspdf');
        const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
        const autoTableModule = await import('jspdf-autotable');
        const autoTable = autoTableModule.default || autoTableModule.autoTable;

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        const COLOR_BRAND = [30, 58, 138]; // #1E3A8A
        const COLOR_BLACK = [17, 24, 39]; // Slate 900
        const COLOR_TEXT_SUBTLE = [107, 114, 128]; // gray-500
        const COLOR_BORDER = [226, 232, 240]; // gray-200

        let headerStartY = 20;

        // --- 1. HEADER (CLEAN & CENTERED LOGO) ---
        
        // Brand Logo (Left - Circular with subtle border)
        if (branding.logo) {
            try {
                const base64Logo = await getBase64ImageFromURL(branding.logo);
                // Shadow/Border Circle
                doc.setDrawColor(241, 245, 249);
                doc.setLineWidth(0.5);
                doc.setFillColor(255, 255, 255);
                doc.circle(32, headerStartY + 12, 16, 'FD');
                
                // Actual Logo
                doc.addImage(base64Logo, 'PNG', 20, headerStartY, 24, 24, undefined, 'FAST');
            } catch (e) {
                doc.setFillColor(...COLOR_BRAND);
                doc.circle(32, headerStartY + 12, 16, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                doc.text('LOGO', 32, headerStartY + 13.5, { align: 'center' });
            }
        } else {
            doc.setFillColor(...COLOR_BLACK);
            doc.circle(32, headerStartY + 12, 16, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text((branding.name || 'G').charAt(0).toUpperCase(), 32, headerStartY + 14.5, { align: 'center' });
        }

        // Gym Details (Right Aligned)
        doc.setTextColor(...COLOR_BLACK);
        doc.setFontSize(26);
        doc.setFont('helvetica', 'bold');
        doc.text(branding.name || 'Gym Management', pageWidth - 15, headerStartY + 8, { align: 'right' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLOR_TEXT_SUBTLE);
        
        let detailY = headerStartY + 16;
        if (branding.location) {
            doc.text(branding.location, pageWidth - 15, detailY, { align: 'right' });
            detailY += 5;
        }
        if (branding.phone || branding.email) {
            const contactText = [branding.phone, branding.email].filter(Boolean).join('  •  ');
            doc.text(contactText, pageWidth - 15, detailY, { align: 'right' });
        }

        // Divider
        doc.setDrawColor(...COLOR_BORDER);
        doc.setLineWidth(0.2);
        doc.line(15, headerStartY + 38, pageWidth - 15, headerStartY + 38);

        // --- 2. REPORT TITLE ---
        const titleStartY = headerStartY + 55;
        doc.setTextColor(...COLOR_BLACK);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), pageWidth / 2, titleStartY, { align: 'center', charSpace: 1 });
        
        // Short concentrated underline
        doc.setDrawColor(191, 219, 254); // Light blue bar
        doc.setLineWidth(1.5);
        doc.line(pageWidth / 2 - 18, titleStartY + 5, pageWidth / 2 + 18, titleStartY + 5);

        // --- 3. META INFO ROW ---
        doc.setTextColor(...COLOR_TEXT_SUBTLE);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.text(`DATE: ${new Date().toLocaleDateString('en-GB')}  ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`, 15, titleStartY + 15);
        doc.text(`GENERATED BY: SYSTEM ADMIN`, pageWidth - 15, titleStartY + 15, { align: 'right' });

        // --- 4. DATA SECTION (CARD LOOK) ---
        let finalHeaders = [];
        let finalRows = [];

        const sanitize = (val) => {
            if (val === null || val === undefined) return '-';
            
            // Handle Objects (e.g., Member object, Plan object)
            if (typeof val === 'object' && !Array.isArray(val)) {
                return val.name || val.title || val.fullName || val.label || JSON.stringify(val);
            }
            
            if (typeof val !== 'string') val = String(val);
            
            // Replace broken Rupee symbols with standard Rs. for better font support
            return val.replace(/[₹]/g, 'Rs. ').replace(/Rs\./g, 'Rs. ').replace(/Rs/g, 'Rs. ').trim();
        };

        if (Array.isArray(body[0])) {
            finalRows = body.map(row => row.map(cell => sanitize(cell)));
            finalHeaders = (headers || []).map(h => sanitize(h));
        } else {
            const keys = Object.keys(body[0]).filter(k =>
                !['id', 'createdAt', 'updatedAt', 'password', '__v', 'avatar', 'image'].includes(k)
            );
            finalHeaders = (headers || keys.map(k =>
                k.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
            )).map(h => sanitize(h));
            finalRows = body.map(item =>
                keys.map(key => sanitize(item[key]))
            );
        }

        autoTable(doc, {
            startY: titleStartY + 22,
            head: [finalHeaders],
            body: finalRows,
            styles: {
                fontSize: 9,
                cellPadding: 6,
                font: 'helvetica',
                lineWidth: 0.1,
                lineColor: [241, 245, 249],
                textColor: [31, 41, 55], // Slate 800
                valign: 'middle'
            },
            headStyles: {
                fillColor: [248, 250, 252], // Very Light gray
                textColor: [31, 41, 55],
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 9.5
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255]
            },
            willDrawCell: (data) => {
                const statusWords = ['Active', 'Paid', 'Success', 'Inactive', 'Unpaid', 'Pending', 'Failed', 'Expired'];
                const text = data.cell.text[0];
                
                if (data.section === 'body' && statusWords.some(w => text?.includes(w))) {
                    data.cell.rawStatus = text;
                    data.cell.text = ['']; 
                }

                if (data.section === 'body' && (text?.includes('₹') || text?.includes('Rs.') || text?.includes('Amount'))) {
                    data.cell.rawAmount = text;
                    data.cell.text = ['']; 
                }
            },
            didDrawCell: (data) => {
                // Status Pill (Soft Red/Green)
                if (data.section === 'body' && data.cell.rawStatus) {
                    const status = data.cell.rawStatus;
                    let bg = [241, 245, 249];
                    let text = [107, 114, 128];
                    if (['Active', 'Paid', 'Success'].includes(status)) { bg = [220, 252, 231]; text = [22, 101, 52]; }
                    if (['Unpaid', 'Failed', 'Expired'].includes(status)) { bg = [254, 226, 226]; text = [185, 28, 28]; }
                    if (['Pending'].includes(status)) { bg = [254, 243, 199]; text = [146, 64, 14]; }

                    const rectWidth = data.cell.width - 8;
                    const rectHeight = 7;
                    const posX = data.cell.x + (data.cell.width - rectWidth) / 2;
                    const posY = data.cell.y + (data.cell.height - rectHeight) / 2;

                    doc.setFillColor(...bg);
                    doc.roundedRect(posX, posY, rectWidth, rectHeight, 3.5, 3.5, 'F');
                    
                    doc.setTextColor(...text);
                    doc.setFontSize(7.5);
                    doc.setFont('helvetica', 'bold');
                    doc.text(status.toUpperCase(), posX + rectWidth / 2, posY + 4.8, { align: 'center' });
                }

                // Amount Highlighting (Green)
                if (data.section === 'body' && data.cell.rawAmount) {
                    const amount = data.cell.rawAmount;
                    doc.setTextColor(22, 163, 74); // Green 600
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(9.5);
                    doc.text(amount, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1.5, { align: 'center' });
                }
            },
            theme: 'grid',
            margin: { left: 15, right: 15, bottom: 40 }
        });

        // --- 5. FOOTER (CLEAN & CENTERED) ---
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            
            doc.setFontSize(9);
            doc.setTextColor(...COLOR_TEXT_SUBTLE);
            doc.setFont('helvetica', 'normal');
            doc.text('This is a system-generated report', pageWidth / 2, pageHeight - 32, { align: 'center' });

            doc.setDrawColor(...COLOR_BORDER);
            doc.setLineWidth(0.2);
            doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);

            doc.setFontSize(10);
            const copyright = `© ${new Date().getFullYear()} ${branding.name || 'Gym'}  |  All Rights Reserved`;
            doc.text(copyright, pageWidth / 2, pageHeight - 15, { align: 'center' });
            
            doc.setFontSize(8);
            doc.text(`Page ${i} of ${totalPages}`, pageWidth - 15, pageHeight - 15, { align: 'right' });
        }

        // --- SAVE ---
        const safeName = filename.replace(/[^a-zA-Z0-9_]/g, '_');
        doc.save(`${safeName}.pdf`);

        removePdfToast(loadingToastId);
        const successToastId = showPdfToast('Premium Report Exported!', 'success');
        setTimeout(() => removePdfToast(successToastId), 3000);

    } catch (error) {
        console.error('PDF Export failed:', error);
        removePdfToast(loadingToastId);
        const errorToastId = showPdfToast('Export failed. Please try again.', 'error');
        setTimeout(() => removePdfToast(errorToastId), 5000);
    }
};
