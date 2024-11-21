import { DocsContext } from '@storybook/blocks';
import type { ModuleExports } from '@storybook/types';
import React, { useContext } from 'react';
import { FlagAIcon16Light } from '@skbkontur/icons/icons/FlagAIcon/FlagAIcon16Light';
import { LocationGlobeIcon16Light } from '@skbkontur/icons/icons/LocationGlobeIcon/LocationGlobeIcon16Light';
import { WeatherMoonIcon16Light } from '@skbkontur/icons/icons/WeatherMoonIcon/WeatherMoonIcon16Light';
import { WeatherSunIcon16Light } from '@skbkontur/icons/icons/WeatherSunIcon/WeatherSunIcon16Light';
import { WeatherSunMoonIcon16Light } from '@skbkontur/icons/icons/WeatherSunMoonIcon/WeatherSunMoonIcon16Light';

import { DropdownMenu } from '../../DropdownMenu';
import { MenuItem } from '../../MenuItem';
import { Toggle } from '../../Toggle';
import { css } from '../../../lib/theming/Emotion';
import { reactUIFeatureFlagsDefault } from '../../../lib/featureFlagsContext';

const languages = [
  { icon: '🇷🇺', caption: 'Russian', value: 'ru-RU' },
  { icon: '🇬🇧', caption: 'English', value: 'en-EN' },
];

const themes = [
  { icon: <WeatherSunIcon16Light />, caption: 'Light', value: 'LIGHT_THEME' },
  { icon: <WeatherMoonIcon16Light />, caption: 'Dark', value: 'DARK_THEME' },
  { icon: <WeatherSunIcon16Light />, caption: 'Light 2022', value: 'LIGHT_THEME_2022_0' },
  { icon: <WeatherMoonIcon16Light />, caption: 'Dark 2022', value: 'DARK_THEME_2022_0' },
];

const featureFlags = Object.entries(reactUIFeatureFlagsDefault);

const styles = {
  menuWrap: css`
    height: 20px;
  `,
  menu: css`
    position: fixed;
    display: flex;
    gap: 8px;
    padding: 4px 16px;
    align-items: center;
    width: 100%;
    top: 0;
    left: 0;
    background: white;
    border-bottom: 1px solid #e0e6ea;
    z-index: 1;
    font-size: 11px;
  `,
  menuSelect: css`
    color: #73818c;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;

    &:hover {
      background: rgba(0, 0, 0, 0.06);
    }

    &:active {
      background: rgba(0, 0, 0, 0.1);
    }
  `,
  menuComment: css`
    position: relative;
    font-size: 10px;
    margin-top: -4px;
  `,
  menuIcon: css`
    position: absolute;
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    font-size: 16px;
  `,
  menuContuer: css`
    display: inline-block;
    background: #3d3d3d;
    font-size: 10px !important;
    color: white;
    position: relative;
    top: -0.5px;
    margin-left: 4px !important;
    vertical-align: middle;
    border-radius: 50%;
    line-height: 11px;
    padding: 2px 4px 1px;
    font-weight: 600;
  `,
};

export const Meta = ({ of }: { of: ModuleExports }) => {
  const context = useContext(DocsContext);

  if (of) {
    context.referenceMeta(of, true);
  }

  return (
    <div className={styles.menuWrap}>
      <div className={styles.menu}>
        {/* TODO: Брать значение из globals */}
        <DropdownMenu
          caption={
            <div className={styles.menuSelect}>
              <WeatherSunMoonIcon16Light /> Light
            </div>
          }
        >
          {themes.map(({ icon, caption, value }) => (
            <MenuItem
              comment={<div className={styles.menuComment}>{value}</div>}
              onClick={() => context.channel.emit('updateGlobals', { globals: { theme: value } })}
            >
              <div style={{ minWidth: 150 }}>
                {caption} <div className={styles.menuIcon}>{icon}</div>
              </div>
            </MenuItem>
          ))}
        </DropdownMenu>

        {/* TODO: Брать значение из globals */}
        <DropdownMenu
          caption={
            <div className={styles.menuSelect}>
              <LocationGlobeIcon16Light /> Russian
            </div>
          }
        >
          {languages.map(({ icon, caption, value }) => (
            <MenuItem
              comment={<div className={styles.menuComment}>{value}</div>}
              onClick={() => context.channel.emit('updateGlobals', { globals: { locale: value } })}
            >
              <div style={{ minWidth: 150 }}>
                {caption} <div className={styles.menuIcon}>{icon}</div>
              </div>
            </MenuItem>
          ))}
        </DropdownMenu>

        <DropdownMenu
          caption={
            <div className={styles.menuSelect}>
              {/* TODO: Брать значение из контекста */}
              {/* TODO: Скрывать счётчик, если не выбрано */}
              <FlagAIcon16Light /> Feature flags <span className={styles.menuContuer}>1</span>
            </div>
          }
        >
          {featureFlags.map(([flag, value]) => (
            <MenuItem onClick={(e) => e.preventDefault()}>
              <Toggle
                checked={value}
                // TODO: прокидывание контекста
                onValueChange={console.log}
              >
                {flag}
              </Toggle>
            </MenuItem>
          ))}
        </DropdownMenu>
      </div>
    </div>
  );
};
