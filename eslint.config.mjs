import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import react from 'eslint-plugin-react';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'next.config.mjs',
      'eslint.config.mjs',
      'stylelint.config.js',
      'postcss.config.js',
      '.lintstagedrc.js',
      'public/**',
    ],
  },
  ...nextVitals,
  js.configs.recommended,
  react.configs.flat.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'react/react-in-jsx-scope': 'off', // import React from 'react' 안해도 되게 만들어줌.
      'simple-import-sort/imports': 'error', // import 구문 순서 엉망이면 에러 냄.
      'simple-import-sort/exports': 'error', // export 구문도 순서 엉망이면 에러 냄.
      '@typescript-eslint/no-unused-vars': 'error', // 안 쓰는 변수 그대로 두면 에러 냄.
      '@typescript-eslint/no-explicit-any': 'warn', // any 쓰면 경고 냄.
      '@typescript-eslint/no-misused-promises': 'off',
      'no-console': 'error',
      'react-hooks/exhaustive-deps': 'off',
      // typescript-eslint v8에서 새로 기본 활성화된 규칙. `||`→`??` 자동 변환은 ''·0 처리 동작을 바꿀 수 있어
      // 일괄 적용하지 않고 기존(v7) 수준을 유지한다.
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      // eslint-plugin-react-hooks v7(React Compiler 규칙). 기존 코드 26곳이 걸려 경고로 낮춰 두고
      // effect 리팩터링은 별도 작업으로 처리한다.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],
    },
  }
);
