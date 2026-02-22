import React from 'react';

const SectionHeader = ({ title, action }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-3)'
        }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1F2937', margin: 0 }}>{title}</h3>
            {action && (
                <div>{action}</div>
            )}
        </div>
    );
};

export default SectionHeader;
