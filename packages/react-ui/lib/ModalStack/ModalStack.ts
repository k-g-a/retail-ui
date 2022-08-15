import React from 'react';

import { SidePageProps } from '../../components/SidePage';
import { ModalProps } from '../../components/Modal';
import { globalThat } from '../SSRSafe';

import { Emitter } from './Emitter';

type Handler = () => void;
type Event = Handler | Handler[] | undefined;

interface Events {
  _events?: { [name: string]: Event };
}

export interface StackInfo {
  emitter: Events & Emitter;
  mounted: React.Component[];
}

export interface GlobalWithStackInfo {
  __ReactUIStackInfo?: StackInfo;
}

export interface ModalStackSubscription {
  remove: () => void;
}

export class ModalStack {
  public static add(
    component: React.Component,
    onChange: (stack: readonly React.Component[]) => void,
  ): ModalStackSubscription {
    const { emitter, mounted } = ModalStack.getStackInfo();
    mounted.unshift(component);
    const changeHandler = () => onChange([...mounted]);
    const fallbackFBEmitter = emitter.addListener('change', changeHandler);
    emitter.emit('change');
    return {
      remove: () => {
        // Backward compatible with versions using the `fbemitter` package.
        if ('remove' in fallbackFBEmitter) {
          // @ts-expect-error: `remove` is method of `ModalStack`.
          fallbackFBEmitter.remove();
          return;
        }

        emitter.removeListener('change', changeHandler);
      },
    };
  }

  public static remove(component: React.Component) {
    const { emitter, mounted } = ModalStack.getStackInfo();
    const index = mounted.indexOf(component);
    if (index !== -1) {
      mounted.splice(index, 1);
    }
    emitter.emit('change');
  }

  /**
   * Determines if stack component is allowed to block background
   */
  public static isBlocking(component: React.Component): boolean {
    const { mounted } = ModalStack.getStackInfo();
    for (let index = 0; index < mounted.length; index++) {
      if (ModalStack.wantsToBlock(mounted[index])) {
        // only the highest component in stack
        // that wants to block is allowed to do it
        return component === mounted[index];
      }
    }
    return false;
  }

  public static getStackInfo(): StackInfo {
    return (
      globalThat.__ReactUIStackInfo ||
      (globalThat.__ReactUIStackInfo = {
        emitter: new Emitter(),
        mounted: [],
      })
    );
  }

  private static wantsToBlock(component: React.Component): boolean {
    if (isModal(component)) {
      return true;
    }

    if (isSidePage(component)) {
      const { mounted } = ModalStack.getStackInfo();
      const deepestSidePages = mounted.filter((i) => isSidePage(i)).pop();
      return !!component.props.blockBackground && component === deepestSidePages;
    }

    return false;
  }
}

/**
 * Specific check for component type by its instance
 */
const isReactUIInstance = <T>(componentName: string) => {
  return (instance: React.Component): instance is React.Component<T> => {
    const { constructor } = instance;

    return (
      Object.prototype.hasOwnProperty.call(constructor, '__KONTUR_REACT_UI__') &&
      // @ts-expect-error: React doesn't know about existence of __KONTUR_REACT_UI__.
      constructor.__KONTUR_REACT_UI__ === componentName
    );
  };
};

const isSidePage = isReactUIInstance<SidePageProps>('SidePage');

const isModal = isReactUIInstance<ModalProps>('Modal');
