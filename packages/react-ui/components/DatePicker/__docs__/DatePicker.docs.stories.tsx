import React from 'react';
import { Meta, Story } from '../../../typings/stories';

import { ViewDateInputValidateChecks } from '@skbkontur/react-ui/components/DateInput/ViewDateInputValidateChecks';
import * as DatePickerHelpers from '../DatePickerHelpers';

import { DatePicker, Gapped, Tooltip, DateOrder, DateSeparator, LocaleContext, Select, LangCodes } from '@skbkontur/react-ui';

export default {
  title: 'Date/DatePicker',
  component: DatePicker,
  parameters: { creevey: { skip: true } },
} as Meta;

/** Пример с обработкой ошибок, когда пользователь ввел невалидную дату. */
export const Example1: Story = () => {

  const [value, setValue] = React.useState();
  const [error, setError] = React.useState(false);
  const [tooltip, setTooltip] = React.useState(false);

  const minDate = '22.12.2012';
  const maxDate = '02.05.2018';

  const unvalidate = () => {
    setError(false);
    setTooltip(false);
  };

  const validate = () => {
    const errorNew = !!value && !DatePicker.validate(value, { minDate: minDate, maxDate: maxDate });
    setError(errorNew);
    setTooltip(errorNew);
  };

  let removeTooltip = () => setTooltip(false);

  return (
    <Gapped gap={10} vertical>
      <ViewDateInputValidateChecks value={value} minDate={minDate} maxDate={maxDate} />
      <pre>
        minDate = {minDate}
        <br />
        maxDate = {maxDate}
      </pre>

      <Tooltip trigger={tooltip ? 'opened' : 'closed'} render={() => 'Невалидная дата'} onCloseClick={removeTooltip}>
        <DatePicker
          error={error}
          value={value}
          onValueChange={setValue}
          onFocus={unvalidate}
          onBlur={validate}
          minDate={minDate}
          maxDate={maxDate}
          enableTodayLink
        />
      </Tooltip>
    </Gapped>
  );

};
Example1.storyName = 'Валидация';

/** В компонент можно передать функцию `isHoliday`, которая будет получать день строкой формата `dd.mm.yyyy` и флаг `isWeekend`, и должна вернуть `true` для выходного и `false` для рабочего дня. */
export const Example2: Story = () => {

  const [value, setValue] = React.useState();

  const createRandomHolidays = () => {
    const holidays = new Array(10);
    const today = new Date();

    for (let index = 0; index < holidays.length; index++) {
      const day = new Date(today.setDate(today.getDate() + 1 + index).valueOf());

      const holiday = {
        date: day.getDate(),
        month: day.getMonth(),
        year: day.getFullYear(),
      };

      holidays[index] = DatePickerHelpers.formatDate(holiday);
    }

    return holidays;
  };
  const holidays = createRandomHolidays();

  const isHoliday = (day, isWeekend) => {
    const today = new Date();
    const holiday = {
      date: today.getDate(),
      month: today.getMonth(),
      year: today.getFullYear(),
    };

    if (holidays.includes(day)) {
      return !isWeekend;
    }

    return isWeekend;
  };

  return (
    <DatePicker isHoliday={isHoliday} value={value} onValueChange={setValue} enableTodayLink />
  );

};
Example2.storyName = '`isHoliday`';

export const Example4: Story = () => {

  class DatePickerFormatting extends React.Component {
    constructor() {
      this.state = {
        order: DateOrder.YMD,
        separator: 'Dot',
        value: '21.12.2012',
      };
    }

    render() {
      return (
        <Gapped vertical gap={10}>
          <div>
            <span style={{ width: '300px', display: 'inline-block' }}>
              Порядок компонентов (<tt>DateOrder</tt>)
            </span>
            <Select
              value={this.state.order}
              items={Object.keys(DateOrder)}
              onValueChange={order => this.setState({ order })}
            />
          </div>
          <div>
            <span style={{ width: '300px', display: 'inline-block' }}>
              Разделитель (<tt>DateSeparator</tt>)
            </span>
            <Select
              value={this.state.separator}
              items={Object.keys(DateSeparator)}
              onValueChange={separator => this.setState({ separator })}
            />
          </div>
          <LocaleContext.Provider
            value={{
              langCode: LangCodes.ru_RU,
              locale: {
                DatePicker: {
                  separator: DateSeparator[this.state.separator],
                  order: this.state.order,
                },
              },
            }}
          >
            <DatePicker onValueChange={value => this.setState({ value })} value={this.state.value} />
          </LocaleContext.Provider>
        </Gapped>
      );
    }
  }

  return (
    <DatePickerFormatting />
  );

};
Example4.storyName = 'Ручное форматирование даты';

/** Подбробный пример в [Calendar](#/Components/Calendar) */
export const Example5: Story = () => {
  const [value, setValue] = React.useState('12.05.2022');

  return (
    <DatePicker
      value={value}
      onValueChange={setValue}
      periodStartDate="16.05.2022"
      periodEndDate="20.05.2022"
    />
  );

};
Example5.storyName = 'Период дат';

/** Подбробный пример в [Calendar](#/Components/Calendar) */
export const Example6: Story = () => {
  const [value, setValue] = React.useState('12.05.2022');

  const renderDay = (date, defaultProps, RenderDefault) => {
    const isEven = defaultProps.children % 2 === 0;

    return <RenderDefault {...defaultProps} isDisabled={isEven} />;
  };


  return (
    <DatePicker value={value} onValueChange={setValue} renderDay={renderDay} />
  );

};
Example6.storyName = 'Кастомный рендер дня';

