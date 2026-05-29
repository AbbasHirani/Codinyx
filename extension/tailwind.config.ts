import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f0f11",
        card: "#1a1a1f",
        border: "#2a2a35",
        primary: "#7c3aed",
        "primary-hover": "#6d28d9",
        muted: "#8b8b99",
        accent: "#a78bfa",
        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
      },
    },
  },
  plugins: [],
} satisfies Config;
