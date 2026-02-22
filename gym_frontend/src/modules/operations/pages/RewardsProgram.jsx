import React, { useState, useEffect } from 'react';
import { rewardApi } from '../../../api/rewardApi';
import toast from 'react-hot-toast';
import { Gift, Plus, Award, Settings, Trash2, Zap, Star, Users, Calendar } from 'lucide-react';
import RightDrawer from '../../../components/common/RightDrawer';
import AddRewardDrawer from './AddRewardDrawer';

const RewardsProgram = () => {
    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRewards();
    }, []);

    const loadRewards = async () => {
        try {
            setLoading(true);
            const data = await rewardApi.getAllRewards();
            // Map the data appropriately if needed, expecting: id, member, points, description, date
            const formatted = data.map(r => ({
                id: r.id,
                name: r.member, // using member name as reward 'name' in UI context for now
                points: r.points,
                description: r.description,
                category: 'Custom'
            }));
            setRewards(formatted);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load rewards');
        } finally {
            setLoading(false);
        }
    };

    const [pointsConfig, setPointsConfig] = useState({
        checkIn: 10,
        referral: 500,
        review: 100,
        classBooking: 20
    });

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleAddReward = async (newReward) => {
        try {
            await rewardApi.addReward({
                points: parseInt(newReward.points),
                description: newReward.name || newReward.description
            });
            toast.success('Reward added successfully');
            loadRewards();
            setIsDrawerOpen(false);
        } catch (error) {
            toast.error('Failed to add reward');
        }
    };

    const handleDeleteReward = (id) => {
        setRewards(rewards.filter(r => r.id !== id));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
            {/* Premium Header */}
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-100 p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:scale-110 hover:rotate-6">
                            <Gift size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                                    Rewards Program
                                </h1>
                                <span className="px-2 py-0.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black rounded-md shadow-sm animate-pulse">
                                    PREMIUM ✨
                                </span>
                            </div>
                            <p className="text-slate-600 text-sm mt-1">Configure loyalty points and redeemable rewards</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Points Configuration */}
                <div className="group relative bg-white rounded-2xl shadow-lg border border-slate-100 p-6 lg:col-span-1 overflow-hidden h-fit">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                                <Settings size={16} strokeWidth={2.5} />
                            </div>
                            Earning Rules
                        </h3>

                        <div className="space-y-4">
                            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 hover:border-violet-300 transition-colors duration-300">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                        <div className="p-1.5 bg-green-100 text-green-600 rounded-lg">
                                            <Zap size={14} />
                                        </div>
                                        Per Check-in
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            value={pointsConfig.checkIn}
                                            onChange={(e) => setPointsConfig({ ...pointsConfig, checkIn: parseInt(e.target.value) })}
                                            className="w-16 p-1.5 bg-white border-2 border-slate-200 rounded-lg text-right font-black text-slate-900 focus:border-violet-500 focus:outline-none transition-all text-sm"
                                        />
                                        <span className="text-[10px] font-black text-slate-400 uppercase">PTS</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 hover:border-violet-300 transition-colors duration-300">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                        <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                                            <Users size={14} />
                                        </div>
                                        Per Referral
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            value={pointsConfig.referral}
                                            onChange={(e) => setPointsConfig({ ...pointsConfig, referral: parseInt(e.target.value) })}
                                            className="w-16 p-1.5 bg-white border-2 border-slate-200 rounded-lg text-right font-black text-slate-900 focus:border-violet-500 focus:outline-none transition-all text-sm"
                                        />
                                        <span className="text-[10px] font-black text-slate-400 uppercase">PTS</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 hover:border-violet-300 transition-colors duration-300">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                        <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                                            <Star size={14} />
                                        </div>
                                        Google Review
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            value={pointsConfig.review}
                                            onChange={(e) => setPointsConfig({ ...pointsConfig, review: parseInt(e.target.value) })}
                                            className="w-16 p-1.5 bg-white border-2 border-slate-200 rounded-lg text-right font-black text-slate-900 focus:border-violet-500 focus:outline-none transition-all text-sm"
                                        />
                                        <span className="text-[10px] font-black text-slate-400 uppercase">PTS</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 hover:border-violet-300 transition-colors duration-300">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                            <Calendar size={14} />
                                        </div>
                                        Class Booking
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            value={pointsConfig.classBooking}
                                            onChange={(e) => setPointsConfig({ ...pointsConfig, classBooking: parseInt(e.target.value) })}
                                            className="w-16 p-1.5 bg-white border-2 border-slate-200 rounded-lg text-right font-black text-slate-900 focus:border-violet-500 focus:outline-none transition-all text-sm"
                                        />
                                        <span className="text-[10px] font-black text-slate-400 uppercase">PTS</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300">
                            Save Configuration
                        </button>
                    </div>
                </div>

                {/* Rewards List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-slate-900">Active Rewards</h3>
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:border-violet-500 hover:text-violet-600 transition-all duration-300"
                        >
                            <Plus size={16} strokeWidth={2.5} /> Add Reward
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rewards.map(reward => (
                            <div key={reward.id} className="group relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-violet-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                    <button
                                        onClick={() => handleDeleteReward(reward.id)}
                                        className="p-2 bg-white rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="relative z-10 flex items-start gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                                        <Award size={28} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-lg group-hover:text-violet-700 transition-colors">{reward.name}</h4>
                                        <div className="inline-flex items-center gap-1 text-amber-600 font-black text-sm mb-2 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                                            <Star size={12} fill="currentColor" /> {reward.points} Points
                                        </div>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{reward.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side Drawer */}
            <RightDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Create Reward"
            >
                <AddRewardDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    onAdd={handleAddReward}
                />
            </RightDrawer>
        </div>
    );
};

export default RewardsProgram;
