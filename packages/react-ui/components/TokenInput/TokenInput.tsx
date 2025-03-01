import React, {
  AriaAttributes,
  ChangeEvent,
  FocusEvent,
  FocusEventHandler,
  HTMLAttributes,
  KeyboardEvent,
  MouseEventHandler,
  ReactNode,
} from 'react';
import isEqual from 'lodash.isequal';
import { globalObject } from '@skbkontur/global-object';

import { PopupIds } from '../../internal/Popup';
import {
  isKeyArrowHorizontal,
  isKeyArrowLeft,
  isKeyArrowRight,
  isKeyArrowUp,
  isKeyArrowVertical,
  isKeyBackspace,
  isKeyComma,
  isKeyDelete,
  isKeyEnter,
  isKeyEscape,
  isShortcutSelectAll,
} from '../../lib/events/keyboard/identifiers';
import * as LayoutEvents from '../../lib/LayoutEvents';
import { Menu } from '../../internal/Menu';
import { Token, TokenProps, TokenSize } from '../Token';
import { MenuItemState, MenuItem } from '../MenuItem';
import { AnyObject, emptyHandler, getRandomID } from '../../lib/utils';
import { ThemeContext } from '../../lib/theming/ThemeContext';
import { Theme } from '../../lib/theming/Theme';
import { locale } from '../../lib/locale/decorators';
import { CommonProps, CommonWrapper } from '../../internal/CommonWrapper';
import { cx } from '../../lib/theming/Emotion';
import { getRootNode, rootNode, TSetRootNode } from '../../lib/rootNode';
import { createPropsGetter } from '../../lib/createPropsGetter';
import { getUid } from '../../lib/uidUtils';
import { TokenView } from '../Token/TokenView';

import { TokenInputLocale, TokenInputLocaleHelper } from './locale';
import { styles } from './TokenInput.styles';
import { TokenInputAction, tokenInputReducer } from './TokenInputReducer';
import { TokenInputMenu } from './TokenInputMenu';
import { TextWidthHelper } from './TextWidthHelper';

const TEMP_FAKE_FLAG = 'TEMP_FAKE_FLAG';

export enum TokenInputType {
  WithReference,
  WithoutReference,
  Combined,
}

export type TokenInputMenuAlign = 'left' | 'cursor';

export interface TokenInputProps<T>
  extends CommonProps,
    Pick<AriaAttributes, 'aria-describedby' | 'aria-label'>,
    Pick<HTMLAttributes<HTMLElement>, 'id'> {
  /** Задает выбранные токены, которые будут отображаться в поле ввода. */
  selectedItems?: T[];

  /** Задает функцию, которая вызывается при добавлении нового токена. */
  onValueChange?: (items: T[]) => void;

  /** Задает HTML-событие `onmouseenter`.
   * @ignore */
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;

  /** Задает HTML-событие `onmouseleave`.
   * @ignore */
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;

  /** Задает HTML-событие `onfocus`.
   * @ignore */
  onFocus?: FocusEventHandler<HTMLTextAreaElement>;

  /** Задает HTML-событие `onblur`.
   * @ignore */
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;

  /** Устанавливает фокус на контроле после окончания загрузки страницы. */
  autoFocus?: boolean;

  /** Задает размер контрола. */
  size?: TokenSize;

  /** Задает тип инпута.
   * Возможные значения:
   *   `TokenInputType.WithReference` (можно выбирать токены только из предложенных, нельзя добавить новые).
   *   `TokenInputType.WithoutReference` (можно добавлять токены, но нельзя выбирать).
   *   `TokenInputType.Combined` (можно и выбирать, и добавлять). */
  type?: TokenInputType;

  /** Задает ширину выпадающего меню. Может быть 'auto', в пикселях, процентах (от ширины инпута) и других конкретных единицах.
   * Если menuAlign = 'cursor', то ширина выпадающего меню всегда будет равна 'auto' (по ширине текста). */
  menuWidth?: React.CSSProperties['width'];

  /** Задает выравнивание выпадающего меню. */
  menuAlign?: TokenInputMenuAlign;

  /** Задает функцию поиска элементов, должна возвращать Promise с массивом элементов. По умолчанию ожидаются строки.
   * Элементы могут быть любого типа. В таком случае необходимо определить свойства `renderItem`, `valueToString`. */
  getItems?: (query: string) => Promise<T[]>;

  /** Скрывает меню при пустом вводе. */
  hideMenuIfEmptyInputValue?: boolean;

  /** Задает функцию, которая отображает элемент списка. */
  renderItem?: (item: T, state: MenuItemState) => React.ReactNode | null;

  /** Задает функцию, которая отображает выбранное значение. */
  renderValue?: (item: T) => React.ReactNode;

  /** Задает функцию, которая возвращает строковое представление токена.
   * @default item => item */
  valueToString?: (item: T) => string;

  /** Задает функцию, которая отображает сообщение об общем количестве элементов.
   * `found` учитывает только компонент `MenuItem`. Им "оборачиваются" элементы, возвращаемые `getItems()`. */
  renderTotalCount?: (found: number, total: number) => React.ReactNode;

  /** Определяет общее количество элементов. Необходим для работы `renderTotalCount`. */
  totalCount?: number;

  /** Задает функцию, которая отображает заданное содержимое при пустом результате поиска. Не работает, если рендерится `AddButton`. */
  renderNotFound?: () => React.ReactNode;

  /** Преобразует значение в элемент списка. */
  valueToItem?: (item: string) => T;

  /** Определяет уникальный ключ по элементу. */
  toKey?: (item: T) => string | number | undefined;

  /** Задает текст, который отображается если не введено никакое значение. */
  placeholder?: string;

  /** Задает символы, которые разделяют введённый текст на токены. */
  delimiters?: string[];

  /** Переводит контрол в состояние валидации "ошибка". */
  error?: boolean;

  /** Переводит контрол в состояние валидации "предупреждение". */
  warning?: boolean;

  /** Делает компонент недоступным. */
  disabled?: boolean;

  /** Задает ширину токен-инпута. */
  width?: string | number;

  /** Задает максимальную высоту выпадающего меню. */
  maxMenuHeight?: number | string;

  /** Задает функцию, которая отображает токен и предоставляет возможность кастомизации внешнего вида и поведения токена. */
  renderToken?: (item: T, props: Partial<TokenProps>) => ReactNode;

  /** Задает функцию, вызывающуюся при изменении текста в поле ввода. */
  onInputValueChange?: (value: string) => void;

  /** Задает функцию отрисовки кнопки добавления в выпадающем списке */
  renderAddButton?: (query?: string, onAddItem?: () => void) => ReactNode;

  /** Задает функцию для обработки ввода строки в инпут и последующую потерю фокуса компонентом.
   * Функция срабатывает с аргументом инпута строки
   *
   * Если при потере фокуса в выпадающем списке будет только один элемент и  результат `valueToString` с этим элементом будет
   * совпадать со значение в текстовом поле, то сработает `onValueChange` со значением данного элемента
   *
   * Сама функция также может вернуть значение, неравное `undefined`, с которым будет вызван `onValueChange`.
   * При возвращаемом значении `null` будет выполнена очистка текущего значения инпута, а в режиме редактирования токен будет удален. */
  onUnexpectedInput?: (value: string) => void | null | undefined | T;

  /** Задает типы вводимых данных. */
  inputMode?: React.HTMLAttributes<HTMLTextAreaElement>['inputMode'];
}

export interface TokenInputState<T> {
  autocompleteItems?: T[];
  activeTokens: T[];
  editingTokenIndex: number;
  clickedToken?: T;
  clickedTokenTimeout?: number;
  inFocus?: boolean;
  inputValue: string;
  reservedInputValue: string | undefined;
  inputValueWidth: number;
  inputValueHeight: number;
  preventBlur?: boolean;
  loading?: boolean;
}

export const DefaultState = {
  inputValue: '',
  reservedInputValue: undefined,
  autocompleteItems: undefined,
  activeTokens: [],
  editingTokenIndex: -1,
  inFocus: false,
  loading: false,
  preventBlur: false,
  inputValueWidth: 2,
  inputValueHeight: 22,
};

export const TokenInputDataTids = {
  root: 'TokenInput__root',
  tokenInputMenu: 'TokenInputMenu__root',
  label: 'TokenInput__label',
} as const;

type DefaultProps<T> = Required<
  Pick<
    TokenInputProps<T>,
    | 'selectedItems'
    | 'delimiters'
    | 'renderItem'
    | 'renderValue'
    | 'valueToString'
    | 'valueToItem'
    | 'toKey'
    | 'onValueChange'
    | 'width'
    | 'onBlur'
    | 'onFocus'
    | 'onMouseEnter'
    | 'onMouseLeave'
    | 'menuWidth'
    | 'menuAlign'
    | 'size'
  >
>;

const defaultToKey = <T extends AnyObject>(item: T): string => item.toString();
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
const identity = <T extends unknown>(item: T): T => item;
const defaultRenderToken = <T extends AnyObject>(
  item: T,
  { isActive, onClick, onDoubleClick, onRemove, disabled, size }: Partial<TokenProps>,
) => (
  <Token
    key={item.toString()}
    isActive={isActive}
    onClick={onClick}
    onDoubleClick={onDoubleClick}
    onRemove={onRemove}
    disabled={disabled}
    size={size}
  >
    {item.toString()}
  </Token>
);

/**
 * Поле с токенами `TokenInput` — это поле ввода со списком подсказок.
 *
 * Поле с токенами используют для выбора нескольких значений из справочника и для добавления своих значений.
 */
@rootNode
@locale('TokenInput', TokenInputLocaleHelper)
export class TokenInput<T = string> extends React.PureComponent<TokenInputProps<T>, TokenInputState<T>> {
  public static __KONTUR_REACT_UI__ = 'TokenInput';
  public static displayName = 'TokenInput';

  public static defaultProps: DefaultProps<any> = {
    selectedItems: [],
    // TEMP_FAKE_FLAG помогает узнать, остались ли разделители дефолтными или пользователь передал их равными дефолтным.
    delimiters: [',', TEMP_FAKE_FLAG],
    renderItem: identity,
    renderValue: identity,
    valueToString: identity,
    valueToItem: (item: string) => item,
    toKey: defaultToKey,
    onValueChange: () => void 0,
    width: 250 as string | number,
    onBlur: emptyHandler,
    onFocus: emptyHandler,
    onMouseEnter: emptyHandler,
    onMouseLeave: emptyHandler,
    menuWidth: 'auto',
    menuAlign: 'cursor',
    size: 'small',
  };

  private getDelimiters(): string[] {
    const delimiters = this.props.delimiters ?? [];
    if (delimiters.every((delimiter) => delimiter !== TEMP_FAKE_FLAG)) {
      return delimiters;
    }
    return delimiters.filter((delimiter) => delimiter !== TEMP_FAKE_FLAG);
  }

  private getProps() {
    const propsGetter = createPropsGetter(TokenInput.defaultProps);
    const propsWithOldDelimiters = propsGetter.apply(this);
    return { ...propsWithOldDelimiters, delimiters: this.getDelimiters() };
  }

  private get textareaId() {
    return this.props.id ?? this._textareaId;
  }

  public state: TokenInputState<T> = DefaultState;

  private readonly _textareaId: string = getUid();
  private rootId = PopupIds.root + getRandomID();
  private readonly locale!: TokenInputLocale;
  private theme!: Theme;
  private input: HTMLTextAreaElement | null = null;
  private tokensInputMenu: TokenInputMenu<T> | null = null;
  private textHelper: TextWidthHelper | null = null;
  private wrapper: HTMLLabelElement | null = null;
  private setRootNode!: TSetRootNode;
  private memoizedTokens = new Map();

  public componentDidMount() {
    this.updateInputTextWidth();
    globalObject.document?.addEventListener('copy', this.handleCopy);
    if (this.props.autoFocus) {
      this.focusInput();
    }
  }

  public componentDidUpdate(prevProps: TokenInputProps<T> & DefaultProps<T>, prevState: TokenInputState<T>) {
    if (prevState.inputValue !== this.state.inputValue) {
      this.updateInputTextWidth();
    }
    if (prevState.activeTokens.length === 0 && this.state.activeTokens.length > 0) {
      this.dispatch({
        type: 'SET_AUTOCOMPLETE_ITEMS',
        payload: undefined,
      });
    }
    if (prevProps.selectedItems.length !== this.getProps().selectedItems.length) {
      LayoutEvents.emit();
      this.memoizedTokens.clear();
    }
    if (!this.isCursorVisibleForState(prevState) && this.isCursorVisible) {
      this.tryGetItems(this.isEditingMode ? '' : this.state.inputValue);
    }
  }

  public componentWillUnmount() {
    globalObject.document?.removeEventListener('copy', this.handleCopy);
  }

  /**
   * @public
   */
  public focus() {
    this.input?.focus();
  }

  /**
   * @public
   */
  public blur() {
    this.input?.blur();
  }

  public render() {
    return (
      <ThemeContext.Consumer>
        {(theme) => {
          this.theme = theme;
          return this.renderMain();
        }}
      </ThemeContext.Consumer>
    );
  }

  private getLabelSizeClassName() {
    switch (this.getProps().size) {
      case 'large':
        return styles.labelLarge(this.theme);
      case 'medium':
        return styles.labelMedium(this.theme);
      case 'small':
      default:
        return styles.labelSmall(this.theme);
    }
  }

  private getInputSizeClassName() {
    switch (this.getProps().size) {
      case 'large':
        return styles.inputLarge(this.theme);
      case 'medium':
        return styles.inputMedium(this.theme);
      case 'small':
      default:
        return styles.inputSmall(this.theme);
    }
  }

  private renderMain() {
    if (this.type !== TokenInputType.WithoutReference && !this.props.getItems) {
      throw Error('Missed getItems for type ' + this.type);
    }

    const {
      maxMenuHeight,
      error,
      warning,
      disabled,
      renderNotFound,
      hideMenuIfEmptyInputValue,
      inputMode,
      renderTotalCount,
      totalCount,
      'aria-describedby': ariaDescribedby,
      'aria-label': ariaLabel,
    } = this.props;

    const { selectedItems, width, onMouseEnter, onMouseLeave, menuWidth, menuAlign, renderItem } = this.getProps();

    const {
      activeTokens,
      inFocus,
      inputValueWidth,
      inputValueHeight,
      inputValue,
      reservedInputValue,
      autocompleteItems,
      loading,
    } = this.state;

    const showMenu =
      this.type !== TokenInputType.WithoutReference &&
      this.isCursorVisible &&
      activeTokens.length === 0 &&
      (inputValue !== '' || !hideMenuIfEmptyInputValue);

    const theme = this.theme;

    const inputInlineStyles: React.CSSProperties = {
      // вычисляем ширину чтобы input автоматически перенёсся на следующую строку при необходимости
      width: inputValueWidth,
      height: inputValueHeight,
      // в ie не работает, но альтернативный способ --- дать tabindex для label --- предположительно ещё сложнее
      caretColor: this.isCursorVisible ? undefined : 'transparent',
    };

    const labelClassName = cx(styles.label(theme), this.getLabelSizeClassName(), {
      [styles.hovering(this.theme)]: !inFocus && !disabled && !warning && !error,
      [styles.labelDisabled(theme)]: !!disabled,
      [styles.labelFocused(theme)]: !!inFocus,
      [styles.error(theme)]: !!error,
      [styles.warning(theme)]: !!warning,
    });
    const inputClassName = cx(styles.input(theme), this.getInputSizeClassName(), {
      [styles.inputDisabled(theme)]: !!disabled,
    });

    const placeholder = selectedItems.length === 0 && !inputValue ? this.props.placeholder : '';

    const inputNode = (
      <TokenView
        size={this.getProps().size}
        className={cx({
          // input растягивается на всю ширину чтобы placeholder не обрезался
          [styles.inputPlaceholderWrapper()]: Boolean(placeholder),
        })}
        hideCloseButton={Boolean(placeholder)}
      >
        <textarea
          id={this.textareaId}
          ref={this.inputRef}
          value={inputValue}
          style={inputInlineStyles}
          spellCheck={false}
          disabled={disabled}
          className={inputClassName}
          placeholder={placeholder}
          onFocus={this.handleInputFocus}
          onBlur={this.handleInputBlur}
          onChange={this.handleChangeInputValue}
          onKeyDown={this.handleKeyDown}
          onPaste={this.handleInputPaste}
          inputMode={inputMode}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedby}
        />
      </TokenView>
    );

    return (
      <CommonWrapper rootNodeRef={this.setRootNode} {...this.props}>
        <div data-tid={TokenInputDataTids.root} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
          <label
            ref={this.wrapperRef}
            style={{ width }}
            className={labelClassName}
            onMouseDown={this.handleWrapperMouseDown}
            onMouseUp={this.handleWrapperMouseUp}
            htmlFor={this.textareaId}
            aria-controls={this.rootId}
            data-tid={TokenInputDataTids.label}
          >
            <TextWidthHelper
              ref={this.textHelperRef}
              text={inputValue}
              theme={this.theme}
              size={this.getProps().size}
            />
            {this.renderTokensStart()}
            {inputNode}
            {showMenu && (
              <TokenInputMenu
                popupMenuId={this.rootId}
                ref={this.tokensInputMenuRef}
                items={autocompleteItems}
                loading={loading}
                opened={showMenu}
                maxMenuHeight={maxMenuHeight}
                anchorElement={menuAlign === 'cursor' ? this.input : this.wrapper}
                renderNotFound={renderNotFound}
                renderItem={renderItem}
                onValueChange={this.selectItem}
                renderAddButton={this.renderAddButton}
                menuWidth={menuWidth}
                menuAlign={menuAlign}
                renderTotalCount={renderTotalCount}
                totalCount={totalCount}
                size={this.getProps().size}
              />
            )}
            {this.renderTokensEnd()}
            {this.isEditingMode ? (
              <TokenView size={this.props.size}>
                <span className={styles.reservedInput(theme)}>{reservedInputValue}</span>
              </TokenView>
            ) : null}
          </label>
        </div>
      </CommonWrapper>
    );
  }

  /**
   * Сбрасывает введенное пользователем значение
   * @public
   */
  public reset() {
    this.dispatch({ type: 'RESET' });
  }

  private hasValueInItems = (items: T[], value: T) => {
    if (typeof value === 'string') {
      return items.includes(value);
    }
    // todo: как то не очень
    return items.some((item) => isEqual(item, value));
  };

  private get showAddItemHint() {
    const items = this.state.autocompleteItems;
    const value = this.getProps().valueToItem(this.state.inputValue);

    if (items && this.hasValueInItems(items, value)) {
      return false;
    }

    const selectedItems = this.getProps().selectedItems;
    if (selectedItems && this.hasValueInItems(selectedItems, value)) {
      return false;
    }

    if (this.type === TokenInputType.Combined && this.state.inputValue !== '') {
      return true;
    }
  }

  private get type() {
    return this.props.type ? this.props.type : TokenInputType.WithReference;
  }

  private get menuRef(): Menu | null {
    return this.tokensInputMenu && this.tokensInputMenu.getMenuRef();
  }

  private get isCursorVisible() {
    return this.isCursorVisibleForState(this.state);
  }

  private get isEditingMode() {
    return this.state.editingTokenIndex > -1;
  }

  private isCursorVisibleForState(state: TokenInputState<T>) {
    return state.inFocus && (state.inputValue !== '' || state.activeTokens.length === 0);
  }

  private inputRef = (node: HTMLTextAreaElement) => (this.input = node);
  private tokensInputMenuRef = (node: TokenInputMenu<T>) => (this.tokensInputMenu = node);
  private textHelperRef = (node: TextWidthHelper) => (this.textHelper = node);
  private wrapperRef = (node: HTMLLabelElement) => (this.wrapper = node);

  private dispatch = (action: TokenInputAction, cb?: () => void) => {
    this.setState((prevState) => tokenInputReducer(prevState, action), cb);
  };

  private updateInputTextWidth() {
    if (this.textHelper) {
      // в IE текст иногда не помещается в input
      // из-за округления, поэтому округляем явно
      const inputValueWidth = parseFloat(this.textHelper.getTextWidth().toFixed(2));
      const inputValueHeight = parseFloat(this.textHelper.getTextHeight().toFixed(2));

      this.dispatch({ type: 'SET_INPUT_VALUE_WIDTH', payload: inputValueWidth }, LayoutEvents.emit);
      this.dispatch({ type: 'SET_INPUT_VALUE_HEIGHT', payload: inputValueHeight }, LayoutEvents.emit);
    }
  }

  private handleInputFocus = (event: FocusEvent<HTMLTextAreaElement>) => {
    this.dispatch({ type: 'SET_FOCUS_IN' });
    this.getProps().onFocus(event);
  };

  private handleInputBlur = (event: FocusEvent<HTMLTextAreaElement>) => {
    const isBlurToMenu = this.isBlurToMenu(event);

    if (!isBlurToMenu) {
      this.handleOutsideBlur();
    }

    if (isBlurToMenu || this.state.preventBlur) {
      event.preventDefault();
      // первый focus нужен для предотвращения/уменьшения моргания в других браузерах
      this.input?.focus();
      // в firefox не работает без второго focus
      globalObject.requestAnimationFrame?.(() => this.input?.focus());
      this.dispatch({ type: 'SET_PREVENT_BLUR', payload: false });
    } else {
      this.dispatch({ type: 'BLUR' });
      this.getProps().onBlur(event);
    }
  };

  private handleOutsideBlur = () => {
    const { inputValue, autocompleteItems } = this.state;

    if (inputValue === '') {
      // если стерли содержимое токена в режиме редактирования, то удаляем токен
      if (this.isEditingMode) {
        this.finishTokenEdit();
      }
      return;
    }

    // если не изменилось значение токена при редактировании
    if (this.isEditingMode && !this.isTokenValueChanged) {
      this.finishTokenEdit();
      return;
    }

    // чекаем автокомплит на совпадение с введенным значением в инпут
    if (autocompleteItems && autocompleteItems.length === 1) {
      const item = autocompleteItems[0];

      if (this.getProps().valueToString(item) === inputValue) {
        this.isEditingMode ? this.finishTokenEdit() : this.selectItem(item);

        return;
      }
    }

    if (this.isInputChanged) {
      this.checkForUnexpectedInput();
    }
  };

  private get isInputChanged() {
    if (this.isEditingMode) {
      return this.isTokenValueChanged;
    }

    return this.isInputValueChanged;
  }

  private get isInputValueChanged() {
    const { inputValue } = this.state;

    return inputValue !== '';
  }

  private get isTokenValueChanged() {
    const { inputValue, editingTokenIndex } = this.state;
    const { valueToString, selectedItems } = this.getProps();

    if (this.isEditingMode) {
      return valueToString(selectedItems[editingTokenIndex]) !== inputValue;
    }

    return false;
  }

  private isBlurToMenu = (event: FocusEvent<HTMLElement>) => {
    if (this.menuRef && globalObject.document) {
      const menu = getRootNode(this.tokensInputMenu?.getMenuRef());
      const relatedTarget = event.relatedTarget || globalObject.document.activeElement;

      if (menu && menu.contains(relatedTarget)) {
        return true;
      }
    }
    return false;
  };

  private handleWrapperMouseDown = (event: React.MouseEvent<HTMLElement>) => {
    this.dispatch({ type: 'SET_PREVENT_BLUR', payload: true });
    const target = event.target as HTMLElement;
    const isClickOnToken = target && this.wrapper?.contains(target) && target !== this.wrapper && target !== this.input;
    if (!isClickOnToken) {
      this.dispatch({ type: 'REMOVE_ALL_ACTIVE_TOKENS' });
    }
  };

  private handleWrapperMouseUp = () => {
    this.dispatch({ type: 'SET_PREVENT_BLUR', payload: false });
  };

  private handleCopy = (event: any) => {
    if (!this.state.inFocus || this.state.activeTokens.length === 0 || this.isCursorVisible) {
      return;
    }
    event.preventDefault();
    const { selectedItems, valueToString, delimiters } = this.getProps();
    // упорядочивание токенов по индексу
    const tokens = this.state.activeTokens
      .map((token) => selectedItems.indexOf(token))
      .sort()
      .map((index) => selectedItems[index])
      .map((item) => valueToString(item));
    event.clipboardData.setData('text/plain', tokens.join(delimiters[0]));
  };

  private handleInputPaste = (event: React.ClipboardEvent<HTMLElement>) => {
    if (this.type === TokenInputType.WithReference || !event.clipboardData) {
      return;
    }
    const paste = event.clipboardData.getData('text');
    const { delimiters, selectedItems, valueToItem, onValueChange } = this.getProps();
    if (delimiters.some((delimiter) => paste.includes(delimiter))) {
      event.preventDefault();
      event.stopPropagation();
      const tokens = paste.trim().split(new RegExp(`[${delimiters.join('')}]+`));
      const items = tokens
        .filter(Boolean)
        .map((token) => valueToItem(token))
        .filter((item) => item && !this.hasValueInItems(selectedItems, item));
      const newItems = selectedItems.concat(items);
      onValueChange(newItems);

      this.dispatch({ type: 'SET_AUTOCOMPLETE_ITEMS', payload: undefined });
      this.tryGetItems();
    }
  };

  private tryGetItems = async (query = '') => {
    if (this.props.getItems && (this.state.inputValue !== '' || !this.props.hideMenuIfEmptyInputValue)) {
      this.dispatch({ type: 'SET_LOADING', payload: true });
      const autocompleteItems = await this.props.getItems(query);
      this.dispatch({ type: 'SET_LOADING', payload: false });

      const { selectedItems, valueToItem, valueToString } = this.getProps();
      const isSelectedItem = (item: T) => this.hasValueInItems(selectedItems, item);
      const isEditingItem = (item: T) => {
        const editingItem = selectedItems[this.state.editingTokenIndex];
        return !!editingItem && isEqual(item, editingItem);
      };

      const autocompleteItemsUnique = autocompleteItems.filter((item) => !isSelectedItem(item) || isEditingItem(item));

      if (this.isEditingMode) {
        const editingItem = selectedItems[this.state.editingTokenIndex];
        if (
          isEqual(editingItem, valueToItem(this.state.inputValue)) &&
          !this.hasValueInItems(autocompleteItemsUnique, editingItem)
        ) {
          autocompleteItemsUnique.unshift(editingItem);
        }
      }

      if (query === '' || this.state.inputValue !== '') {
        this.dispatch({ type: 'SET_AUTOCOMPLETE_ITEMS', payload: autocompleteItemsUnique }, () => {
          LayoutEvents.emit();
          this.highlightMenuItem();
        });
      }
      const selectItemIndex = autocompleteItemsUnique.findIndex(
        (item) => valueToString(item).toLowerCase() === this.state.inputValue.toLowerCase(),
      );
      setTimeout(() => this.menuRef?.highlightItem(selectItemIndex < 0 ? 0 : selectItemIndex), 0);
    }
  };

  private handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (this.isCursorVisible) {
      this.handleInputKeyDown(event);
    } else {
      this.handleWrapperKeyDown(event);
    }
  };

  private handleInputKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();

    if (
      (this.type !== TokenInputType.WithReference &&
        this.getProps().delimiters.some((key) => key === e.key || (key === ',' && isKeyComma(e)))) ||
      (isKeyEnter(e) && this.type === TokenInputType.WithoutReference)
    ) {
      e.preventDefault();
      const newValue = this.state.inputValue;
      if (newValue !== '') {
        if (this.isEditingMode) {
          this.finishTokenEdit();
        } else {
          this.handleAddItem();
        }
      }
    }
    const isRightmostTokenNotDisabled = !this.isTokenDisabled(this.getProps().selectedItems.length - 1);
    switch (true) {
      case isKeyEnter(e):
        if (this.menuRef) {
          this.menuRef.enter(e);
        }
        // don't allow textarea
        // became multiline
        e.preventDefault();
        break;
      case isKeyArrowVertical(e):
        e.preventDefault();
        if (this.menuRef) {
          if (isKeyArrowUp(e)) {
            this.menuRef.up();
          } else {
            this.menuRef.down();
          }
        }
        break;
      case isKeyEscape(e):
        this.input?.blur();
        break;
      case isKeyBackspace(e):
        if (!this.isEditingMode && isRightmostTokenNotDisabled) {
          this.moveFocusToLastToken();
        }
        break;
      case isKeyArrowLeft(e):
        if (this.input?.selectionStart === 0) {
          const index = this.getAvailableTokenIndex(this.getProps().selectedItems.length);
          const itemNew = this.getProps().selectedItems[index];
          if (itemNew) {
            this.dispatch({ type: 'SET_ACTIVE_TOKENS', payload: [itemNew] });
          }
        }
        break;
    }
  };

  private moveFocusToLastToken() {
    const items = this.getProps().selectedItems;
    if (this.state.inputValue === '' && items && items.length > 0) {
      this.dispatch({ type: 'SET_ACTIVE_TOKENS', payload: items.slice(-1) });
    }
  }

  private focusInput = () => {
    globalObject.requestAnimationFrame?.(() => this.input?.focus());
  };

  private selectInputText = () => {
    if (this.input) {
      this.input.setSelectionRange(0, this.state.inputValue.length);
    }
  };

  private handleWrapperKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const { selectedItems, onValueChange } = this.getProps();
    switch (true) {
      case isKeyBackspace(e):
      case isKeyDelete(e): {
        const indexOfActiveToken = this.getProps().selectedItems.indexOf(
          this.state.activeTokens[this.state.activeTokens.length - 1],
        );
        if (!this.isEditingMode && !this.isTokenDisabled(indexOfActiveToken)) {
          const itemsNew = selectedItems.filter((item) => !this.hasValueInItems(this.state.activeTokens, item));
          onValueChange(itemsNew);
          this.dispatch({ type: 'REMOVE_ALL_ACTIVE_TOKENS' }, () => {
            LayoutEvents.emit();
            this.input?.focus();
          });
        }
        break;
      }
      case isKeyArrowHorizontal(e):
        this.handleWrapperArrows(e);
        break;
      case isKeyEscape(e):
        this.wrapper?.blur();
        break;
      case isKeyEnter(e):
        e.preventDefault();
        if (this.state.activeTokens.length === 1) {
          this.handleTokenEdit(this.state.activeTokens[0]);
        }
        break;
      case isShortcutSelectAll(e):
        e.preventDefault();
        this.dispatch({
          type: 'SET_ACTIVE_TOKENS',
          payload: selectedItems.filter((item) => !this.isTokenDisabled(selectedItems.indexOf(item))),
        });
        break;
    }
  };

  private handleWrapperArrows = (e: KeyboardEvent<HTMLElement>) => {
    e.preventDefault();
    const selectedItems = this.getProps().selectedItems;
    const activeTokens = this.state.activeTokens;
    const activeItemIndex = selectedItems.indexOf(activeTokens[0]);
    const newItemIndex = this.getAvailableTokenIndex(activeItemIndex, isKeyArrowLeft(e));
    const isLeftEdge = activeItemIndex === 0 && isKeyArrowLeft(e);
    const isRightEdge = newItemIndex === selectedItems.length && isKeyArrowRight(e);
    if (!e.shiftKey && activeTokens.length === 1) {
      this.handleWrapperArrowsWithoutShift(isLeftEdge, isRightEdge, newItemIndex);
    } else {
      this.handleWrapperArrowsWithShift(isLeftEdge, isRightEdge, newItemIndex);
    }
  };

  private handleWrapperArrowsWithoutShift = (isLeftEdge: boolean, isRightEdge: boolean, newItemIndex: number) => {
    if (isRightEdge) {
      this.dispatch({ type: 'REMOVE_ALL_ACTIVE_TOKENS' }, () => this.input?.focus());
    } else if (!isLeftEdge) {
      this.dispatch({
        type: 'SET_ACTIVE_TOKENS',
        payload: [this.getProps().selectedItems[newItemIndex]],
      });
    }
  };

  private handleWrapperArrowsWithShift = (isLeftEdge: boolean, isRightEdge: boolean, newItemIndex: number) => {
    if (!isLeftEdge && !isRightEdge) {
      const itemNew = this.getProps().selectedItems[newItemIndex];
      const itemsNew = [itemNew, ...this.state.activeTokens.filter((item) => !isEqual(item, itemNew))];
      this.dispatch({ type: 'SET_ACTIVE_TOKENS', payload: itemsNew });
    }
  };

  private handleValueChange = (items: T[]) => {
    this.getProps().onValueChange(items);
  };

  private handleAddItem = () => {
    const item = this.getProps().valueToItem(this.state.inputValue);
    if (item) {
      this.selectItem(item);
    }
  };

  private selectItem = (item: T) => {
    const { selectedItems, valueToString } = this.getProps();
    if (this.isEditingMode) {
      this.dispatch({ type: 'UPDATE_QUERY', payload: valueToString(item) }, this.finishTokenEdit);
    } else if (!this.hasValueInItems(selectedItems, item)) {
      this.handleValueChange(selectedItems.concat([item]));
      this.dispatch({ type: 'CLEAR_INPUT' });
      this.tryGetItems();
    }
  };

  private handleRemoveToken = (item: T) => {
    this.props.onValueChange?.(this.getProps().selectedItems.filter((_) => !isEqual(_, item)));
    const filteredActiveTokens = this.state.activeTokens.filter((_) => !isEqual(_, item));

    this.dispatch({ type: 'SET_ACTIVE_TOKENS', payload: filteredActiveTokens });
    if (filteredActiveTokens.length === 0) {
      this.focusInput();
    }

    this.tryGetItems();
  };

  private handleTokenClick = (event: React.MouseEvent<HTMLElement>, itemNew: T) => {
    const items = this.state.activeTokens;
    if (event.ctrlKey) {
      const newItems = this.hasValueInItems(this.state.activeTokens, itemNew)
        ? items.filter((item) => !isEqual(item, itemNew))
        : [...items, itemNew];
      this.dispatch({ type: 'SET_ACTIVE_TOKENS', payload: newItems });
    } else {
      this.dispatch({ type: 'SET_ACTIVE_TOKENS', payload: [itemNew] });
    }
    this.focusInput();
  };

  private handleTokenEdit = (itemNew: T) => {
    const { selectedItems, valueToString } = this.getProps();
    const editingTokenIndex = selectedItems.findIndex((item) => item === itemNew);
    this.dispatch({ type: 'SET_EDITING_TOKEN_INDEX', payload: editingTokenIndex });

    if (this.state.inputValue !== '') {
      if (this.state.reservedInputValue === undefined) {
        this.dispatch({ type: 'SET_TEMPORARY_QUERY', payload: this.state.inputValue });
      }
    }
    this.dispatch({ type: 'UPDATE_QUERY', payload: valueToString(itemNew) }, this.selectInputText);
    this.dispatch({ type: 'REMOVE_ALL_ACTIVE_TOKENS' });

    this.tryGetItems();
  };

  private finishTokenEdit = () => {
    const selectedItems = this.getProps().selectedItems;
    const { editingTokenIndex, inputValue, reservedInputValue } = this.state;
    const editedItem = this.getProps().valueToItem(inputValue);
    const newItems = selectedItems.concat([]);

    if (!this.hasValueInItems(selectedItems, editedItem)) {
      newItems.splice(editingTokenIndex, 1, ...(inputValue !== '' ? [editedItem] : []));
      this.handleValueChange(newItems);
    }

    this.dispatch({ type: 'REMOVE_EDITING_TOKEN_INDEX' });

    if (reservedInputValue) {
      this.dispatch({ type: 'UPDATE_QUERY', payload: reservedInputValue });
      this.dispatch({ type: 'REMOVE_TEMPORARY_QUERY' });
    } else {
      this.dispatch({ type: 'CLEAR_INPUT' });
    }

    if (newItems.length === selectedItems.length) {
      this.dispatch({ type: 'SET_ACTIVE_TOKENS', payload: [newItems[editingTokenIndex]] });
    }
  };

  private checkForUnexpectedInput = () => {
    const { inputValue } = this.state;
    const { onUnexpectedInput } = this.props;

    if (onUnexpectedInput) {
      // чекаем не возвращает ли что-нибудь обработчик
      const returnedValue = onUnexpectedInput(inputValue);

      if (returnedValue === undefined) {
        return;
      }

      if (returnedValue === null) {
        this.dispatch({ type: 'CLEAR_INPUT' }, () => {
          if (this.isEditingMode) {
            this.finishTokenEdit();
          }
        });

        return;
      }

      if (returnedValue) {
        this.selectItem(returnedValue);
      }
    }
  };

  private handleChangeInputValue = (event: ChangeEvent<HTMLTextAreaElement>) => {
    this.dispatch({ type: 'REMOVE_ALL_ACTIVE_TOKENS' });
    let query = event.target.value.trimLeft();

    if (query.endsWith(' ')) {
      query = query.trimRight() + ' ';
    }
    if (this.state.inputValue !== '' && query === '') {
      this.dispatch({ type: 'SET_AUTOCOMPLETE_ITEMS', payload: undefined });
    }
    this.dispatch({ type: 'UPDATE_QUERY', payload: query }, () => {
      this.tryGetItems(query);
    });
    if (this.props.onInputValueChange) {
      this.props.onInputValueChange(query);
    }
  };

  private highlightMenuItem = () => {
    if (
      this.menuRef &&
      this.state.autocompleteItems &&
      this.state.autocompleteItems.length > 0 &&
      this.type !== TokenInputType.Combined
    ) {
      this.menuRef.highlightItem(0);
    }
  };

  private renderTokensStart = () => {
    const { editingTokenIndex } = this.state;
    const selectedItems = this.getProps().selectedItems;
    const delimiter = editingTokenIndex >= 0 ? editingTokenIndex : selectedItems.length;
    return selectedItems.slice(0, delimiter).map(this.renderToken);
  };

  private renderTokensEnd = () => {
    if (this.state.editingTokenIndex >= 0) {
      return this.getProps()
        .selectedItems.slice(this.state.editingTokenIndex + 1)
        .map(this.renderToken);
    }
  };

  private renderToken = (item: T) => {
    const { renderToken = defaultRenderToken, disabled, size } = this.props;

    const isActive = this.state.activeTokens.includes(item);

    // TODO useCallback
    const handleIconClick: React.MouseEventHandler<HTMLElement> = (event) => {
      event.stopPropagation();
      if (!this.isEditingMode) {
        this.handleRemoveToken(item);
      }
    };

    // TODO useCallback
    const handleTokenClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
      event.stopPropagation();
      if (!this.isEditingMode) {
        this.handleTokenClick(event, item);
      }
    };

    const handleTokenDoubleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
      event.stopPropagation();
      if (!this.isEditingMode && !disabled) {
        this.handleTokenEdit(item);
      }
    };

    const renderedToken = renderToken(item as T & AnyObject, {
      size,
      isActive,
      onClick: handleTokenClick,
      onDoubleClick: handleTokenDoubleClick,
      onRemove: handleIconClick,
      disabled,
    });

    this.memoizedTokens.set(this.props.selectedItems?.indexOf(item), renderedToken);
    return renderedToken;
  };

  private renderAddButton = (value = this.state.inputValue): React.ReactNode | undefined => {
    if (!this.showAddItemHint) {
      return;
    }

    if (this.props.renderAddButton) {
      return this.props.renderAddButton(value, this.handleAddItem);
    }

    const { addButtonComment, addButtonTitle } = this.locale;

    return (
      <MenuItem onClick={this.handleAddItem} comment={addButtonComment} key="renderAddButton">
        {addButtonTitle} {value}
      </MenuItem>
    );
  };

  private isTokenDisabled = (itemIndex: number) => {
    let renderedToken;
    if (this.memoizedTokens.has(itemIndex)) {
      renderedToken = this.memoizedTokens.get(itemIndex);
    } else if (itemIndex < 0 || itemIndex > this.getProps().selectedItems.length - 1) {
      return false;
    } else {
      renderedToken = this.renderToken(this.getProps().selectedItems[itemIndex]) as React.ReactElement<
        TokenInputProps<unknown>
      >;
    }
    return renderedToken.props.disabled;
  };

  private getAvailableTokenIndex = (startIndex: number, isDirectionLeft = true) => {
    const { selectedItems } = this.getProps();
    const step = isDirectionLeft ? -1 : +1;
    let availableIndex = startIndex + step;

    while (this.isTokenDisabled(availableIndex)) {
      availableIndex += step;
      if (availableIndex === selectedItems.length) {
        return availableIndex;
      } else if (availableIndex === -1) {
        return startIndex;
      }
    }

    return availableIndex;
  };
}
