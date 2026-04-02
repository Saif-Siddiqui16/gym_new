/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#4F46E5',
                    hover: '#4338CA',
                    light: '#EEF2FF',
                },
                card: {
                    DEFAULT: '#ffffff',
                    foreground: '#1f2937',
                },
                muted: {
                    DEFAULT: '#f3f4f6',
                    foreground: '#6b7280',
                },
                border: {
                    DEFAULT: '#e5e7eb',
                    light: '#f3f4f6',
                },
                title: '#111827',
                body: '#374151',
            },
            fontFamily: {
                sans: ['Inter', 'Public Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'md': '0 4px 14px rgba(165, 163, 174, 0.15)',
                'lg': '0 8px 20px rgba(165, 163, 174, 0.2)',
                'premium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            borderRadius: {
                'card': '12px',
                'btn': '10px',
            },
            fontSize: {
                'page-title': '28px',
                'section-title': '20px',
            },
            animation: {
                'fadeIn': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
