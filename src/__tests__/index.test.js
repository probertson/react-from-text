import React from 'react';
import { shallow } from 'enzyme';

import fromText from '../index';

describe('fromText', () => {
  it('substitutes named placeholder variables', () => {
    const values = {
      theDate: 'foo',
    };

    const message = 'Date completed: %(theDate)s';
    const expected = 'Date completed: foo';

    expect(fromText(message, values)).toEqual(expected);
  });

  it('substitutes tag-like placeholders', () => {
    const tags = {
      span: <span />,
    };

    const message = 'Date completed: <span>Never</span>';
    const formattedMessage = shallow(
      <div>{fromText(message, tags)}</div>
    ).html();
    const expected = shallow(
      <div>
        Date completed: <span>Never</span>
      </div>
    ).html();

    expect(formattedMessage).toEqual(expected);
  });

  it('substitutes tag-like placeholders (multiple uses of one placeholder), giving them unique keys', () => {
    const tags = {
      span: <span />,
    };

    const message = 'Date completed: <span>Never</span> <span>Again</span>';
    const formattedMessageSpans = shallow(
      <div>{fromText(message, tags)}</div>
    ).find('span');

    expect.hasAssertions();

    formattedMessageSpans.forEach(formattedSpan => {
      expect(
        formattedMessageSpans.findWhere(
          spanToCheck => spanToCheck.key() === formattedSpan.key()
        ).length
      ).toEqual(1);
    });
  });

  it('substitutes self-closing tag-like placeholders', () => {
    const tags = {
      br: <br />,
    };

    const message = 'Date completed: <br/>Never';
    const formattedMessage = shallow(
      <div>{fromText(message, tags)}</div>
    ).html();
    const expected = shallow(
      <div>
        Date completed: <br />
        Never
      </div>
    ).html();

    expect(formattedMessage).toEqual(expected);
  });

  it('substitutes self-closing tag-like placeholders (multiple uses of one placeholder), giving them unique keys', () => {
    const tags = {
      br: <br />,
    };

    const message = 'Date completed: <br/>Never<br/>Again';
    const formattedMessageBRTags = shallow(
      <div>{fromText(message, tags)}</div>
    ).find('br');

    expect.hasAssertions();

    formattedMessageBRTags.forEach(formattedBR => {
      expect(
        formattedMessageBRTags.findWhere(
          brToCheck => brToCheck.key() === formattedBR.key()
        ).length
      ).toEqual(1);
    });
  });

  it('substitutes named placeholder variables *and* tag-like placeholders', () => {
    const values = {
      theDate: 'foo',
      span: <span />,
    };

    const message = 'Date completed: <span>%(theDate)s</span>';

    const formattedMessage = shallow(
      <div>{fromText(message, values)}</div>
    ).html();
    const expected = shallow(
      <div>
        Date completed: <span>foo</span>
      </div>
    ).html();

    expect(formattedMessage).toEqual(expected);
  });

  it('properly handles named placeholder variables that include tag characters', () => {
    const values = {
      theName: 'foo < >',
      span: <span />,
    };

    const message = 'Position title: <span>%(theName)s</span>';

    const formattedMessage = shallow(
      <div>{fromText(message, values)}</div>
    ).html();
    const expected = shallow(
      <div>
        Position title: <span>foo &lt; &gt;</span>
      </div>
    ).html();

    expect(formattedMessage).toEqual(expected);
  });

  it('properly handles string wrapped in react container', () => {
    const values = {
      span: <span />,
    };

    const message = '<span>Sup</span>';

    const formattedMessage = shallow(
      <div>{fromText(message, values)}</div>
    ).html();
    const expected = shallow(
      <div>
        <span>Sup</span>
      </div>
    ).html();

    expect(formattedMessage).toEqual(expected);
  });

  it('properly handles just a react node', () => {
    const values = {
      span: <span />,
    };

    const message = '<span></span>';

    const formattedMessage = shallow(
      <div>{fromText(message, values)}</div>
    ).html();
    const expected = shallow(
      <div>
        <span></span>
      </div>
    ).html();

    expect(formattedMessage).toEqual(expected);
  });
});
