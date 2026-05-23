import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050807",
        metal: "#101716",
        panel: "#121c1a",
        "panel-soft": "#182320",
        neon: "#39ff14",
        "neon-soft": "#9cff8a",
        cyan: "#33f6ff",
        text: "#eef8f0",
        muted: "#8fa69a",
        danger: "#ff4d6d",
        warning: "#ffd166",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
} satisfies Config;
