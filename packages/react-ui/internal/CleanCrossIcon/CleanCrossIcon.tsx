import React, { AriaAttributes } from 'react';
import { globalObject } from '@skbkontur/global-object';

import { cx } from '../../lib/theming/Emotion';
import { keyListener } from '../../lib/events/keyListener';
import { ThemeContext } from '../../lib/theming/ThemeContext';
import { CommonWrapper, CommonProps } from '../CommonWrapper';
import { SizeProp } from '../../lib/types/props';
import { TokenSize } from '../../components/Token';
import { ThemeFactory } from '../../lib/theming/ThemeFactory';

import { styles } from './CleanCrossIcon.styles';
import { CrossIcon } from './CrossIcon';

export interface CleanCrossIconProps
  extends Pick<AriaAttributes, 'aria-label'>,
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    CommonProps {
  /** Ширина и высота иконки крестика
   * @default small */
  size?: SizeProp;
}

export const CleanCrossIcon: React.FunctionComponent<CleanCrossIconProps> = ({ size = 'small', style, ...rest }) => {
  const _theme = React.useContext(ThemeContext);
  const theme = ThemeFactory.create(
    {
      cleanCrossIconColor: _theme.cleanCrossIconColor,
      cleanCrossIconHoverColor: _theme.cleanCrossIconHoverColor,
    },
    _theme,
  );
  const getSizeClassName = (size: TokenSize) => {
    switch (size) {
      case 'large':
        return styles.cleanCrossLarge(theme);
      case 'medium':
        return styles.cleanCrossMedium(theme);
      case 'small':
      default:
        return styles.cleanCrossSmall(theme);
    }
  };

  const [focusedByTab, setFocusedByTab] = React.useState(false);

  const handleFocus = () => {
    setFocusedByTab(true);
    // focus event fires before keyDown eventlistener so we should check tabPressed in async way
    globalObject.requestAnimationFrame?.(() => {
      if (keyListener.isTabPressed) {
        setFocusedByTab(true);
      }
    });
  };
  const handleBlur = () => setFocusedByTab(false);

  const tabIndex = rest.disabled ? -1 : 0;

  return (
    <CommonWrapper {...rest}>
      <button
        tabIndex={tabIndex}
        className={cx(
          styles.root(theme),
          focusedByTab && styles.focus(theme),
          rest.disabled && styles.rootDisabled(theme),
          getSizeClassName(size),
        )}
        style={{ ...style }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      >
        <span className={styles.wrapper()}>
          <CrossIcon size={size} focusable />
        </span>
      </button>
    </CommonWrapper>
  );
};

CleanCrossIcon.__KONTUR_REACT_UI__ = 'CleanCrossIcon';
CleanCrossIcon.displayName = 'CleanCrossIcon';
