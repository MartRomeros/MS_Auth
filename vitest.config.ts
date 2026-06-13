import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/tests/**/*.test.ts', 'test/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',  // o 'istanbul'
      reporter: ['html', 'text'],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 80,      // falla si coverage < 80%
        functions: 80,
        branches: 80,
      }
    }
  },
});

