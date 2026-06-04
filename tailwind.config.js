/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  // The visualizers ship their own hand-written CSS (assets/styles/visualizers.css).
  // Disable Preflight so Tailwind's reset doesn't override that established look;
  // utilities stay available for the shell.
  corePlugins: { preflight: false },
  theme: { extend: {} },
  plugins: []
}
