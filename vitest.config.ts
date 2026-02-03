import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    exclude: [
      'node_modules',
      'dist',
      // Phaser 의존 코드는 제외하지만, 순수 로직 테스트는 허용
      // *.test.ts 파일은 include에서 이미 포함됨
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './coverage',
      include: ['src/systems/**/*.ts', 'src/types/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/scenes/**',
        'src/ui/**',
        'src/entities/**',
        'src/main.ts',
        'src/config.ts',
        'src/systems/InputController.ts', // Phaser-dependent, manual testing only
        'src/systems/index.ts', // Re-exports only
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
