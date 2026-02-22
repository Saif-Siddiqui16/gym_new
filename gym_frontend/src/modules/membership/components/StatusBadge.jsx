import React from 'react';

const StatusBadge = ({ status }) => {
    let backgroundColor;
    let color;

    const normalizedStatus = (status || '').toLowerCase();

    switch (normalizedStatus) {
        case 'active':
            backgroundColor = '#D1FAE5'; // Light green
            color = '#10B981'; // Success green
            break;
        case 'expired':
            backgroundColor = '#F3F4F6'; // Light gray
            color = '#6B7280'; // Neutral gray
            break;
        case 'frozen':
            backgroundColor = '#FEF3C7'; // Light yellow warnings
            color = '#F59E0B'; // Warning amber
            break;
        default:
            backgroundColor = '#E5E7EB';
            color = '#374151';
    }

    const style = {
        backgroundColor,
        color,
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'capitalize',
        display: 'inline-block'
    };

    return (
        <span style={style}>
            {status}
        </span>
    );
};

export default StatusBadge;
