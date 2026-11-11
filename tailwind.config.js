/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        polymarket: {
          bg: '#06060a',
          bgSecondary: '#0d0d14',
          bgTeritary: '#14141f',
          card: '#0f0f17',
          border: '#1f1f2e',
          borderHover: '#2a2a3e',
          primary: '#00d4aa',
          primaryHover: '#00e8bb',
          primaryGlow: 'rgba(0, 212, 170, 0.4)',
          primaryDim: 'rgba(0, 212, 170, 0.1)',
          secondary: '#6366f1',
          secondaryHover: '#818cf8',
          danger: '#ef4444',
          dangerHover: '#f87171',
          dangerGlow: 'rgba(239, 68, 68, 0.4)',
          dangerDim: 'rgba(239, 68, 68, 0.1)',
          warning: '#f59e0b',
          warningHover: '#fbbf24',
          success: '#22c55e',
          successHover: '#4ade80',
          text: '#fafafa',
          textSecondary: '#a1a1aa',
          textMuted: '#71717a',
          textInverse: '#06060a',
        },
        chip: {
          1: '#ffffff',
          5: '#ef4444',
          25: '#22c55e',
          100: '#0f0f17',
          500: '#a855f7',
          1000: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.2s ease-in',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'card-flip': 'cardFlip 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'card-deal': 'cardDeal 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'chip-fly': 'chipFly 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 170, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 212, 170, 0.5)' },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(90deg) scale(0.8)', opacity: '0' },
          '50%': { transform: 'rotateY(0deg) scale(1.05)' },
          '100%': { transform: 'rotateY(0deg) scale(1)', opacity: '1' },
        },
        cardDeal: {
          '0%': { transform: 'translateY(-200px) rotate(-180deg) scale(0.5)', opacity: '0' },
          '60%': { transform: 'translateY(10px) rotate(5deg) scale(1.05)' },
          '100%': { transform: 'translateY(0) rotate(0deg) scale(1)', opacity: '1' },
        },
        chipFly: {
          '0%': { transform: 'translate(0, 0) scale(1)', opacity: '1' },
          '50%': { transform: 'translate(var(--tx), var(--ty)) scale(1.5)', opacity: '0.8' },
          '100%': { transform: 'translate(var(--tx), var(--ty)) scale(0.8)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-primary': '0 0 30px rgba(0, 212, 170, 0.3), 0 0 60px rgba(0, 212, 170, 0.1)',
        'glow-danger': '0 0 30px rgba(239, 68, 68, 0.3), 0 0 60px rgba(239, 68, 68, 0.1)',
        'glow-card': '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 212, 170, 0.1)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'gradient-card': 'linear-gradient(145deg, #0f0f17 0%, #14141f 100%)',
        'gradient-shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
        'mesh-gradient': 'radial-gradient(ellipse at 20% 20%, rgba(0, 212, 170, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0.5) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}