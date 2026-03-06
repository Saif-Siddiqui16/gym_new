import React from 'react';
import StatusBadge from './StatusBadge';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MembershipCard = ({ membership }) => {
    const navigate = useNavigate();

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="group relative bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col">
            {/* Gradient Background on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-indigo-50/50 group-hover:via-purple-50/30 group-hover:to-pink-50/50 transition-all duration-500 rounded-2xl`}></div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header: Avatar, Name & Status */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Avatar with Gradient */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            {getInitials(membership.memberName)}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                                {membership.memberName}
                            </h3>
                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                                <User size={14} />
                                <span>{membership.memberId}</span>
                            </div>
                        </div>
                    </div>
                    <StatusBadge status={membership.status} />
                </div>

                {/* Plan Info Section */}
                <div className="py-4 px-4 mb-4 bg-gradient-to-br from-gray-50 to-indigo-50/30 rounded-xl border-2 border-gray-100 group-hover:border-indigo-200 transition-all duration-300">
                    <div className="font-bold text-base bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        {membership.planName}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar size={14} className="text-indigo-500" />
                        <span>{membership.startDate} — {membership.endDate}</span>
                    </div>
                </div>

                {/* View Details Button */}
                <button
                    onClick={() => navigate(`/memberships/${membership.id}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300 group/btn"
                >
                    <span>View Details</span>
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                </button>
            </div>
        </div>
    );
};

export default MembershipCard;
