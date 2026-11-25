/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-alt': 'var(--bg-alt)',
        'bg-deep': 'var(--bg-deep)',
        'bg-space': 'var(--bg-space)',
        sky: 'var(--sky)',
        'sky-deep': 'var(--sky-deep)',
        'sky-ink': 'var(--sky-ink)',
        amc: 'var(--amc)',
        'amc-2': 'var(--amc-2)',
        navy: 'var(--navy)',
        ink: 'var(--ink)',
        body: 'var(--body)',
        line: 'var(--line)',
        sale: 'var(--sale)',
        'sale-ink': 'var(--sale-ink)',
        wa: 'var(--wa)',
        'wa-ink': 'var(--wa-ink)',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        card: '24px',
        panel: '20px',
        logo: '14px',
      },
      boxShadow: {
        amc: '0 20px 60px rgba(26, 54, 255, 0.08)',
        'amc-hover': '0 28px 72px rgba(26, 54, 255, 0.14)',
      },
      maxWidth: {
        amc: '1280px',
      },
    },
  },
  plugins: [],
};
