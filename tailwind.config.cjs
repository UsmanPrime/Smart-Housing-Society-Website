module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'ng-blue': '#0b1a4a',
        'ng-light': '#c3c5ce',
        'ng-accent': '#12265a'
      }
    }
  },
  plugins: [],
  corePlugins: {
    preflight: true
  },
  safelist: [
    'animate-spin',
    'rounded-full',
    'h-12',
    'w-12',
    'border-t-2',
    'border-b-2'
  ]
}
