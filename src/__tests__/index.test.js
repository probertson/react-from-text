import React from 'react';
import { shallow } from 'enzyme';

import fromText from '../index';

describe('fromText', () => {
  it('substitutes sprintf-style placeholders', () => {
    const formatted = fromText('Hello, %(name)s!', { name: 'World' });
    expect(formatted).toEqual('Hello, World!');
  });

  it('substitutes self closing tags', () => {
    const formatted = shallow(
      <div>{fromText('Hello, <span/>World!', { span: <span /> })}</div>
    );

    expect(
      formatted.equals(
        <div>
          Hello, <span />
          World!
        </div>
      )
    ).toBe(true);
  });

  it('supports trailing whitespace in self-closing tags', () => {
    const formatted = shallow(
      <div>{fromText('Hello, <span />World!', { span: <span /> })}</div>
    );

    expect(
      formatted.equals(
        <div>
          Hello, <span />
          World!
        </div>
      )
    ).toBe(true);
  });

  it('supports numbers in self closing tags', () => {
    const formatted = shallow(
      <div>{fromText('Hello, <break2 />World!', { break2: <br /> })}</div>
    );

    expect(
      formatted.equals(
        <div>
          Hello, <br />
          World!
        </div>
      )
    ).toBe(true);
  });

  it('substitutes empty tag pairs', () => {
    const formatted = shallow(
      <div>{fromText('Hello, <span></span>World!', { span: <span /> })}</div>
    );

    expect(
      formatted.equals(
        <div>
          Hello, <span></span>
          World!
        </div>
      )
    ).toBe(true);
  });

  it('treats nested text as strings', () => {
    const formatted = shallow(
      <div>
        {fromText('Hello, <span>World!</span>', {
          span: <span />,
        })}
      </div>
    );

    expect(
      formatted.equals(
        <div>
          Hello, <span>World!</span>
        </div>
      )
    ).toBe(true);
  });

  it('maintains props on placeholders', () => {
    const formatted = shallow(
      <div>
        {fromText('Hello, <span>World</span>!', {
          span: <span style={{ fontWeight: 'bold' }} />,
        })}
      </div>
    );

    expect(
      formatted.equals(
        <div>
          Hello, <span style={{ fontWeight: 'bold' }}>World</span>!
        </div>
      )
    ).toBe(true);
  });

  it('substitutes sibling tags', () => {
    const formatted = shallow(
      <div>
        {fromText('<div>Hello</div>, <span>World</span>!', {
          span: <span />,
          div: <div />,
        })}
      </div>
    );

    expect(
      formatted.equals(
        <div>
          <div>Hello</div>, <span>World</span>!
        </div>
      )
    ).toBe(true);
  });

  it('substitutes both twin tags', () => {
    const formatted = shallow(
      <div>
        {fromText('<span>Hello</span>, <span>World</span>!', {
          span: <span />,
        })}
      </div>
    );

    expect(
      formatted.equals(
        <div>
          <span>Hello</span>, <span>World</span>!
        </div>
      )
    ).toBe(true);
  });

  it('substitutes named sprintf placeholders inside tag characters', () => {
    const formatted = shallow(
      <div>
        {fromText('Hello, <span>%(name)s!</span>', {
          name: 'World',
          span: <span />,
        })}
      </div>
    );

    expect(
      formatted.equals(
        <div>
          Hello, <span>World!</span>
        </div>
      )
    ).toBe(true);
  });

  it('substitutes nested tags', () => {
    const formatted = shallow(
      <div>
        {fromText('<span><span>Hello</span>, World!</span>', {
          span: <span />,
        })}
      </div>
    );

    expect(
      formatted.equals(
        <div>
          <span>
            <span>Hello</span>, World!
          </span>
        </div>
      )
    ).toBe(true);
  });

  it('substitutes nested self closing', () => {
    const formatted = shallow(
      <div>
        {fromText('Hello, <span><br/>World!</span>', {
          span: <span />,
          br: <br />,
        })}
      </div>
    );

    expect(
      formatted.equals(
        <div>
          Hello,{' '}
          <span>
            <br />
            World!
          </span>
        </div>
      )
    ).toBe(true);
  });

  it('supports an html-tag-like substitution value', () => {
    const formatted = shallow(
      <div>
        {fromText('Hello %(world)s<span>Foo</span>', {
          world: '<b />',
          span: <span />,
        })}
      </div>
    );

    expect(
      formatted.equals(
        <div>
          {'Hello <b />'}
          <span>Foo</span>
        </div>
      )
    ).toBe(true);
  });

  it('treats invalid tags as text', () => {
    const formatted = shallow(<div>{fromText('<Hello World>', {})}</div>);

    expect(formatted.equals(<div>&lt;Hello World&gt;</div>)).toBe(true);
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
