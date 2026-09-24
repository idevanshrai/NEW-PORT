/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0d0d0b',        // page
        char: '#161614',       // raised surface
        line: '#2a2a26',       // hairlines
        paper: '#ecebe4',      // primary text
        mute: '#8b8a80',       // secondary text
        lime: '#c8ff2e',       // the one accent
      },
      fontFamily: {
        display: ['"Archivo Variable"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Inter Tight Variable"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono Variable"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.055em',
      },
      maxWidth: {
        page: '1440px',
      },
      keyframes: {
        marquee: { to: { transform: 'translateX(-100%)' } },
        fade: { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        fade: 'fade 1.2s ease-out both',
      },
    },
  },
  plugins: [],
};
