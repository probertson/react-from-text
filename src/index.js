import React from 'react';
import { sprintf } from 'sprintf-js';
import formatChildrenBase from './base-format-children';

/**
 * Formats a localized string with substituted elements (values and React components).
 *
 * @param message The localized string.
 * @param placeholders An object defining a map values to substitute into the string. For
 *                     named value substitutions (`%(someVariable)s`) the property key
 *                     matching the variable name (`someVariable`) defines the value
 *                     that's substituted. For tag-like substitutions (`<span>foo</span>`
 *                     or `<br/>` or `<myReactComponent/>`) the key matching the tag name
 *                     defines the React component that replaces the tag(s).
 */
export default function reactFromText(message, placeholders) {
  return replacePlaceholders(
    formatChildrenBase(applyChildren, message, placeholders),
    placeholders
  );
}

function replacePlaceholders(segment, placeholders, dedupeKeySuffix) {
  // it's a string so just substitute the placeholders
  if (typeof segment === 'string') {
    return sprintf(segment, placeholders);
  }

  // it's an array of (strings and/or React elements) so perform replacement on each one
  if (Array.isArray(segment)) {
    return segment.map((subSegment, index) =>
      replacePlaceholders(subSegment, placeholders, index.toString())
    );
  }

  // it's a React element, so perform replacement on its child(ren) instead
  if (segment.props.children) {
    const replacedChildren = replacePlaceholders(
      segment.props.children,
      placeholders
    );
    return React.cloneElement.apply(
      React,
      [
        segment,
        { key: dedupeKeySuffix ? segment.key + dedupeKeySuffix : segment.key },
      ].concat(replacedChildren)
    );
  }

  // it's a React element without any children, so just return the node
  return dedupeKeySuffix
    ? React.cloneElement.apply(React, [
        segment,
        { key: segment.key + dedupeKeySuffix },
      ])
    : segment;
}

function applyChildren(key, element, children) {
  if (process.env.NODE_ENV !== 'production' && !React.isValidElement(element)) {
    throw new Error(JSON.stringify(element) + ' is not a valid element');
  }

  return React.cloneElement.apply(
    React,
    [element, { key: element.key || key }].concat(children || [])
  );
}
