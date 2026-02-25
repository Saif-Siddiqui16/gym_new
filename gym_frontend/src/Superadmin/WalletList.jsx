import React, { useState, useEffect } from 'react';
import { Search, Eye, ChevronLeft, ChevronRight, MapPin, DollarSign, History } from 'lucide-react';
import WalletDrawer from './WalletDrawer';
import { ROLES } from '../config/roles';
import MobileCard from '../components/common/MobileCard';
import { fetchMemberWallets } from '../api/superadmin/superAdminApi';

const WalletList = ({ role = ROLES.SUPER_ADMIN }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);


    // Initial Member Data
    const [wallets, setWallets] = useState([]);
    const [walletData, setWalletData] = useState({});

    // Fetch Data
    useEffect(() => {
        const loadWallets = async () => {
            try {
                setLoading(true);
                const data = await fetchMemberWallets();
                setWallets(data);

                // Map data to walletData structure for drawer/list
                const walletMap = data.reduce((acc, w) => {
                    acc[w.id] = { // Use id (memberId) to match record.id
                        balance: Number(w.balance) || 0,
                        transactions: w.transactions || [],
                        lastTransaction: w.lastTransaction
                    };
                    return acc;
                }, {});
                setWalletData(walletMap);

            } catch (error) {
                console.error("Failed to fetch wallets:", error);
            } finally {
                setLoading(false);
            }
        };
        loadWallets();
    }, []);

    // Step 7: Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const membersPerPage = 5;

    // Reset pagination when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const handleViewWallet = (member) => {
        setSelectedMember(member);
        setIsDrawerOpen(true);
    };

    // Step 6: Real-time filtering logic
    const filteredMembers = wallets.filter(member => {
        const matchesSearch =
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.branch.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    // Step 7: Pagination Logic
    const indexOfLastMember = currentPage * membersPerPage;
    const indexOfFirstMember = indexOfLastMember - membersPerPage;
    const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
    const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

    return (
        <div className="p-6 w-full animate-slide-up relative overflow-hidden">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Benefit Wallet Management</h1>
                <p className="text-sm text-gray-500 mt-1">Manage member wallet balances and transactions</p>
            </div>

            {/* Search Bar */}
            <div className="saas-card mb-6">
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="saas-input pl-10 transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                        placeholder="Search members, IDs or branches..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Wallet Table (hidden on mobile) */}
            <div className="hidden md:block saas-card p-0 overflow-hidden shadow-soft rounded-xl mb-6">
                <div className="saas-table-wrapper overflow-x-auto">
                    <table className="saas-table saas-table-responsive w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Balance</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Transaction</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {currentMembers.length > 0 ? (
                                currentMembers.map((record) => {
                                    const currentWallet = walletData[record.id] || { balance: 0, lastTransaction: 'N/A' };
                                    return (
                                        <tr key={record.id} className="hover:bg-indigo-50/30 transition-all duration-300 group">
                                            <td className="px-6 py-4 whitespace-nowrap" data-label="Member Name">
                                                <div className="text-sm font-medium text-gray-900">{record.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap" data-label="Member ID">
                                                <div className="text-sm text-gray-500">{record.id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap" data-label="Branch">
                                                <div className="text-sm text-gray-500">{record.branch}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap" data-label="Current Balance">
                                                <span className={`text-sm font-bold ${Number(currentWallet.balance) > 0 ? 'text-green-600' : Number(currentWallet.balance) < 0 ? 'text-red-100' : 'text-gray-900'}`}>
                                                    {Number(currentWallet.balance) < 0 ? `-$${Math.abs(Number(currentWallet.balance)).toFixed(2)}` : `$${Number(currentWallet.balance).toFixed(2)}`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap" data-label="Last Transaction">
                                                <div className="text-sm text-gray-500">{currentWallet.lastTransaction}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right" data-label="Action">
                                                <button
                                                    onClick={() => handleViewWallet(record)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all duration-300"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View Wallet
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500 font-medium">
                                        No members found matching "{searchQuery}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View (md:hidden) */}
            <div className="grid grid-cols-1 gap-4 md:hidden mb-6">
                {currentMembers.length > 0 ? (
                    currentMembers.map((record) => {
                        const currentWallet = walletData[record.id] || { balance: 0, lastTransaction: 'N/A' };
                        return (
                            <MobileCard
                                key={record.id}
                                title={record.name}
                                subtitle={record.id}
                                badge={{
                                    label: Number(currentWallet.balance) < 0 ? `-$${Math.abs(Number(currentWallet.balance)).toFixed(2)}` : `$${Number(currentWallet.balance).toFixed(2)}`,
                                    color: Number(currentWallet.balance) > 0 ? 'emerald' : Number(currentWallet.balance) < 0 ? 'red' : 'slate'
                                }}
                                fields={[
                                    { label: 'Branch', value: record.branch, icon: MapPin },
                                    { label: 'Last Trans.', value: currentWallet.lastTransaction, icon: History },
                                ]}
                                actions={[
                                    {
                                        label: 'View Wallet',
                                        icon: Eye,
                                        variant: 'primary',
                                        onClick: () => handleViewWallet(record)
                                    }
                                ]}
                            />
                        );
                    })
                ) : (
                    <div className="bg-white p-10 text-center text-gray-500 rounded-xl shadow-sm border border-gray-100">
                        No members found matching "{searchQuery}"
                    </div>
                )}
            </div>

            {/* Step 7: Pagination UI */}
            {filteredMembers.length > membersPerPage && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-semibold">{indexOfFirstMember + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastMember, filteredMembers.length)}</span> of{' '}
                                <span className="font-semibold">{filteredMembers.length}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                </button>
                                {[...Array(totalPages)].map((_, idx) => (
                                    <button
                                        key={idx + 1}
                                        onClick={() => setCurrentPage(idx + 1)}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 transition-all ${currentPage === idx + 1 ? 'z-10 bg-indigo-600 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'}`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            {/* Refactored Wallet Details Drawer (Controlled Component) */}
            <WalletDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                memberData={selectedMember}
                walletData={walletData}
                setWalletData={setWalletData}
            />
        </div>
    );
};

export default WalletList;
