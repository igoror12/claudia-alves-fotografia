import type { Config } from "tailwindcss";

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
        serif: ['"Cormorant Garamond"', "serif"],
        sans: ['"Figtree"', "system-ui", "sans-serif"],
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.8s cubic-bezier(0.4,0,0.2,1) forwards",
        fadeIn: "fadeIn 1s ease forwards",
        marquee: "marquee 20s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
