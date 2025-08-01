import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

import base from "./base";

export default {
  content: base.content,
  presets: [base],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    colors: {
      brand: {
        50: "#EDFAE1",
        100: "#DEF5C6",
        200: "#BDEC8E",
        300: "#9CE255",
        400: "#7AD124",
        500: "#59981A",
        600: "#477A15",
        700: "#365B10",
        800: "#243D0A",
        900: "#121E05",
        950: "#080D02",
      },
      background: {
        DEFAULT: "var(--background)",
        secondary: "var(--background-secondary)",
      },
    },
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
