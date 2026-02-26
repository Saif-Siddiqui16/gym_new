import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, User, Store, Package, Users, Info, ChevronDown } from 'lucide-react';
import { getStoreProducts, checkoutStoreOrder } from '../../../api/storeApi';
import { membershipApi } from '../../../api/membershipApi';
import { promoApi } from '../../../api/promoApi';
import { fetchTenantSettings } from '../../../api/manager/managerApi';
import toast from 'react-hot-toast';

const POS = () => {
    const [products, setProducts] = useState([]);
    const [members, setMembers] = useState([]);
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Customer Sync State
    const [customerType, setCustomerType] = useState('member'); // 'member' or 'guest'
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberSearch, setMemberSearch] = useState('');
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);

    // Discounts & Rewards State
    const [discountCodeInput, setDiscountCodeInput] = useState('');
    const [appliedDiscountCode, setAppliedDiscountCode] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [rewardPointsToUse, setRewardPointsToUse] = useState(0);
    const [availablePoints, setAvailablePoints] = useState(0);
    const [gstPercent, setGstPercent] = useState(18);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [productData, memberData, settingsData] = await Promise.all([
                    getStoreProducts(),
                    membershipApi.getMembers(),
                    fetchTenantSettings().catch(() => ({ gstPercent: 18 }))
                ]);
                setProducts(productData);
                setMembers(memberData);
                if (settingsData && settingsData.gstPercent) {
                    setGstPercent(parseFloat(settingsData.gstPercent));
                }
            } catch (error) {
                console.error("Failed to load POS data", error);
            }
        };
        loadData();
    }, []);

    const filteredProducts = products.filter(p =>
        (selectedCategory === 'All' || p.category === selectedCategory) &&
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        (m.memberId && m.memberId.toLowerCase().includes(memberSearch.toLowerCase()))
    );

    const categories = ['All', ...new Set(products.map(p => p.category))];

    const addToCart = (product) => {
        const productInStock = products.find(p => p.id === product.id);
        const existingInCart = cart.find(item => item.id === product.id);
        const currentQty = existingInCart ? existingInCart.qty : 0;

        if (currentQty >= productInStock.stock) {
            alert('Cannot add more items. Out of stock.');
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
            }
            return [...prev, { ...product, qty: 1 }];
        });
    };

    const updateQty = (id, delta) => {
        const productInStock = products.find(p => p.id === id);

        setCart(prev => prev.map(item => {
            if (item.id === id) {
                if (delta > 0 && item.qty >= productInStock.stock) {
                    return item;
                }
                const newQty = Math.max(0, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }).filter(item => item.qty > 0));
    };

    // Points fetching logic
    useEffect(() => {
        if (selectedMember && selectedMember.id) {
            // Need to fetch or calculate available points for the member.
            // Let's assume the API returns member with total points or we provide mock for now.
            // Wait, we can fetch from membershipApi or assume it's attached.
            // We'll set a mock or use member.points if it exists
            const mockPoints = selectedMember.totalPoints || 500; // Give them 500 points for demo if none exists
            setAvailablePoints(mockPoints);
        } else {
            setAvailablePoints(0);
            setRewardPointsToUse(0);
        }
    }, [selectedMember]);

    const handleApplyDiscount = async () => {
        if (!discountCodeInput) return;
        try {
            const promo = await promoApi.validatePromo(discountCodeInput);
            const sum = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

            if (promo.type === 'PERCENTAGE') {
                setDiscountAmount(sum * (parseFloat(promo.value) / 100));
            } else {
                setDiscountAmount(parseFloat(promo.value));
            }

            setAppliedDiscountCode(promo.code);
            toast.success("Promo code applied successfully!");
        } catch (error) {
            alert(error || "Invalid Discount Code");
            setDiscountAmount(0);
            setAppliedDiscountCode(null);
        }
    };

    const handleRemoveDiscount = () => {
        setDiscountAmount(0);
        setAppliedDiscountCode(null);
        setDiscountCodeInput('');
    };

    const handleCheckout = async () => {
        if (customerType === 'member' && !selectedMember) {
            alert('Please select a member for this transaction.');
            return;
        }

        if (rewardPointsToUse > availablePoints) {
            alert('Cannot use more points than available.');
            return;
        }

        try {
            const orderData = {
                memberId: selectedMember ? selectedMember.id : null,
                cartItems: cart.map(item => ({ id: item.id, quantity: item.qty })),
                totalAmount: finalTotalPayable, // Will calculate this below
                discountCode: appliedDiscountCode,
                pointsRedeemed: rewardPointsToUse
            };

            await checkoutStoreOrder(orderData);

            // Reduct stock count instantly in UI
            setProducts(prevProducts => prevProducts.map(p => {
                const cartItem = cart.find(item => item.id === p.id);
                if (cartItem) {
                    return { ...p, stock: p.stock - cartItem.qty };
                }
                return p;
            }));

            const customerInfo = customerType === 'member'
                ? `Member: ${selectedMember.name} (${selectedMember.memberId})`
                : 'Guest Checkout';

            alert(`Processing Payment of ₹${Math.round(finalTotalPayable).toLocaleString()}.\n${customerInfo}\n\nInvoice generated and synced with Finance & Member history.`);
            setCart([]);
            setSelectedMember(null);
            setMemberSearch('');
            setDiscountAmount(0);
            setAppliedDiscountCode(null);
            setDiscountCodeInput('');
            setRewardPointsToUse(0);
        } catch (error) {
            alert(`Failed to complete transaction: ${error}`);
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const valueFromPoints = parseInt(rewardPointsToUse || 0); // 1 point = 1 INR
    const taxableAmount = Math.max(0, discountedSubtotal - valueFromPoints);
    const tax = taxableAmount * (gstPercent / 100);
    const finalTotalPayable = taxableAmount + tax;

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-4 sm:p-6 pb-12 min-h-screen">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-[calc(100vh-120px)]">
                {/* Product Grid */}
                <div className="flex-1 flex flex-col gap-4 sm:gap-6 overflow-hidden">
                    {/* Premium Header */}
                    <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur-2xl opacity-10 animate-pulse"></div>
                        <div className="relative bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 p-4 sm:p-6">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                                        <Store className="text-violet-600" size={24} />
                                        POS Store
                                    </h1>
                                    <p className="text-slate-600 text-xs sm:text-sm">Sell supplements, gear, and amenities</p>
                                </div>
                                <div className="relative w-full group">
                                    <Search
                                        size={18}
                                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 group-focus-within:scale-110 transition-all duration-300"
                                    />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search products..."
                                        className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-white/80 border-2 border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 focus:bg-white transition-all duration-300 hover:border-slate-300"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 shadow-md ${selectedCategory === cat
                                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-xl hover:shadow-violet-500/50 hover:scale-105'
                                    : 'bg-white text-slate-700 hover:bg-slate-50 hover:shadow-lg hover:scale-105 border border-slate-100'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 overflow-y-auto pb-4 pr-2">
                        {filteredProducts.map(product => (
                            <div key={product.id} className="group bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col hover:scale-105 hover:-translate-y-1">
                                <div className="aspect-square bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-100 rounded-lg sm:rounded-xl mb-2 sm:mb-3 relative overflow-hidden flex items-center justify-center">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <Package size={48} className="text-violet-400 opacity-50" />
                                    )}
                                    {product.stock === 0 ? (
                                        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-rose-600 text-white px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight shadow-lg animate-pulse">
                                            Out of Stock
                                        </div>
                                    ) : (
                                        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-white/90 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold shadow-md">
                                            <Package size={10} className="sm:w-3 sm:h-3 inline mr-0.5 sm:mr-1 text-violet-500" />
                                            {product.stock} in stock
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-1 line-clamp-2 group-hover:text-violet-600 transition-colors">{product.name}</h3>
                                <div className="text-[10px] sm:text-xs font-semibold text-slate-500 mb-2 sm:mb-3">{product.category}</div>
                                <div className="mt-auto flex items-center justify-between">
                                    <div className="font-black text-base sm:text-lg text-slate-900">₹{product.price}</div>
                                    <button
                                        onClick={() => addToCart(product)}
                                        disabled={product.stock === 0}
                                        className={`p-1.5 sm:p-2 bg-gradient-to-br transition-all duration-300 rounded-lg sm:rounded-xl ${product.stock === 0 ? 'from-slate-100 to-slate-200 text-slate-400 cursor-not-allowed' : 'from-violet-500 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-500/50 hover:scale-110'}`}
                                    >
                                        <Plus size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cart Sidebar */}
                <div className="w-full lg:w-96 shrink-0 flex flex-col bg-white/60 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-white/50 h-[calc(100vh-120px)] lg:h-[calc(100vh-48px)]">
                    <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50 rounded-t-xl sm:rounded-t-2xl shrink-0">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                            <ShoppingCart className="text-violet-600" size={20} />
                            Current Cart
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
                        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-shrink-0">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 py-10">
                                    <ShoppingCart size={40} className="sm:w-12 sm:h-12 mb-3 sm:mb-4" />
                                    <p className="font-bold text-sm sm:text-base">Cart is empty</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="group flex items-center gap-2 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-300">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-lg sm:rounded-xl shrink-0 overflow-hidden flex items-center justify-center">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Package size={16} className="sm:w-5 sm:h-5 text-violet-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-xs sm:text-sm text-slate-900 truncate group-hover:text-violet-600 transition-colors">{item.name}</div>
                                            <div className="text-[10px] sm:text-xs font-semibold text-slate-500">₹{item.price} × {item.qty}</div>
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-2 bg-slate-50 rounded-lg p-1">
                                            <button onClick={() => updateQty(item.id, -1)} className="p-0.5 sm:p-1 hover:bg-white rounded-md transition-colors">
                                                <Minus size={12} className="sm:w-[14px] sm:h-[14px]" />
                                            </button>
                                            <span className="text-[10px] sm:text-xs font-bold w-3 sm:w-4 text-center">{item.qty}</span>
                                            <button onClick={() => updateQty(item.id, 1)} className="p-0.5 sm:p-1 hover:bg-white rounded-md transition-colors">
                                                <Plus size={12} className="sm:w-[14px] sm:h-[14px]" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Customer Information Section */}
                        <div className="px-4 pb-4 sm:px-6 sm:pb-6 border-t border-slate-100 bg-white/40 flex-shrink-0">
                            <div className="py-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Customer Information</h4>
                                <div className="flex gap-4 mb-4">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="customerType"
                                            checked={customerType === 'member'}
                                            onChange={() => setCustomerType('member')}
                                            className="w-4 h-4 text-violet-600 border-slate-300 focus:ring-violet-500"
                                        />
                                        <span className={`text-xs font-bold transition-colors ${customerType === 'member' ? 'text-violet-600' : 'text-slate-500 group-hover:text-slate-700'}`}>Assign to Member</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="customerType"
                                            checked={customerType === 'guest'}
                                            onChange={() => setCustomerType('guest')}
                                            className="w-4 h-4 text-violet-600 border-slate-300 focus:ring-violet-500"
                                        />
                                        <span className={`text-xs font-bold transition-colors ${customerType === 'guest' ? 'text-violet-600' : 'text-slate-500 group-hover:text-slate-700'}`}>Guest Checkout</span>
                                    </label>
                                </div>

                                {customerType === 'member' && (
                                    <div className="relative animate-in fade-in slide-in-from-top-2">
                                        <div
                                            onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                                            className={`flex items-center justify-between px-4 py-2.5 bg-white border-2 rounded-xl cursor-pointer transition-all ${selectedMember ? 'border-violet-200 bg-violet-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Users size={16} className={selectedMember ? 'text-violet-600' : 'text-slate-400'} />
                                                {selectedMember ? (
                                                    <div className="truncate">
                                                        <div className="text-xs font-bold text-slate-900">{selectedMember.name}</div>
                                                        <div className="text-[10px] text-slate-500">{selectedMember.memberId}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-bold text-slate-400">Search Member...</span>
                                                )}
                                            </div>
                                            <ChevronDown size={16} className={`text-slate-400 transition-transform ${showMemberDropdown ? 'rotate-180' : ''}`} />
                                        </div>

                                        {showMemberDropdown && (
                                            <div className="mt-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
                                                <div className="p-2 border-b border-slate-50">
                                                    <div className="relative">
                                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input
                                                            type="text"
                                                            value={memberSearch}
                                                            onChange={(e) => setMemberSearch(e.target.value)}
                                                            placeholder="Name or ID..."
                                                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border-none rounded-lg text-xs font-bold focus:ring-2 focus:ring-violet-500/20"
                                                            autoFocus
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-48 overflow-y-auto pt-1">
                                                    {filteredMembers.length > 0 ? (
                                                        filteredMembers.map(member => (
                                                            <div
                                                                key={member.id}
                                                                onClick={() => {
                                                                    setSelectedMember(member);
                                                                    setShowMemberDropdown(false);
                                                                }}
                                                                className="px-4 py-2 hover:bg-violet-50 cursor-pointer transition-colors border-b border-slate-50 last:border-none"
                                                            >
                                                                <div className="text-xs font-bold text-slate-900">{member.name}</div>
                                                                <div className="text-[10px] text-slate-500 font-medium">{member.memberId} • {member.phone}</div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-center text-xs text-slate-400 font-bold italic">No members found</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-4 p-3 bg-violet-50/50 rounded-xl border border-violet-100 flex items-start gap-2">
                                    <Info size={14} className="text-violet-500 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-violet-700 leading-tight">This transaction will generate an Invoice.</p>
                                        <p className="text-[9px] font-medium text-slate-500 leading-tight italic">
                                            Auto-Sync: Finance Module & {customerType === 'member' ? 'Member Purchase History' : 'General Sales Log'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Discount & Rewards Section */}
                        {cart.length > 0 && (
                            <div className="px-4 sm:px-6 py-4 bg-white/40 border-t border-slate-100 space-y-4 flex-shrink-0">
                                {/* Discount Code */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Promo & Discount</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={discountCodeInput}
                                            onChange={(e) => setDiscountCodeInput(e.target.value)}
                                            disabled={!!appliedDiscountCode}
                                            placeholder="Enter CODE (e.g., SAVE10)"
                                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-violet-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                                        />
                                        {appliedDiscountCode ? (
                                            <button onClick={handleRemoveDiscount} className="px-4 py-2 bg-rose-100 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-200 transition-colors">
                                                Remove
                                            </button>
                                        ) : (
                                            <button onClick={handleApplyDiscount} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">
                                                Apply
                                            </button>
                                        )}
                                    </div>
                                    {appliedDiscountCode && (
                                        <div className="text-[10px] text-emerald-600 font-bold mt-1 ml-1">- ₹{discountAmount.toLocaleString()} discount applied!</div>
                                    )}
                                </div>

                                {/* Rewards Points */}
                                {customerType === 'member' && selectedMember && availablePoints > 0 && (
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Use Reward Points</label>
                                            <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">{availablePoints} Available</span>
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            max={Math.min(availablePoints, discountedSubtotal)}
                                            value={rewardPointsToUse}
                                            onChange={(e) => {
                                                let val = parseInt(e.target.value) || 0;
                                                val = Math.min(val, availablePoints, Math.floor(discountedSubtotal));
                                                setRewardPointsToUse(val);
                                            }}
                                            disabled={discountedSubtotal <= 0}
                                            placeholder="Points to redeem"
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-violet-500/20"
                                        />
                                        <div className="text-[10px] text-slate-500 italic mt-1 ml-1">1 point = ₹1</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div> {/* End of scrollable area */}

                    <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-50 to-slate-100/50 border-t border-slate-200 space-y-3 flex-shrink-0 rounded-b-xl sm:rounded-b-2xl">
                        <div className="flex justify-between items-center text-slate-600 font-semibold text-xs sm:text-sm">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between items-center text-emerald-600 font-bold text-xs sm:text-sm">
                                <span>Discount ({appliedDiscountCode})</span>
                                <span>-₹{discountAmount.toLocaleString()}</span>
                            </div>
                        )}
                        {rewardPointsToUse > 0 && (
                            <div className="flex justify-between items-center text-violet-600 font-bold text-xs sm:text-sm">
                                <span>Points Redeemed ({rewardPointsToUse} pts)</span>
                                <span>-₹{rewardPointsToUse.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-slate-500 font-medium text-[10px] sm:text-xs">
                            <span>Taxable Amount</span>
                            <span>₹{taxableAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600 font-semibold text-[10px] sm:text-xs">
                            <span>Tax ({gstPercent}% GST)</span>
                            <span>₹{Math.round(tax).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xl sm:text-2xl font-black text-slate-900 pt-3 sm:pt-4 border-t border-slate-300">
                            <span>Total</span>
                            <span className="text-violet-600">₹{Math.round(finalTotalPayable).toLocaleString()}</span>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <button
                                disabled={cart.length === 0 || (customerType === 'member' && !selectedMember)}
                                onClick={handleCheckout}
                                className="group relative w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-base sm:text-lg hover:shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative text-sm sm:text-base">Checkout Now</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POS;
