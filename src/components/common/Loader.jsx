import React from 'react';
import { Dumbbell } from 'lucide-react';

const T = {
  accent: '#7C5CFC',
  bg: '#F6F5FF',
  text: '#1A1533',
  muted: '#7B7A8E',
  border: '#EAE7FF'
};

const Loader = ({ message = "Syncing with Roar Hub...", fullHeight = true }) => {
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: fullHeight ? '100vh' : '400px', 
            background: fullHeight ? T.bg : 'transparent', 
            gap: 24,
            fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
            <style>{`
                @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.5; } 100% { transform: scale(1.4); opacity: 0; } }
                @keyframes bounce-icon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes linear-move { 0% { left: -40%; } 100% { left: 100%; } }
                .linear-progress { height: 4px; width: 180px; background: rgba(124,92,252,0.08); border-radius: 10px; overflow: hidden; position: relative; }
                .linear-progress::after { content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 40%; background: #7C5CFC; border-radius: 10px; animation: linear-move 1.5s infinite ease-in-out; }
            `}</style>
            
            <div style={{ position: 'relative' }}>
                 <div style={{ position: 'absolute', inset: -15, borderRadius: '50%', border: `2px solid ${T.accent}`, opacity: 0.2, animation: 'pulse-ring 2s infinite' }} />
                 <div style={{ 
                    width: 72, height: 72, borderRadius: 20, 
                    background: '#fff', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', boxShadow: '0 12px 32px rgba(124,92,252,0.12)', 
                    animation: 'bounce-icon 2s infinite ease-in-out',
                    border: `1px solid ${T.border}`
                }}>
                    <Dumbbell size={32} color={T.accent} strokeWidth={2.5} />
                 </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div className="linear-progress" />
                <p style={{ fontSize: 10, fontWeight: 900, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>{message}</p>
            </div>
        </div>
    );
};

export default Loader;
