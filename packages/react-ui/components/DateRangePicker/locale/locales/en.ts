import { DateRangePickerLocale } from '../types';
import { componentsLocales as DatePickerLocale } from '../../../DatePicker/locale/locales/en';

export const componentsLocales: DateRangePickerLocale = {
  withoutFirstDate: 'No first date',
  withoutSecondDate: 'No second date',
  ...DatePickerLocale,
};
