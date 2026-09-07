import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F5F6F8",
        ink: "#12161F",
        border: "#E3E6EC",
        sidebar: {
          DEFAULT: "#0F1522",
          foreground: "#E7EAF2",
          muted: "#8792A8",
          active: "#182338",
        },
        brand: {
          DEFAULT: "#2451B0",
          foreground: "#FFFFFF",
          soft: "#E7EEFC",
        },
        status: {
          online: "#0E9F6E",
          warning: "#D97706",
          offline: "#DC2626",
          maintenance: "#7C5CFC",
        },
      },
      fontFamily: {
        // "Plus Jakarta Sans" / "IBM Plex Mono" dipakai kalau tersedia di sistem
        // pengguna, dengan fallback aman kalau tidak — tidak bergantung pada fetch
        // Google Fonts saat build.
        sans: [
          '"Plus Jakarta Sans"',
          '"Segoe UI"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          '"IBM Plex Mono"',
          '"SFMono-Regular"',
          "ui-monospace",
          "Menlo",
          "monospace",
        ],
      },
      borderRadius: {
        xl: "0.875rem",
      },
    },
  },
  plugins: [],
};

export default config;
