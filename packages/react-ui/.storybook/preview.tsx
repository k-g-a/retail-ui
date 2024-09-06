import React, { ReactNode } from 'react';
import { setFilter } from '@skbkontur/react-props2attrs';
import { findAmongParents } from '@skbkontur/react-sorge/lib';
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import { Preview } from '@storybook/react';
import { addons } from '@storybook/manager-api';
import { CopyIcon16Regular } from '@skbkontur/icons/icons/CopyIcon/CopyIcon16Regular';
import { ArrowRoundTimeBackIcon16Regular } from '@skbkontur/icons/icons/ArrowRoundTimeBackIcon/ArrowRoundTimeBackIcon16Regular';
import { ArrowCollapseTrianglesVOpenIcon16Regular } from '@skbkontur/icons/icons/ArrowCollapseTrianglesVOpenIcon/ArrowCollapseTrianglesVOpenIcon16Regular';
import SearchIcon from '@skbkontur/react-icons/Search';
import MenuIcon from '@skbkontur/react-icons/Menu';
import HelpDotIcon from '@skbkontur/react-icons/HelpDot';
import { MoneyTypeCoinsIcon } from '@skbkontur/icons/MoneyTypeCoinsIcon';
import { TrashCanIcon } from '@skbkontur/icons/TrashCanIcon';
import { NotificationBellAlarmIcon16Solid } from '@skbkontur/icons/NotificationBellAlarmIcon16Solid';
import { CheckAIcon16Light } from '@skbkontur/icons/icons/CheckAIcon/CheckAIcon16Light';
import OkIcon from '@skbkontur/react-icons/icons/Ok';
import FunctionIcon from '@skbkontur/react-icons/Function';
import * as DatePickerHelpers from '@skbkontur/react-ui/components/DatePicker/DatePickerHelpers';
import { ViewDateInputValidateChecks } from '@skbkontur/react-ui/components/DateInput/ViewDateInputValidateChecks';
import PeopleIcon from '@skbkontur/react-icons/People';

import { isTestEnv } from '../lib/currentEnvironment';
import { ThemeContext } from '../lib/theming/ThemeContext';
import { DEFAULT_THEME } from '../lib/theming/themes/DefaultTheme';
import { DARK_THEME } from '../lib/theming/themes/DarkTheme';
import { DEFAULT_THEME_MOBILE } from '../lib/theming/themes/DefaultThemeMobile';
import { DEFAULT_THEME_8PX_OLD } from '../lib/theming/themes/DefaultTheme8pxOld';
import { FLAT_THEME_8PX_OLD } from '../lib/theming/themes/FlatTheme8pxOld';
import { THEME_2022 } from '../lib/theming/themes/Theme2022';
import { THEME_2022_DARK } from '../lib/theming/themes/Theme2022Dark';
import { ThemeFactory } from '../lib/theming/ThemeFactory';
import * as ReactUi from '../index';
import { XIcon16Regular } from '../internal/icons2022/XIcon/XIcon16Regular';
import { MinusCircleIcon16Light } from '../internal/icons2022/MinusCircleIcon/MinusCircleIcon16Light';

import { LocaleDecorator, toolbarItems } from './decorators/Locale/LocaleDecorator';
import FeatureFlagsDecorator from './decorators/Features/FeatureFlagsDecorator';
import { featureFlagsConfig } from './featureFlagsConfig/featureFlagsConfig';
import { LIVE_EXAMPLES_ADDON_ID, Config as LiveConfig } from './addons/live-examples/config';

const customViewports = {
  iphone: {
    name: 'Iphone',
    styles: {
      width: '375px',
      height: '667px',
    },
    type: 'mobile',
  },
  iphonePlus: {
    name: 'Iphone Plus',
    styles: {
      width: '414px',
      height: '736px',
    },
    type: 'mobile',
  },
};

const themes = {
  DEFAULT_THEME,
  DARK_THEME,
  DEFAULT_THEME_8PX_OLD,
  FLAT_THEME_8PX_OLD,
  DEFAULT_THEME_MOBILE,
  THEME_2022,
  THEME_2022_DARK,
};

setFilter((fiber) => {
  // Транслируем все пропы только для контролов
  const isControlComponent = !!findAmongParents(
    fiber,
    (fiberParent) => fiberParent.type && typeof fiberParent.type.__KONTUR_REACT_UI__ === 'string',
  );
  if (isTestEnv && isControlComponent) {
    return null;
  }
  // Для остальных компонентов ограничиваемся тестовыми идентификаторами
  return ['data-tid', 'data-testid'];
});

const MOBILE_REGEXP = /Mobile.*/i;
const preview: Preview = {
  parameters: {
    docs: {
      toc: {
        title: 'Содержание',
        headingSelector: 'h2, h3, h4', // может еще что-то включить
      },
    },
    creevey: {
      captureElement: '#test-element',
      skip: {
        'not flat stories in flat browsers': {
          in: ['chromeFlat8px', 'firefoxFlat8px', 'ie11Flat8px'],
          kinds:
            /^(?!\bAction\\Button\b|\bChoose\\Checkbox\b|\bInputElements\\Input\b|\bChoose\\Radio\b|\bInputElements\\Textarea\b|\bChoose\\Toggle\b|\bChoose\\Switcher\b|\bInputElements\\TokenInput\b)/,
        },
        'not mobile stories in mobile browser': { in: MOBILE_REGEXP, stories: /^((?!Mobile).)*$/i },
        'mobile stories in not mobile browsers': { stories: MOBILE_REGEXP, in: /^((?!Mobile).)*$/i },
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Versions', '*'],
      },
    },
    viewport: {
      viewports: { ...MINIMAL_VIEWPORTS, ...customViewports },
    },
    multiselect: featureFlagsConfig,
  },
  decorators: [
    (Story, context) => {
      const storybookTheme = themes[context.globals.theme] || DEFAULT_THEME;

      if ([DARK_THEME, THEME_2022_DARK].includes(storybookTheme)) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
      if (storybookTheme !== DEFAULT_THEME) {
        return (
          <ThemeContext.Consumer>
            {(theme) => {
              return (
                <ThemeContext.Provider value={ThemeFactory.create(theme, storybookTheme)}>
                  <Story />
                </ThemeContext.Provider>
              );
            }}
          </ThemeContext.Consumer>
        );
      }
      return <Story />;
    },
    (Story) => (
      <div id="test-element" style={{ display: 'inline-block', padding: 4 }}>
        <Story />
      </div>
    ),
    (Story) => {
      return (
        <ThemeContext.Consumer>
          {(theme) => {
            return (
              <ThemeContext.Provider
                value={ThemeFactory.create(
                  {
                    mobileMediaQuery: '(max-width: 576px)',
                  },
                  theme,
                )}
              >
                <Story />
              </ThemeContext.Provider>
            );
          }}
        </ThemeContext.Consumer>
      );
    },
    LocaleDecorator,
    FeatureFlagsDecorator,
  ],
};

export default preview;

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'React UI Theme',
    defaultValue: 'DEFAULT_THEME',
    toolbar: {
      icon: 'paintbrush',
      items: Object.keys(themes),
      showName: true,
    },
  },
  locale: {
    name: 'Locale',
    description: 'React UI Locale',
    defaultValue: 'ru',
    toolbar: {
      icon: 'globe',
      items: Object.keys(toolbarItems),
      showName: true,
      dynamicTitle: true,
    },
  },
};

if (isTestEnv) {
  import('../lib/styles/HoldSelectionColor');
}

addons.setConfig({
  [LIVE_EXAMPLES_ADDON_ID]: {
    sandboxPath: '/docs/sandbox--docs',
    previewBgColor: '#ffffff',
    scope: {
      ...ReactUi,
      DatePickerHelpers,
      ViewDateInputValidateChecks,
      OkIcon,
      MenuIcon,
      PeopleIcon,
      SearchIcon,
      HelpDotIcon,
      FunctionIcon,
      CopyIcon16Regular,
      TrashCanIcon,
      MoneyTypeCoinsIcon,
      NotificationBellAlarmIcon16Solid,
      CheckAIcon16Light,
      XIcon16Regular,
      MinusCircleIcon16Light,
    },
    fontBase: "'Lab Grotesque', 'Helvetica Neue', Roboto, Arial, sans-serif",
    fontCode: 'Consolas, "Liberation Mono", Menlo, monospace',
    copyIcon: CopyIcon16Regular as unknown as ReactNode,
    expandIcon: ArrowCollapseTrianglesVOpenIcon16Regular as unknown as ReactNode,
    resetIcon: ArrowRoundTimeBackIcon16Regular as unknown as ReactNode,
    borderColor: 'hsla(203, 50%, 30%, 0.15)',
    iconColor: '#029CFD',
  } as LiveConfig,
});
