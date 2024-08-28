import React from 'react';
import { Meta, Story } from '../../../typings/stories';

import { RadioGroup, Gapped, Radio } from '@skbkontur/react-ui';

export default {
  title: 'Choose/RadioGroup',
  component: RadioGroup,
} as Meta;

export const Example1: Story = () => {
  
  let items = ['One', 'Two', 'Three', 'Four'];
  
  let simpleRadioGroup = (
    <div>
      <h2>Numbers</h2>
      <RadioGroup name="number-simple" items={items} defaultValue="One" />
    </div>
  );
  
  let complexRadioGroup = (
    <div>
      <h2>Numbers</h2>
      <RadioGroup name="number-complex" defaultValue="3">
        <Gapped gap={40}>
          <Gapped vertical gap={0}>
            <b>Odd</b>
            <Radio value="1">One</Radio>
            <Radio value="3">Three</Radio>
            <Radio value="5" disabled>
              Five
            </Radio>
            <Radio value="7">Seven</Radio>
          </Gapped>
          <Gapped vertical gap={0}>
            <b>Even</b>
            <Radio value="2">Two</Radio>
            <Radio value="4">Four</Radio>
            <Radio value="6">Six</Radio>
            <Radio value="8">Eight</Radio>
          </Gapped>
        </Gapped>
      </RadioGroup>
    </div>
  );
  
  return (
    <div>
      {simpleRadioGroup}
      {complexRadioGroup}
    </div>
  );

};
Example1.storyName = 'Базовый пример';

