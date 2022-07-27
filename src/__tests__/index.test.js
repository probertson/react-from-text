import React from 'react';
import { render } from '@testing-library/react';

import fromText from '../index';

describe('fromText', () => {
  it('substitutes sprintf-style placeholders', () => {
    const formatted = fromText('Hello, %(name)s!', { name: 'World' });
    expect(formatted).toEqual('Hello, World!');
  });

  it('substitutes self closing tags', () => {
    const { asFragment } = render(
      <div>{fromText('Hello, <span/>World!', { span: <span /> })}</div>
    );

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          Hello, 
          <span />
          World!
        </div>
      </DocumentFragment>
    `);
  });

  it('supports trailing whitespace in self-closing tags', () => {
    const { asFragment } = render(
      <div>{fromText('Hello, <span />World!', { span: <span /> })}</div>
    );

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          Hello, 
          <span />
          World!
        </div>
      </DocumentFragment>
    `);
  });

  it('supports numbers in self closing tags', () => {
    const { asFragment } = render(
      <div>{fromText('Hello, <break2 />World!', { break2: <br /> })}</div>
    );

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          Hello, 
          <br />
          World!
        </div>
      </DocumentFragment>
    `);
  });

  it('substitutes empty tag pairs', () => {
    const { asFragment } = render(
      <div>{fromText('Hello, <span></span>World!', { span: <span /> })}</div>
    );

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          Hello, 
          <span />
          World!
        </div>
      </DocumentFragment>
    `);
  });

  it('treats nested text as strings', () => {
    const { asFragment } = render(
      <div>
        {fromText('Hello, <span>World!</span>', {
          span: <span />,
        })}
      </div>
    );

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          Hello, 
          <span>
            World!
          </span>
        </div>
      </DocumentFragment>
    `);
  });

  it('maintains props on placeholders', () => {
    const { asFragment } = render(
      <div>
        {fromText('Hello, <span>World</span>!', {
          span: <span style={{ fontWeight: 'bold' }} />,
        })}
      </div>
    );

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          Hello, 
          <span
            style="font-weight: bold;"
          >
            World
          </span>
          !
        </div>
      </DocumentFragment>
    `);
  });

  it('substitutes sibling tags', () => {
    const { asFragment } = render(
      <div>
        {fromText('<div>Hello</div>, <span>World</span>!', {
          span: <span />,
          div: <div />,
        })}
      </div>
    );

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          <div>
            Hello
          </div>
          , 
          <span>
            World
          </span>
          !
        </div>
      </DocumentFragment>
    `);
  });

  it('substitutes both twin tags', () => {
    const { asFragment } = render(
      <div>
        {fromText('<span>Hello</span>, <span>World</span>!', {
          span: <span />,
        })}
      </div>
    );

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          <span>
            Hello
          </span>
          , 
          <span>
            World
          </span>
          !
        </div>
      </DocumentFragment>
    `);
  });

  it('substitutes named sprintf placeholders inside tags', () => {
    const { asFragment } = render(
      <div>
        {fromText('Hello, <span>%(name)s!</span>', {
          name: 'World',
          span: <span />,
        })}
      </div>
    );

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          Hello, 
          <span>
            World!
          </span>
        </div>
      </DocumentFragment>
    `);
  });

  it('substitutes nested tags', () => {
    const { asFragment } = render(
      <div>
        {fromText('<span><span>Hello</span>, World!</span>', {
          span: <span />,
        })}
      </div>
    );

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          <span>
            <span>
              Hello
            </span>
            , World!
          </span>
        </div>
      </DocumentFragment>
    `);
  });

  it('substitutes nested self closing tags', () => {
    const { asFragment } = render(
      <div>
        {fromText('Hello, <span><br/>World!</span>', {
          span: <span />,
          br: <br />,
        })}
      </div>
    );

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          Hello, 
          <span>
            <br />
            World!
          </span>
        </div>
      </DocumentFragment>
    `);
  });

  it('supports an html tag-like substitution value', () => {
    const { asFragment } = render(
      <div>
        {fromText('Hello %(world)s<span>Foo</span>', {
          world: '<b />',
          span: <span />,
        })}
      </div>
    );

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          Hello &lt;b /&gt;
          <span>
            Foo
          </span>
        </div>
      </DocumentFragment>
    `);
  });

  it('treats invalid tags as text', () => {
    const { asFragment } = render(<div>{fromText('<Hello World>', {})}</div>);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div>
          &lt;Hello World&gt;
        </div>
      </DocumentFragment>
    `);
  });

  it('informs if they are missing a placeholder tag', () => {
    expect(() => fromText('<div>Hello World!</div>', {})).toThrow(
      /missing placeholder value <div>/
    );
  });

  it('informs if placeholder is not an Element', () => {
    expect(() => fromText('<div>Hello World!</div>', { div: 1 })).toThrow(
      /is not a react element/
    );
  });

  it('informs if they are missing a closing tag', () => {
    expect(() => fromText('<div>Hello World!', { div: <div /> })).toThrow(
      /missing closing tag <\/div>/
    );
  });

  it('informs if they use the wrong closing tag', () => {
    expect(() =>
      fromText('<span>Hello</div>, World!', { span: <span /> })
    ).toThrow(/missing closing tag <\/span>/);
  });
});
