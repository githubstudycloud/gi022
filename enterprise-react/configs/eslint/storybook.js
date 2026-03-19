import storybookPlugin from 'eslint-plugin-storybook';
import { react } from './react.js';

/** @type {import('eslint').Linter.Config[]} */
export const storybook = [
  ...react,
  {
    files: ['**/*.stories.{ts,tsx}', '**/*.story.{ts,tsx}'],
    plugins: {
      storybook: storybookPlugin,
    },
    rules: {
      'storybook/default-exports': 'error',
      'storybook/no-redundant-story-name': 'warn',
      'storybook/prefer-pascal-case': 'error',
      'storybook/story-exports': 'error',
    },
  },
];

export default storybook;
