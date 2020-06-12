import React from 'react';
import { sprintf } from 'sprintf-js';
import invariant from 'invariant';

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
export default function fromText(message, placeholders) {
  const context = { string: message };

  const ast = parseFragment(message, context);
  const children = substituteTags(ast, placeholders, context);

  return children.length === 1 ? children[0] : children;
}

function parseFragment(rawMessage, context) {
  let message = rawMessage;
  const result = [];

  while (message !== '') {
    const { remaining, ...props } = parseNext(message, context);

    result.push({ ...props });
    message = remaining;
  }

  return result;
}

function parseNext(message, context) {
  let { kind, value, name, remaining } = parseNextToken(message);

  if (kind === TOKENS.SELF) {
    return {
      kind: NODES.TAG,
      value: { name, children: null },
      remaining,
    };
  } else if (kind === TOKENS.OPEN) {
    const next = parseUntilClosing(name, remaining, context);
    invariant(next, createError(`missing closing tag </${name}>`, context));

    const { children, remaining: newRemaining } = next;

    return {
      kind: NODES.TAG,
      value: {
        name,
        children,
      },
      remaining: newRemaining,
    };
  } /* kind === TOKENS.TEXT */ else {
    return { kind: NODES.TEXT, value: value, remaining: remaining };
  }
}

function parseNextToken(message) {
  const match = message.match(/\<\/?(\w+?)(\s*\/)?\>/);

  // Text until tag
  if (match && match.index !== 0) {
    const value = message.substr(0, match.index);
    const remaining = message.substr(match.index);

    return {
      kind: TOKENS.TEXT,
      value,
      remaining,
    };
  }

  // Tag
  if (match && match.index === 0) {
    const { name, kind } = getTagInfo(match[0]);
    const remaining = message.substr(match[0].length);

    return { kind, name, remaining };
  }

  // Only text remains
  return { kind: TOKENS.TEXT, value: message, remaining: '' };
}

function getTagInfo(string) {
  const openingTag = string.match(/\<(\w+)\>/i);
  const closingTag = string.match(/\<\/(\w+)\>/i);
  const selfClosingTag = string.match(/\<(\w+)\s*\/\>/i);

  if (openingTag) {
    return { name: openingTag[1], kind: TOKENS.OPEN };
  }

  if (closingTag) {
    return { name: closingTag[1], kind: TOKENS.CLOSE };
  }

  /* selfClosingTag */
  return { name: selfClosingTag[1], kind: TOKENS.SELF };
}

function parseUntilClosing(tagName, message, context) {
  const children = [];

  do {
    const { name, value, kind, remaining } = parseNextToken(message);

    if (kind === TOKENS.CLOSE) {
      invariant(
        tagName === name,
        createError(`missing closing tag </${tagName}>`, context)
      );

      return { children, remaining };
    } else if (kind === TOKENS.SELF) {
      message = remaining;
      children.push({
        kind: NODES.TAG,
        value: {
          name,
          children: null,
        },
      });
    } else if (kind === TOKENS.OPEN) {
      const {
        children: nestedChildren,
        remaining: nestedRemaining,
      } = parseUntilClosing(name, remaining, context);

      message = nestedRemaining;
      children.push({
        kind: NODES.TAG,
        value: { name, children: nestedChildren },
      });
    } /* kind === TOKENS.TEXT */ else {
      message = remaining;
      children.push({
        kind: NODES.TEXT,
        value,
      });
    }
  } while (message !== '');
}

const NODES = {
  TEXT: 'TEXT',
  TAG: 'TAG',
};

const TOKENS = {
  TEXT: 'TEXT',
  SELF: 'SELF',
  OPEN: 'OPEN',
  CLOSE: 'CLOSE',
};

function substituteTags(message, placeholders, context) {
  return message.map((node, i) => {
    if (node.kind === NODES.TAG) {
      const { name, children } = node.value;

      invariant(
        placeholders.hasOwnProperty(name),
        createError(`missing placeholder value <${name}>`, context)
      );

      const props = { key: `${name}-${i}` };
      const element = placeholders[name];

      invariant(
        React.isValidElement(element),
        createError(
          `placeholder value <${name}> is not a react element`,
          context
        )
      );
      return React.cloneElement(
        placeholders[name],
        props,
        ...(children ? substituteTags(children, placeholders, context) : [])
      );
    }

    /* node.kind === NODES.TEXT */
    return sprintf(node.value, placeholders);
  });
}

function createError(error, context) {
  return [`fromText: ${error}`, `Source: ${context.string}`].join('\n');
}
