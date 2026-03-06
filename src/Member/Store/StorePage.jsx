import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, ShoppingCart, Package, Trash2, ChevronRight, RefreshCw, Sparkles } from 'lucide-react';
import RightDrawer from '../../components/common/RightDrawer';
import ProductCard from './ProductCard';
import { getStoreProducts, checkoutStoreOrder } from '../../api/storeApi';
import toast from 'react-hot-toast';

const StorePage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
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

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        try {
            toast.loading("Processing Order...", { id: 'checkout' });
            await checkoutStoreOrder({
                cartItems: cart.map(c => ({ id: c.id, quantity: c.quantity })),
                totalAmount: cartTotal
            });
            toast.success("Purchase Successful!", { id: 'checkout' });
            setCart([]);
        } catch (error) {
            toast.error("Transaction Failed", { id: 'checkout' });
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div className="saas-container h-screen overflow-y-auto p-8 space-y-10 fade-in scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Header Section - Restored Premium Style */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pb-10 border-b-2 border-slate-100">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                        <ShoppingBag size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Store</h1>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">Browse and purchase products</p>
                    </div>
                </div>
            </div>

            {/* Search Bar - Premium Refined */}
            <div className="relative group w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full h-16 pl-16 pr-8 bg-white border-2 border-slate-100 rounded-[2rem] text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm placeholder:text-slate-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Products Grid */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Sparkles size={16} />
                        </div>
                        <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Available Gear</h2>
                    </div>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {products.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={addToCart}
                                    onViewDetails={viewProductDetails}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8">
                                <Package size={48} strokeWidth={1} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">No products found</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Try adjusting your search terms</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Persistent Cart Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[3rem] border-2 border-slate-100 p-8 flex flex-col min-h-[500px] shadow-xl shadow-slate-200/50 sticky top-0">
                        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-100">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                                <ShoppingCart size={20} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Cart</h2>
                        </div>

                        {cart.length > 0 ? (
                            <div className="flex-1 flex flex-col h-full">
                                <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2 mb-8">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 group transition-all hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-white">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0 py-1">
                                                <h4 className="font-bold text-slate-900 text-xs truncate uppercase tracking-tight leading-tight">{item.name}</h4>
                                                <p className="text-indigo-600 font-black text-sm mt-1">₹{item.price.toLocaleString()}</p>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 px-3 gap-4">
                                                        <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-400 hover:text-indigo-600 font-black">-</button>
                                                        <span className="text-xs font-black text-slate-900">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-400 hover:text-indigo-600 font-black">+</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-rose-500 self-start p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-8 border-t-2 border-slate-100 space-y-6">
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estimated Total</span>
                                        <span className="text-2xl font-black text-slate-900 tracking-tight">₹{cartTotal.toLocaleString()}</span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        Complete Checkout
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                                <div className="w-20 h-20 flex items-center justify-center text-slate-200 mb-6 bg-slate-50 rounded-[2rem]">
                                    <ShoppingBag size={40} strokeWidth={1} />
                                </div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Your bag is empty</h4>
                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Gear up to reach your goals</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Details Drawer */}
            <RightDrawer
                isOpen={isProductDrawerOpen}
                onClose={() => setIsProductDrawerOpen(false)}
                title={selectedProduct?.name || 'Product Details'}
                maxWidth="max-w-md"
            >
                {selectedProduct && (
                    <div className="p-10 space-y-8">
                        <div className="aspect-square rounded-[2rem] overflow-hidden bg-white border-2 border-slate-100 shadow-sm">
                            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{selectedProduct.name}</h3>
                            <div className="inline-block px-4 py-1.5 bg-indigo-50 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
                                Premium Selection
                            </div>
                            <p className="text-slate-500 font-medium leading-relaxed pt-2">
                                {selectedProduct.description || "Expertly crafted for peak performance and maximum comfort during your most intense training sessions."}
                            </p>
                        </div>
                        <div className="pt-10 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</span>
                                <span className="text-4xl font-black text-indigo-600 tracking-tight">₹{selectedProduct.price.toLocaleString()}</span>
                            </div>
                            <button
                                onClick={() => {
                                    addToCart(selectedProduct);
                                    setIsProductDrawerOpen(false);
                                    toast.success("Added to Gear Bag");
                                }}
                                className="px-8 h-14 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                )}
            </RightDrawer>
        </div>
    );
};

export default StorePage;
