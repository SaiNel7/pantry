import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "color-1": "hsl(var(--color-1))",
        "color-2": "hsl(var(--color-2))",
        "color-3": "hsl(var(--color-3))",
        "color-4": "hsl(var(--color-4))",
        "color-5": "hsl(var(--color-5))",
        cream: "#F7F5F0",
        forest: "#2D6A4F",
        "forest-light": "#3D7A5F",
        "forest-pale": "#EBF4EF",
        "forest-dark": "#1E4D38",
        terra: "#C1440E",
        "terra-light": "#E8572A",
        "terra-pale": "#FEF0EA",
        bark: "#1A2E1A",
        "bark-muted": "#5A6B5A",
        sage: "#74A97A",
        "sage-light": "#A8CBA0",
        "sage-pale": "#EDF5EE",
        parchment: "#E8E2D4",
        // Dark theme (MISE)
        void: "#000000",
        surface: "#1a1a1a",
        "surface-2": "#242424",
        "surface-3": "#2e2e2e",
        muted: "#6b6b6b",
        "muted-2": "#4a4a4a",
        orange: "#E8572A",
        "orange-dim": "#b8441f",
      },
      fontFamily: {
        serif: ["-apple-system", "BlinkMacSystemFont", '"SF Pro Display"', '"SF Pro Text"', "system-ui", "sans-serif"],
        sans: ["-apple-system", "BlinkMacSystemFont", '"SF Pro Display"', '"SF Pro Text"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 2px 16px 0 rgba(26,46,26,0.08)",
        "card-lg": "0 8px 32px 0 rgba(26,46,26,0.12)",
        float: "0 4px 24px 0 rgba(26,46,26,0.14)",
      },
      keyframes: {
        "gradient-border": {
          "0%, 100%": { borderRadius: "37% 29% 27% 27% / 28% 25% 41% 37%" },
          "25%": { borderRadius: "47% 29% 39% 49% / 61% 19% 66% 26%" },
          "50%": { borderRadius: "57% 23% 47% 72% / 63% 17% 66% 33%" },
          "75%": { borderRadius: "28% 49% 29% 100% / 93% 20% 64% 25%" },
        },
        "gradient-1": {
          "0%, 100%": { top: "0", right: "0" },
          "50%": { top: "50%", right: "25%" },
          "75%": { top: "25%", right: "50%" },
        },
        "gradient-2": {
          "0%, 100%": { top: "0", left: "0" },
          "60%": { top: "75%", left: "25%" },
          "85%": { top: "50%", left: "50%" },
        },
        "gradient-3": {
          "0%, 100%": { bottom: "0", left: "0" },
          "40%": { bottom: "50%", left: "25%" },
          "65%": { bottom: "25%", left: "50%" },
        },
        "gradient-4": {
          "0%, 100%": { bottom: "0", right: "0" },
          "50%": { bottom: "25%", right: "40%" },
          "90%": { bottom: "50%", right: "25%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
