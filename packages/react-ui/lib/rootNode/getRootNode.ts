import { findDOMNode } from 'react-dom';
import React from 'react';
import warning from 'warning';
import { globalObject } from '@skbkontur/global-object';

import { isInstanceOf } from '../../lib/isInstanceOf';
import { Nullable } from '../../typings/utility-types';

import { isInstanceWithRootNode } from './rootNodeDecorator';

/**
 * Extracts component's root Element (HTMLElement/SVGElement) out of it's instance
 * following the "StrictMode support convention" (@see README.md#strictmode, #2518).
 *
 * Replaces findDOMNode but falls back to it if "convention" is not respected.
 *
 * @param instance Component's instance provided by React.Ref or `this` inside class-components.
 * @returns Component's root `Element` or null
 */

export const getRootNode = (instance: Nullable<React.ReactInstance>): Nullable<Element> => {
  /**
   * Options of what instance can be:
   *  1. null or undefined
   *  2. DOM Element
   *  3. class Component instance (object)
   *  4. literally anything, returned from useImperativeHandle
   */

  if (!globalObject.document || !instance) {
    // instance can be `null` if component was unmounted
    // also checking undefined for convenient usage
    return null;
  }

  if (isInstanceOf(instance, globalObject.Element)) {
    // instance can be an Element already if its coming
    // from Refs of intrinsic elements (<div />, <button />, etc.)
    return instance;
  }

  let rootNode;

  if (isInstanceWithRootNode(instance)) {
    // it happened to be that native Node interface also has
    // the "getRootNode" method, but we can ignore it here
    // because we'd already checked the instance on being an Element
    // which is a subclass of Node, so, just fixing types here
    if (!isInstanceOf(instance, globalObject.Node)) {
      rootNode = instance.getRootNode();
    }
  }

  if (rootNode !== undefined) {
    // the getter exists and has returned something, it should be what we are looking for
    // probably its an Element or null (which is also OK, e.g. Popup/Tooltip/Hint before opening)
    return rootNode;
  }

  try {
    // rootNode is undefined, which means that the getter doesn't exists or returns the undefined
    // anyway, it tell us that the convention is not respected,
    // so, we have to fall back to the deprecated findDOMNode, which breaks StrictMode
    // instance can still be a class component or an imperative handle (i.e., anything, except null/undefined/Element)
    rootNode = findDOMNode(instance);
  } catch (e) {
    // but findDOMNode doesn`t accept everything that instance can be at this point,
    // so we have to handle exceptions
    // see https://github.com/facebook/react/blob/cae63505/packages/react-dom/src/__tests__/findDOMNode-test.js#L66-L86
    warning(
      false,
      '[getRootNode]: can`t fallback to findDOMNode.' +
        '\n' +
        'See https://github.com/skbkontur/retail-ui/blob/master/packages/react-ui/README.md#strictmode' +
        '\n\n' +
        e.message,
    );
    return null;
  }

  // the findDOMNode can also return Text, but we are only interested in Elements, so just filter it
  return isInstanceOf(rootNode, globalObject.Element) ? rootNode : null;
};
