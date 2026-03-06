import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiClient from '../api/apiClient';

const BranchContext = createContext();

export const BranchProvider = ({ children }) => {
    const { user } = useAuth();
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranchState] = useState(() => localStorage.getItem('selectedBranch') || 'all');
    const [loadingBranches, setLoadingBranches] = useState(false);

    const setSelectedBranch = (val) => {
        setSelectedBranchState(val);
        localStorage.setItem('selectedBranch', val);
    };

    useEffect(() => {
        console.log('BranchContext useEffect triggered, user:', user);
        if (user) {
            console.log('Attempting to fetch branches for role:', user.role);
            fetchBranches();
        }
    }, [user]);

    const fetchBranches = async () => {
        try {
            setLoadingBranches(true);
            // We set 'x-tenant-id' to null (not undefined) so the apiClient interceptor DOES NOT overwrite it
            // This ensures we get all branches for the user, not just one.
            const response = await apiClient.get('/branches', {
                headers: { 'x-tenant-id': 'none' }
            });

            console.log('[BranchContext] API Status:', response.status);
            const rawData = response.data?.data || response.data || [];
            const formattedBranches = Array.isArray(rawData) ? rawData : [];

            console.log('[BranchContext] Fetched branches count:', formattedBranches.length);
            setBranches(formattedBranches);

            // Validate current selection
            if (selectedBranch !== 'all') {
                const isValid = formattedBranches.some(b => String(b.id) === String(selectedBranch) || String(b._id) === String(selectedBranch));
                if (!isValid) {
                    console.log('[BranchContext] Current selection invalid for this user, falling back to all');
                    setSelectedBranch('all');
                }
            }
        } catch (error) {
            console.error('[BranchContext] Fetch error:', error.response?.data || error.message);
            setBranches([]);
        } finally {
            setLoadingBranches(false);
        }
    };

    const refreshBranches = () => fetchBranches();

    return (
        <BranchContext.Provider value={{
            branches,
            selectedBranch,
            setSelectedBranch,
            loadingBranches,
            refreshBranches,
            showAllOption: true,
            showSelector: true
        }}>
            {children}
        </BranchContext.Provider>
    );
};

export const useBranchContext = () => useContext(BranchContext);
