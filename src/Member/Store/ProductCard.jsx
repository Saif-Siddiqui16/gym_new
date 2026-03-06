import React from 'react';
import { ShoppingBag, Star, Eye } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, onViewDetails }) => {
    return (
        <div className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-violet-200/50 transition-all duration-700 hover:-translate-y-3 border border-slate-100/50">
            {/* Image Section */}
            <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                />

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-violet-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-violet-600 uppercase tracking-widest shadow-sm">
                        {product.category}
                    </span>
                    {product.price < product.originalPrice && (
                        <span className="px-3 py-1 bg-rose-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/30">
                            Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                    )}
                </div>

                {/* Interactive Action Buttons */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                    <button
                        onClick={() => onViewDetails(product)}
                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-800 shadow-xl hover:bg-violet-600 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                    >
                        <Eye size={20} />
                    </button>
                    <button
                        onClick={() => onAddToCart(product)}
                        className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white shadow-xl hover:bg-slate-900 transition-all transform hover:scale-110 active:scale-95"
                    >
                        <ShoppingBag size={20} />
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-7">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-violet-600 transition-colors duration-300">
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg">
                        <Star size={14} className="text-amber-500" fill="currentColor" />
                        <span className="text-xs font-black text-amber-700">{product.rating}</span>
                    </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-6 font-medium">
                    {product.description}
                </p>

                <div className="flex items-end justify-between">
                    <div>
                        <span className="block text-[10px] text-slate-400 line-through mb-1 font-bold tracking-wider">
                            ₹{product.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-2xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                            ₹{product.price.toLocaleString()}
                        </span>
                    </div>

                    <button
                        onClick={() => onAddToCart(product)}
                        className="relative overflow-hidden group/btn px-6 py-3 bg-slate-900 rounded-2xl text-[10px] font-black text-white uppercase tracking-[0.1em] transition-all hover:bg-violet-600 active:scale-95"
                    >
                        <span className="relative z-10">Add To Cart</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 scale-x-0 group-hover/btn:scale-x-100 origin-left transition-transform duration-500" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
