import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        "border-strong": "hsl(var(--border-strong))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        // Light-theme soft shadow ramp, navy-tinted, from the design system
        // foundations. Replaces Tailwind's default gray shadows so cards and
        // surfaces read correctly on the off-white canvas.
        xs: "0 1px 2px rgba(11, 27, 54, 0.05)",
        sm: "0 1px 2px rgba(11, 27, 54, 0.04), 0 1px 3px rgba(11, 27, 54, 0.07)",
        md: "0 2px 4px rgba(11, 27, 54, 0.04), 0 6px 16px -4px rgba(11, 27, 54, 0.1)",
        lg: "0 8px 24px -6px rgba(11, 27, 54, 0.12), 0 2px 6px rgba(11, 27, 54, 0.06)",
        xl: "0 24px 48px -12px rgba(11, 27, 54, 0.18)",
        "card-hover": "0 8px 24px -8px rgba(11, 27, 54, 0.16)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
