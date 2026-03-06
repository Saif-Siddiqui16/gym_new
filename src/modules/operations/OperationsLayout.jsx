import React from 'react';
import { Outlet } from 'react-router-dom';

const OperationsLayout = () => {
    return (
        <div className="fade-in">
            <Outlet />
        </div>
    );
};

export default OperationsLayout;

