import React from 'react';

import { HTMLProps } from '../../typings/html';
import { ThemeFactory } from '../../lib/theming/ThemeFactory';
import { Popup, PopupProps } from '../../internal/Popup';
import { ComboBoxMenu, ComboBoxMenuProps } from '../../internal/CustomComboBox';
import { Menu } from '../../internal/Menu';
import { Theme } from '../../lib/theming/Theme';
import { ThemeContext } from '../../lib/theming/ThemeContext';
import { TokenSize } from '../Token';

import { TokenInputDataTids, TokenInputMenuAlign, TokenInputProps } from './TokenInput';

export interface TokenInputMenuProps<T> extends ComboBoxMenuProps<T> {
  anchorElement: PopupProps['anchorElement'];
  menuWidth: TokenInputProps<string>['menuWidth'];
  menuAlign: TokenInputMenuAlign;
  /**
   * Позволяет задать `id` выпадающему меню.
   *
   * Это может пригодиться при реализации a11y. Например, для того, чтобы связать `aria-controls` с выпадающим меню.
   */
  popupMenuId?: HTMLProps['id'];
  size?: TokenSize;
  /**
   * Отключает использование портала
   */
  disablePortal?: boolean;
}

export class TokenInputMenu<T = string> extends React.Component<TokenInputMenuProps<T>> {
  public static __KONTUR_REACT_UI__ = 'TokenInputMenu';
  public static displayName = 'TokenInputMenu';

  private theme!: Theme;

  private menu: Menu | null = null;

  public render() {
    return (
      <ThemeContext.Consumer>
        {(theme) => {
          this.theme = theme;
          return (
            <ThemeContext.Provider
              value={ThemeFactory.create(
                {
                  popupMargin: this.getPopupMargin() + 'px',
                  popupBackground: this.theme.tokenInputMenuPopupBg,
                },
                theme,
              )}
            >
              {this.renderMain()}
            </ThemeContext.Provider>
          );
        }}
      </ThemeContext.Consumer>
    );
  }

  public getMenuRef = (): any | null => this.menu;

  private getPopupMarginSize(t: Theme) {
    switch (this.props.size) {
      case 'large':
        return t.tokenInputPopupMarginLarge;
      case 'medium':
        return t.tokenInputPopupMarginMedium;
      case 'small':
      default:
        return t.tokenInputPopupMarginSmall;
    }
  }

  private renderMain() {
    const {
      loading,
      maxMenuHeight,
      renderTotalCount,
      totalCount,
      opened,
      items,
      renderNotFound,
      renderItem,
      onValueChange,
      renderAddButton,
      anchorElement,
      menuWidth,
      menuAlign,
    } = this.props;

    return (
      <Popup
        id={this.props.popupMenuId}
        data-tid={TokenInputDataTids.tokenInputMenu}
        disablePortal={this.props.disablePortal}
        opened={!!opened}
        positions={['bottom left', 'top left']}
        anchorElement={anchorElement}
        popupOffset={
          menuAlign === 'left'
            ? parseInt(this.theme.tokenInputPopupOffset)
            : 8 + parseInt(this.theme.tokenInputPopupOffset)
        }
        margin={menuAlign === 'left' ? 1 : parseInt(this.getPopupMarginSize(this.theme))}
        hasShadow
        width={menuAlign === 'cursor' ? 'auto' : menuWidth}
        withoutMobile
      >
        <ComboBoxMenu
          items={items}
          loading={loading}
          maxMenuHeight={maxMenuHeight}
          onValueChange={onValueChange}
          opened={opened}
          refMenu={this.menuRef}
          renderTotalCount={renderTotalCount}
          renderItem={renderItem}
          renderNotFound={renderNotFound}
          totalCount={totalCount}
          renderAddButton={renderAddButton}
        />
      </Popup>
    );
  }

  private getPopupMargin = (): number => {
    const paddingY = parseInt(this.theme.tokenInputPaddingY, 10) || 0;
    const outlineWidth = parseInt(this.theme.controlOutlineWidth, 10) || 0;
    const marginY = parseInt(this.theme.tokenMarginY, 10) || 0;

    return paddingY + outlineWidth + marginY;
  };

  private menuRef = (node: any) => (this.menu = node);
}
