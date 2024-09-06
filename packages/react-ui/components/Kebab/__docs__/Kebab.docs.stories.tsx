import React from 'react';
import { Meta, Story } from '../../../typings/stories';

import EditIcon from '@skbkontur/react-icons/Edit';
import TrashIcon from '@skbkontur/react-icons/Trash';
import OkIcon from '@skbkontur/react-icons/Ok';

import { Kebab, Gapped, MenuItem, Toast, Button, MenuHeader, MenuSeparator } from '@skbkontur/react-ui';

export default {
  title: 'Menu/Kebab',
  component: Kebab,
  parameters: { creevey: { skip: true } },
} as Meta;

export const Example1: Story = () => {

  let style = {
    alignItems: 'center',
    border: '1px solid #dfdede',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 20px',
    width: 250,
  };

  let Card = ({ name, post }) => (
    <div style={style}>
      <div>
        <h3>{name}</h3>
        <p style={{ color: 'gray' }}>{post}</p>
      </div>

      <Kebab size="large">
        <MenuItem icon={<EditIcon />} onClick={() => Toast.push('Отредактировано')}>
          Редактировать
        </MenuItem>
        <MenuItem icon={<TrashIcon />} onClick={() => Toast.push('Удалено')}>
          Удалить
        </MenuItem>
      </Kebab>
    </div>
  );

  return (
    <Gapped gap={-1} wrap>
      <Gapped gap={-1}>
        <Card name="Баранова Анастасия" post="SEO GazPro" />
        <Card name="Слуцкий Антон" post="Junior Front-Back Developer" />
      </Gapped>
      <Gapped gap={-1}>
        <Card name="Иванов Иван" post="Head Ivan Co" />
        <Card name="Сашка Егоров" post="KungFu Master" />
      </Gapped>
    </Gapped>
  );

};
Example1.storyName = 'Базовый пример';

export const Example2: Story = () => {

  let style = {
    alignItems: 'center',
    border: '1px solid #dfdede',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 20px',
    width: 230,
  };

  let Card = ({ title, size }) => (
    <div style={style}>
      <div>
        <h3>{title}</h3>
      </div>

      <Kebab size={size}>
        <MenuItem icon={<EditIcon />} onClick={() => Toast.push('Отредактировано')}>
          Редактировать
        </MenuItem>
        <MenuItem icon={<TrashIcon />} onClick={() => Toast.push('Удалено')}>
          Удалить
        </MenuItem>
      </Kebab>
    </div>
  );

  return (
    <Gapped>
      <Card title="Маленький кебаб" size="small" />
      <Card title="Средний кебаб" size="medium" />
      <Card title="Большой кебаб" size="large" />
    </Gapped>
  );

};
Example2.storyName = 'Размер';

export const Example3: Story = () => {

  let style = {
    alignItems: 'center',
    border: '1px solid #dfdede',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 20px',
    width: 250,
  };


  let Card = ({ title }) => (
    <div style={style}>
      <div>
        <h3>{title}</h3>
      </div>

      <Kebab positions={['left middle']} size="large">
        <MenuItem icon={<EditIcon />} onClick={() => Toast.push('Отредактировано')}>
          Редактировать
        </MenuItem>
        <MenuItem icon={<TrashIcon />} onClick={() => Toast.push('Удалено')}>
          Удалить
        </MenuItem>
      </Kebab>
    </div>
  );

  return (
    <Card title="С выпадашкой слева" />
  );

};
Example3.storyName = 'Кебаб-меню с выпадашкой слева';

export const Example4: Story = () => {

  let style = {
    alignItems: 'center',
    border: '1px solid #dfdede',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 20px',
    width: 250,
  };

  let Card = ({ title }) => (
    <div style={style}>
      <div>
        <h3>{title}</h3>
      </div>

      <Kebab
        onOpen={() => Toast.push('Кебаб-меню открылось!')}
        size="large"
        >
        <MenuItem icon={<EditIcon />} onClick={() => Toast.push('Отредактировано')}>
          Редактировать
        </MenuItem>
        <MenuItem icon={<TrashIcon />} onClick={() => Toast.push('Удалено')}>
          Удалить
        </MenuItem>
      </Kebab>
    </div>
  );

  return (
    <Card title="С кастомным действием" />
  );

};
Example4.storyName = 'Кастомное действие при открытии';

export const Example5: Story = () => {

  return (
    <Kebab>
      <MenuHeader>MenuHeader</MenuHeader>
      <MenuItem icon={<OkIcon />}>MenuItem1</MenuItem>
      <MenuItem icon={<OkIcon />}>MenuItem2</MenuItem>
      <MenuItem>MenuItem3</MenuItem>
    </Kebab>
  );

};
Example5.storyName = 'Иконка и автовыравнивание';

export const Example6: Story = () => {

  return (
    <Kebab preventIconsOffset>
      <MenuHeader>MenuHeader</MenuHeader>
      <MenuItem icon={<OkIcon />}>MenuItem1</MenuItem>
      <MenuItem icon={<OkIcon />}>MenuItem2</MenuItem>
      <MenuItem>MenuItem3</MenuItem>
    </Kebab>
  );

};
Example6.storyName = 'Иконка и отключенное автовыравнивание';

export const Example7: Story = () => {

  let style = {
    alignItems: 'center',
    border: '1px solid #dfdede',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 20px',
    width: 250,
  };

  let Card = ({ title }) => (
    <div style={style}>
      <div>
        <h3>{title}</h3>
      </div>

      <Kebab disabled size="large">
        <MenuItem icon={<EditIcon />} onClick={() => Toast.push('Отредактировано')}>
          Редактировать
        </MenuItem>
        <MenuItem icon={<TrashIcon />} onClick={() => Toast.push('Удалено')}>
          Удалить
        </MenuItem>
      </Kebab>
    </div>
  );

  return (
    <Card title="Не нажимается :(" />
  );

};
Example7.storyName = 'Отключенное кебаб-меню';

export const Example8: Story = () => {

  let style = {
    alignItems: 'center',
    border: '1px solid #dfdede',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 20px',
    width: 250,
  };

  let Card = ({ title }) => (
    <div style={style}>
      <div>
        <h3>{title}</h3>
      </div>

      <Kebab disableAnimations size="large">
        <MenuItem icon={<EditIcon />} onClick={() => Toast.push('Отредактировано')}>
          Редактировать
        </MenuItem>
        <MenuItem icon={<TrashIcon />} onClick={() => Toast.push('Удалено')}>
          Удалить
        </MenuItem>
      </Kebab>
    </div>
  );

  return (
    <Card title="Без анимации" />
  );

};
Example8.storyName = 'Отключенная анимация';

export const Example9: Story = () => {

  let style = {
    alignItems: 'center',
    border: '1px solid #dfdede',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 20px',
    width: 250,
  };

  let Card = ({ title }) => (
    <div style={style}>
      <div>
        <h3>{title}</h3>
      </div>

      <Kebab
        menuMaxHeight="100px"
        size="large"
        >
        <MenuItem>
          Действие
        </MenuItem>
        <MenuItem>
          И ещё одно
        </MenuItem>
        <MenuItem>
          Ещё действие
        </MenuItem>
        <MenuItem>
          И последнее действие
        </MenuItem>
      </Kebab>
    </div>
  );

  return (
    <Card title="С заданной высотой" />
  );

};
Example9.storyName = 'Высота';

