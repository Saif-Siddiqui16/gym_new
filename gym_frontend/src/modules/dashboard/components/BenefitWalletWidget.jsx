import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import { ChevronRight } from 'lucide-react';
import BenefitDetailsDrawer from './BenefitDetailsDrawer';

const BenefitWalletWidget = ({ walletData }) => {
    const [selectedBenefit, setSelectedBenefit] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    if (!walletData || !walletData.benefits || walletData.benefits.length === 0) {
        return (
            <Card className="p-5 border-l-4 border-l-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-slate-900 text-xs font-black uppercase tracking-widest">Benefit Wallet</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Your membership benefits</p>
                    </div>
                </div>
                <div className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    No benefits included.
                </div>
            </Card>
        );
    }

    const { planName, benefits } = walletData;

    const openDetails = (benefit) => {
        setSelectedBenefit(benefit);
        setIsDrawerOpen(true);
    };

    return (
        <>
            <Card className="bg-gradient-to-br from-slate-50/50 to-white p-5 border border-slate-100 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-[220px] flex flex-col group overflow-hidden">
                <div className="flex items-center justify-between mb-3 shrink-0">
                    <div>
                        <h3 className="text-slate-900 text-[11px] font-black uppercase tracking-[0.2em] leading-none text-violet-600">My Benefits</h3>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{planName}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 shadow-sm group-hover:scale-110 transition-transform">
                        <ChevronRight size={16} strokeWidth={3} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                    <div className="space-y-2">
                        {benefits.map((benefit) => {
                            const isUnlimited = benefit.total === 'Unlimited';
                            const progress = isUnlimited ? 100 : (benefit.used / benefit.total) * 100;
                            const remaining = isUnlimited ? '∞' : benefit.total - benefit.used;

                            return (
                                <div
                                    key={benefit.id}
                                    className="py-1 group/item cursor-pointer"
                                    onClick={() => openDetails(benefit)}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">
                                            {benefit.name}
                                        </span>
                                        <span className="text-[9px] font-black tracking-tighter text-slate-400 uppercase">
                                            <span className="text-slate-900">{remaining} / {benefit.total}</span> <span className="text-slate-400 ml-1">{benefit.total === 'Unlimited' ? '' : 'Total Quota'}</span>
                                        </span>
                                    </div>

                                    <div className="h-[2px] bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-700"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-3 mt-auto border-t border-slate-50 shrink-0">
                    <button
                        onClick={() => openDetails(benefits[0])}
                        className="text-[9px] font-black text-violet-600 uppercase tracking-[0.2em] hover:text-violet-700 transition-colors flex items-center gap-1"
                    >
                        VIEW ALL BENEFITS <ChevronRight size={10} strokeWidth={4} />
                    </button>
                </div>
            </Card>

            <BenefitDetailsDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                benefit={selectedBenefit}
            />
        </>
    );
};

export default BenefitWalletWidget;
