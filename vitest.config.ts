import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    workspace: ['packages/*'],
    environment: 'node',
    reporters: ['default', 'html'],
    outputFile: { html: './reports/index.html' },

    coverage: {
      enabled: true,
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['packages/*/src/**/*.{ts,js}'],
    },
  },
});
