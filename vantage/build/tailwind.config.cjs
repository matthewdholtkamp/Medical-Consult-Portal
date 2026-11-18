// Builds vantage/widget/src/medcon/styles/portal.css (Vantage can't load Tailwind from a CDN).
module.exports = {
  content: ["../widget/src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gemini: {
          900: "#0b0f19",
          800: "#13161f",
          700: "#1e2330",
          600: "#2d3342",
          accent: "#3b82f6",
        },
      },
    },
  },
  plugins: [],
};
