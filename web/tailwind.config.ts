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
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
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
