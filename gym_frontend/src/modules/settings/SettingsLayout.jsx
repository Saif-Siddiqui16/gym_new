import React from 'react';
import { Outlet } from 'react-router-dom';

const SettingsLayout = ({ role }) => {
    return (
        <div className="fade-in">
            <Outlet context={{ role }} />
        </div>
    );
};

export default SettingsLayout;
