// Shared Tailwind CSS Configuration
// This ensures a unified look and feel (fonts, colors, animations) across all pages.

tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Roboto Condensed', 'sans-serif'],
            },
            colors: {
                gemini: {
                    900: '#0b0f19', // Deepest background
                    800: '#13161f', // Sidebar/Surface
                    700: '#1e2330', // Hover states
                    600: '#2d3342', // Borders
                    accent: '#3b82f6', // Blue accent
                }
            },
            animation: {
                'spin-slow': 'spin 3s linear infinite',
                'fade-in': 'fadeIn 0.5s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        }
    }
};
