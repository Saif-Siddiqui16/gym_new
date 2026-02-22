import React from 'react';
import { GitBranch, Globe } from 'lucide-react';

const BranchScopeSelector = ({ value, onChange, branches = [] }) => {
    return (
        <div className="bg-violet-50 p-4 rounded-xl border border-violet-100 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-violet-600">
                        <GitBranch size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-800">Apply Settings To:</h4>
                        <p className="text-xs text-slate-500 font-medium">Choose if this configuration is global or branch-specific.</p>
                    </div>
                </div>

                <div className="w-full sm:w-auto">
                    <select
                        value={value || 'all'}
                        onChange={(e) => onChange(e.target.value === 'all' ? null : e.target.value)}
                        className="w-full sm:w-64 pl-4 pr-10 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:border-violet-500 transition-all appearance-none cursor-pointer shadow-sm hover:border-slate-300"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 1rem center',
                            backgroundSize: '1.25rem'
                        }}
                    >
                        <option value="all">🌐 All Branches (Global)</option>
                        {branches.map(branch => (
                            <option key={branch.id} value={branch.id}>
                                📍 {branch.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default BranchScopeSelector;
