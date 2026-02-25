import React, { useState, useEffect } from 'react';
import { Sparkles, Search, TrendingUp, ChevronRight, ShoppingBag, Star, Trash2, CheckCircle, RefreshCw } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import ProductCard from './ProductCard';
import { getStoreProducts, getStoreOrders, checkoutStoreOrder } from '../../api/storeApi';
import toast from 'react-hot-toast';

const StorePage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
    const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
    const [activeStoreTab, setActiveStoreTab] = useState('shop'); // shop, orders
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [checkoutStep, setCheckoutStep] = useState('cart'); // cart, checkout, processing, success

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, [selectedCategory, searchTerm]);

    const fetchProducts = async () => {
        try {
            const data = await getStoreProducts({
                category: selectedCategory,
                search: searchTerm
            });
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        }
    };

    const fetchOrders = async () => {
        try {
            const data = await getStoreOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    };

    const categories = ['All', 'Supplements', 'Apparel', 'Equipment', 'Accesories'];

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const viewProductDetails = (product) => {
        setSelectedProduct(product);
        setIsProductDrawerOpen(true);
    };

    const handleCheckout = () => {
        setCheckoutStep('checkout');
    };

    const completePurchase = async () => {
        setCheckoutStep('processing');
        try {
            await checkoutStoreOrder({
                cartItems: cart.map(c => ({ id: c.id, quantity: c.quantity })),
                totalAmount: cartTotal
            });
            setCheckoutStep('success');
            fetchOrders();
            setCart([]);
        } catch (error) {
            toast.error(error);
            setCheckoutStep('checkout');
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50/50 min-h-screen p-6 md:p-8">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="relative">
                        <div className="absolute -left-4 -top-4 w-24 h-24 bg-violet-600 rounded-full blur-[80px] opacity-20" />
                        <h1 className="relative text-5xl font-black text-slate-800 flex items-center gap-4 tracking-tight">
                            <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-violet-500/20 rotate-3">
                                <ShoppingBag size={30} />
                            </div>
                            Gym Store
                        </h1>
                        <p className="text-slate-500 mt-3 font-semibold text-lg max-w-md">Premium nutrition & elite performance gear delivered to your locker.</p>
                    </div>

                    <div className="flex flex-col space-y-4 flex-1 max-w-2xl">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-all duration-300" size={22} />
                            <input
                                type="text"
                                placeholder="Search premium essentials..."
                                className="w-full pl-16 pr-6 py-5 bg-white border-2 border-slate-100 rounded-3xl text-sm font-bold focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 transition-all shadow-xl shadow-slate-200/40 placeholder:text-slate-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-1.5 shadow-lg gap-2 mb-6">
                            <button
                                onClick={() => setActiveStoreTab('shop')}
                                className={`flex-1 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeStoreTab === 'shop'
                                    ? 'bg-violet-600 text-white shadow-lg'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                Shop Store
                            </button>
                            <button
                                onClick={() => setActiveStoreTab('orders')}
                                className={`flex-1 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeStoreTab === 'orders'
                                    ? 'bg-violet-600 text-white shadow-lg'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                My Orders
                            </button>
                        </div>

                        {activeStoreTab === 'shop' && (
                            <div className="flex bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl p-1.5 shadow-lg overflow-x-auto no-scrollbar gap-1">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shrink-0 ${selectedCategory === cat
                                            ? 'bg-slate-900 text-white shadow-lg'
                                            : 'text-slate-500 hover:text-violet-600 hover:bg-violet-50'
                                            } `}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {activeStoreTab === 'shop' ? (
                <>
                    {/* Premium Banner */}
                    <div className="max-w-7xl mx-auto mb-16 rounded-[3rem] overflow-hidden relative min-h-[450px] shadow-2xl flex items-center">
                        <div className="absolute inset-0">
                            <img
                                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop"
                                alt="Premium Banner"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
                        </div>

                        <div className="relative z-10 p-12 md:p-20 max-w-2xl">
                            <div className="inline-flex items-center gap-2 bg-violet-500/20 backdrop-blur-xl border border-violet-400/30 px-5 py-2.5 rounded-full mb-8">
                                <Sparkles size={18} className="text-violet-300 animate-pulse" />
                                <span className="text-violet-100 text-[10px] font-black uppercase tracking-[0.2em]">The Performance Collection</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-8">
                                FUEL YOUR <br />
                                <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">AMBITION.</span>
                            </h2>
                            <p className="text-slate-300 text-lg font-medium leading-relaxed mb-10 max-w-lg">
                                Elite-standard supplements and engineered apparel. Built for those who never settle for average.
                            </p>
                            <div className="flex flex-wrap gap-5">
                                <button className="px-10 py-5 bg-violet-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-violet-600/30 hover:scale-105 active:scale-95">
                                    Shop The Drop
                                </button>
                                <button className="px-10 py-5 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all hover:scale-105 active:scale-95">
                                    Learn More
                                </button>
                            </div>
                        </div>

                        {/* Animated Decorative Element */}
                        <div className="absolute right-0 bottom-0 p-20 hidden lg:block">
                            <div className="w-64 h-64 border-2 border-white/10 rounded-full animate-[spin_20s_linear_infinite] flex items-center justify-center">
                                <div className="w-48 h-48 border-2 border-violet-500/20 rounded-full flex items-center justify-center">
                                    <div className="w-32 h-32 bg-violet-500/10 rounded-full backdrop-blur-3xl" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={addToCart}
                                onViewDetails={viewProductDetails}
                            />
                        ))}
                    </div>

                    {/* Empty State */}
                    {products.length === 0 && (
                        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 mt-10">
                            <div className="w-24 h-24 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-8 text-violet-200">
                                <Search size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">No matches found</h3>
                            <p className="text-slate-500 mt-3 font-medium">Try broadening your search or select a different category.</p>
                        </div>
                    )}
                </>
            ) : (
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                                    <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Items</th>
                                    <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Total</th>
                                    <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-10 py-6 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-10 py-8">
                                            <span className="font-black text-slate-900">#{order.id}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="font-bold text-slate-500">{order.date}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="font-bold text-slate-900">{order.items} Items</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="font-black text-violet-600">₹{order.total.toLocaleString()}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <button className="text-xs font-black text-violet-600 hover:text-violet-800 uppercase tracking-widest">
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <button
                    onClick={() => {
                        setCheckoutStep('cart');
                        setIsCartDrawerOpen(true);
                    }}
                    className="fixed bottom-10 right-10 z-[100] group"
                >
                    <div className="absolute inset-0 bg-violet-600 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-all duration-500 group-hover:scale-125" />
                    <div className="relative w-20 h-20 bg-violet-600 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border-4 border-white">
                        <ShoppingBag size={32} />
                        <span className="absolute -top-3 -right-3 min-w-[32px] h-32px p-2 bg-rose-500 rounded-xl border-4 border-white flex items-center justify-center text-[12px] font-black group-hover:scale-125 transition-all shadow-lg">
                            {cartItemCount}
                        </span>
                    </div>
                </button>
            )}

            {/* Cart Drawer */}
            <RightDrawer
                isOpen={isCartDrawerOpen}
                onClose={() => {
                    setIsCartDrawerOpen(false);
                    setTimeout(() => setCheckoutStep('cart'), 500);
                }}
                title={checkoutStep === 'success' ? 'Order Confirmed!' : 'Your Shopping Bag'}
                maxWidth="max-w-md"
            >
                <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
                    {checkoutStep === 'cart' && (
                        <>
                            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                                {cart.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-10">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
                                            <ShoppingBag size={40} />
                                        </div>
                                        <h4 className="text-lg font-bold text-slate-700">Your bag is empty</h4>
                                        <p className="text-sm text-slate-400 mt-2">Start adding some items to gear up!</p>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} className="bg-white p-5 rounded-[2rem] flex gap-5 shadow-sm border border-slate-100 group transition-all hover:shadow-xl hover:shadow-violet-500/5">
                                            <div className="w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-50 border border-slate-100">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 flex flex-col pt-1">
                                                <div className="flex justify-between">
                                                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{item.name}</h4>
                                                    <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <span className="text-violet-600 font-extrabold text-sm mt-2">₹{item.price.toLocaleString()}</span>
                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-4">
                                                        <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-white hover:text-violet-600 rounded-lg transition-all font-black text-lg">-</button>
                                                        <span className="text-xs font-black text-slate-800">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-white hover:text-violet-600 rounded-lg transition-all font-black text-lg">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="shrink-0 p-8 bg-white border-t border-slate-100 space-y-6 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-slate-500 font-bold text-sm">
                                        <span>Subtotal</span>
                                        <span className="text-slate-800">₹{cartTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 font-bold text-sm">
                                        <span>Shipping</span>
                                        <span className="text-emerald-600 uppercase tracking-widest">Free</span>
                                    </div>
                                    <div className="flex justify-between text-2xl font-black text-slate-800 pt-5 border-t border-slate-100">
                                        <span>Total</span>
                                        <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">₹{cartTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    disabled={cart.length === 0}
                                    className="w-full py-6 bg-violet-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/40 hover:bg-violet-700 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale disabled:pointer-events-none"
                                >
                                    Secure Checkout
                                </button>
                            </div>
                        </>
                    )}

                    {checkoutStep === 'checkout' && (
                        <div className="flex-1 p-8 space-y-8">
                            <button onClick={() => setCheckoutStep('cart')} className="flex items-center gap-2 text-slate-400 hover:text-violet-600 font-bold text-xs uppercase tracking-widest">
                                <ChevronRight className="rotate-180" size={16} /> Back to Cart
                            </button>

                            <div>
                                <h3 className="text-2xl font-black text-slate-800 mb-6">Order Review</h3>
                                <div className="space-y-4 bg-white p-6 rounded-[2rem] border border-slate-100">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-bold">Locker Delivery</span>
                                        <span className="text-violet-600 font-black">Locker #24</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-bold">Payment Method</span>
                                        <span className="text-slate-800 font-black text-right">Gym Wallet<br /><span className="text-[10px] text-slate-400 uppercase">Available: ₹12,450</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Summary</h4>
                                <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-4">
                                    <div className="flex justify-between text-slate-400 font-medium">
                                        <span>Total Items</span>
                                        <span>{cartItemCount}</span>
                                    </div>
                                    <div className="flex justify-between text-3xl font-black border-t border-white/10 pt-4">
                                        <span>Total</span>
                                        <span className="text-violet-400">₹{cartTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={completePurchase}
                                disabled={checkoutStep === 'processing'}
                                className="w-full py-6 bg-violet-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-violet-500/40 hover:bg-violet-700 transition-all hover:scale-[1.02]"
                            >
                                {checkoutStep === 'processing' ? <RefreshCw className="animate-spin inline mr-2" /> : ''}
                                Confirm & Pay
                            </button>
                        </div>
                    )}

                    {checkoutStep === 'success' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
                            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8 relative">
                                <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                                <CheckCircle size={48} className="relative z-10" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Purchase Confirmed!</h3>
                            <p className="text-slate-500 font-medium leading-relaxed mb-4">
                                Your order has been placed successfully. <br />
                                Your items will be delivered to your locker soon.
                            </p>
                            <span className="px-4 py-2 bg-slate-100 rounded-full text-xs font-black text-slate-400 uppercase tracking-widest">
                                Order ID: #GYM-{Math.floor(100000 + Math.random() * 900000)}
                            </span>
                        </div>
                    )}
                </div>
            </RightDrawer>
        </div>
    );
};

export default StorePage;
