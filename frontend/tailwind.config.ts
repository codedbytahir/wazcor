import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
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
        "scanline": "linear-gradient(to bottom, transparent 50%, rgba(57, 255, 20, 0.05) 50%)",
      },
      boxShadow: {
        'neon-glow': '0 0 10px rgba(57, 255, 20, 0.4)',
        'neon-glow-strong': '0 0 20px rgba(57, 255, 20, 0.6)',
        'cyan-glow': '0 0 10px rgba(51, 246, 255, 0.4)',
        'danger-glow': '0 0 10px rgba(255, 77, 109, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 0.15s infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        scanline: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100vh)' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
