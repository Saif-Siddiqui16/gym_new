import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, ShoppingCart, Package, Trash2, ChevronRight, RefreshCw, Sparkles, X, Plus, Minus, Tag, ShieldCheck, Zap } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import ProductCard from './ProductCard';
import StorePaymentModal from './StorePaymentModal';
import { getStoreProducts, checkoutStoreOrder, validateCoupon, getAvailableCoupons } from '../../api/storeApi';
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

/* ─────────────────────────────────────────────────────────────────────────────
   DESIGN TOKENS (Roar Fitness Premium)
   ───────────────────────────────────────────────────────────────────────── */
const T = {
  accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
  border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
  muted: '#7B7A8E', subtle: '#B0ADCC', green: '#22C97A', greenLight: '#E8FBF2',
  amber: '#F59E0B', amberLight: '#FEF3C7', rose: '#F43F5E', roseLight: '#FFF1F4',
  blue: '#3B82F6', blueLight: '#EFF6FF', dark: '#0D0A1F'
};

const SectionHeader = ({ icon: Icon, title, subtitle, color = T.accent }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} strokeWidth={2.5} />
        </div>
        <div>
            <h3 style={{ fontSize: 13, fontWeight: 900, color: T.text, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: 9, fontWeight: 800, color: T.muted, textTransform: 'uppercase', margin: 0 }}>{subtitle}</p>}
        </div>
    </div>
);

const PremiumCard = ({ children, style = {}, index = 0 }) => (
    <div 
        style={{
            background: T.surface, borderRadius: 28, border: `1px solid ${T.border}`,
            padding: 24, boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
            animation: `fadeUp 0.4s ease both ${0.1 + index * 0.05}s`,
            ...style
        }}
    >
        {children}
    </div>
);

const StorePage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const branchId = userData.tenantId;

    useEffect(() => { fetchProducts(); }, [selectedCategory, searchTerm, branchId]);
    useEffect(() => { fetchCoupons(); }, [branchId]);

    const fetchCoupons = async () => {
        try {
            const data = await getAvailableCoupons();
            setAvailableCoupons(data.filter(c => c.applicableService === 'All' || c.applicableService === 'POS'));
        } catch (error) { console.error("Failed to fetch coupons:", error); }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getStoreProducts({ 
                category: selectedCategory, 
                search: searchTerm,
                branchId: branchId 
            });
            setProducts(data);
        } catch (error) { console.error("Failed to fetch products:", error); }
        finally { setLoading(false); }
    };

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => { setCart(prev => prev.filter(item => item.id !== id)); };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
            return item;
        }));
    };

    const viewProductDetails = (product) => { setSelectedProduct(product); setIsProductDrawerOpen(true); };

    const handleApplyCoupon = async () => { if (couponCode) await handleApplyCouponWithCode(couponCode); };

    const handleApplyCouponWithCode = async (codeToApply) => {
        try {
            setIsValidatingCoupon(true);
            const result = await validateCoupon(codeToApply, cartTotal);
            setAppliedCoupon(result.coupon);
            setCouponCode(result.coupon.code);
            toast.success("Coupon applied!");
        } catch (error) { toast.error(error); setAppliedCoupon(null); }
        finally { setIsValidatingCoupon(false); }
    };

    const handleCheckout = () => { if (cart.length > 0) setIsPaymentModalOpen(true); };

    const confirmCheckout = async ({ paymentMethod, referenceNumber }) => {
        try {
            setIsPaymentModalOpen(false);
            toast.loading("Processing Order...", { id: 'checkout' });
            const payload = {
                items: cart.map(c => ({ productId: c.id, quantity: c.quantity, price: c.price })),
                total: finalTotal, paymentMethod, referenceNumber
            };
            if (appliedCoupon) payload.couponCode = appliedCoupon.code;
            await checkoutStoreOrder(payload);
            toast.success("Purchase Successful!", { id: 'checkout' });
            setCart([]); setAppliedCoupon(null); setCouponCode('');
        } catch (error) { toast.error(error.message || error || "Failed", { id: 'checkout' }); }
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = appliedCoupon ? (appliedCoupon.type === 'Percentage' ? (cartTotal * appliedCoupon.value / 100) : appliedCoupon.value) : 0;
    const finalTotal = Math.max(0, cartTotal - discountAmount);

    if (loading && products.length === 0) return <Loader message="Stocking the premium store shelves..." />;

    return (
        <div className="dashboard-container" style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
                @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeUp 0.6s ease forwards; }
                
                .store-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 400px; 
                    gap: 32px; 
                    align-items: start; 
                }
                
                .product-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
                    gap: 28px; 
                }

                @media (max-width: 1400px) {
                    .store-grid { grid-template-columns: 1fr 360px; gap: 24px; }
                }

                @media (max-width: 1200px) {
                    .store-grid { grid-template-columns: 1fr; }
                    .cart-column { order: 2; }
                    .dashboard-container { padding: 20px 16px 40px !important; }
                }

                @media (max-width: 640px) {
                    .header-banner { flex-direction: column; align-items: flex-start !important; gap: 20px; padding: 20px !important; }
                    .search-container { width: 100% !important; }
                    .product-grid { grid-template-columns: 1fr; gap: 20px; }
                }
            `}</style>

            {/* HEADER BANNER */}
            <div style={{
                background: 'linear-gradient(135deg, #7C5CFC 0%, #9B7BFF 55%, #C084FC 100%)',
                borderRadius: 24, padding: '24px 32px',
                boxShadow: '0 12px 40px rgba(124,92,252,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 32, position: 'relative', overflow: 'hidden'
            }} className="animate-fadeIn header-banner">
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, position: 'relative', zIndex: 2 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <ShoppingBag size={28} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.8px' }}>Store Page</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.92)', margin: 0, fontWeight: 600 }}>Browse high-performance gear and nutrition</p>
                    </div>
                </div>
                <div className="search-container" style={{ position: 'relative', width: 340, zIndex: 2 }}>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white opacity-60" size={18} />
                    <input 
                        type="text" placeholder="Search premium gear..." 
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: '100%', height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.1)', padding: '0 16px 0 48px', fontSize: 13, fontWeight: 700, color: '#fff', outline: 'none' }}
                    />
                </div>
            </div>

            <div className="store-grid">
                
                {/* PRODUCTS COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <SectionHeader icon={Sparkles} title="Featured Collection" subtitle="Curated for enthusiasts" />
                    
                    {products.length > 0 ? (
                        <div className="product-grid">
                            {products.map((p, idx) => (
                                <ProductCard key={p.id} product={p} onAddToCart={addToCart} onViewDetails={viewProductDetails} index={idx} />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 100, background: T.surface, borderRadius: 32, border: `2px dashed ${T.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                             <Package size={64} style={{ opacity: 0.1, marginBottom: 20 }} />
                             <h4 style={{ fontSize: 18, fontWeight: 900, color: T.text }}>No products found</h4>
                             <p style={{ fontSize: 13, fontWeight: 700, color: T.muted }}>Adjust your search to explore the collection.</p>
                        </div>
                    )}
                </div>

                {/* CART COLUMN */}
                <div className="cart-column" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <PremiumCard style={{ position: 'sticky', top: 28, height: 'fit-content' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${T.bg}` }}>
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: T.dark, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingCart size={22} /></div>
                            <h3 style={{ fontSize: 20, fontWeight: 900, color: T.text, margin: 0 }}>Gear Bag</h3>
                        </div>

                        {cart.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
                                    {cart.map(item => (
                                        <div key={item.id} style={{ display: 'flex', gap: 16, padding: 16, borderRadius: 20, background: T.bg, border: `1px solid ${T.border}`, position: 'relative' }}>
                                            <div style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.border}`, background: '#fff' }}>
                                                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: 13, fontWeight: 900, color: T.text, margin: '0 0 4px', textTransform: 'uppercase' }}>{item.name}</h4>
                                                <p style={{ fontSize: 14, fontWeight: 900, color: T.accent, margin: '0 0 10px' }}>₹{item.price.toLocaleString()}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', width: 'fit-content', padding: '4px 12px', borderRadius: 10, border: `1px solid ${T.border}` }}>
                                                     <button onClick={() => updateQuantity(item.id, -1)} style={{ border: 'none', background: 'none', color: T.subtle, cursor: 'pointer', fontWeight: 900 }}><Minus size={14} /></button>
                                                     <span style={{ fontSize: 12, fontWeight: 900, color: T.text }}>{item.quantity}</span>
                                                     <button onClick={() => updateQuantity(item.id, 1)} style={{ border: 'none', background: 'none', color: T.subtle, cursor: 'pointer', fontWeight: 900 }}><Plus size={14} /></button>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} style={{ position: 'absolute', top: 12, right: 12, border: 'none', background: 'none', color: T.subtle, cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ paddingTop: 24, borderTop: `1px solid ${T.bg}`, display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <p style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rewards & Coupons</p>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <div style={{ flex: 1, position: 'relative' }}>
                                                <input 
                                                    type="text" placeholder="Promo code..." value={couponCode} 
                                                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                                    disabled={appliedCoupon || isValidatingCoupon}
                                                    style={{ width: '100%', height: 44, borderRadius: 12, border: `1px solid ${T.border}`, padding: '0 12px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', outline: 'none' }}
                                                />
                                                {appliedCoupon && <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: T.rose, cursor: 'pointer' }}><X size={16} /></button>}
                                            </div>
                                            {!appliedCoupon && <button onClick={handleApplyCoupon} disabled={!couponCode || isValidatingCoupon} style={{ width: 80, height: 44, borderRadius: 12, background: T.dark, color: '#fff', border: 'none', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>Apply</button>}
                                        </div>
                                        {availableCoupons.length > 0 && !appliedCoupon && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                                                {availableCoupons.map(c => <button key={c.id} onClick={() => handleApplyCouponWithCode(c.code)} style={{ padding: '6px 12px', borderRadius: 8, background: T.accentLight, color: T.accent, border: `1px solid ${T.accentMid}`, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer' }}>{c.code}</button>)}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 0', borderTop: `2px solid ${T.bg}` }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: 11, fontWeight: 900, color: T.muted, textTransform: 'uppercase' }}>Subtotal</span>
                                            <span style={{ fontSize: 14, fontWeight: 900, color: T.text }}>₹{cartTotal.toLocaleString()}</span>
                                        </div>
                                        {appliedCoupon && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: T.green }}>
                                                <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>Savings</span>
                                                <span style={{ fontSize: 14, fontWeight: 900 }}>-₹{discountAmount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                            <span style={{ fontSize: 12, fontWeight: 900, color: T.text, textTransform: 'uppercase' }}>Grand Total</span>
                                            <span style={{ fontSize: 28, fontWeight: 900, color: T.text, letterSpacing: '-1px' }}>₹{finalTotal.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <button onClick={handleCheckout} style={{ width: '100%', height: 64, borderRadius: 20, background: T.accent, color: '#fff', border: 'none', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 12px 32px rgba(124,92,252,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>Check Out <ChevronRight size={20} /></button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '48px 24px', border: `2px dashed ${T.border}`, borderRadius: 24, background: T.bg }}>
                                <div style={{ width: 64, height: 64, borderRadius: 22, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.subtle, margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}><ShoppingBag size={32} /></div>
                                <h4 style={{ fontSize: 14, fontWeight: 900, color: T.text, margin: '0 0 8px' }}>Your Bag is Empty</h4>
                                <p style={{ fontSize: 11, fontWeight: 700, color: T.subtle, margin: 0 }}>Add premium performance gear to start training with style.</p>
                            </div>
                        )}
                    </PremiumCard>

                    <div style={{ padding: 24, borderRadius: 24, background: T.greenLight, border: `1px solid ${T.green}20`, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <ShieldCheck size={28} color={T.green} />
                        <div>
                             <p style={{ fontSize: 11, fontWeight: 900, color: T.green, textTransform: 'uppercase', margin: 0 }}>Secure Transaction</p>
                             <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, margin: 0 }}>End-to-end encrypted billing</p>
                        </div>
                    </div>
                </div>

            </div>

             {/* DETAILS DRAWER */}
            <RightDrawer isOpen={isProductDrawerOpen} onClose={() => setIsProductDrawerOpen(false)} title="Gear Specifications" subtitle={selectedProduct?.name}>
                {selectedProduct && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: 4 }}>
                         <div style={{ aspectRatio: '1', borderRadius: 24, overflow: 'hidden', border: `1px solid ${T.border}`, background: '#fff' }}>
                            <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <h3 style={{ fontSize: 24, fontWeight: 900, color: T.text, margin: 0 }}>{selectedProduct.name}</h3>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <span style={{ padding: '6px 12px', borderRadius: 8, background: T.accentLight, color: T.accent, fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }}>Premium Performance</span>
                                <span style={{ padding: '6px 12px', borderRadius: 8, background: T.greenLight, color: T.green, fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }}>In Stock</span>
                            </div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: T.muted, lineHeight: 1.6, marginTop: 8 }}>{selectedProduct.description || "Unleash your potential with our elite gear. Designed for durability, breathability, and peak performance during your most demanding sessions."}</p>
                        </div>
                        <div style={{ paddingTop: 32, borderTop: `1px solid ${T.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 900, color: T.subtle, textTransform: 'uppercase', marginBottom: 4 }}>Unit Price</p>
                                <p style={{ fontSize: 26, fontWeight: 900, color: T.accent, margin: 0 }}>₹{selectedProduct.price.toLocaleString()}</p>
                            </div>
                            <button 
                                onClick={() => { addToCart(selectedProduct); setIsProductDrawerOpen(false); toast.success("Added to Bag"); }}
                                style={{ padding: '0 32px', height: 56, background: T.accent, color: '#fff', borderRadius: 16, border: 'none', fontSize: 12, fontWeight: 900, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '0 8px 16px rgba(124,92,252,0.1)' }}
                            >Add to Cart</button>
                        </div>
                    </div>
                )}
            </RightDrawer>

            <StorePaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} onConfirm={confirmCheckout} totalAmount={finalTotal} />
        </div>
    );
};

export default StorePage;
