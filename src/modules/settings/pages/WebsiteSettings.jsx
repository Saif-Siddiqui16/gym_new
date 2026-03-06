import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ExternalLink, RefreshCw, Save, Plus, Trash2, Dumbbell, Users, Activity, Clock, Instagram, Facebook, Twitter, Youtube, Palette } from 'lucide-react';

import { ROLES } from '../../../config/roles';

const WebsiteSettings = () => {
    const context = useOutletContext();
    const role = context?.role;
    const isReadOnly = role === ROLES.MANAGER;

    const [activeTab, setActiveTab] = useState('General');
    const [generalSettings, setGeneralSettings] = useState({
        gymName: 'Incline Fitness',
        tagline: 'Elevate Your Potential',
        email: 'info@inclinefitness.com',
        phone: '+91 98765 43210',
        address: '123 Fitness Street, Mumbai, India'
    });

    const [heroSettings, setHeroSettings] = useState({
        title: 'TRANSFORM YOUR BODY',
        subtitle: 'Incline Fitness - Where Champions Are Made',
        imageUrl: '/gym-hero.jpg',
        logoUrl: '/logo.png'
    });

    const [features, setFeatures] = useState([
        { id: 1, title: 'Premium Equipment', icon: 'Dumbbell', description: 'State-of-the-art fitness machines and free weights' },
        { id: 2, title: 'Expert Trainers', icon: 'Users', description: 'Certified personal trainers to guide your journey' },
        { id: 3, title: 'Group Classes', icon: 'Activity', description: 'Yoga, HIIT, Zumba, and more group sessions' },
        { id: 4, title: '24/7 Access', icon: 'Clock', description: 'Train anytime with round-the-clock gym access' }
    ]);

    const tabs = ['General', 'Hero', 'Features', 'Pricing', 'Reviews', 'Social', 'Theme'];

    const iconMap = {
        Dumbbell: Dumbbell,
        Users: Users,
        Activity: Activity,
        Clock: Clock,
        Save: Save
    };

    const [socialLinks, setSocialLinks] = useState({
        instagram: 'https://instagram.com/inclinefitness',
        facebook: 'https://facebook.com/inclinefitness',
        twitter: 'https://twitter.com/inclinefitness',
        youtube: 'https://youtube.com/inclinefitness'
    });

    const handleGeneralChange = (e) => {
        const { name, value } = e.target;
        setGeneralSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleHeroChange = (e) => {
        const { name, value } = e.target;
        setHeroSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleFeatureChange = (id, field, value) => {
        setFeatures(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
    };

    const addFeature = () => {
        const newId = features.length > 0 ? Math.max(...features.map(f => f.id)) + 1 : 1;
        setFeatures([...features, { id: newId, title: '', icon: 'Dumbbell', description: '' }]);
    };

    const removeFeature = (id) => {
        setFeatures(prev => prev.filter(f => f.id !== id));
    };

    const [pricingPlans, setPricingPlans] = useState([
        {
            id: 1,
            name: 'Monthly',
            price: '2999',
            duration: '1 Month',
            isPopular: false,
            features: 'Full gym access\nLocker facility\nBasic fitness assessment'
        },
        {
            id: 2,
            name: 'Quarterly',
            price: '7999',
            duration: '3 Months',
            isPopular: true,
            features: 'Full gym access\nLocker facility\nFitness assessment\n2 PT sessions'
        },
        {
            id: 3,
            name: 'Annual',
            price: '24999',
            duration: '12 Months',
            isPopular: false,
            features: 'Full gym access\nPremium locker\nMonthly assessment\n12 PT sessions\nDiet consultation'
        }
    ]);

    const [testimonials, setTestimonials] = useState([
        { id: 1, name: 'Rahul S.', imageUrl: '', quote: 'Lost 20kg in 6 months. The trainers here are incredibly supportive!' },
        { id: 2, name: 'Priya M.', imageUrl: '', quote: 'Best gym in the city. Clean, well-equipped, and great community.' },
        { id: 3, name: 'Amit K.', imageUrl: '', quote: 'The personal training program completely transformed my fitness journey.' }
    ]);

    const handlePricingChange = (id, field, value) => {
        setPricingPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const addPricingPlan = () => {
        const newId = pricingPlans.length > 0 ? Math.max(...pricingPlans.map(p => p.id)) + 1 : 1;
        setPricingPlans([...pricingPlans, { id: newId, name: '', price: '', duration: '', isPopular: false, features: '' }]);
    };

    const removePricingPlan = (id) => {
        setPricingPlans(prev => prev.filter(p => p.id !== id));
    };

    const handleTestimonialChange = (id, field, value) => {
        setTestimonials(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const addTestimonial = () => {
        const newId = testimonials.length > 0 ? Math.max(...testimonials.map(t => t.id)) + 1 : 1;
        setTestimonials([...testimonials, { id: newId, name: '', imageUrl: '', quote: '' }]);
    };

    const removeTestimonial = (id) => {
        setTestimonials(prev => prev.filter(t => t.id !== id));
    };

    const handleSocialChange = (e) => {
        const { name, value } = e.target;
        setSocialLinks(prev => ({ ...prev, [name]: value }));
    };

    const [themeSettings, setThemeSettings] = useState({
        primaryColor: '#1e293b',
        accentColor: '#3b82f6'
    });

    const handleThemeChange = (e) => {
        const { name, value } = e.target;
        setThemeSettings(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-xl sm:text-page-title leading-tight">Website CMS</h1>
                    <p className="text-muted text-xs sm:text-sm mt-1">Manage your public website content and theme</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none btn border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 px-4 h-10 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                        <ExternalLink size={16} />
                        Preview
                    </button>
                    <button className="flex-1 md:flex-none btn border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 px-4 h-10 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                        <RefreshCw size={16} />
                        Reset
                    </button>
                    <button
                        className="w-full md:w-auto btn btn-primary px-6 h-10 text-[10px] sm:text-xs font-semibold uppercase tracking-wider shadow-lg shadow-primary/10"
                        disabled={isReadOnly}
                    >
                        <Save size={16} />
                        Publish
                    </button>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex overflow-x-auto scrollbar-hide gap-1 p-1 bg-slate-100/80 rounded-2xl w-full sm:w-fit -mx-2 sm:mx-0">
                <div className="flex min-w-max gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 sm:px-6 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap uppercase tracking-wider ${activeTab === tab
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'General' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="mb-10">
                        <h2 className="text-card-title">General Settings</h2>
                        <p className="text-muted text-sm mt-0.5">Basic information about your gym displayed on the website</p>
                    </div>

                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="form-label">Gym Name</label>
                                <input
                                    type="text"
                                    name="gymName"
                                    value={generalSettings.gymName}
                                    onChange={handleGeneralChange}
                                    disabled={isReadOnly}
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="form-label">Tagline</label>
                                <input
                                    type="text"
                                    name="tagline"
                                    value={generalSettings.tagline}
                                    onChange={handleGeneralChange}
                                    disabled={isReadOnly}
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="form-label">Logo URL</label>
                            <input
                                type="text"
                                name="logoUrl"
                                value={heroSettings.logoUrl}
                                onChange={handleHeroChange}
                                disabled={isReadOnly}
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                placeholder="/logo.png"
                            />
                        </div>

                        <div className="pt-10 border-t border-slate-100">
                            <h3 className="text-card-title mb-6">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="form-label">Support Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={generalSettings.email}
                                        onChange={handleGeneralChange}
                                        disabled={isReadOnly}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="form-label">Contact Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={generalSettings.phone}
                                        onChange={handleGeneralChange}
                                        disabled={isReadOnly}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="form-label">Physical Address</label>
                            <textarea
                                name="address"
                                value={generalSettings.address}
                                onChange={handleGeneralChange}
                                disabled={isReadOnly}
                                rows={4}
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Hero' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="mb-10">
                        <h2 className="text-card-title">Hero Section</h2>
                        <p className="text-muted text-sm mt-0.5">The main banner visitors see first</p>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="form-label">Hero Title</label>
                            <input
                                type="text"
                                name="title"
                                value={heroSettings.title}
                                onChange={handleHeroChange}
                                disabled={isReadOnly}
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="form-label">Hero Subtitle</label>
                            <textarea
                                name="subtitle"
                                value={heroSettings.subtitle}
                                onChange={handleHeroChange}
                                disabled={isReadOnly}
                                rows={3}
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="form-label">Hero Image URL</label>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    name="imageUrl"
                                    value={heroSettings.imageUrl}
                                    onChange={handleHeroChange}
                                    disabled={isReadOnly}
                                    className="flex-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                />
                                <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
                                    {heroSettings.imageUrl ? (
                                        <img src={heroSettings.imageUrl} alt="Hero Preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                    ) : (
                                        <ExternalLink size={20} className="text-slate-300" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Features' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                        <div>
                            <h2 className="text-card-title">Features</h2>
                            <p className="text-muted text-sm mt-0.5">Highlight your gym's best offerings</p>
                        </div>
                        <button
                            onClick={addFeature}
                            disabled={isReadOnly}
                            className="btn btn-primary px-4 h-10 text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/10"
                        >
                            <Plus size={16} />
                            Add Feature
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature) => (
                            <div key={feature.id} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 relative group">
                                <button
                                    onClick={() => removeFeature(feature.id)}
                                    disabled={isReadOnly}
                                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-primary">
                                            {(() => {
                                                const Icon = iconMap[feature.icon] || Dumbbell;
                                                return <Icon size={24} />;
                                            })()}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Title</label>
                                                <input
                                                    type="text"
                                                    value={feature.title}
                                                    onChange={(e) => handleFeatureChange(feature.id, 'title', e.target.value)}
                                                    disabled={isReadOnly}
                                                    placeholder="Feature title"
                                                    className="w-full bg-transparent border-b border-slate-200 focus:border-primary outline-none py-1 font-medium text-slate-900"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Icon Name</label>
                                            <select
                                                value={feature.icon}
                                                onChange={(e) => handleFeatureChange(feature.id, 'icon', e.target.value)}
                                                disabled={isReadOnly}
                                                className="w-full bg-white border border-slate-200 rounded-lg h-9 px-2 text-xs focus:ring-2 focus:ring-primary/10 outline-none"
                                            >
                                                <option value="Dumbbell">Dumbbell</option>
                                                <option value="Users">Users</option>
                                                <option value="Activity">Activity</option>
                                                <option value="Clock">Clock</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Description</label>
                                            <textarea
                                                value={feature.description}
                                                onChange={(e) => handleFeatureChange(feature.id, 'description', e.target.value)}
                                                disabled={isReadOnly}
                                                rows={2}
                                                placeholder="Describe this feature..."
                                                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none resize-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {features.length === 0 && (
                        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                            <Plus size={32} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-muted">No features added yet. Click "Add Feature" to get started.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'Pricing' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                        <div>
                            <h2 className="text-card-title">Pricing Plans</h2>
                            <p className="text-muted text-sm mt-0.5">Manage your membership pricing display</p>
                        </div>
                        <button
                            onClick={addPricingPlan}
                            disabled={isReadOnly}
                            className="btn btn-primary px-4 h-10 text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/10"
                        >
                            <Plus size={16} />
                            Add Plan
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pricingPlans.map((plan) => (
                            <div key={plan.id} className={`p-6 bg-slate-50/50 rounded-2xl border ${plan.isPopular ? 'border-primary/30 ring-1 ring-primary/10' : 'border-slate-100'} relative group`}>
                                <button
                                    onClick={() => removePricingPlan(plan.id)}
                                    disabled={isReadOnly}
                                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1 flex-1 pr-8">
                                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Plan Name</label>
                                            <input
                                                type="text"
                                                value={plan.name}
                                                onChange={(e) => handlePricingChange(plan.id, 'name', e.target.value)}
                                                disabled={isReadOnly}
                                                placeholder="e.g. Monthly"
                                                className="w-full bg-transparent border-b border-slate-200 focus:border-primary outline-none py-1 font-bold text-lg text-slate-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Price (₹)</label>
                                            <input
                                                type="text"
                                                value={plan.price}
                                                onChange={(e) => handlePricingChange(plan.id, 'price', e.target.value)}
                                                disabled={isReadOnly}
                                                placeholder="2999"
                                                className="w-full bg-white border border-slate-200 rounded-lg h-10 px-3 text-sm font-semibold focus:ring-2 focus:ring-primary/10 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Duration</label>
                                            <input
                                                type="text"
                                                value={plan.duration}
                                                onChange={(e) => handlePricingChange(plan.id, 'duration', e.target.value)}
                                                disabled={isReadOnly}
                                                placeholder="1 Month"
                                                className="w-full bg-white border border-slate-200 rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-primary/10 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 py-2 border-y border-slate-100">
                                        <input
                                            type="checkbox"
                                            checked={plan.isPopular}
                                            onChange={(e) => handlePricingChange(plan.id, 'isPopular', e.target.checked)}
                                            disabled={isReadOnly}
                                            className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                                        />
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide cursor-pointer">Popular Option</label>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Features (one per line)</label>
                                        <textarea
                                            value={plan.features}
                                            onChange={(e) => handlePricingChange(plan.id, 'features', e.target.value)}
                                            disabled={isReadOnly}
                                            rows={5}
                                            placeholder="Feature 1\nFeature 2..."
                                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs leading-relaxed focus:ring-2 focus:ring-primary/10 outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {pricingPlans.length === 0 && (
                        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                            <Plus size={32} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-muted">No pricing plans added yet. Click "Add Plan" to get started.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'Reviews' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                        <div>
                            <h2 className="text-card-title">Member Testimonials</h2>
                            <p className="text-muted text-sm mt-0.5">Share your members' success stories</p>
                        </div>
                        <button
                            onClick={addTestimonial}
                            disabled={isReadOnly}
                            className="btn btn-primary px-4 h-10 text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/10"
                        >
                            <Plus size={16} />
                            Add Testimonial
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 relative group">
                                <button
                                    onClick={() => removeTestimonial(testimonial.id)}
                                    disabled={isReadOnly}
                                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                            {testimonial.imageUrl ? (
                                                <img src={testimonial.imageUrl} alt={testimonial.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Users size={24} className="text-slate-200" />
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Member Name</label>
                                                <input
                                                    type="text"
                                                    value={testimonial.name}
                                                    onChange={(e) => handleTestimonialChange(testimonial.id, 'name', e.target.value)}
                                                    disabled={isReadOnly}
                                                    placeholder="e.g. Rahul S."
                                                    className="w-full bg-transparent border-b border-slate-200 focus:border-primary outline-none py-1 font-bold text-slate-900"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Image URL (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={testimonial.imageUrl}
                                                    onChange={(e) => handleTestimonialChange(testimonial.id, 'imageUrl', e.target.value)}
                                                    disabled={isReadOnly}
                                                    placeholder="https://..."
                                                    className="w-full bg-white border border-slate-200 rounded-lg h-9 px-3 text-xs focus:ring-2 focus:ring-primary/10 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Quote</label>
                                        <textarea
                                            value={testimonial.quote}
                                            onChange={(e) => handleTestimonialChange(testimonial.id, 'quote', e.target.value)}
                                            disabled={isReadOnly}
                                            rows={3}
                                            placeholder="Enter member's quote..."
                                            className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm leading-relaxed focus:ring-2 focus:ring-primary/10 outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {testimonials.length === 0 && (
                        <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                            <Plus size={32} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-muted">No testimonials added yet. Click "Add Testimonial" to get started.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'Social' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="mb-10">
                        <h2 className="text-card-title">Social Media Links</h2>
                        <p className="text-muted text-sm mt-0.5">Connect your social media profiles</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="form-label flex items-center gap-2">
                                <Instagram size={16} className="text-pink-500" />
                                Instagram
                            </label>
                            <input
                                type="text"
                                name="instagram"
                                value={socialLinks.instagram}
                                onChange={handleSocialChange}
                                disabled={isReadOnly}
                                placeholder="https://instagram.com/..."
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="form-label flex items-center gap-2">
                                <Facebook size={16} className="text-blue-600" />
                                Facebook
                            </label>
                            <input
                                type="text"
                                name="facebook"
                                value={socialLinks.facebook}
                                onChange={handleSocialChange}
                                disabled={isReadOnly}
                                placeholder="https://facebook.com/..."
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="form-label flex items-center gap-2">
                                <Twitter size={16} className="text-sky-500" />
                                Twitter / X
                            </label>
                            <input
                                type="text"
                                name="twitter"
                                value={socialLinks.twitter}
                                onChange={handleSocialChange}
                                disabled={isReadOnly}
                                placeholder="https://twitter.com/..."
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="form-label flex items-center gap-2">
                                <Youtube size={16} className="text-red-600" />
                                YouTube
                            </label>
                            <input
                                type="text"
                                name="youtube"
                                value={socialLinks.youtube}
                                onChange={handleSocialChange}
                                disabled={isReadOnly}
                                placeholder="https://youtube.com/..."
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'Theme' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    <div className="mb-10">
                        <h2 className="text-card-title">Theme Colors</h2>
                        <p className="text-muted text-sm mt-0.5">Customize your website's color scheme</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="form-label flex items-center justify-between">
                                    Primary Color
                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">{themeSettings.primaryColor}</span>
                                </label>
                                <div className="flex gap-3">
                                    <div
                                        className="w-10 h-10 rounded-lg border border-slate-200 shadow-sm shrink-0"
                                        style={{ backgroundColor: themeSettings.primaryColor }}
                                    />
                                    <input
                                        type="color"
                                        name="primaryColor"
                                        value={themeSettings.primaryColor}
                                        onChange={handleThemeChange}
                                        disabled={isReadOnly}
                                        className="w-full h-10 p-1 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer outline-none transition-all"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 italic">This color is used for main backgrounds and primary actions.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="form-label flex items-center justify-between">
                                    Accent Color
                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">{themeSettings.accentColor}</span>
                                </label>
                                <div className="flex gap-3">
                                    <div
                                        className="w-10 h-10 rounded-lg border border-slate-200 shadow-sm shrink-0"
                                        style={{ backgroundColor: themeSettings.accentColor }}
                                    />
                                    <input
                                        type="color"
                                        name="accentColor"
                                        value={themeSettings.accentColor}
                                        onChange={handleThemeChange}
                                        disabled={isReadOnly}
                                        className="w-full h-10 p-1 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer outline-none transition-all"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-400 italic">This color is used for highlights, icons, and secondary buttons.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 sm:mt-12 p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm shrink-0">
                            <Palette size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900">Live Preview Tip</h4>
                            <p className="text-[11px] sm:text-xs text-muted">Colors will be applied to your public website once you click <strong>Publish</strong>.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Placeholder for other tabs */}
            {!['General', 'Hero', 'Features', 'Pricing', 'Reviews', 'Social', 'Theme'].includes(activeTab) && (
                <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center shadow-sm">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="w-20 h-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
                            <RefreshCw size={32} className="opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{activeTab} Customization</h3>
                        <p className="text-muted leading-relaxed">This module is being fine-tuned for your branch. You'll be able to customize your website's {activeTab.toLowerCase()} section here very soon.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebsiteSettings;
