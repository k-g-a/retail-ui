import type { StorybookConfig } from '@storybook/react-webpack5';

console.log('main', process.cwd());

const config: StorybookConfig = {
  stories: [
    {
      directory: process.cwd(),
      // 👇 Storybook will load all files that match this glob
      files: '**/*.docs.stories.*',
    },
    {
      directory: process.cwd(),
      // 👇 Storybook will load all files that match this glob
      files: '**/*.mdx',
    },
  ],
  docs: {
    docsMode: true,
  },
  addons: [
    {
      name: '@storybook/addon-essentials',
      options: {
        docsMode: true,
      },
    },
    '@skbkontur/storybook-addon-live-examples',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {
      legacyRootApi: false,
    },
  },
  core: {
    disableWhatsNewNotifications: true,
    disableTelemetry: true,
  },
};
export default config;
