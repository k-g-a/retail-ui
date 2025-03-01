import React, { useState } from 'react';
import MenuIcon from '@skbkontur/react-icons/Menu';
import ArrowSize2Icon from '@skbkontur/react-icons/ArrowSize2';
import SearchIcon from '@skbkontur/react-icons/Search';
import AddIcon from '@skbkontur/react-icons/Add';
import DeleteIcon from '@skbkontur/react-icons/Delete';

import { Meta, Story } from '../../../typings/stories';
import { MenuItem } from '../../MenuItem';
import { MenuHeader } from '../../MenuHeader';
import { MenuSeparator } from '../../MenuSeparator';
import { DropdownMenu, DropdownMenuProps } from '../DropdownMenu';
import { Button } from '../../Button';
import { Toast } from '../../Toast';
import { Input } from '../../Input';
import { Gapped } from '../../Gapped';
import { CheckAIcon16Regular } from '../../../internal/icons2022/CheckAIcon/CheckAIcon16Regular';

export default {
  title: 'DropdownMenu',
  component: DropdownMenu,
  decorators: [
    (Story: () => JSX.Element) => (
      <div
        style={{
          padding: '20px 120px 150px',
          border: '1px solid #dfdede',
          overflow: 'hidden',
        }}
      >
        <Story />
      </div>
    ),
  ],
} as Meta;

export const SimpleExample: Story = () => (
  <DropdownMenu caption={<Button use="primary">Открыть меню</Button>}>
    <MenuHeader>Заголовок меню</MenuHeader>
    <MenuSeparator />
    <MenuItem onClick={() => Toast.push('Раз')}>Раз</MenuItem>
    <MenuItem onClick={() => Toast.push('Два')}>Два</MenuItem>
    <MenuItem onClick={() => Toast.push('Три')}>Три</MenuItem>
  </DropdownMenu>
);
SimpleExample.storyName = 'Simple example';

const MenuOutOfViewPortSample = ({ side }: { side: 'left' | 'right' }) => {
  return (
    <div
      style={{
        overflow: 'auto',
        width: '100vw',
        height: '300px',
        marginLeft: '-100px',
        marginRight: '-100px',
        marginBottom: '-150px',
      }}
      data-tid="container"
    >
      <div
        style={{
          width: 'calc(100% + 50px)',
          display: 'flex',
          justifyContent: `${side === 'right' ? 'flex-end' : 'flex-start'}`,
          alignItems: 'flex-start',
        }}
      >
        <Gapped vertical>
          <DropdownMenu data-tid={'firstMenu'} caption={<Button use="primary">Открыть меню</Button>}>
            <MenuHeader>Заголовок меню</MenuHeader>
            <MenuSeparator />
            <MenuItem>Раз два три раз два три</MenuItem>
            <MenuItem>Раз два три раз два три</MenuItem>
            <MenuItem>Раз два три раз два три</MenuItem>
          </DropdownMenu>
          <DropdownMenu data-tid={'secondMenu'} menuWidth={300} caption={<Button use="primary">Открыть меню</Button>}>
            <MenuHeader>Заголовок меню</MenuHeader>
            <MenuSeparator />
            <MenuItem>Раз два три раз два три</MenuItem>
            <MenuItem>Раз два три раз два три</MenuItem>
            <MenuItem>Раз два три раз два три</MenuItem>
          </DropdownMenu>
        </Gapped>
      </div>
    </div>
  );
};

export const MenuOutOfViewPortRight: Story = () => {
  return <MenuOutOfViewPortSample side={'right'} />;
};
MenuOutOfViewPortRight.storyName = 'Menu out of viewport right';

export const MenuOutOfViewPortLeft: Story = () => {
  return <MenuOutOfViewPortSample side={'left'} />;
};
MenuOutOfViewPortLeft.storyName = 'Menu out of viewport left';

export const CaptionWidth: Story = () => (
  <div style={{ width: '300px' }}>
    <DropdownMenu
      caption={
        <Button width={'100%'} use="primary">
          Открыть меню
        </Button>
      }
      width={'100%'}
    >
      <MenuHeader>Заголовок меню</MenuHeader>
      <MenuSeparator />
      <MenuItem onClick={() => Toast.push('Раз')}>Раз</MenuItem>
      <MenuItem onClick={() => Toast.push('Два')}>Два</MenuItem>
      <MenuItem onClick={() => Toast.push('Три')}>Три</MenuItem>
    </DropdownMenu>
  </div>
);
CaptionWidth.storyName = 'Caption width 100%';

export const ExampleWithWidthOfMenu = () => (
  <DropdownMenu caption={<Button use="primary">Открыть меню</Button>} menuWidth={350}>
    <MenuHeader>Заголовок меню</MenuHeader>
    <MenuSeparator />
    <MenuItem>Раз</MenuItem>
    <MenuItem>Два</MenuItem>
    <MenuItem>Три</MenuItem>
  </DropdownMenu>
);
ExampleWithWidthOfMenu.storyName = 'Example with width of menu';
ExampleWithWidthOfMenu.parameters = { creevey: { skip: true } };

export const ExampleWithMaximumHeightOfMenu = () => (
  <DropdownMenu caption={<Button use="primary">Открыть меню</Button>} menuMaxHeight={150}>
    <MenuHeader>Заголовок меню</MenuHeader>
    <MenuSeparator />
    <MenuItem>Раз</MenuItem>
    <MenuItem>Два</MenuItem>
    <MenuItem>Три</MenuItem>
  </DropdownMenu>
);
ExampleWithMaximumHeightOfMenu.storyName = 'Example with maximum height of menu';
ExampleWithMaximumHeightOfMenu.parameters = { creevey: { skip: true } };

export const CaptionAcceptsAnArbitraryElement = () => (
  <DropdownMenu
    menuWidth="300px"
    caption={
      <span tabIndex={0} style={{ display: 'inline-block' }}>
        <MenuIcon size={32} />
      </span>
    }
  >
    <MenuItem>Раз</MenuItem>
    <MenuItem>Два</MenuItem>
    <MenuItem>Три</MenuItem>
  </DropdownMenu>
);
CaptionAcceptsAnArbitraryElement.storyName = 'Caption accepts an arbitrary element';
CaptionAcceptsAnArbitraryElement.parameters = { creevey: { skip: true } };

export const OnlyStaticElements = () => (
  <DropdownMenu
    menuWidth="300px"
    caption={
      <span tabIndex={0} style={{ display: 'inline-block' }}>
        <MenuIcon size={32} />
      </span>
    }
  >
    <MenuHeader>Заголовок меню</MenuHeader>
    <MenuSeparator />
    <MenuItem disabled>Недоступен</MenuItem>
  </DropdownMenu>
);
OnlyStaticElements.storyName = 'Only static elements';
OnlyStaticElements.parameters = { creevey: { skip: true } };

export const CaptionAcceptsAFunction = () => (
  <DropdownMenu
    menuWidth="300px"
    caption={(captionProps) => (
      <span
        style={{
          display: 'inline-block',
          transition: 'all 0.3s',
          transform: captionProps.opened ? 'rotate(45deg)' : 'none',
        }}
      >
        <Button use="primary" onClick={captionProps.toggleMenu}>
          <ArrowSize2Icon size={16} />
        </Button>
      </span>
    )}
  >
    <MenuItem>Раз</MenuItem>
    <MenuItem>Два</MenuItem>
    <MenuItem>Три</MenuItem>
  </DropdownMenu>
);
CaptionAcceptsAFunction.storyName = 'Caption accepts a function';
CaptionAcceptsAFunction.parameters = { creevey: { skip: true } };

export const WithoutAnimations = () => (
  <DropdownMenu disableAnimations caption={<Button use="primary">Открыть меню</Button>}>
    <MenuHeader>Заголовок меню</MenuHeader>
    <MenuSeparator />
    <MenuItem onClick={() => Toast.push('Раз')}>Раз</MenuItem>
    <MenuItem onClick={() => Toast.push('Два')}>Два</MenuItem>
    <MenuItem onClick={() => Toast.push('Три')}>Три</MenuItem>
  </DropdownMenu>
);
WithoutAnimations.storyName = 'Without animations';
WithoutAnimations.parameters = { creevey: { skip: true } };

export const WithHeaderAndFooter: Story = () => (
  <DropdownWithScrollStateChange
    disableAnimations
    caption={<Button use="primary">Открыть меню</Button>}
    menuWidth={250}
  />
);
WithHeaderAndFooter.storyName = 'With header and footer';

interface DropdownWithScrollStateChangeState {
  hasHeader: boolean;
  value: string;
}
class DropdownWithScrollStateChange extends React.Component<DropdownMenuProps> {
  public state: DropdownWithScrollStateChangeState = {
    value: '',
    hasHeader: true,
  };

  public render() {
    return (
      <DropdownMenu
        {...this.props}
        menuMaxHeight={'450px'}
        menuWidth={this.props.menuWidth}
        onClose={this.resetStateToDefault}
        header={this.state.hasHeader && this.header()}
        footer={this.footer()}
      >
        {new Array(50).fill('').map((i, index) => (
          <MenuItem key={index}>{`Item ${index}`}</MenuItem>
        ))}
      </DropdownMenu>
    );
  }

  private header = () => {
    return (
      <div
        style={{
          margin: '-6px -18px -7px -8px',
          padding: '10px 18px 10px 8px',
        }}
      >
        <Input leftIcon={<SearchIcon />} value={this.state.value} onValueChange={this.handleInputChange} width={220} />
      </div>
    );
  };

  private footer = () => {
    const { hasHeader } = this.state;
    const icon = hasHeader ? <DeleteIcon /> : <AddIcon />;
    return (
      <div style={{ paddingTop: 4 }}>
        <Button use={'link'} icon={icon} onClick={this.switchHeaderState}>
          {hasHeader ? 'Disable header' : 'Enable Header'}
        </Button>
      </div>
    );
  };

  private switchHeaderState = () => {
    this.setState((state: DropdownWithScrollStateChangeState) => ({
      hasHeader: !state.hasHeader,
    }));
  };

  private handleInputChange = (value: string) => {
    this.setState({ value });
  };

  private resetStateToDefault = () => {
    this.setState({ value: '' });
  };
}

export const MobileExampleWithHorizontalPadding: Story = () => (
  <DropdownMenu caption={<Button use="primary">Открыть меню</Button>}>
    <MenuHeader>Заголовок меню</MenuHeader>
    <MenuSeparator />
    <MenuItem onClick={() => Toast.push('Раз')}>Раз</MenuItem>
    <MenuItem onClick={() => Toast.push('Два')}>Два</MenuItem>
    <MenuItem onClick={() => Toast.push('Три')}>Три</MenuItem>
  </DropdownMenu>
);

MobileExampleWithHorizontalPadding.parameters = {
  viewport: {
    defaultViewport: 'iphone',
  },
};

export const WithItemsAndIcons = () => (
  <DropdownMenu caption={<Button>Click me</Button>}>
    <MenuHeader>MenuHeader</MenuHeader>
    <MenuItem icon={<CheckAIcon16Regular />}>MenuItem1</MenuItem>
    <MenuItem icon={<CheckAIcon16Regular />}>MenuItem2</MenuItem>
    <MenuItem>MenuItem3</MenuItem>
  </DropdownMenu>
);

export const WithItemsAndIconsWithoutTextAlignment = () => (
  <DropdownMenu preventIconsOffset caption={<Button>Click me</Button>}>
    <MenuHeader>MenuHeader</MenuHeader>
    <MenuItem icon={<CheckAIcon16Regular />}>MenuItem1</MenuItem>
    <MenuItem icon={<CheckAIcon16Regular />}>MenuItem2</MenuItem>
    <MenuItem>MenuItem3</MenuItem>
  </DropdownMenu>
);

export const WithNestedMenuItems = () => {
  const [caption, setCaption] = useState('not selected');
  const onClick = () => {
    setCaption('selected');
  };
  return (
    <DropdownMenu menuWidth="300px" caption={<Button use="primary">{caption}</Button>}>
      <>
        <div>
          <MenuItem>Раз</MenuItem>
          <MenuItem onClick={onClick}>Два</MenuItem>
        </div>
        <MenuItem>Три</MenuItem>
      </>
    </DropdownMenu>
  );
};
WithNestedMenuItems.storyName = 'With nested menu items';
