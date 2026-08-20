import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed", // primary electric violet
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        cyan: {
          400: "#22d3ee",
          500: "#06b6d4",
        },
        ink: {
          900: "#111114",
          800: "#1c1c22",
          600: "#4b4b57",
          400: "#8b8b98",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f8f7fb",
          border: "#e8e6f0",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(17, 17, 20, 0.04), 0 1px 8px rgba(17, 17, 20, 0.04)",
      },
      borderRadius: {
        xl2: "0.875rem",
      },
    },
  },
  plugins: [],
};

export default config;
