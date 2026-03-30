import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../components/common/ConfirmationModal';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [confirmConfig, setConfirmConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'info',
        onConfirm: () => {},
        onCancel: () => {},
        loading: false
    });

    const confirm = useCallback((config) => {
        return new Promise((resolve) => {
            setConfirmConfig({
                isOpen: true,
                title: config.title || 'Are you sure?',
                message: config.message || 'Please confirm this action.',
                confirmText: config.confirmText || 'Confirm',
                cancelText: config.cancelText || 'Cancel',
                type: config.type || 'info',
                onConfirm: () => {
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                    if (config.onConfirm) config.onConfirm();
                    resolve(true);
                },
                onCancel: () => {
                    setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                    if (config.onCancel) config.onCancel();
                    resolve(false);
                },
                loading: false
            });
        });
    }, []);

    const closeConfirm = useCallback(() => {
        setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <NotificationContext.Provider value={{ toast, confirm, closeConfirm }}>
            {children}
            <ConfirmationModal
                isOpen={confirmConfig.isOpen}
                onClose={confirmConfig.onCancel}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmText={confirmConfig.confirmText}
                cancelText={confirmConfig.cancelText}
                type={confirmConfig.type}
                loading={confirmConfig.loading}
            />
        </NotificationContext.Provider>
    );
};
