import React from 'react';
import PropTypes from 'prop-types';
import shallowEqual from 'shallowequal';
import { globalObject } from '@skbkontur/global-object';
import type { Emotion } from '@emotion/css/create-instance';

import * as LayoutEvents from '../../lib/LayoutEvents';
import { Nullable } from '../../typings/utility-types';
import { isFunction } from '../../lib/utils';
import { ZIndex } from '../../internal/ZIndex';
import { CommonProps, CommonWrapper } from '../../internal/CommonWrapper';
import { EmotionConsumer } from '../../lib/theming/Emotion';
import { rootNode, TSetRootNode } from '../../lib/rootNode';
import { getDOMRect } from '../../lib/dom/getDOMRect';
import { createPropsGetter } from '../../lib/createPropsGetter';

import { getStyles } from './Sticky.styles';

const MAX_REFLOW_RETRIES = 5;

export interface StickyProps extends Omit<CommonProps, 'children'> {
  /** Задает сторону залипания. */
  side: 'top' | 'bottom';

  /** Задает отступ от края экрана в пикселях, на который сдвигается элемент в залипшем состоянии.
   * @default 0 */
  offset?: number;

  /** Задает функцию, которая возвращает DOM-элемент, который нельзя пересекать. */
  getStop?: () => Nullable<HTMLElement>;

  /** @ignore */
  children?: React.ReactNode | ((fixed: boolean) => React.ReactNode);
}

export interface StickyState {
  fixed: boolean;
  deltaHeight: number;
  height?: number;
  width?: number;
  left?: number;
  stopped: boolean;
  relativeTop: number;
}

export const StickyDataTids = {
  root: 'Sticky__root',
} as const;

type DefaultProps = Required<Pick<StickyProps, 'offset'>>;

/**
 * `Sticky` позволяет закреплять элемент интерфейса в определенной позиции на экране при прокрутке страницы.
 * Это полезно для создания "прилипающих" элементов, которые остаются видимыми при прокрутке содержимого.
 */
@rootNode
export class Sticky extends React.Component<StickyProps, StickyState> {
  public static __KONTUR_REACT_UI__ = 'Sticky';
  public static displayName = 'Sticky';

  public static propTypes = {
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),

    /**
     * Функция, которая возвращает DOM-элемент, который нельзя пересекать.
     */
    getStop: PropTypes.func,

    /**
     * Отступ от границы в пикселях
     */
    offset: PropTypes.number,

    side: PropTypes.oneOf(['top', 'bottom']).isRequired,
  };

  public static defaultProps: DefaultProps = { offset: 0 };

  private getProps = createPropsGetter(Sticky.defaultProps);

  public state: StickyState = {
    fixed: false,
    deltaHeight: 0,
    stopped: false,
    relativeTop: 0,
  };

  private wrapper: Nullable<HTMLElement>;
  private inner: Nullable<HTMLElement>;
  private layoutSubscription: { remove: Nullable<() => void> } = { remove: null };
  private reflowCounter = 0;
  private emotion!: Emotion;
  private styles!: ReturnType<typeof getStyles>;
  private setRootNode!: TSetRootNode;

  public componentDidMount() {
    this.reflow();

    this.layoutSubscription = LayoutEvents.addListener(this.reflow);
  }

  public componentWillUnmount() {
    if (this.layoutSubscription.remove) {
      this.layoutSubscription.remove();
    }
  }

  public componentDidUpdate(prevProps: StickyProps, prevState: StickyState) {
    if (!shallowEqual(prevProps, this.props) || !shallowEqual(prevState, this.state)) {
      if (this.reflowCounter < MAX_REFLOW_RETRIES) {
        LayoutEvents.emit();
        this.reflowCounter += 1;
        return;
      }
    }
    this.reflowCounter = 0;
  }

  public render() {
    return (
      <EmotionConsumer>
        {(emotion) => {
          this.emotion = emotion;
          this.styles = getStyles(this.emotion);
          return this.renderMain();
        }}
      </EmotionConsumer>
    );
  }

  public renderMain() {
    let { children } = this.props;
    const { side } = this.props;
    const offset = this.getProps().offset;
    const { fixed, stopped, relativeTop, deltaHeight, width, height, left } = this.state;
    const innerStyle: React.CSSProperties = {};

    if (fixed) {
      if (stopped) {
        innerStyle.top = relativeTop;
        innerStyle[side === 'top' ? 'marginTop' : 'marginBottom'] = deltaHeight;
      } else {
        innerStyle.width = width;
        innerStyle[side] = offset;
        innerStyle.left = left;
      }
    }

    if (isFunction(children)) {
      children = children(fixed);
    }
    const styles = this.styles;
    return (
      <CommonWrapper rootNodeRef={this.setRootNode} {...this.props}>
        <div data-tid={StickyDataTids.root} ref={this.refWrapper} className={styles.wrapper()}>
          <ZIndex
            priority="Sticky"
            applyZIndex={fixed}
            className={this.emotion.cx(styles.inner(), {
              [styles.fixed()]: fixed && !stopped,
              [styles.stopped()]: stopped,
            })}
            style={innerStyle}
            wrapperRef={this.refInner}
          >
            <div className={styles.container()}>{children}</div>
          </ZIndex>
          {fixed && !stopped ? <div style={{ width, height }} /> : null}
        </div>
      </CommonWrapper>
    );
  }

  private refWrapper = (ref: Nullable<HTMLElement>) => (this.wrapper = ref);

  private refInner = (ref: Nullable<HTMLElement>) => (this.inner = ref);

  /**
   * Пересчитать габариты и позицию залипшего элемента
   *
   * @public
   */
  public reflow = () => {
    if (!globalObject.document?.documentElement) {
      throw Error('There is no "documentElement" in document');
    }

    const windowHeight = globalObject.innerHeight || globalObject.document.documentElement.clientHeight;
    if (!this.wrapper || !this.inner) {
      return;
    }
    const { top, bottom, left, width } = getDOMRect(this.wrapper);
    const { height } = getDOMRect(this.inner);
    const { getStop, side } = this.props;
    const { fixed: prevFixed, height: prevHeight = height } = this.state;
    const offset = this.getProps().offset;
    const fixed = side === 'top' ? top < offset : Math.floor(bottom) > windowHeight - offset;

    this.setState({ fixed, left });

    if (fixed && !prevFixed) {
      this.setState({ width, height });
    }

    if (fixed) {
      this.setState({ width });
      const stop = getStop && getStop();
      if (stop) {
        const deltaHeight = prevHeight - height;
        const stopRect = getDOMRect(stop);
        const outerHeight = height + offset;
        let stopped = false;
        let relativeTop = 0;

        if (side === 'top') {
          stopped = stopRect.top - outerHeight < 0;
          relativeTop = stopRect.top - prevHeight - top;
        } else {
          stopped = stopRect.bottom + outerHeight > windowHeight;
          relativeTop = stopRect.bottom - top;
        }

        this.setState({ relativeTop, deltaHeight, stopped });
      }
    }
  };
}
