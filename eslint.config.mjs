import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'plugin:jsx-a11y/recommended'),
  { rules: { '@typescript-eslint/no-explicit-any': 'error' } },
  // Hanya AI Gateway yang boleh mengimpor SDK provider; hanya lib/db yang menyentuh DB.
  { ignores: ['.next/**', 'node_modules/**'] },
];

export default config;
