import React from 'react';

const Card = ({ children, title, subtitle, className = '', ...props }) => {
    return (
        <div className={`saas-card ${className}`} {...props}>
            {(title || subtitle) && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    {title && <h3 className="text-title">{title}</h3>}
                    {subtitle && <p className="text-muted">{subtitle}</p>}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
