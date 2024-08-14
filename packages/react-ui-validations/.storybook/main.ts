import type { StorybookConfig } from '@storybook/react-webpack5';

const isDocsEnv = Boolean(process.env.STORYBOOK_REACT_UI_VALIDATIONS_DOCS);

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.tsx', '../stories/**/*.mdx'],
  docs: {
    docsMode: isDocsEnv,
  },
  addons: [
    'creevey',
    'storybook-addon-multiselect',
    '@storybook/blocks',
    '@storybook/addon-docs',
    {
      name: '@storybook/addon-essentials',
      options: {
        docsMode: true,
      },
    },
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {
      fastRefresh: true,
      strictMode: true,
    },
  },
};

export default config;
