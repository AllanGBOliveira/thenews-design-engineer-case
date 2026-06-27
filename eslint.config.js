import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from '@eslint-react/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
  {
    ignores: [
      'build/',
      '.react-router/',
      'node_modules/',
      'untrack/',
      'eslint.config.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...reactPlugin.configs.recommended,
    plugins: {
      ...reactPlugin.configs.recommended.plugins,
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
)
