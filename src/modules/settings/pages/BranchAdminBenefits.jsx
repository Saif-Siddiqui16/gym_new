import React from 'react';
import { Building2 } from 'lucide-react';

const BranchAdminBenefits = () => {
    return (
        <div className="flex flex-col items-center justify-center bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10 sm:p-20 text-center gap-6 min-h-[500px]">
            <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center shadow-inner">
                <Building2 size={48} className="text-slate-300" />
            </div>
            <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">No branch found.</h3>
                <p className="text-slate-500 font-bold mt-2">Please create a branch first.</p>
            </div>
        </div>
    );
};

export default BranchAdminBenefits;
