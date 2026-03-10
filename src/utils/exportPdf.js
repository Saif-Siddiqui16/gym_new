/**
 * Unified PDF Export Utility with Branding and Toast Notifications
 */

// PDF toast notification helper
export const showPdfToast = (message, type = 'success') => {
    const toastId = `pdf-toast-${Date.now()}`;
    const colors = {
        success: { bg: '#f0fdf4', border: '#86efac', icon: '#16a34a', text: '#15803d' },
        error: { bg: '#fef2f2', border: '#fca5a5', icon: '#dc2626', text: '#dc2626' },
        loading: { bg: '#f5f3ff', border: '#c4b5fd', icon: '#7c3aed', text: '#6d28d9' }
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
 * Flexible PDF Export function.
 * 
 * Supports two signatures:
 * 1. exportPdf(tableName, data) - data is array of objects
 * 2. exportPdf({ title, filename, headers, rows, gymName }) - rows is array of arrays or objects
 */
export const exportPdf = async (arg1, arg2) => {
    let title = 'Report';
    let filename = 'Report';
    let headers = null;
    let body = null;
    let gymName = 'Gym Administration';

    // Handle Signature 2: Single object argument
    if (typeof arg1 === 'object' && !Array.isArray(arg1) && arg1 !== null && !arg2) {
        title = arg1.title || 'Report';
        filename = arg1.filename || title;
        headers = arg1.headers || null;
        body = arg1.rows || arg1.data || null;
        gymName = arg1.gymName || 'Gym Administration';
    }
    // Handle Signature 1: Positional arguments (tableName, data)
    else {
        title = arg1 || 'Report';
        filename = title;
        body = arg2 || null;
    }

    // Validation
    if (!body || !Array.isArray(body) || body.length === 0) {
        const errorToastId = showPdfToast('No data available to export.', 'error');
        setTimeout(() => removePdfToast(errorToastId), 3000);
        return;
    }

    const loadingToastId = showPdfToast('Generating PDF, please wait...', 'loading');

    try {
        const jsPDFModule = await import('jspdf');
        const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
        const autoTableModule = await import('jspdf-autotable');
        const autoTable = autoTableModule.default || autoTableModule.autoTable;

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // --- HEADER BAR ---
        doc.setFillColor(88, 28, 235);
        doc.rect(0, 0, pageWidth, 22, 'F');

        // Logo circle
        doc.setFillColor(255, 255, 255);
        doc.circle(18, 11, 8, 'F');
        doc.setTextColor(88, 28, 235);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('GA', 18, 12.5, { align: 'center' });

        // Report Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 32, 10);

        // Date
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Generated: ' + new Date().toLocaleString(), 32, 16);

        // Company name right
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(gymName, pageWidth - 15, 10, { align: 'right' });
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('Confidential Report', pageWidth - 15, 16, { align: 'right' });

        // --- PREPARE DATA ---
        let finalHeaders = [];
        let finalRows = [];

        const sanitize = (val) => {
            if (val === null || val === undefined) return '-';
            if (typeof val !== 'string') val = String(val);
            return val.replace(/₹/g, 'Rs. ');
        };

        // If body is array of arrays
        if (Array.isArray(body[0])) {
            finalRows = body.map(row => row.map(cell => sanitize(cell)));
            finalHeaders = (headers || []).map(h => sanitize(h));
        }
        // If body is array of objects
        else {
            const keys = Object.keys(body[0]).filter(k =>
                !['id', 'createdAt', 'updatedAt', 'password', '__v', 'avatar', 'image'].includes(k)
            );

            finalHeaders = (headers || keys.map(k =>
                k.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
            )).map(h => sanitize(h));

            finalRows = body.map(item =>
                keys.map(key => {
                    let val = item[key];
                    if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
                    if (typeof val === 'boolean') val = val ? 'Yes' : 'No';
                    return sanitize(val);
                })
            );
        }

        autoTable(doc, {
            startY: 28,
            head: [finalHeaders],
            body: finalRows,
            styles: {
                fontSize: 7,
                cellPadding: 3,
                font: 'helvetica',
                lineWidth: 0.1,
                lineColor: [230, 225, 255]
            },
            headStyles: {
                fillColor: [88, 28, 235],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 7.5
            },
            alternateRowStyles: {
                fillColor: [245, 243, 255]
            },
            theme: 'striped',
            margin: { left: 10, right: 10 }
        });

        // --- FOOTER ---
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFillColor(245, 243, 255);
            doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
            doc.setFontSize(7);
            doc.setTextColor(88, 28, 235);
            doc.setFont('helvetica', 'normal');
            doc.text(`© ${gymName}`, 10, pageHeight - 4);
            doc.text(`Page ${i} of ${totalPages}`, pageWidth - 10, pageHeight - 4, { align: 'right' });
        }

        // --- SAVE ---
        const safeName = filename.replace(/[^a-zA-Z0-9_]/g, '_');
        doc.save(`${safeName}.pdf`);

        removePdfToast(loadingToastId);
        const successToastId = showPdfToast('PDF downloaded successfully!', 'success');
        setTimeout(() => removePdfToast(successToastId), 3000);

    } catch (error) {
        console.error('PDF Export failed:', error);
        removePdfToast(loadingToastId);
        const errorToastId = showPdfToast('Failed to generate PDF. Please try again.', 'error');
        setTimeout(() => removePdfToast(errorToastId), 5000);
    }
};
