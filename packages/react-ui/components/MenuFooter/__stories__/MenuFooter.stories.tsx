import React from 'react';

import { Meta } from '../../../typings/stories';
import { MenuFooter } from '../MenuFooter';
import { Gapped } from '../../Gapped';

export default {
  title: 'Menu/MenuFooter',
  component: MenuFooter,
  tags: ['autodocs'],
} as Meta;

export const Size = () => {
  return (
    <Gapped>
      <MenuFooter size={'small'}>Маленький</MenuFooter>
      <MenuFooter size={'medium'}>Средний</MenuFooter>
      <MenuFooter size={'large'}>Большой</MenuFooter>
    </Gapped>
  );
};
Size.storyName = 'size';
