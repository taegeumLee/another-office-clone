import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        slideDown: "slideDown 0.2s ease-out forwards",
      },
      gridTemplateColumns: {
        "4": "repeat(4, minmax(0, 1fr))",
        "6": "repeat(6, minmax(0, 1fr))",
      },
    },
  },
  darkMode: "class",
  plugins: [nextui()],
} satisfies Config;
