import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  { ignores: ['node_modules/', 'playwright-report/', 'test-results/', 'blob-report/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Playwright-specific rules apply only to the test files, not the page objects.
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
  },
);
