import React from 'react';

const DashboardGrid = ({ children }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {children}
        </div>
    );
};

export default DashboardGrid;
