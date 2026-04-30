import type { Config } from "tailwindcss";

// As animações e keyframes vivem agora em src/styles/globals.css.
// Mantemos só as paletas e fonts aqui — o que faz sentido em utilities.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF8F4",
        ink: "#2E2820",
        "warm-mid": "#9E8E7E",
        "warm-light": "#DDD4C8",
        accent: "#C9A882",
        "section-dark": "#3C3228",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
