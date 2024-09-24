import React, { ReactNode, useContext } from 'react';

import { ThemeContext } from '../../lib/theming/ThemeContext';
import { CommonProps, CommonWrapper } from '../../internal/CommonWrapper';
import { cx } from '../../lib/theming/Emotion';
import { SizeProp } from '../../lib/types/props';

import { styles } from './MenuFooter.styles';

/**
 * @deprecated use SizeProp
 */
export type MenuFooterSize = SizeProp;

export interface MenuFooterProps extends CommonProps {
  /** Добавляет отступ иконке. */
  _enableIconPadding?: boolean;

  /** @ignore */
  children: ReactNode;

  /** Задает размер. */
  size?: SizeProp;
}

export const MenuFooterDataTids = {
  root: 'MenuFooter__root',
} as const;

/**
 * Футер меню `MenuFooter`.
 *
 * `MenuFooter`, в отличие от `MenuItem` нельзя затаргетить с клавиатуры.
 *
 * Сущности, в которых может быть использован `MenuFooter`: [DropdownMenu](?path=/docs/menu-dropdownmenu--docs), [Kebab](?path=/docs/menu-kebab--docs), [TooltipMenu](?path=/docs/menu-tooltipmenu--docs) и [Select](?path=/docs/input-data-select--docs).
 */
function MenuFooter({ _enableIconPadding = false, children, size = 'small', ...rest }: MenuFooterProps) {
  const theme = useContext(ThemeContext);

  function getRootSizeClassName() {
    switch (size) {
      case 'large':
        return styles.rootLarge(theme);
      case 'medium':
        return styles.rootMedium(theme);
      case 'small':
      default:
        return styles.rootSmall(theme);
    }
  }
  function getWithLeftPaddingSizeClassName() {
    switch (size) {
      case 'large':
        return styles.withLeftPaddingSmall(theme);
      case 'medium':
        return styles.withLeftPaddingMedium(theme);
      case 'small':
      default:
        return styles.withLeftPaddingSmall(theme);
    }
  }

  return (
    <CommonWrapper {...rest}>
      <div
        data-tid={MenuFooterDataTids.root}
        className={cx(getRootSizeClassName(), {
          [styles.root(theme)]: true,
          [getWithLeftPaddingSizeClassName()]: _enableIconPadding,
        })}
      >
        {children}
      </div>
    </CommonWrapper>
  );
}

MenuFooter.__KONTUR_REACT_UI__ = 'MenuFooter';
MenuFooter.displayName = 'MenuFooter';
MenuFooter.__MENU_FOOTER__ = true;

export { MenuFooter };

export const isMenuFooter = (child: React.ReactNode): child is React.ReactElement<MenuFooterProps> => {
  return React.isValidElement<MenuFooterProps>(child)
    ? Object.prototype.hasOwnProperty.call(child.type, '__MENU_FOOTER__')
    : false;
};
