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
                    DEFAULT: '#8e68e5',
                    hover: '#7b59c7',
                    light: '#f2effd',
                },
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
