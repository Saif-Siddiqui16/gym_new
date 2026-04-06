import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Search, ShoppingCart, Package, User, Clock, ReceiptText, Filter, Plus, Minus,
    Trash2, X, Store, CreditCard, LayoutGrid, ChevronDown, CheckCircle, Sparkles
} from 'lucide-react';
import Loader from '../../../components/common/Loader';
import { getStoreProducts, getStoreStats, checkoutStoreOrder, validateCoupon } from '../../../api/storeApi';
import { getMembers } from '../../../api/staff/memberApi';
import { useBranchContext } from '../../../context/BranchContext';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import ReceiptModal from '../components/ReceiptModal';

const T = {
    accent: '#7C5CFC', accent2: '#9B7BFF', accentLight: '#F0ECFF', accentMid: '#E4DCFF',
    border: '#EAE7FF', bg: '#F6F5FF', surface: '#FFFFFF', text: '#1A1533',
    muted: '#7B7A8E', subtle: '#B0ADCC', error: '#FF4D4D', success: '#00C853',
    cardShadow: '0 10px 25px -5px rgba(124, 92, 252, 0.08), 0 8px 10px -6px rgba(124, 92, 252, 0.05)'
};

const S = {
    ff: "'Plus Jakarta Sans', sans-serif",
    card: { background: '#FFF', borderRadius: '24px', border: `1px solid ${T.border}`, boxShadow: T.cardShadow, transition: 'all 0.3s ease' },
    input: { height: '48px', padding: '0 16px', borderRadius: '14px', border: `2px solid ${T.border}`, fontSize: '14px', fontWeight: '600', color: T.text, outline: 'none', transition: 'all 0.2s ease', background: '#FFF' },
    btn: { height: '44px', padding: '0 20px', borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    badge: { padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }
};

const POS = () => {
    const { selectedBranch } = useBranchContext();
    const { user } = useAuth();
    const [todaySalesTotal, setTodaySalesTotal] = useState(0);
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);
    const [members, setMembers] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [categories] = useState(['All', 'Memberships', 'Supplements', 'Apparel', 'Accessories']);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [showGuestForm, setShowGuestForm] = useState(false);
    const [guestInfo, setGuestInfo] = useState({ name: '', phone: '', email: '' });
    const [selectedMember, setSelectedMember] = useState(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingProducts(true);
                setCart([]); setSelectedMember(null); setShowGuestForm(false); setGuestInfo({ name: '', phone: '', email: '' });
                const [productsData, statsData, membersData] = await Promise.all([
                    getStoreProducts({ branchId: selectedBranch }),
                    getStoreStats({ branchId: selectedBranch }),
                    getMembers({ branchId: selectedBranch })
                ]);
                setProducts(productsData.products || productsData);
                setTodaySalesTotal(statsData.stats?.todayPos || 0);
                setRecentTransactions(statsData.recentTransactions || []);
                setMembers(membersData);
            } catch (error) { toast.error("Failed to sync store inventory"); }
            finally { setLoadingProducts(false); }
        };
        loadData();
    }, [selectedBranch]);

    useEffect(() => {
        const fetchMemberCoupons = async () => {
            try {
                if (selectedMember) {
                    const { getAvailableCouponsForMember } = await import('../../../api/storeApi');
                    const couponsData = await getAvailableCouponsForMember(selectedMember.id);
                    setAvailableCoupons(couponsData.filter(c => c.applicableService === 'All' || c.applicableService === 'POS'));
                } else { setAvailableCoupons([]); }
            } catch (error) { console.error("Failed to fetch coupons", error); }
        };
        fetchMemberCoupons();
    }, [selectedMember]);

    const handleAddToCart = (product) => {
        if (product.stock <= 0) return toast.error("Out of stock");
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            if (existing.quantity >= product.stock) return toast.error("Max stock reached");
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else { setCart([...cart, { ...product, quantity: 1 }]); }
    };

    const handleUpdateQuantity = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                if (newQty <= 0) return null;
                if (newQty > item.stock) { toast.error("Max stock reached"); return item; }
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(Boolean));
    };

    const handleApplyCouponWithCode = async (code) => {
        try {
            setIsValidatingCoupon(true);
            const result = await validateCoupon(code, total);
            setAppliedCoupon(result.coupon); setCouponCode(result.coupon.code); toast.success("Coupon applied!");
        } catch (error) { toast.error(error); setAppliedCoupon(null); }
        finally { setIsValidatingCoupon(false); }
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return toast.error("Cart is empty");
        const payload = {
            tenantId: selectedBranch === 'all' ? null : selectedBranch,
            items: cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
            total: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
        };
        if (showGuestForm) {
            if (!guestInfo.name || !guestInfo.phone) return toast.error("Guest info required");
            payload.guestInfo = guestInfo;
        } else if (selectedMember) { payload.memberId = selectedMember.id; }
        else { return toast.error("Select customer or guest"); }

        if (!['Cash', 'Online Link'].includes(paymentMethod) && !referenceNumber) return toast.error("Reference number required");
        
        payload.paymentMode = paymentMethod;
        payload.referenceNumber = referenceNumber;
        if (appliedCoupon) payload.couponCode = appliedCoupon.code;

        try {
            setIsCheckingOut(true);
            const orderResult = await checkoutStoreOrder(payload);
            toast.success("Checkout successful!");
            setLastOrder(orderResult); setShowReceiptModal(true);
            setCart([]); setSelectedMember(null); setShowGuestForm(false); setReferenceNumber(''); setCouponCode(''); setAppliedCoupon(null);
            const [productsData, statsData] = await Promise.all([
                getStoreProducts({ branchId: selectedBranch }),
                getStoreStats({ branchId: selectedBranch })
            ]);
            setProducts(productsData.products || productsData);
            setTodaySalesTotal(statsData.stats?.todayPos || 0);
            setRecentTransactions(statsData.recentTransactions || []);
        } catch (error) { toast.error(error); }
        finally { setIsCheckingOut(false); }
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discountAmount = appliedCoupon ? (appliedCoupon.type === 'Percentage' ? (total * appliedCoupon.value / 100) : appliedCoupon.value) : 0;
    const grandTotal = Math.max(0, total - discountAmount);

    const filteredProducts = products.filter(p =>
        (selectedCategory === 'All' || p.category === selectedCategory) &&
        (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))
    );

    const filteredMembers = members.filter(m =>
        customerSearch && (m.name.toLowerCase().includes(customerSearch.toLowerCase()) || m.memberId?.toLowerCase().includes(customerSearch.toLowerCase()))
    ).slice(0, 5);

    return (
        <div style={{ background: T.bg, minHeight: '100vh', padding: '28px 28px 60px', fontFamily: S.ff }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: ${T.accentMid}; borderRadius: 10px; }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: T.accent, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(124, 92, 252, 0.2)' }}><Store size={32} /></div>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '900', color: T.text, margin: 0 }}>POS Terminal</h1>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: T.muted, marginTop: '4px' }}>Local inventory checkout system</p>
                    </div>
                </div>
                <div style={{ ...S.card, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px', background: T.accentLight, border: `1px solid ${T.accentMid}` }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '10px', fontWeight: '800', color: T.accent, textTransform: 'uppercase', margin: 0 }}>TODAY'S TOTAL</p>
                        <p style={{ fontSize: '20px', fontWeight: '900', color: T.text, margin: 0 }}>₹{todaySalesTotal.toLocaleString()}</p>
                    </div>
                    <div style={{ width: '1px', height: '32px', background: T.accentMid }}></div>
                    <ReceiptText size={24} color={T.accent} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '32px' }}>
                {/* Product Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={18} color={T.subtle} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input placeholder="Search products..." style={{ ...S.input, width: '100%', paddingLeft: '48px', height: '56px', borderRadius: '18px' }} value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select style={{ ...S.input, width: '200px', height: '56px', borderRadius: '18px' }} value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {loadingProducts ? (
                        <div style={{ padding: '80px 0' }}><Loader message="Syncing Inventory..." /></div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                            {filteredProducts.map(p => (
                                <div key={p.id} style={{ ...S.card, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', border: p.stock === 0 ? `1px solid ${T.border}` : `1px solid ${T.border}`, opacity: p.stock === 0 ? 0.7 : 1 }}>
                                    <div style={{ width: '100%', aspectRatio: '1/1', background: T.bg, borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                                        {p.image ? <img src={p.image} style={{ width: '100%', height: '100%', objectCover: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={48} color={T.subtle} strokeWidth={1} /></div>}
                                        {p.stock <= 5 && <div style={{ position: 'absolute', top: '8px', right: '8px', background: p.stock === 0 ? T.error : '#FF9800', color: '#FFF', fontSize: '9px', fontWeight: '900', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>{p.stock === 0 ? 'Out of Stock' : `Only ${p.stock} left`}</div>}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '10px', fontWeight: '800', color: T.accent, textTransform: 'uppercase', marginBottom: '4px' }}>{p.category}</p>
                                        <h4 style={{ fontSize: '15px', fontWeight: '800', color: T.text, margin: '0 0 12px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '40px' }}>{p.name}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '18px', fontWeight: '900', color: T.text }}>₹{Number(p.price).toLocaleString()}</span>
                                            <button onClick={() => handleAddToCart(p)} disabled={p.stock === 0} style={{ width: '40px', height: '40px', borderRadius: '12px', background: T.accentLight, color: T.accent, border: 'none', cursor: p.stock === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>{p.stock === 0 ? <X size={20} /> : <Plus size={20} />}</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart Pane */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ ...S.card, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '24px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} /></div>
                                <h3 style={{ fontSize: '16px', fontWeight: '900', color: T.text, margin: 0 }}>Customer Info</h3>
                            </div>
                            
                            {selectedMember ? (
                                <div style={{ padding: '16px', background: T.accentLight, borderRadius: '16px', border: `1px solid ${T.accentMid}`, position: 'relative' }}>
                                    <button onClick={() => setSelectedMember(null)} style={{ position: 'absolute', top: '12px', right: '12px', color: T.accent, border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={16} /></button>
                                    <p style={{ fontSize: '14px', fontWeight: '800', color: T.text, margin: 0 }}>{selectedMember.name}</p>
                                    <p style={{ fontSize: '12px', fontWeight: '600', color: T.accent, margin: '2px 0 0' }}>{selectedMember.memberId || 'ID#N/A'}</p>
                                </div>
                            ) : showGuestForm ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <input style={{ ...S.input, height: '44px' }} placeholder="Guest Name *" value={guestInfo.name} onChange={e => setGuestInfo({ ...guestInfo, name: e.target.value })} />
                                    <input style={{ ...S.input, height: '44px' }} placeholder="Phone Number *" value={guestInfo.phone} onChange={e => setGuestInfo({ ...guestInfo, phone: e.target.value })} />
                                    <button onClick={() => setShowGuestForm(false)} style={{ fontSize: '11px', fontWeight: '800', color: T.error, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', padding: '0 4px' }}>CANCEL GUEST MODE</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={16} color={T.subtle} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input style={{ ...S.input, height: '44px', paddingLeft: '36px' }} placeholder="Search member code..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} />
                                        {customerSearch && filteredMembers.length > 0 && (
                                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#FFF', border: `1px solid ${T.border}`, borderRadius: '12px', marginTop: '4px', zIndex: 10, boxShadow: '0 10px 20px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                                                {filteredMembers.map(m => <div key={m.id} onClick={() => { setSelectedMember(m); setCustomerSearch(''); }} style={{ padding: '12px', cursor: 'pointer', borderBottom: `1px solid ${T.bg}`, fontSize: '13px', fontWeight: '700', transition: 'background 0.2s' }}>{m.name} ({m.memberId})</div>)}
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => setShowGuestForm(true)} style={{ ...S.btn, background: T.bg, color: T.muted, height: '44px', border: `2px dashed ${T.border}` }}><Plus size={16} /> WALK-IN GUEST</button>
                                </div>
                            )}
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingCart size={20} /></div>
                                    <h3 style={{ fontSize: '16px', fontWeight: '900', color: T.text, margin: 0 }}>Cart</h3>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: '800', color: T.accent, background: T.accentLight, padding: '4px 10px', borderRadius: '8px' }}>{cart.length} ITEMS</span>
                            </div>

                            <div className="custom-scrollbar" style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '100px' }}>
                                {cart.length === 0 ? (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', opacity: 0.5 }}>
                                        <ShoppingCart size={32} color={T.subtle} style={{ marginBottom: '8px' }} />
                                        <p style={{ fontSize: '12px', fontWeight: '700', color: T.subtle }}>Empty Cart</p>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${T.bg}` }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: T.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {item.image ? <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} /> : <Package size={20} color={T.subtle} />}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: '13px', fontWeight: '800', color: T.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                                                <p style={{ fontSize: '11px', fontWeight: '700', color: T.accent, margin: '2px 0 0' }}>₹{item.price}</p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: T.bg, padding: '4px', borderRadius: '10px' }}>
                                                <button onClick={() => handleUpdateQuantity(item.id, -1)} style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: '#FFF', color: T.text, cursor: 'pointer' }}><Minus size={12} /></button>
                                                <span style={{ fontSize: '12px', fontWeight: '900', minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                                                <button onClick={() => handleUpdateQuantity(item.id, 1)} style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: '#FFF', color: T.text, cursor: 'pointer' }}><Plus size={12} /></button>
                                            </div>
                                            <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} style={{ border: 'none', background: 'transparent', color: T.error, cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div style={{ borderTop: `1px solid ${T.bg}`, paddingTop: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '20px' }}>
                                {['Cash', 'UPI', 'Card', 'QR', 'Link'].map(m => (
                                    <button key={m} onClick={() => setPaymentMethod(m === 'Link' ? 'Online Link' : m)} style={{ padding: '10px 0', borderRadius: '10px', fontSize: '10px', fontWeight: '800', border: 'none', background: paymentMethod === (m === 'Link' ? 'Online Link' : m) ? T.accent : T.bg, color: paymentMethod === (m === 'Link' ? 'Online Link' : m) ? '#FFF' : T.muted, cursor: 'pointer', transition: 'all 0.2s' }}>{m}</button>
                                ))}
                            </div>
                            
                            {!['Cash', 'Online Link'].includes(paymentMethod) && <input style={{ ...S.input, height: '44px', marginBottom: '20px', width: '100%', fontSize: '12px' }} placeholder="Reference / TXN ID *" value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)} />}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', color: T.muted }}><span>Subtotal</span><span>₹{total.toLocaleString()}</span></div>
                                {appliedCoupon && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700', color: T.success }}><span>Discount</span><span>- ₹{discountAmount.toLocaleString()}</span></div>}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '24px', fontWeight: '900', color: T.text, marginTop: '8px' }}><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
                            </div>

                            <button onClick={handleCheckout} disabled={cart.length === 0 || isCheckingOut || (!selectedMember && !showGuestForm)} style={{ ...S.btn, width: '100%', height: '56px', background: T.accent, color: '#FFF', fontSize: '14px', boxShadow: '0 10px 20px rgba(124, 92, 252, 0.2)' }}>{isCheckingOut ? 'PROCESSING...' : 'SECURE CHECKOUT'}</button>
                        </div>
                    </div>

                    <div style={{ ...S.card, padding: '24px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: T.accentLight, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={20} /></div>
                            <h3 style={{ fontSize: '16px', fontWeight: '900', color: T.text, margin: 0 }}>Recent Activity</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {recentTransactions.slice(0, 5).map((txn, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: T.bg, borderRadius: '12px' }}>
                                    <div>
                                        <p style={{ fontSize: '13px', fontWeight: '800', color: T.text, margin: 0 }}>Order #{txn.id}</p>
                                        <p style={{ fontSize: '10px', fontWeight: '600', color: T.subtle, margin: '2px 0 0', textTransform: 'uppercase' }}>{txn.status} • {new Date(txn.date).toLocaleDateString()}</p>
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: '900', color: T.text }}>₹{Number(txn.amount).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <ReceiptModal isOpen={showReceiptModal} onClose={() => setShowReceiptModal(false)} order={lastOrder} />
        </div>
    );
};

export default POS;
