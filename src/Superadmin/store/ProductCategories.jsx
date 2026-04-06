import React, { useState, useEffect } from 'react';
import { Search, Layers, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import CategoryDrawer from './CategoryDrawer';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api/storeApi';
import toast from 'react-hot-toast';
import { useBranchContext } from '../../context/BranchContext';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const T = {
    accent: '#7C5CFC',        // primary purple
    accent2: '#9B7BFF',       // lighter purple
    accentLight: '#F0ECFF',   // purple tint bg
    accentMid: '#E4DCFF',     // purple border/focus
    border: '#EAE7FF',        // default borders
    bg: '#F6F5FF',            // page background
    surface: '#FFFFFF',       // card/input surface
    text: '#1A1533',          // primary text
    muted: '#7B7A8E',         // secondary text
    subtle: '#B0ADCC',        // placeholder/disabled
    rose: '#FF4D4D',          // danger
    roseLight: '#FFF0F0',     // danger tint
    emerald: '#00C853',       // success
    emeraldLight: '#E8FBF2',  // success tint
    cardShadow: '0 10px 25px -5px rgba(124, 92, 252, 0.08), 0 8px 10px -6px rgba(124, 92, 252, 0.05)',
    ff: "'Plus Jakarta Sans', sans-serif"
};

const HeaderBanner = ({ title, subTitle, icon: Icon }) => (
    <div style={{
        background: `linear-gradient(135deg, ${T.accent} 0%, ${T.accent2} 100%)`,
        borderRadius: '24px',
        padding: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '32px',
        boxShadow: '0 20px 40px -15px rgba(124, 92, 252, 0.3)',
        position: 'relative',
        overflow: 'hidden'
    }}>
        <div style={{
            position: 'absolute', top: '-10%', right: '-5%', width: '200px', height: '200px',
            background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)'
        }} />
        <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            padding: '16px',
            color: '#FFFFFF'
        }}>
            <Icon size={28} strokeWidth={2.5} />
        </div>
        <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>{title}</h1>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600', margin: '4px 0 0' }}>{subTitle}</p>
        </div>
    </div>
);

const ProductCategories = () => {
    const { selectedBranch, branches } = useBranchContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState('add');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, loading: false });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const branchParam = selectedBranch === 'all' ? 'all' : selectedBranch;
            const data = await getCategories({ search: searchTerm, branchId: branchParam });
            setCategories(data);
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            fetchCategories();
        }, 500);
        return () => clearTimeout(delaySearch);
    }, [searchTerm, selectedBranch]);

    const handleEdit = (category) => {
        setSelectedCategory(category);
        setDrawerMode('edit');
        setIsDrawerOpen(true);
    };

    const handleAdd = () => {
        setSelectedCategory(null);
        setDrawerMode('add');
        setIsDrawerOpen(true);
    };

    const handleDelete = (id) => {
        setConfirmModal({ isOpen: true, id, loading: false });
    };

    const processDelete = async () => {
        try {
            setConfirmModal(prev => ({ ...prev, loading: true }));
            await deleteCategory(confirmModal.id);
            toast.success('Category deleted successfully');
            setConfirmModal({ isOpen: false, id: null, loading: false });
            fetchCategories();
        } catch (error) {
            toast.error(error);
            setConfirmModal(prev => ({ ...prev, loading: false }));
        }
    };

    const handleDrawerSubmit = async (formData) => {
        try {
            const targetBranch = formData.branchId || selectedBranch;
            const branchLabel = targetBranch === 'all'
                ? 'all branches'
                : (branches.find(b => b.id.toString() === targetBranch.toString())?.name || 'branch');

            toast.dismiss();
            if (drawerMode === 'add') {
                await createCategory({ ...formData, branchId: targetBranch });
                toast.success(`Category added successfully for ${branchLabel}`);
            } else {
                await updateCategory(selectedCategory.id, formData);
                toast.success('Category updated successfully');
            }
            fetchCategories();
        } catch (error) {
            toast.error(error);
        }
    };

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px', fontFamily: T.ff }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ borderLeft: `4px solid ${T.accent}`, paddingLeft: '12px' }}>
                        <h1 style={{ fontSize: '14px', fontWeight: '900', color: T.text, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Categories</h1>
                    </div>
                </div>
                <button
                    onClick={handleAdd}
                    style={{
                        padding: '12px 24px',
                        background: T.accent,
                        color: '#FFFFFF',
                        borderRadius: '16px',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: '800',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 10px 20px -5px rgba(124, 92, 252, 0.2)',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Plus size={18} /> ADD CATEGORY
                </button>
            </div>

            <HeaderBanner 
                title="Product Categories" 
                subTitle="Manage and organize your gym's products and services" 
                icon={Layers} 
            />

            {/* Filters */}
            <div style={{ 
                background: T.surface, 
                borderRadius: '24px', 
                padding: '20px', 
                marginBottom: '32px', 
                boxShadow: T.cardShadow,
                border: `1px solid ${T.border}`
            }}>
                <div style={{ position: 'relative', maxWidth: '400px' }}>
                    <Search size={18} color={T.subtle} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '14px 16px 14px 48px',
                            background: T.bg,
                            border: `2px solid transparent`,
                            borderRadius: '16px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: T.text,
                            outline: 'none',
                            transition: 'all 0.3s'
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = T.accentMid}
                        onBlur={e => e.currentTarget.style.borderColor = 'transparent'}
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
                    <div className="animate-spin" style={{ width: '40px', height: '40px', border: `4px solid ${T.accentLight}`, borderTopColor: T.accent, borderRadius: '50%', marginBottom: '16px' }}></div>
                    <p style={{ fontSize: '11px', fontWeight: '800', color: T.muted, textTransform: 'uppercase', letterSpacing: '1px' }}>Loading categories...</p>
                </div>
            ) : categories.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {categories.map(cat => (
                        <div key={cat.id} style={{ 
                            background: T.surface, 
                            borderRadius: '32px', 
                            overflow: 'hidden', 
                            boxShadow: T.cardShadow, 
                            border: `1px solid ${T.border}`,
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ height: '180px', position: 'relative', background: T.bg }}>
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '100%', objectCover: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle }}>
                                        <Layers size={48} strokeWidth={1} />
                                    </div>
                                )}
                                <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                                    <span style={{ 
                                        padding: '6px 12px', 
                                        borderRadius: '10px', 
                                        fontSize: '10px', 
                                        fontWeight: '900', 
                                        textTransform: 'uppercase', 
                                        color: '#FFFFFF',
                                        background: cat.status === 'Active' ? T.emerald : T.rose
                                    }}>
                                        {cat.status}
                                    </span>
                                </div>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: T.accent }} />
                                    <span style={{ fontSize: '10px', fontWeight: '800', color: T.subtle, textTransform: 'uppercase' }}>{cat.tenant?.name || 'Main Branch'}</span>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '900', color: T.text, margin: '0 0 8px', truncate: true }}>{cat.name}</h3>
                                <p style={{ fontSize: '13px', color: T.muted, fontWeight: '500', lineHeight: '1.6', height: '40px', overflow: 'hidden' }}>{cat.description || 'No description available for this category.'}</p>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '24px', paddingTop: '20px', borderTop: `1px solid ${T.bg}` }}>
                                    <button
                                        onClick={() => handleEdit(cat)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            background: T.accentLight,
                                            color: T.accent,
                                            border: 'none',
                                            borderRadius: '14px',
                                            fontSize: '11px',
                                            fontWeight: '900',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Edit2 size={14} /> EDIT
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        style={{
                                            width: '44px',
                                            height: '44px',
                                            background: T.roseLight,
                                            color: T.rose,
                                            border: 'none',
                                            borderRadius: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ 
                    background: T.surface, 
                    borderRadius: '40px', 
                    padding: '80px 40px', 
                    textAlign: 'center', 
                    border: `2px dashed ${T.accentMid}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <div style={{ width: '80px', height: '80px', background: T.accentLight, borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, marginBottom: '24px' }}>
                        <Layers size={40} />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: T.text, margin: '0 0 8px' }}>No categories found</h3>
                    <p style={{ fontSize: '14px', color: T.muted, fontWeight: '600', maxWidth: '300px', margin: '0 auto 32px' }}>Start organizing your products by creating your very first category.</p>
                    <button
                        onClick={handleAdd}
                        style={{
                            padding: '16px 32px',
                            background: T.accent,
                            color: '#FFFFFF',
                            borderRadius: '18px',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '900',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            boxShadow: '0 15px 30px -10px rgba(124, 92, 252, 0.4)'
                        }}
                    >
                        <Plus size={20} /> CREATE NEW CATEGORY
                    </button>
                </div>
            )}

            <CategoryDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                category={selectedCategory}
                mode={drawerMode}
                onSubmit={handleDrawerSubmit}
            />
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, id: null, loading: false })}
                onConfirm={processDelete}
                title="Delete Category?"
                message="All products in this category may be affected. This cannot be undone."
                confirmText="Delete"
                type="danger"
                loading={confirmModal.loading}
            />
        </div>
    );
};

export default ProductCategories;
