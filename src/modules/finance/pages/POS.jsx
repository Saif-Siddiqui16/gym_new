import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Package, User, Clock, ReceiptText, Filter, Plus, Minus, Trash2, X, Store, CreditCard, LayoutGrid } from 'lucide-react';
import { getStoreProducts, getStoreStats, checkoutStoreOrder } from '../../../api/storeApi';
import { getMembers } from '../../../api/staff/memberApi';
import { useBranchContext } from '../../../context/BranchContext';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import ReceiptModal from '../components/ReceiptModal';

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

    // Guest form state
    const [guestInfo, setGuestInfo] = useState({ name: '', phone: '', email: '' });
    // Selected member state
    const [selectedMember, setSelectedMember] = useState(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [referenceNumber, setReferenceNumber] = useState('');
    
    // Receipt Modal State
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [lastOrder, setLastOrder] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                console.log("[POS] Loading for branch:", selectedBranch);
                setLoadingProducts(true);
                // Clear cart and checkout state on branch switch
                setCart([]);
                setSelectedMember(null);
                setShowGuestForm(false);
                setGuestInfo({ name: '', phone: '', email: '' });

                try {
                    const productsData = await getStoreProducts({ branchId: selectedBranch });
                    console.log("[POS] Products loaded:", productsData?.length);
                    setProducts(productsData.products || productsData);
                } catch (e) {
                    console.error("[POS] Error loading products:", e);
                }

                try {
                    const statsData = await getStoreStats({ branchId: selectedBranch });
                    console.log("[POS] Stats loaded:", statsData);
                    setTodaySalesTotal(statsData.stats?.todayPos || 0);
                    setRecentTransactions(statsData.recentTransactions || []);
                } catch (e) {
                    console.error("[POS] Error loading stats:", e);
                }

                try {
                    const membersData = await getMembers({ branchId: selectedBranch });
                    console.log("[POS] Members loaded:", membersData?.length);
                    setMembers(membersData);
                } catch (e) {
                    console.error("[POS] Error loading members:", e);
                }
            } catch (error) {
                console.error("General POS load error:", error);
                toast.error("Failed to load some store data");
            } finally {
                setLoadingProducts(false);
            }
        };
        loadData();
    }, [selectedBranch]);

    const handleAddToCart = (product) => {
        if (product.stock <= 0) {
            toast.error("Product is out of stock");
            return;
        }
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            if (existing.quantity >= product.stock) {
                toast.error("Cannot add more than available stock");
                return;
            }
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const handleUpdateQuantity = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQuantity = item.quantity + delta;
                if (newQuantity <= 0) return null;
                if (newQuantity > item.stock) {
                    toast.error("Cannot exceed available stock");
                    return item;
                }
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(Boolean));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return toast.error("Cart is empty");

        const payload = {
            tenantId: selectedBranch === 'all' ? null : selectedBranch,
            items: cart.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
            total: cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
        };

        if (showGuestForm) {
            if (!guestInfo.name || !guestInfo.phone) return toast.error("Guest name and phone are required");
            payload.guestInfo = guestInfo;
        } else if (selectedMember) {
            payload.memberId = selectedMember.id;
        } else {
            return toast.error("Please select a member or enter guest details");
        }

        if (paymentMethod !== 'Cash' && !referenceNumber && paymentMethod !== 'Online Link') {
            return toast.error("Please enter a reference/transaction number");
        }

        payload.paymentMode = paymentMethod;
        payload.referenceNumber = referenceNumber;

        if (paymentMethod === 'Online Link') {
            toast.promise(
                new Promise(resolve => setTimeout(resolve, 2000)),
                {
                    loading: 'Sending payment link to customer...',
                    success: 'SMS Payment Link sent!',
                    error: 'Failed to send link',
                }
            );
            // In a real scenario, we might wait for webhook. For simulation, we continue to save as POS order.
        }

        try {
            setIsCheckingOut(true);
            const orderResult = await checkoutStoreOrder(payload);
            toast.success("Checkout successful!");
            
            // Set data for receipt modal
            setLastOrder(orderResult);
            setShowReceiptModal(true);

            setCart([]);
            setSelectedMember(null);
            setShowGuestForm(false);
            setGuestInfo({ name: '', phone: '', email: '' });
            setReferenceNumber('');
            // Refresh stats and products to update stock
            const [productsData, statsData] = await Promise.all([
                getStoreProducts({ branchId: selectedBranch }),
                getStoreStats({ branchId: selectedBranch })
            ]);
            setProducts(productsData.products || productsData);
            setTodaySalesTotal(statsData.stats?.todayPos || 0);
            setRecentTransactions(statsData.recentTransactions || []);
        } catch (error) {
            toast.error(error);
        } finally {
            setIsCheckingOut(false);
        }
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const filteredProducts = products.filter(p =>
        (selectedCategory === 'All' || p.category === selectedCategory) &&
        (search === '' || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))
    );
    const filteredMembers = members.filter(m =>
        customerSearch && (m.name.toLowerCase().includes(customerSearch.toLowerCase()) || m.memberId?.toLowerCase().includes(customerSearch.toLowerCase()))
    );

    return (
        <div className="saas-page pb-page animate-fadeIn space-y-12">

            {/* Premium Header Section */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-fuchsia-500 rounded-3xl blur-2xl opacity-10 pointer-events-none"></div>
                <div className="relative bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white shadow-lg shadow-violet-200 ring-4 ring-white">
                                <Store size={32} />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Point of Sale</h1>
                                <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mt-1">
                                    Manage local sales and inventory terminal
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
                            <div className="px-6 py-3 bg-white rounded-xl shadow-sm border border-slate-100">
                                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Today's Sales</p>
                                <p className="text-2xl font-black text-slate-900 leading-none">₹{todaySalesTotal}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Side: Product Terminal */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Search and Filters with premium styling */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-all pointer-events-none" size={22} />
                            <input
                                type="text"
                                placeholder="Search products by name or SKU..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full h-16 pl-14 pr-4 rounded-2xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-semibold transition-all outline-none bg-white font-sans placeholder:text-slate-300"
                            />
                        </div>
                        <div className="relative min-w-[200px]">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full h-16 px-6 appearance-none rounded-2xl border-2 border-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-bold transition-all outline-none bg-white cursor-pointer pr-14 font-sans text-slate-700"
                            >
                                {categories.map(cat => <option key={cat}>{cat}</option>)}
                            </select>
                            <Filter className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                        </div>
                    </div>

                    {loadingProducts ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-50">
                            <div className="w-12 h-12 border-4 border-violet-200 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Inventory...</p>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-violet-200 transition-all flex flex-col group relative overflow-hidden">
                                    {/* Low Stock Badge */}
                                    {product.stock <= 5 && product.stock > 0 && (
                                        <div className="absolute top-4 right-4 bg-orange-100 text-orange-600 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">
                                            Low Stock: {product.stock}
                                        </div>
                                    )}
                                    {product.stock === 0 && (
                                        <div className="absolute top-4 right-4 bg-red-100 text-red-600 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">
                                            Out of Stock
                                        </div>
                                    )}

                                    <div className="w-full aspect-square bg-slate-50 rounded-2xl mb-4 flex items-center justify-center relative group-hover:bg-primary-light transition-colors">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            <Package className="text-slate-300 group-hover:text-violet-300 transition-colors" size={48} strokeWidth={1.5} />
                                        )}
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        {product.category && <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{product.category}</span>}
                                        <h4 className="text-sm font-bold text-slate-800 leading-tight mb-2 line-clamp-2">{product.name}</h4>
                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="text-lg font-black text-slate-900">₹{product.price}</span>
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                disabled={product.stock === 0}
                                                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-violet-200 transition-all disabled:opacity-50 disabled:hover:bg-slate-100 disabled:hover:text-slate-600"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/60 backdrop-blur-sm rounded-[3rem] shadow-sm border border-slate-100 p-10 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden w-full">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-purple-500 opacity-20"></div>
                            <div className="flex flex-col items-center gap-8 animate-pulse text-center max-w-sm">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-violet-100 rounded-[2.5rem] blur-xl opacity-50"></div>
                                    <div className="relative w-28 h-28 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl flex items-center justify-center text-slate-200">
                                        <Package size={56} strokeWidth={1.5} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">No products found</h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-3 leading-relaxed">
                                        Your store inventory is currently empty or no products match your search.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Checkout Console */}
                <div className="lg:col-span-4 flex flex-col gap-8">

                    {/* Customer Picker with Staff Dashboard aesthetic */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-violet-200">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 tracking-tight uppercase tracking-tight">Customer</h3>
                                <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-0.5">Sale Assignment</p>
                            </div>
                        </div>

                        {showGuestForm ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Guest Info</p>
                                    <input
                                        type="text"
                                        placeholder="Enter guest name *"
                                        value={guestInfo.name}
                                        onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                                        className="w-full h-12 px-5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 text-sm font-semibold bg-slate-50/30 outline-none transition-all font-sans placeholder:text-slate-300"
                                    />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="Phone number *"
                                    value={guestInfo.phone}
                                    onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                                    className="w-full h-12 px-5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 text-sm font-semibold bg-slate-50/30 outline-none transition-all font-sans placeholder:text-slate-300"
                                />
                                <input
                                    type="email"
                                    placeholder="Email address (optional)"
                                    value={guestInfo.email}
                                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                                    className="w-full h-12 px-5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 text-sm font-semibold bg-slate-50/30 outline-none transition-all font-sans placeholder:text-slate-300"
                                />
                                <button
                                    onClick={() => setShowGuestForm(false)}
                                    className="w-full h-11 flex items-center justify-center bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-100 hover:bg-slate-100 hover:text-slate-900 transition-all"
                                >
                                    Cancel Selection
                                </button>
                            </div>
                        ) : selectedMember ? (
                            <div className="bg-primary-light/50 rounded-2xl p-5 border border-violet-100 animate-in fade-in slide-in-from-top-2 relative">
                                <button onClick={() => setSelectedMember(null)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors">
                                    <X size={16} />
                                </button>
                                <p className="text-sm font-black text-slate-900 mb-1">{selectedMember.name}</p>
                                <p className="text-xs font-bold text-slate-500 mb-2">{selectedMember.memberId || 'Walk-in'}</p>
                                {selectedMember.phone && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedMember.phone}</p>}
                                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest">
                                    Active Member
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search members by code..."
                                        value={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 text-sm font-semibold bg-slate-50/30 outline-none transition-all font-sans"
                                    />
                                    {customerSearch && filteredMembers.length > 0 && (
                                        <div className="absolute top-14 left-0 w-full bg-white border border-slate-100 rounded-xl shadow-xl max-h-48  z-10">
                                            {filteredMembers.map(m => (
                                                <div
                                                    key={m.id}
                                                    onClick={() => { setSelectedMember(m); setCustomerSearch(''); }}
                                                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                                                >
                                                    <p className="text-sm font-bold text-slate-800">{m.name}</p>
                                                    <p className="text-xs text-slate-500">{m.memberId}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => setShowGuestForm(true)}
                                    className="w-full h-14 flex items-center justify-center gap-3 bg-white text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-violet-200 transition-all border-2 border-dashed border-slate-100 group"
                                >
                                    <Plus size={16} className="text-slate-300 group-hover:text-primary" /> Walk-in Guest
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Cart Control with Premium Branding */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col min-h-[500px] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center border border-violet-100">
                                    <ShoppingCart size={24} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Cart Console</h3>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">{cart.length} Items Selected</p>
                                </div>
                            </div>
                            {cart.length > 0 && (
                                <button onClick={() => setCart([])} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50">
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="flex-1 flex flex-col gap-4  max-h-[350px] pr-2 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center opacity-30 py-10 scale-90">
                                    <div className="w-20 h-20 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200 mb-6 shadow-inner">
                                        <ShoppingCart size={40} strokeWidth={1} />
                                    </div>
                                    <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.25em]">Cart is currently empty</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="bg-slate-50 rounded-2xl p-4 flex gap-4 items-center border border-slate-100">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
                                            {item.image ? <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg" /> : <Package size={20} className="text-slate-300" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">{item.name}</h4>
                                            <p className="text-[10px] font-black text-primary">₹{item.price}</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-1 shadow-sm shrink-0">
                                            <button onClick={() => handleUpdateQuantity(item.id, -1)} className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                                <Minus size={12} />
                                            </button>
                                            <span className="text-xs font-black min-w-[20px] text-center text-slate-800">{item.quantity}</span>
                                            <button onClick={() => handleUpdateQuantity(item.id, 1)} className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-slate-300 hover:text-red-500 transition-colors p-2 shrink-0">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 shrink-0 space-y-6">
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {['Cash', 'UPI', 'QR', 'Card', 'Online Link'].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setPaymentMethod(m)}
                                            className={`py-2.5 rounded-xl border-2 transition-all text-[9px] font-black uppercase tracking-widest ${paymentMethod === m ? 'border-primary bg-primary text-white shadow-md' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {paymentMethod !== 'Cash' && paymentMethod !== 'Online Link' && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ref Number</p>
                                    <input
                                        type="text"
                                        placeholder="TNX-ID / Auth code"
                                        value={referenceNumber}
                                        onChange={(e) => setReferenceNumber(e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-primary text-xs font-bold bg-slate-50/50 outline-none transition-all"
                                    />
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Subtotal</span>
                                <span className="text-lg font-black text-slate-900 border-b-2 border-violet-200">₹{total.toLocaleString()}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || isCheckingOut || (!selectedMember && !showGuestForm)}
                                className="w-full h-14 bg-gradient-to-r from-primary to-primary-hover text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-violet-200 flex items-center justify-center gap-3 hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-500"
                            >
                                <CreditCard size={18} />
                                {isCheckingOut ? 'Processing...' : 'Secure Checkout'}
                            </button>
                            <p className="text-center text-[9px] font-bold text-slate-400 mt-4 uppercase tracking-widest">
                                {(!selectedMember && !showGuestForm) ? "Select customer to proceed" : "Secure Payment Gateway"}
                            </p>
                        </div>
                    </div>

                    {/* Recent Transactions with Glass Style */}
                    <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-lg border border-slate-100 p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center border border-violet-100 shadow-sm">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Today's Log</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Recent Sales activity</p>
                            </div>
                        </div>

                        {recentTransactions.length > 0 ? (
                            <div className="space-y-3 max-h-[300px]  pr-1 custom-scrollbar">
                                {recentTransactions.map((txn, idx) => (
                                    <div key={txn.id || idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-violet-200 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-violet-100 text-primary flex items-center justify-center">
                                                <ReceiptText size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">Order #{txn.id}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                    {txn.itemsCount || 0} items • {txn.status}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-900">₹{parseFloat(txn.amount || 0).toLocaleString()}</p>
                                            <p className="text-[9px] font-bold text-slate-400">
                                                {new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 opacity-30">
                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-100 mb-4 animate-spin-slow">
                                    <ReceiptText size={28} />
                                </div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">No sales activity yet</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
            {/* Receipt Modal */}
            <ReceiptModal 
                isOpen={showReceiptModal} 
                onClose={() => setShowReceiptModal(false)} 
                order={lastOrder} 
            />
        </div>
    );
};

export default POS;
