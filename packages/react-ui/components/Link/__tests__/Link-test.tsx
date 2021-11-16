import { mount } from 'enzyme';
import React from 'react';

import { LinkProps } from '..';
import { LinkFuture } from '../Link';

const render = (props?: LinkProps) => mount(<LinkFuture {...props} />);

describe('Link', () => {
  it('calls `onClick` when link clicked', () => {
    const onClick = jest.fn();

    const wrapper = render({ onClick });
    wrapper.find('a').simulate('click');

    expect(onClick).toHaveBeenCalled();
  });

  describe('"rel" attribute', () => {
    it("doesn't change if defined in props", () => {
      const wrapper = render({ href: 'https://example.com', rel: 'nofollow' });

      expect(wrapper.find('a').prop('rel')).toBe('nofollow');
    });

    it("doesn't get filled if there is no href", () => {
      const wrapper = render();

      expect(wrapper.find('a').prop('rel')).toBe(undefined);
    });

    describe('external hrefs', () => {
      it.each([['https://example.com:8080/home'], ['http://example.com'], ['//example.com/'], ['HTTP://EXAMPLE.COM']])(
        '%s',
        (href) => {
          const wrapper = render({ href: href });

          expect(wrapper.find('a').prop('rel')).toBe('noopener noreferrer');
        },
      );
    });

    describe('internal hrefs', () => {
      it.each([
        [`https://${location.host}/home`],
        [`http://${location.host}`],
        [`//${location.host}`],
        ['/home'],
        ['/home?redirect=http://example.com'],
        ['../home'],
        ['page.html'],
        ['#anchor'],
      ])('%s', (href) => {
        const wrapper = render({ href: href });

        expect(wrapper.find('a').prop('rel')).toBe('noopener');
      });
    });
  });
});
