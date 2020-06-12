# react-from-text
Create React elements from a string containing markup. Useful for creating nicely-structured translation strings
containing HTML-like tags.

## Background

You want to build a React app that is translated into multiple languages. To make the translations sound natural, you
need to give the translators the flexibility to re-order placeholder items within the translated strings.

For example, suppose you want to include a variable, a link, and some bold text in a sentence to be translated. Ignoring
translation requirements, it would be something like this:

```jsx
function SomeComponent({ prize }) {
  return (
    <div>You will <b>win a {prize}</b> if you <a href="https://example.com/">Click Here</a>!</div>
  );
}
```

One way to handle this would be to break the text into several chunks and submit them separately to translators. In this
case the chunks would be:

> "You will"
 
> "win a"

> "if you"

> "Click Here"

Breaking up the string forces translators to figure out a way to translate the chunks into a well-structured sentence,
without changing the order of the chunks.

## Example

A better way is to give the translators a full sentence, including markers for the HTML tags and the placeholder
variable -- something like:

> You will &lt;b>win a %(prizeName)s&lt;/b> if you &lt;link>Click Here&lt;/link>!

That's where this library comes in:

```jsx
import fromText from 'react-from-text';
import gettext from '...';

function TranslatedComponent({ prize }) {
  // This example uses `gettext()` for the actual translation substitution,
  // but any function that returns a string works (or even a hard-coded string).
  return (
    <div>
      {
        fromText(
          gettext('You will <b>win a %(prizeName)s</b> if you <link>Click Here</link>!'),
          {
            prizeName: prize,
            b: <b/>,
            link: <a href="https://example.com/"/>,
          }
        )
      }
    </div>
  );
}
```

Also, as this example shows, the names of the tags don't have to actually match the name of the component that replaces
it. You can use tag names that will be helpful to communicate the intent to the translators (such as "link" in this
case, where a hypothetical translator might not know what an `<a>` tag represents.

## API Reference

This package exports a function `fromText()` with the following signature:

```
function fromText(text, placeholders)
```

- `text` (String): The text containing the tags and placeholder markers to replace
- `placeholders` (Object): A map of placeholder names (from the text) to their replacements. These can take two
   different forms:
   - A tag (pair or self-closing) in the text is replaced by a React component with specified props
   - An interpolation placeholder in the text is replaced by a value, stringified. This library does not mandate a
     specific format for the interpolation placeholders in the text. It uses
     [sprintf-js](https://github.com/alexei/sprintf.js) (installed separately as a peer dependency) to replace
     interpolation placeholders, so ["named" `sprintf-js` placeholder style](https://github.com/alexei/sprintf.js)
     should be used:
     ```
     '%(name)s', '%(name)d', etc.
     ```

## Credits/Acknowledgements

v1.0.0 (2020-06-11):
For v1.0.0 the core was rewritten by Taylor Everding ([@taylor1791](https://github.com/taylor1791)) to use a cleaner AST-based parsing approach.

v0.1.0
The core of this package was originally a utility (`format-message/react`) in
[format-message](https://github.com/format-message/format-message/packages/format-message), with initial work by
[@vanwagonet](https://github.com/vanwagonet) and [contributions by Paul Robertson (me)](https://github.com/format-message/format-message/pull/117).

Since that time, `format-message` has implemented an alternative approach for supporting tags in translation strings,
and has deprecated the `format-message/react` utility. However, the alternative approach is specific to the
ICU MessageFormat syntax for translations. In my case I wasn't using `format-message` with ICU MessageFormat -- I was
just using the utility to replace tags in strings with React components -- so it made sense to extract it into its own
package. I had also made some React-specific improvements within a private codebase (for example, allowing the same tag
name to be used multiple times in a translation string). Those improvements are also included in this package.

My work (and Taylor's work) on this package was funded by my employer, HireVue, Inc. ([@hirevue](https://github.com/hirevue)). It's a great place to work -- check us out!
