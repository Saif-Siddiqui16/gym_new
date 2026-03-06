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
                    DEFAULT: '#2563EB', // blue-600
                    hover: '#1d4ed8', // blue-700
                    light: '#f2effd',
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
                }
            },
            fontFamily: {
                sans: ['Public Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            boxShadow: {
                'sm': '0 2px 4px rgba(165, 163, 174, 0.3)',
                'md': '0 4px 14px rgba(165, 163, 174, 0.15)',
                'lg': '0 8px 20px rgba(165, 163, 174, 0.2)',
            },
        },
    },
    plugins: [],
}
