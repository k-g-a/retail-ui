import React, { AriaAttributes, ReactNode } from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash.throttle';
import { globalObject } from '@skbkontur/global-object';

import { isKeyEnter } from '../../lib/events/keyboard/identifiers';
import { needsPolyfillPlaceholder } from '../../lib/needsPolyfillPlaceholder';
import * as LayoutEvents from '../../lib/LayoutEvents';
import { Nullable, Override } from '../../typings/utility-types';
import { ThemeContext } from '../../lib/theming/ThemeContext';
import { Theme } from '../../lib/theming/Theme';
import { RenderLayer } from '../../internal/RenderLayer';
import { ResizeDetector } from '../../internal/ResizeDetector';
import { isIE11, isSafariWithTextareaBug } from '../../lib/client';
import { CommonProps, CommonWrapper, CommonWrapperRestProps } from '../../internal/CommonWrapper';
import { isTestEnv } from '../../lib/currentEnvironment';
import { cx } from '../../lib/theming/Emotion';
import { rootNode, TSetRootNode } from '../../lib/rootNode';
import { createPropsGetter } from '../../lib/createPropsGetter';
import { SizeProp } from '../../lib/types/props';

import { getTextAreaHeight } from './TextareaHelpers';
import { styles } from './Textarea.styles';
import { TextareaCounter, TextareaCounterRef } from './TextareaCounter';
import { TextareaWithSafari17Workaround } from './TextareaWithSafari17Workaround';

const DEFAULT_WIDTH = 250;
const AUTORESIZE_THROTTLE_DEFAULT_WAIT = 100;

export interface TextareaProps
  extends Pick<AriaAttributes, 'aria-label'>,
    CommonProps,
    Override<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      {
        /** Переводит контрол в состояние валидации "ошибка". */
        error?: boolean;

        /** Переводит контрол в состояние валидации "предупреждение". */
        warning?: boolean;

        /** Делает компонент недоступным. */
        disabled?: boolean;

        /** Задает размер компонента. */
        size?: SizeProp;

        /** Выполняет автоматический ресайз в зависимости от содержимого. */
        autoResize?: boolean;

        /** Задает высоту текстарии в виде числа строк видимых без скролла. */
        rows?: number;

        /** Задает максимальное число строк при автоматическом ресайзе. */
        maxRows?: string | number;

        /** Задает направления ресайза компонента.
         * Попадает в `style`. */
        resize?: React.CSSProperties['resize'];

        /** Задает ширину текстэрии. */
        width?: React.CSSProperties['width'];

        /** Задает функцию, которая вызывается при изменении `value`. */
        onValueChange?: (value: string) => void;

        /** Определяет, нужно ли выделять введенное значение при фокусе. Работает с типами text, password, tel, search, url. */
        selectAllOnFocus?: boolean;

        /** Определяет, нужно ли показывать счетчик символов. */
        showLengthCounter?: boolean;

        /** Задает допустимое количество символов в поле. Отображается в счетчике.
         * @default maxLength */
        lengthCounter?: number;

        /** Задает подсказку к счетчику символов.
         * По умолчанию - тултип с содержимым из пропа, если передан `ReactNode`.
         * Передав функцию, можно переопределить подсказку целиком, вместе с иконкой.
         * @example
         * ```
         * counterHelp={() => <Tooltip render={...}><HelpIcon /></Tooltip>}
         * ``` */
        counterHelp?: ReactNode | (() => ReactNode);

        /** Добавляет дополнительную свободную строку при авто-ресайзе.
         * @see https://guides.kontur.ru/components/textarea/#04 */
        extraRow?: boolean;

        /** Отключает анимацию при авто-ресайзе. Автоматически отключается когда в `extraRow` передан `false`. */
        disableAnimations?: boolean;
      }
    > {}

export interface TextareaState {
  needsPolyfillPlaceholder: boolean;
  isCounterVisible: boolean;
}

export const TextareaDataTids = {
  root: 'Textarea__root',
  counter: 'TextareaCounter__root',
  helpIcon: 'TextareaCounter__helpIcon',
} as const;

type DefaultProps = Required<Pick<TextareaProps, 'rows' | 'maxRows' | 'extraRow' | 'disableAnimations' | 'size'>>;

/**
 * Многострочное поле `Textarea` — это поле ввода, которое позволяет работать с несколькими строками текста.
 *
 * Принимает все атрибуты `React.TextareaHTMLAttributes<HTMLTextAreaElement>`.
 * Пропы **`className` и `style` игнорируются**.
 */
@rootNode
export class Textarea extends React.Component<TextareaProps, TextareaState> {
  public static __KONTUR_REACT_UI__ = 'Textarea';
  public static displayName = 'Textarea';

  public static propTypes = {
    error: PropTypes.bool,
    warning: PropTypes.bool,
    disabled: PropTypes.bool,

    autoResize: PropTypes.bool,
    extraRow: PropTypes.bool,
    disableAnimations: PropTypes.bool,
    maxRows: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    resize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

    id: PropTypes.string,
    name: PropTypes.string,
    title: PropTypes.string,
    spellCheck: PropTypes.bool,
    role: PropTypes.string,
    maxLength: PropTypes.number,
    tabIndex: PropTypes.number,
    rows: PropTypes.number,
    placeholder: PropTypes.string,

    value: PropTypes.string,
    defaultValue: PropTypes.string,
    onValueChange: PropTypes.func,

    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseMove: PropTypes.func,
    onMouseOut: PropTypes.func,

    onMouseUp: PropTypes.func,
    onMouseDown: PropTypes.func,
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,

    onKeyDown: PropTypes.func,
    onKeyPress: PropTypes.func,
    onKeyUp: PropTypes.func,
    onInput: PropTypes.func,

    onFocus: PropTypes.func,
    onBlur: PropTypes.func,

    onScroll: PropTypes.func,
    onWheel: PropTypes.func,

    onCut: PropTypes.func,
    onPaste: PropTypes.func,
    onCopy: PropTypes.func,
  };

  public static defaultProps: DefaultProps = {
    rows: 3,
    maxRows: 15,
    extraRow: true,
    size: 'small',
    disableAnimations: isTestEnv,
  };

  private getProps = createPropsGetter(Textarea.defaultProps);

  private getRootSizeClassName() {
    switch (this.getProps().size) {
      case 'large':
        return styles.rootLarge(this.theme);
      case 'medium':
        return styles.rootMedium(this.theme);
      case 'small':
      default:
        return styles.rootSmall(this.theme);
    }
  }

  private getTextareaSizeClassName() {
    switch (this.getProps().size) {
      case 'large':
        return styles.textareaLarge(this.theme);
      case 'medium':
        return styles.textareaMedium(this.theme);
      case 'small':
      default:
        return styles.textareaSmall(this.theme);
    }
  }

  public state = {
    needsPolyfillPlaceholder,
    isCounterVisible: false,
  };
  private reflowCounter = () => {
    if (this.counter) {
      this.counter.reflow();
    }
  };

  private theme!: Theme;
  private selectAllId: number | null = null;
  private node: Nullable<HTMLTextAreaElement>;
  private fakeNode: Nullable<HTMLTextAreaElement>;
  private counter: Nullable<TextareaCounterRef>;
  private layoutEvents: Nullable<{ remove: () => void }>;
  private textareaObserver = globalObject.MutationObserver
    ? new globalObject.MutationObserver(this.reflowCounter)
    : null;
  private setRootNode!: TSetRootNode;
  private getAutoResizeThrottleWait(props: TextareaProps = this.props): number {
    // NOTE: При отключении анимации остается эффект дергания при авто-ресайзе из-за троттлинга расчета высоты
    // Поэтому выставляем таймаут троттла в ноль. Подробности - https://github.com/skbkontur/retail-ui/issues/2120
    return this.isAnimationsDisabled(props) ? 0 : AUTORESIZE_THROTTLE_DEFAULT_WAIT;
  }
  private isAnimationsDisabled({ disableAnimations, extraRow }: TextareaProps = this.props): boolean {
    return disableAnimations || !extraRow;
  }

  public componentDidMount() {
    if (this.props.autoResize) {
      this.autoResize();
      this.layoutEvents = LayoutEvents.addListener(this.autoResize);
    }

    if (this.node && this.props.showLengthCounter && this.textareaObserver) {
      this.textareaObserver.observe(this.node, { attributes: true });
    }
  }

  public componentWillUnmount() {
    if (this.layoutEvents) {
      this.layoutEvents.remove();
    }
    if (this.props.showLengthCounter && this.textareaObserver) {
      this.textareaObserver.disconnect();
    }
    this.cancelDelayedSelectAll();
  }

  public componentDidUpdate(prevProps: TextareaProps) {
    if (this.getAutoResizeThrottleWait() !== this.getAutoResizeThrottleWait(prevProps)) {
      this.autoResize.cancel();
      this.autoResize = throttle(this.autoResizeHandler, this.getAutoResizeThrottleWait());
    }
    const { rows, maxRows } = this.getProps();
    if (
      this.props.autoResize &&
      (rows !== prevProps.rows || maxRows !== prevProps.maxRows || this.props.value !== prevProps.value)
    ) {
      this.autoResize();
    }
  }

  public render() {
    return (
      <ThemeContext.Consumer>
        {(theme) => {
          this.theme = theme;
          return (
            <CommonWrapper rootNodeRef={this.setRootNode} {...this.getProps()}>
              {this.renderMain}
            </CommonWrapper>
          );
        }}
      </ThemeContext.Consumer>
    );
  }

  /**
   * @public
   */
  public focus() {
    if (this.node) {
      this.node.focus();
    }
  }

  /**
   * @public
   */
  public blur() {
    if (this.node) {
      this.node.blur();
    }
  }

  /**
   * @public
   * @param {number} start
   * @param {number} end
   */
  public setSelectionRange = (start: number, end: number) => {
    if (!this.node) {
      throw new Error('Cannot call "setSelectionRange" on unmounted Input');
    }

    if (globalObject.document?.activeElement !== this.node) {
      this.focus();
    }

    this.node.setSelectionRange(start, end);
  };

  /**
   * @public
   */
  public selectAll = () => {
    if (this.node) {
      this.setSelectionRange(0, this.node.value.length);
    }
  };

  private delaySelectAll = (): number | null =>
    (this.selectAllId = globalObject.requestAnimationFrame?.(this.selectAll) ?? null);

  private cancelDelayedSelectAll = (): void => {
    if (this.selectAllId) {
      globalObject.cancelAnimationFrame?.(this.selectAllId);
      this.selectAllId = null;
    }
  };

  private renderMain = (props: CommonWrapperRestProps<TextareaProps>) => {
    const {
      width = DEFAULT_WIDTH,
      error,
      warning,
      size,
      autoResize,
      resize,
      onCut,
      onPaste,
      maxRows,
      onFocus,
      selectAllOnFocus,
      placeholder,
      onValueChange,
      showLengthCounter,
      lengthCounter,
      counterHelp,
      extraRow,
      disableAnimations,
      disabled,
      ...textareaProps
    } = props;

    const { isCounterVisible } = this.state;

    const rootProps = {
      style: {
        width,
      },
    };

    const textareaClassNames = cx(this.getTextareaSizeClassName(), {
      [styles.textarea(this.theme)]: true,
      [styles.hovering(this.theme)]: !error && !warning,
      [styles.disabled(this.theme)]: disabled,
      [styles.error(this.theme)]: !!error,
      [styles.warning(this.theme)]: !!warning,
      [styles.disableAnimations()]: this.isAnimationsDisabled(),
    });

    const textareaStyle = {
      resize: autoResize ? 'none' : resize,
    };

    let placeholderPolyfill = null;

    if (this.state.needsPolyfillPlaceholder && !textareaProps.value && !textareaProps.defaultValue) {
      placeholderPolyfill = <span className={styles.placeholder()}>{placeholder}</span>;
    }

    let fakeTextarea = null;
    if (autoResize) {
      const fakeProps = {
        value: this.props.value,
        defaultValue: this.props.defaultValue,
        className: cx(textareaClassNames, styles.fake()),
        readOnly: true,
      };
      fakeTextarea = <textarea {...fakeProps} ref={this.refFake} />;
    }

    const counter = showLengthCounter && isCounterVisible && this.node && (
      <TextareaCounter
        textarea={this.node}
        size={this.getProps().size}
        help={counterHelp}
        value={textareaProps.value}
        length={textareaProps.maxLength ?? lengthCounter ?? 0}
        onCloseHelp={this.handleCloseCounterHelp}
        ref={this.refCounter}
      />
    );

    const Component = isSafariWithTextareaBug ? TextareaWithSafari17Workaround : 'textarea';

    return (
      <RenderLayer
        onFocusOutside={this.handleCloseCounterHelp}
        onClickOutside={this.handleCloseCounterHelp}
        active={this.state.isCounterVisible}
      >
        <label
          data-tid={TextareaDataTids.root}
          {...rootProps}
          className={cx(this.getRootSizeClassName(), {
            [styles.root()]: true,
          })}
        >
          {placeholderPolyfill}
          <ResizeDetector onResize={this.reflowCounter}>
            <Component
              {...textareaProps}
              className={textareaClassNames}
              style={textareaStyle}
              placeholder={!placeholderPolyfill ? placeholder : undefined}
              ref={this.ref}
              onChange={this.handleChange}
              onCut={this.handleCut}
              onPaste={this.handlePaste}
              onFocus={this.handleFocus}
              onKeyDown={this.handleKeyDown}
              disabled={disabled}
            >
              {this.props.children}
            </Component>
          </ResizeDetector>
          {fakeTextarea}
          {counter}
        </label>
      </RenderLayer>
    );
  };

  private handleCloseCounterHelp = () => this.setState({ isCounterVisible: false });

  private handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Edge bug: textarea maxlength doesn't work after new line
    // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/18833616/
    const value = this.props.value !== undefined ? this.props.value.toString() : null;
    const isBlockEnter = isKeyEnter(e) && value !== null && value.length === this.props.maxLength;

    if (isBlockEnter) {
      e.preventDefault();
    }

    if (this.props.onKeyDown) {
      this.props.onKeyDown(e);
    }
  };

  private handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (needsPolyfillPlaceholder) {
      const fieldIsEmpty = e.target.value === '';

      if (this.state.needsPolyfillPlaceholder !== fieldIsEmpty) {
        this.setState({ needsPolyfillPlaceholder: fieldIsEmpty });
      }
    }

    if (this.props.onValueChange) {
      this.props.onValueChange(e.target.value);
    }

    if (this.props.autoResize) {
      this.autoResize();
    }

    if (this.props.onChange) {
      this.props.onChange(e);
    }

    this.reflowCounter();
  };

  private ref = (element: HTMLTextAreaElement) => {
    this.node = element;
  };

  private refFake = (element: HTMLTextAreaElement) => {
    this.fakeNode = element;
  };

  private refCounter = (ref: TextareaCounterRef | null) => {
    this.counter = ref;
  };

  private autoResizeHandler = () => {
    const fakeNode = this.fakeNode;
    if (!fakeNode) {
      return;
    }
    const node = this.node;
    if (!node) {
      return;
    }
    if (this.props.value === undefined) {
      fakeNode.value = node.value;
    }

    const { rows, maxRows } = this.getProps();
    if (rows === undefined || maxRows === undefined) {
      return;
    }

    const { height, exceededMaxHeight } =
      getTextAreaHeight({
        node: fakeNode,
        minRows: typeof rows === 'number' ? rows : parseInt(rows, 10),
        maxRows: typeof maxRows === 'number' ? maxRows : parseInt(maxRows, 10),
        extraRow: this.getProps().extraRow,
      }) || {};

    if (height === undefined || exceededMaxHeight === undefined) {
      return;
    }

    node.style.height = height + 'px';
    node.style.overflowY = exceededMaxHeight ? 'scroll' : 'hidden';
    fakeNode.style.overflowY = exceededMaxHeight ? 'scroll' : 'hidden';
  };

  private autoResize = throttle(this.autoResizeHandler, this.getAutoResizeThrottleWait());

  private handleCut = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (this.props.autoResize) {
      this.autoResize();
    }

    if (this.props.onCut) {
      this.props.onCut(event);
    }

    this.reflowCounter();
  };

  private handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (this.props.autoResize) {
      this.autoResize();
    }

    if (this.props.onPaste) {
      this.props.onPaste(event);
    }

    this.reflowCounter();
  };

  private handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    this.setState({ isCounterVisible: true });

    if (this.props.selectAllOnFocus) {
      // https://github.com/facebook/react/issues/7769
      this.node && !isIE11 ? this.selectAll() : this.delaySelectAll();
    }

    if (this.props.onFocus) {
      this.props.onFocus(event);
    }
  };
}
