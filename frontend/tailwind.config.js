/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          DEFAULT: "#39FF14",
          soft: "#7CFF6B",
          dim: "#1FAA0C",
        },
        base: {
          950: "#050706",
          900: "#0A0F0B",
          850: "#0F1712",
          800: "#141F19",
          700: "#1C2921",
        },
      },
      boxShadow: {
        neon: "0 0 12px rgba(57,255,20,0.45), 0 0 2px rgba(57,255,20,0.6)",
        "neon-sm": "0 0 6px rgba(57,255,20,0.35)",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.3 },
        },
        pulseDot: {
          "0%, 100%": { transform: "scale(1)", opacity: 1 },
          "50%": { transform: "scale(1.4)", opacity: 0.6 },
        },
      },
      animation: {
        blink: "blink 1.2s infinite",
        pulseDot: "pulseDot 1.5s infinite",
      },
    },
  },
  daisyui: {
    themes: [
      {
        quickchat: {
          primary: "#39FF14",
          secondary: "#1FAA0C",
          accent: "#7CFF6B",
          neutral: "#141F19",
          "base-100": "#0A0F0B",
          info: "#39FF14",
          success: "#39FF14",
          warning: "#FFD400",
          error: "#FF3B3B",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
