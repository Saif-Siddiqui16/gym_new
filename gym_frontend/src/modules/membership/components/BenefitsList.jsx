import React, { useState, useEffect } from 'react';
import { Check, Wifi, Zap, Shield, Coffee, Music, Car, Tv, Bath, Wind, Waves, Dumbbell, Layers, Loader2 } from 'lucide-react';
import amenityApi from '../../../api/amenityApi';

const ICON_OPTIONS = {
    Wifi, Zap, Shield, Coffee, Music, Car, Tv, Bath, Wind, Waves, Dumbbell, Layers, Check
};

const BenefitsList = ({ benefitIds = [], layout = 'list' }) => {
    // benefitIds can be an array of integers representing the amenity primary IDs
    const safeBenefitIds = Array.isArray(benefitIds) ? benefitIds.map(id => parseInt(id)) : [];

    const [amenities, setAmenities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAmenities = async () => {
            try {
                const data = await amenityApi.getAll();
                setAmenities(data);
            } catch (error) {
                console.error("Failed to load amenities", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAmenities();
    }, []);

    if (loading) return <Loader2 size={16} className="animate-spin text-indigo-500" />;

    const activeBenefits = amenities.filter(b => safeBenefitIds.includes(parseInt(b.id)));

    if (activeBenefits.length === 0) return <div className="text-gray-400 text-sm italic py-2">No benefits included.</div>;

    if (layout === 'grid') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeBenefits.map(benefit => {
                    const Icon = ICON_OPTIONS[benefit.icon] || Check;
                    return (
                        <div key={benefit.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white hover:border-indigo-100 hover:shadow-sm transition-all">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                                <Icon size={18} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="font-bold text-sm text-gray-800 truncate">{benefit.name}</div>
                                {benefit.gender && benefit.gender !== 'UNISEX' && (
                                    <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">
                                        {benefit.gender}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Default 'list' layout
    return (
        <div className="flex flex-wrap gap-2">
            {activeBenefits.map(benefit => {
                const Icon = ICON_OPTIONS[benefit.icon] || Check;
                return (
                    <div key={benefit.id} className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg shadow-sm">
                        <Icon size={14} className="text-indigo-500" />
                        <span className="text-sm font-bold text-gray-700">{benefit.name}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default BenefitsList;
