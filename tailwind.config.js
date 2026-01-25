/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#aaff00",
                "accent-violet": "#A300FF",
                "accent-pink": "#FF33CC",
                "background-light": "#f2f2f3",
                "background-dark": "#242428",
            },
            fontFamily: {
                display: ["Space Grotesk", "sans-serif"],
                body: ["Space Grotesk", "sans-serif"],
                mono: ["JetBrains Mono", "monospace"],
            },
            borderRadius: {
                DEFAULT: "1rem",
                lg: "2rem",
                xl: "3rem",
                full: "9999px",
            },
            animation: {
                float: "float 10s ease-in-out infinite",
                "float-delayed": "float 15s ease-in-out infinite reverse",
                "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
                "rainbow-shift": "rainbow-shift 3s linear infinite",
                "shine": "shine 5s linear infinite",
            },
            keyframes: {
                float: {
                    "0%,100%": { transform: "translate(0,0) rotate(0deg)" },
                    "33%": { transform: "translate(30px,-50px) rotate(10deg)" },
                    "66%": { transform: "translate(-20px,20px) rotate(-5deg)" },
                },
                "rainbow-shift": {
                    "to": { "background-position": "200% center" }
                },
                shine: {
                    "to": { "background-position": "200% center" }
                }
            },
        },
    },
    plugins: [],
}
