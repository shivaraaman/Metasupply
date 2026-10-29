/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05060B",
          900: "#0A0D17",
          800: "#111627",
          700: "#1A2035",
        },
        // Internet Computer brand colours.
        brand: {
          cyan: "#29ABE2",
          violet: "#7C4DFF",
          magenta: "#ED1E79",
          orange: "#F15A24",
          amber: "#FBB03B",
        },
      },
      fontFamily: {
        display: ["Sora", "Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "travel-x": {
          "0%": { left: "0%", opacity: "0" },
          "10%, 90%": { opacity: "1" },
          "100%": { left: "100%", opacity: "0" },
        },
        scan: {
          "0%, 100%": { top: "15%" },
          "50%": { top: "80%" },
        },
        ripple: {
          "0%": { transform: "scale(0.6)", opacity: "0.8" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "gradient-pan": "gradient-pan 8s ease infinite",
        "travel-x": "travel-x 2.4s ease-in-out infinite",
        scan: "scan 2.6s ease-in-out infinite",
        ripple: "ripple 2s ease-out infinite",
        "bounce-soft": "bounce-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
