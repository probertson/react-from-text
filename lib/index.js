"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = fromText;

var _react = _interopRequireDefault(require("react"));

var _sprintfJs = require("sprintf-js");

var _invariant = _interopRequireDefault(require("invariant"));

var _excluded = ["remaining"];

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

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
function fromText(message, placeholders) {
  var context = {
    string: message
  };
  var ast = parseFragment(message, context);
  var children = substituteTags(ast, placeholders, context);
  return children.length === 1 ? children[0] : children;
}

function parseFragment(rawMessage, context) {
  var message = rawMessage;
  var result = [];

  while (message !== '') {
    var _parseNext = parseNext(message, context),
        remaining = _parseNext.remaining,
        props = _objectWithoutProperties(_parseNext, _excluded);

    result.push(_objectSpread({}, props));
    message = remaining;
  }

  return result;
}

function parseNext(message, context) {
  var _parseNextToken = parseNextToken(message),
      kind = _parseNextToken.kind,
      value = _parseNextToken.value,
      name = _parseNextToken.name,
      remaining = _parseNextToken.remaining;

  if (kind === TOKENS.SELF) {
    return {
      kind: NODES.TAG,
      value: {
        name: name,
        children: null
      },
      remaining: remaining
    };
  } else if (kind === TOKENS.OPEN) {
    var next = parseUntilClosing(name, remaining, context);
    (0, _invariant["default"])(next, createError("missing closing tag </".concat(name, ">"), context));
    var children = next.children,
        newRemaining = next.remaining;
    return {
      kind: NODES.TAG,
      value: {
        name: name,
        children: children
      },
      remaining: newRemaining
    };
  }
  /* kind === TOKENS.TEXT */
  else {
    return {
      kind: NODES.TEXT,
      value: value,
      remaining: remaining
    };
  }
}

function parseNextToken(message) {
  var match = message.match(/<\/?(\w+?)(\s*\/)?>/); // Text until tag

  if (match && match.index !== 0) {
    var value = message.substr(0, match.index);
    var remaining = message.substr(match.index);
    return {
      kind: TOKENS.TEXT,
      value: value,
      remaining: remaining
    };
  } // Tag


  if (match && match.index === 0) {
    var _getTagInfo = getTagInfo(match[0]),
        name = _getTagInfo.name,
        kind = _getTagInfo.kind;

    var _remaining = message.substr(match[0].length);

    return {
      kind: kind,
      name: name,
      remaining: _remaining
    };
  } // Only text remains


  return {
    kind: TOKENS.TEXT,
    value: message,
    remaining: ''
  };
}

function getTagInfo(string) {
  var openingTag = string.match(/<(\w+)>/i);
  var closingTag = string.match(/<\/(\w+)>/i);
  var selfClosingTag = string.match(/<(\w+)\s*\/>/i);

  if (openingTag) {
    return {
      name: openingTag[1],
      kind: TOKENS.OPEN
    };
  }

  if (closingTag) {
    return {
      name: closingTag[1],
      kind: TOKENS.CLOSE
    };
  }
  /* selfClosingTag */


  return {
    name: selfClosingTag[1],
    kind: TOKENS.SELF
  };
}

function parseUntilClosing(tagName, message, context) {
  var children = [];

  do {
    var _parseNextToken2 = parseNextToken(message),
        name = _parseNextToken2.name,
        value = _parseNextToken2.value,
        kind = _parseNextToken2.kind,
        remaining = _parseNextToken2.remaining;

    if (kind === TOKENS.CLOSE) {
      (0, _invariant["default"])(tagName === name, createError("missing closing tag </".concat(tagName, ">"), context));
      return {
        children: children,
        remaining: remaining
      };
    } else if (kind === TOKENS.SELF) {
      message = remaining;
      children.push({
        kind: NODES.TAG,
        value: {
          name: name,
          children: null
        }
      });
    } else if (kind === TOKENS.OPEN) {
      var _parseUntilClosing = parseUntilClosing(name, remaining, context),
          nestedChildren = _parseUntilClosing.children,
          nestedRemaining = _parseUntilClosing.remaining;

      message = nestedRemaining;
      children.push({
        kind: NODES.TAG,
        value: {
          name: name,
          children: nestedChildren
        }
      });
    }
    /* kind === TOKENS.TEXT */
    else {
      message = remaining;
      children.push({
        kind: NODES.TEXT,
        value: value
      });
    }
  } while (message !== '');
}

var NODES = {
  TEXT: 'TEXT',
  TAG: 'TAG'
};
var TOKENS = {
  TEXT: 'TEXT',
  SELF: 'SELF',
  OPEN: 'OPEN',
  CLOSE: 'CLOSE'
};

function substituteTags(message, placeholders, context) {
  return message.map(function (node, i) {
    if (node.kind === NODES.TAG) {
      var _node$value = node.value,
          name = _node$value.name,
          children = _node$value.children;
      (0, _invariant["default"])(Object.prototype.hasOwnProperty.call(placeholders, name), createError("missing placeholder value <".concat(name, ">"), context));
      var props = {
        key: "".concat(name, "-").concat(i)
      };
      var element = placeholders[name];
      (0, _invariant["default"])(_react["default"].isValidElement(element), createError("placeholder value <".concat(name, "> is not a react element"), context));
      return _react["default"].cloneElement.apply(_react["default"], [placeholders[name], props].concat(_toConsumableArray(children ? substituteTags(children, placeholders, context) : [])));
    }
    /* node.kind === NODES.TEXT */


    return (0, _sprintfJs.sprintf)(node.value, placeholders);
  });
}

function createError(error, context) {
  return ["fromText: ".concat(error), "Source: ".concat(context.string)].join('\n');
}