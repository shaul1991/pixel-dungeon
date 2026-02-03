import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    exclude: [
      'node_modules',
      'dist',
      'src/scenes/**',
      'src/ui/**',
      'src/entities/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './coverage',
      include: ['src/systems/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/scenes/**',
        'src/ui/**',
        'src/entities/**',
        'src/main.ts',
        'src/config.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
