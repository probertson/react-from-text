"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = formatChildren;
var invalidChars = '</> \n\t\r';
/**
 * This function runs through the message looking for tokens. As it finds a
 * token matching a wrapper (tag), it pushes the parent in the tree on a stack, and
 * collects children for that wrapper until the ending token is found.
 */

function formatChildren(applyChildren, message, wrappers) {
  if (!wrappers) {
    return message;
  }

  var mm = message.length;
  var stack = [];
  var current = [];
  var currentKey = undefined;
  var last = 0;
  var m;

  for (m = 0; m < mm; ++m) {
    if (message[m] !== '<') {
      continue;
    }

    var isSelfClosing = false;
    var isEnd = false;
    var s = m + 1; // skip <

    if (message[s] === '/') {
      isEnd = true;
      ++s;
    }

    var e = s;

    while (invalidChars.indexOf(message[e]) < 0) {
      ++e;
    }

    if (!isEnd && message.slice(e, e + 2) === '/>') {
      isSelfClosing = true;
    } else if (message[e] !== '>') {
      throw new Error("Wrapping tags include invalid characters in \"".concat(message, "\". Valid characters are any character except \"<\", \"/\", \">\", and whitespace characters."));
    }

    var key = message.slice(s, e);

    if (!wrappers[key]) {
      continue;
    }

    ++e;

    if (isSelfClosing) {
      ++e;
    }

    if (last < m) {
      current.push(message.slice(last, m));
    }

    if (isSelfClosing) {
      current.push(applyChildren(key, wrappers[key], null));
    } else if (isEnd) {
      if (currentKey !== key) {
        throw new Error('Wrapping tags not properly nested in "' + message + '"');
      }

      var children = current;
      current = stack.pop();
      currentKey = stack.pop();
      current.push(applyChildren(key, wrappers[key], children));
    } else {
      // start token
      stack.push(currentKey);
      stack.push(current);
      currentKey = key;
      current = [];
    }

    last = e;
    m = e - 1; // offset next ++
  }

  if (stack.length > 0) {
    throw new Error('Wrapping tags not properly nested in "' + message + '"');
  }

  if (last < m) {
    current.push(message.slice(last, m));
  }

  return current.length === 1 ? current[0] : current;
}