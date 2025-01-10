// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
// TODO add   prettier.rules.recommended,

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
        parserOptions: {
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
        },
      },
//     rules: {
//       '@typescript-eslint/interface-name-prefix': 'off',
//       '@typescript-eslint/explicit-function-return-type': 'off',
//       '@typescript-eslint/explicit-module-boundary-types': 'off',
//       '@typescript-eslint/no-explicit-any': 'off',
//   }
}

);

// export default tseslint.config(
//     // languageOptions: {
//     //     parser: '@typescript-eslint/parser',
//     //     parserOptions: {
//     //         project: 'tsconfig.json',
//     //         tsconfigRootDir: import.meta.dirname,
//     //         sourceType: 'module',
//     //       },
//     // },
//     plugins: ['@typescript-eslint/eslint-plugin'],
//     extends: [
//       'plugin:@typescript-eslint/recommended',
//       'plugin:prettier/recommended',
//     ],
//     root: true,
//     env: {
//       node: true,
//       jest: true,
//     },
//     ignorePatterns: ['.eslintrc.js'],
//     rules: {
//       '@typescript-eslint/interface-name-prefix': 'off',
//       '@typescript-eslint/explicit-function-return-type': 'off',
//       '@typescript-eslint/explicit-module-boundary-types': 'off',
//       '@typescript-eslint/no-explicit-any': 'off',
//     },
// );
  