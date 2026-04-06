import React from 'react';
import { ShoppingBag, Star, Eye, ShoppingCart } from 'lucide-react';

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

const ProductCard = ({ product, onAddToCart, onViewDetails, index = 0 }) => {
    return (
        <div 
            style={{
                background: T.surface, borderRadius: 32, border: `1px solid ${T.border}`,
                overflow: 'hidden', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                animation: `fadeUp 0.5s ease both ${0.1 + index * 0.05}s`,
                position: 'relative'
            }}
            className="group"
        >
            <style>{`
                .group:hover { transform: translateY(-12px); border-color: ${T.accentMid}; box-shadow: 0 24px 60px rgba(124,92,252,0.12); }
                .image-zoom { transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1); }
                .group:hover .image-zoom { transform: scale(1.1); }
                .action-overlay { opacity: 0; transform: translateY(20px); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
                .group:hover .action-overlay { opacity: 1; transform: translateY(0); }
            `}</style>

            {/* IMAGE SECTION */}
            <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: T.bg }}>
                <img src={product.image} alt={product.name} className="image-zoom" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                {/* BADGES */}
                <div style={{ position: 'absolute', top: 20, left: 20, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 10 }}>
                     <span style={{ padding: '6px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', fontSize: 9, fontWeight: 900, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>{product.category || 'Gear'}</span>
                     {product.price < product.originalPrice && (
                        <span style={{ padding: '6px 14px', borderRadius: 10, background: T.rose, color: '#fff', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 4px 12px rgba(244,63,94,0.3)' }}>Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</span>
                     )}
                </div>

                {/* OVERLAY ACTIONS */}
                <div className="action-overlay" style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12, zIndex: 20 }}>
                    <button onClick={() => onViewDetails(product)} style={{ width: 48, height: 48, borderRadius: 16, background: '#fff', color: T.text, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}><Eye size={20} /></button>
                    <button onClick={() => onAddToCart(product)} style={{ width: 48, height: 48, borderRadius: 16, background: T.accent, color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 24px rgba(124,92,252,0.3)' }}><ShoppingCart size={20} /></button>
                </div>
            </div>

            {/* CONTENT SECTION */}
            <div style={{ padding: '24px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, margin: 0, lineHeight: 1.2, letterSpacing: '-0.2px' }}>{product.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.amberLight, padding: '4px 10px', borderRadius: 8 }}>
                        <Star size={12} color={T.amber} fill={T.amber} />
                        <span style={{ fontSize: 10, fontWeight: 900, color: T.amber }}>{product.rating || '4.8'}</span>
                    </div>
                </div>

                <p style={{ fontSize: 11, fontWeight: 600, color: T.muted, lineHeight: 1.5, margin: '0 0 24px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>

                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 20, borderTop: `1px solid ${T.bg}` }}>
                    <div>
                         {product.originalPrice > 0 && <span style={{ display: 'block', fontSize: 10, fontWeight: 800, color: T.subtle, textDecoration: 'line-through', marginBottom: 2 }}>₹{product.originalPrice.toLocaleString()}</span>}
                         <span style={{ fontSize: 24, fontWeight: 900, color: T.text, letterSpacing: '-0.5px' }}>₹{product.price.toLocaleString()}</span>
                    </div>
                    <button 
                        onClick={() => onAddToCart(product)}
                        style={{ height: 44, padding: '0 20px', borderRadius: 12, background: T.dark, color: '#fff', border: 'none', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'pointer', transition: '0.2s' }}
                        onMouseEnter={(e) => e.target.style.background = T.accent}
                        onMouseLeave={(e) => e.target.style.background = T.dark}
                    >Add to Cart</button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
