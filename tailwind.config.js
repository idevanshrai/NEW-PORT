/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Values live in src/index.css as CSS variables so the light theme can swap them.
        ink: 'rgb(var(--ink) / <alpha-value>)',     // page
        char: 'rgb(var(--char) / <alpha-value>)',   // raised surface
        line: 'rgb(var(--line) / <alpha-value>)',   // hairlines
        paper: 'rgb(var(--paper) / <alpha-value>)', // primary text
        mute: 'rgb(var(--mute) / <alpha-value>)',   // secondary text
        lime: 'rgb(var(--lime) / <alpha-value>)',   // the one accent
        onlime: '#0d0d0b',                          // text on a lime background (both themes)
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
