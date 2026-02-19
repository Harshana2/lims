/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F4EE',
          100: '#B7E1CC',
          200: '#88CEAA',
          300: '#59BB88',
          400: '#2AA866',
          500: '#088444', // Main green
          600: '#066b36', // Hover green
          700: '#055229',
          800: '#04391C',
          900: '#02200F',
          light: '#E6F4EE', // Light background
          border: '#B7E1CC', // Border tint
          dark: '#088444', // Sidebar dark
          active: '#0AAE5C', // Active menu item
        },
        neutral: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E5E7EB',
          textPrimary: '#111827',
          textSecondary: '#6B7280',
        },
        status: {
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#DC2626',
          info: '#2563EB',
        },
        corporate: {
          blue: '#1e40af',
          gray: '#64748b',
          lightgray: '#f1f5f9',
          darkgray: '#334155',
        },
      },
      borderRadius: {
        'card': '12px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
}
