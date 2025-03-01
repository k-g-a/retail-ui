import React, { HTMLAttributes } from 'react';

import { MAX_SAFE_DIGITS } from '../CurrencyInput/constants';
import { CurrencyHelper } from '../CurrencyInput/CurrencyHelper';
import { CommonWrapper, CommonProps } from '../../internal/CommonWrapper';

export interface CurrencyLabelProps extends CommonProps, Pick<HTMLAttributes<HTMLElement>, 'id'> {
  /** Устанавливает минимальное количество отображаемых знаков после запятой.
   * @default 2 */
  fractionDigits?: number;

  /** Устанавливает значение. */
  value: number;

  /** Задает символ валюты. */
  currencySymbol?: React.ReactNode;

  /** Убирает лишние нули после запятой. */
  hideTrailingZeros?: boolean;
}

const FRACTION_DIGITS_DEFAULT = 2;

export const CurrencyLabelDataTids = {
  root: 'CurrencyLabel__root',
} as const;

/**
 * `CurrencyLabel` — подпись для денежных сумм (и других числовых значений).
 */
export const CurrencyLabel = ({
  id,
  value,
  fractionDigits = FRACTION_DIGITS_DEFAULT,
  currencySymbol,
  hideTrailingZeros = false,
  ...rest
}: CurrencyLabelProps): JSX.Element => {
  return (
    <CommonWrapper {...rest}>
      <span id={id} data-tid={CurrencyLabelDataTids.root}>
        {CurrencyHelper.format(value, { fractionDigits, hideTrailingZeros })}
        {currencySymbol && String.fromCharCode(0xa0) /* &nbsp; */}
        {currencySymbol}
      </span>
    </CommonWrapper>
  );
};

CurrencyLabel.__KONTUR_REACT_UI__ = 'CurrencyLabel';
CurrencyLabel.displayName = 'CurrencyLabel';

CurrencyLabel.propTypes = {
  fractionDigits: ({ fractionDigits = FRACTION_DIGITS_DEFAULT, value }: CurrencyLabelProps) => {
    if (fractionDigits > MAX_SAFE_DIGITS) {
      return new Error(
        `[CurrencyLabel]: Prop 'fractionDigits' exceeds ${MAX_SAFE_DIGITS}.` +
          `\nSee https://tech.skbkontur.ru/react-ui/#/CurrencyInput?id=why15`,
      );
    }

    const { fraction } = CurrencyHelper.destructString(String(value)) || { fraction: '' };
    if (fraction.length > fractionDigits) {
      return new Error(
        `[CurrencyLabel]: Prop 'fractionDigits' less than fractional part of the 'value' property,` +
          `'value' will not be cutted`,
      );
    }

    if (!Number.isInteger(fractionDigits)) {
      return new Error(
        `[CurrencyLabel]: Prop 'fractionDigits' is not integer, fraction part of these property will not be used`,
      );
    }

    return null;
  },
};
