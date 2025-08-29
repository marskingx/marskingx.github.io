const fs = require("fs");
const path = require("path");

// Read theme configuration
const themePath = path.join(__dirname, "data/theme.json");
let theme = {
  fonts: {
    font_size: {
      base: "16px",
      scale: 1.25
    },
    font_family: {
      primary: "Inter",
      primary_type: "sans-serif",
      secondary: "Inter", 
      secondary_type: "sans-serif"
    }
  },
  colors: {
    default: {
      text_color: {
        default: "#334155",
        light: "#64748b",
        dark: "#0f172a"
      },
      theme_color: {
        primary: "#2563eb",
        secondary: "#475569",
        body: "#f8fafc",
        border: "#e2e8f0",
        theme_light: "#f1f5f9",
        theme_dark: "#1e293b"
      }
    },
    darkmode: {
      text_color: {
        default: "#e2e8f0",
        light: "#94a3b8",
        dark: "#f1f5f9"
      },
      theme_color: {
        primary: "#60a5fa",
        secondary: "#64748b",
        body: "#0f172a",
        border: "#334155",
        theme_light: "#1e293b",
        theme_dark: "#0f172a"
      }
    }
  }
};

// Read theme.json if it exists
if (fs.existsSync(themePath)) {
  const themeRead = fs.readFileSync(themePath, "utf8");
  theme = JSON.parse(themeRead);
}

const font_base = Number(theme.fonts.font_size.base.replace("px", ""));
const font_scale = Number(theme.fonts.font_size.scale);
const h6 = font_scale;
const h5 = h6 * font_scale;
const h4 = h5 * font_scale;
const h3 = h4 * font_scale;
const h2 = h3 * font_scale;
const h1 = h2 * font_scale;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./layouts/**/*.html",
    "./content/**/*.md",
    "./themes/hugoplate/layouts/**/*.html",
    "./assets/js/**/*.js",
    "./static/**/*.js"
  ],
  safelist: [{ pattern: /^swiper-/ }],
  darkMode: "class",
  theme: {
    screens: {
      sm: "540px",
      md: "768px", 
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      colors: {
        text: theme.colors.default.text_color.default,
        light: theme.colors.default.text_color.light,
        dark: theme.colors.default.text_color.dark,
        primary: theme.colors.default.theme_color.primary,
        secondary: theme.colors.default.theme_color.secondary,
        body: theme.colors.default.theme_color.body,
        border: theme.colors.default.theme_color.border,
        "theme-light": theme.colors.default.theme_color.theme_light,
        "theme-dark": theme.colors.default.theme_color.theme_dark,
        darkmode: {
          text: theme.colors.darkmode.text_color.default,
          light: theme.colors.darkmode.text_color.light,
          dark: theme.colors.darkmode.text_color.dark,
          primary: theme.colors.darkmode.theme_color.primary,
          secondary: theme.colors.darkmode.theme_color.secondary,
          body: theme.colors.darkmode.theme_color.body,
          border: theme.colors.darkmode.theme_color.border,
          "theme-light": theme.colors.darkmode.theme_color.theme_light,
          "theme-dark": theme.colors.darkmode.theme_color.theme_dark,
        },
      },
      fontSize: {
        base: font_base + "px",
        "base-sm": font_base * 0.8 + "px",
        h1: h1 + "rem",
        "h1-sm": h1 * 0.9 + "rem",
        h2: h2 + "rem",
        "h2-sm": h2 * 0.9 + "rem", 
        h3: h3 + "rem",
        "h3-sm": h3 * 0.9 + "rem",
        h4: h4 + "rem",
        h5: h5 + "rem",
        h6: h6 + "rem",
      },
      fontFamily: {
        primary: [theme.fonts.font_family.primary, theme.fonts.font_family.primary_type],
        secondary: [theme.fonts.font_family.secondary, theme.fonts.font_family.secondary_type],
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("tailwind-bootstrap-grid")({
      generateContainer: false,
      gridGutterWidth: "2rem",
      gridGutters: {
        1: "0.25rem",
        2: "0.5rem", 
        3: "1rem",
        4: "1.5rem",
        5: "3rem",
      },
    }),
  ],
};