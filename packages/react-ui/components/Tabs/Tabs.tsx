import React, { AriaAttributes } from 'react';

import { isHTMLElement } from '../../lib/globalThat';
import { emptyHandler } from '../../lib/utils';
import { ThemeContext } from '../../lib/theming/ThemeContext';
import { Theme } from '../../lib/theming/Theme';
import { CommonProps, CommonWrapper } from '../../internal/CommonWrapper';
import { cx } from '../../lib/theming/Emotion';
import { getRootNode } from '../../lib/rootNode/getRootNode';
import { rootNode, TSetRootNode } from '../../lib/rootNode';
import { createPropsGetter } from '../../lib/createPropsGetter';

import { Indicator } from './Indicator';
import { styles } from './Tabs.styles';
import { TabsContext, TabsContextType } from './TabsContext';
import { Tab, TabSize } from './Tab';

type ValueBaseType = string;
interface TabType<T extends ValueBaseType> {
  getNode: () => Tab<T> | null;
  id: T;
}

export interface TabsProps<T extends ValueBaseType = string> extends CommonProps {
  /**
   * Tab component should be child of Tabs component
   */
  children?: React.ReactNode;

  /**
   * Classname of indicator
   */
  indicatorClassName?: string;

  /**
   * Tabs change event
   */
  onValueChange?: (value: T) => void;

  /**
   * Задаёт размер контрола.
   *
   * **Допустимые значения**: `"small"`, `"medium"`, `"large"`.
   */
  size?: TabSize;

  /**
   * Active tab identifier
   */
  value: T;

  /**
   * Vertical indicator
   * @default false
   */
  vertical?: boolean;

  /**
   * Width of tabs container
   */
  width?: number | string;

  /**
   * Атрибут для указания id элемента(-ов), описывающих его
   */
  'aria-describedby'?: AriaAttributes['aria-describedby'];
}

export const TabsDataTids = {
  root: 'Tabs__root',
  indicatorRoot: 'Indicator__root',
} as const;

type DefaultProps = Required<Pick<TabsProps, 'vertical' | 'size'>>;

/**
 * Tabs wrapper
 *
 * contains static property `Tab`
 */
@rootNode
export class Tabs<T extends string = string> extends React.Component<TabsProps<T>> {
  public static __KONTUR_REACT_UI__ = 'Tabs';

  public static defaultProps: DefaultProps = {
    vertical: false,
    size: 'large',
  };

  private getProps = createPropsGetter(Tabs.defaultProps);

  public static Tab = Tab;

  private theme!: Theme;

  private tabs: Array<TabType<T>> = [];

  private tabUpdates = {
    on: (cb: () => void) => {
      const index = this.listeners.push(cb);
      return () => {
        this.listeners.splice(index, 1);
      };
    },
  };

  private listeners: Array<typeof emptyHandler> = [];
  private setRootNode!: TSetRootNode;

  public render() {
    const { value, width, children, indicatorClassName, 'aria-describedby': ariaDescribedby } = this.props;
    const { vertical, size } = this.getProps();
    return (
      <ThemeContext.Consumer>
        {(theme) => {
          this.theme = theme;
          return (
            <CommonWrapper rootNodeRef={this.setRootNode} {...this.props}>
              <div
                data-tid={TabsDataTids.root}
                className={cx({
                  [styles.rootSmall(this.theme)]: size === 'small',
                  [styles.rootMedium(this.theme)]: size === 'medium',
                  [styles.rootLarge(this.theme)]: size === 'large',
                  [styles.vertical()]: vertical,
                })}
                style={{ width }}
                aria-describedby={ariaDescribedby}
              >
                <TabsContext.Provider
                  value={{
                    vertical,
                    activeTab: value,
                    size,
                    getTab: this.getTab,
                    addTab: this.addTab,
                    removeTab: this.removeTab,
                    notifyUpdate: this.notifyUpdate,
                    shiftFocus: this.shiftFocus,
                    switchTab: this.switchTab,
                  }}
                >
                  {children}
                  <Indicator
                    className={indicatorClassName}
                    tabUpdates={this.tabUpdates}
                    vertical={this.getProps().vertical}
                  />
                </TabsContext.Provider>
              </div>
            </CommonWrapper>
          );
        }}
      </ThemeContext.Consumer>
    );
  }

  private shiftFocus: TabsContextType<T>['shiftFocus'] = (fromTab, delta) => {
    const { tabs } = this;
    const index = tabs.findIndex((x) => x.id === fromTab);
    const newIndex = Math.max(0, Math.min(index + delta, tabs.length - 1));
    const tab = tabs[newIndex];

    const tabNode = tab.getNode();
    const htmlNode = getRootNode(tabNode);

    if (isHTMLElement(htmlNode) && typeof htmlNode.focus === 'function') {
      htmlNode.focus();
    }
  };

  private notifyUpdate: TabsContextType<T>['notifyUpdate'] = () => {
    this.listeners.forEach((cb) => cb());
  };

  private switchTab: TabsContextType<T>['switchTab'] = (id) => {
    const { onValueChange, value } = this.props;
    if (id !== value && onValueChange) {
      onValueChange(id);
    }
  };

  private getTab: TabsContextType<T>['getTab'] = (id) => {
    const { getNode = null } = this.tabs.find((x) => x.id === id) || {};
    return getNode && getNode();
  };

  private addTab: TabsContextType<T>['addTab'] = (id, getNode) => {
    this.tabs = this.tabs.concat({ id, getNode });
  };

  private removeTab: TabsContextType<T>['removeTab'] = (id) => {
    this.tabs = this.tabs.filter((tab) => tab.id !== id);
  };
}
