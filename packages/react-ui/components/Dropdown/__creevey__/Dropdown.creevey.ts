import { story, kind, test } from 'creevey';

import { delay } from '../../../lib/utils';

kind('Dropdown', () => {
  story('SimpleDropdown', ({ setStoryParameters }) => {
    setStoryParameters({
      skip: {
        'story-skip-0': { in: ['ie11', 'ie118px', 'ie11Flat8px', 'ie11Dark'], tests: 'MenuItem hover' },

        // TODO @Khlutkova fix after update browsers
        'story-skip-1': { in: ['chrome8px', 'chromeFlat8px', 'chrome', 'chromeDark'], tests: ['MenuItem hover'] },
      },
    });

    test('idle', async function () {
      const element = await this.browser.findElement({ css: '.dropdown-test-container' });
      await delay(1000);
      await this.expect(await element.takeScreenshot()).to.matchImage('idle');
    });

    test('clicked', async function () {
      const element = await this.browser.findElement({ css: '.dropdown-test-container' });
      await this.browser
        .actions({
          async: undefined,
          bridge: true,
        })
        .click(this.browser.findElement({ css: '[data-comp-name~="Dropdown"]' }))
        .perform();
      await delay(1000);
      await this.expect(await element.takeScreenshot()).to.matchImage('clicked');
    });

    test('MenuItem hover', async function () {
      const element = await this.browser.findElement({ css: '.dropdown-test-container' });
      await this.browser
        .actions({
          async: undefined,
          bridge: true,
        })
        .click(this.browser.findElement({ css: '[data-comp-name~="Dropdown"]' }))
        .perform();
      await this.browser
        .actions({
          async: undefined,
          bridge: true,
        })
        .move({
          origin: this.browser.findElement({ css: '[data-comp-name~="MenuItem"]' }),
        })
        .perform();
      await delay(1000);
      await this.expect(await element.takeScreenshot()).to.matchImage('MenuItem hover');
    });

    test('selected item', async function () {
      const element = await this.browser.findElement({ css: '.dropdown-test-container' });
      await this.browser
        .actions({
          async: undefined,
          bridge: true,
        })
        .click(this.browser.findElement({ css: '[data-comp-name~="Dropdown"]' }))
        .perform();
      await this.browser
        .actions({
          async: undefined,
          bridge: true,
        })
        .click(this.browser.findElement({ css: '[data-comp-name~="MenuItem"]' }))
        .perform();
      await delay(1000);
      await this.expect(await element.takeScreenshot()).to.matchImage('selected item');
    });
  });

  story('WithMenuItemIcon', ({ setStoryParameters }) => {
    setStoryParameters({ captureElement: '.dropdown-test-container' });

    test('clicked', async function () {
      await this.browser
        .actions({
          async: undefined,
          bridge: true,
        })
        .click(this.browser.findElement({ css: '[data-comp-name~="Dropdown"]' }))
        .perform();
      await delay(1000);
      await this.expect(await this.takeScreenshot()).to.matchImage('clicked');
    });
  });

  story('InsideScrollableContainer', ({ setStoryParameters }) => {
    setStoryParameters({ captureElement: '.dropdown-test-container' });

    test('scrolled', async function () {
      await this.browser
        .actions({ async: undefined, bridge: true })
        .click(this.browser.findElement({ css: '[data-comp-name~="Dropdown"]' }))
        .perform();
      const opened = await this.takeScreenshot();
      await this.browser.executeScript(function () {
        const scrollContainer = window.document.querySelector('.dropdown-test-container') as HTMLElement;
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      });
      const scrolled = await this.takeScreenshot();
      await this.expect({ opened, scrolled }).to.matchImages();
    });
  });

  story('WithCustomSelectTheme', () => {
    test('clicked', async function () {
      await this.browser
        .actions({
          async: undefined,
          bridge: true,
        })
        .click(this.browser.findElement({ css: '[data-comp-name~="Dropdown"]' }))
        .perform();
      await this.expect(await this.takeScreenshot()).to.matchImage('clicked');
    });
  });

  story('WithManualPosition', ({ setStoryParameters }) => {
    setStoryParameters({ skip: { 'no themes': { in: /^(?!\b(chrome|firefox)\b)/ } } });

    test('opened top with portal', async function () {
      await this.browser
        .actions({
          async: undefined,
          bridge: true,
        })
        .click(this.browser.findElement({ css: '[data-comp-name~="Dropdown"]' }))
        .perform();
      await delay(1000);
      await this.expect(await this.takeScreenshot()).to.matchImage('opened top with portal');
    });

    test('opened bottom with portal', async function () {
      await this.browser
        .actions({
          async: undefined,
          bridge: true,
        })
        .click(this.browser.findElement({ css: '[data-tid~="pos"]' }))
        .pause(1000)
        .click(this.browser.findElement({ css: '[data-comp-name~="Dropdown"]' }))
        .perform();
      await delay(1000);
      await this.expect(await this.takeScreenshot()).to.matchImage('opened bottom with portal');
    });

    test('opened top without portal', async function () {
      await this.browser
        .actions({
          async: undefined,
          bridge: true,
        })
        .click(this.browser.findElement({ css: '[data-tid~="portal"]' }))
        .pause(1000)
        .click(this.browser.findElement({ css: '[data-comp-name~="Dropdown"]' }))
        .perform();
      await delay(1000);
      await this.expect(await this.takeScreenshot()).to.matchImage('opened top without portal');
    });

    test('opened bottom without portal', async function () {
      await this.browser
        .actions({
          async: undefined,
          bridge: true,
        })
        .click(this.browser.findElement({ css: '[data-tid~="portal"]' }))
        .pause(1000)
        .click(this.browser.findElement({ css: '[data-tid~="pos"]' }))
        .pause(1000)
        .click(this.browser.findElement({ css: '[data-comp-name~="Dropdown"]' }))
        .perform();
      await delay(1000);
      await this.expect(await this.takeScreenshot()).to.matchImage('opened bottom without portal');
    });
  });

  story('Size', () => {
    test('clicked all', async function () {
      await this.browser
        .actions({
          async: undefined,
          bridge: true,
        })
        .click(this.browser.findElement({ css: '[data-tid="open-all"]' }))
        .pause(500)
        .perform();
      await delay(1000);
      await this.expect(await this.takeScreenshot()).to.matchImage('ClickedAll');
    });
  });
});
