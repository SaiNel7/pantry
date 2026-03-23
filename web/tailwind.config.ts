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
    },
  },
  plugins: [],
};
export default config;
