import React from 'react';

import { reactGetTextContent } from '../reactGetTextContent';

class SimpleComponent extends React.Component<React.PropsWithChildren> {
  public render() {
    return (
      <div>
        <span>{this.props.children}</span>
      </div>
    );
  }
}

interface TextContent {
  label: string;
  renderNode: (label: string) => React.ReactNode;
}

const testCase: TextContent[] = [
  {
    label: 'First',
    renderNode: (label) => label,
  },

  {
    label: 'First Second',
    renderNode: (label) => <SimpleComponent>{label}</SimpleComponent>,
  },

  {
    label: 'Third',
    renderNode: (label) => <span>{label}</span>,
  },

  {
    label: 'Fourth',
    renderNode: (label) => label?.split('').map((char, index) => <span key={index}>{char}</span>),
  },

  {
    label: 'Fifth',
    renderNode: (label) => (
      <span>
        <span>{label}</span>
      </span>
    ),
  },

  {
    label: '123',
    renderNode: () => 123,
  },

  { label: '', renderNode: () => false },
];

describe('reactGetTextContent', () => {
  testCase.forEach(({ label, renderNode }, index) => {
    it(`Test (${index + 1})`, () => {
      const node = renderNode(label);
      const textContent = reactGetTextContent(node);

      expect(textContent).toBe(label);
    });
  });
});
