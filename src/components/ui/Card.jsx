import React from 'react';

const Card = ({ children, title, subtitle, className = '', ...props }) => {
    return (
        <div className={`card ${className}`} {...props}>
            {(title || subtitle) && (
                <div className="mb-6 border-b border-border-light pb-4">
                    {title && <h3 className="section-title">{title}</h3>}
                    {subtitle && <p className="text-muted">{subtitle}</p>}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
