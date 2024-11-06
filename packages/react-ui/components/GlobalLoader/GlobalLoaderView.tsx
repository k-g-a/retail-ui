import React, { useContext, useRef } from 'react';

import { EmotionContext } from '../../lib/theming/Emotion';
import { ZIndex } from '../../internal/ZIndex';
import { CommonProps, CommonWrapper } from '../../internal/CommonWrapper';
import { ThemeContext } from '../../lib/theming/ThemeContext';

import { getAnimations, getStyles } from './GlobalLoaderView.styles';
import { useGlobalLoaderPosition, useGlobalLoaderWidth } from './useParams';

export interface GlobalLoaderViewProps extends Pick<CommonProps, 'data-tid'> {
  /** Устанавливает ожидаемое время(ms) ответа сервера. */
  expectedResponseTime: number;

  /** Устанавливает задержку в миллисекундах до исчезновения лоадера. */
  delayBeforeHide: number;

  /** Устанавливает статус операции. */
  status?: 'success' | 'error' | 'standard' | 'accept';

  /** Отключает анимацию. */
  disableAnimations: boolean;
}

export interface GlobalLoaderViewRef {
  element: HTMLDivElement;
  refObject: React.RefObject<GlobalLoaderViewRef['element']>;
}

export const GlobalLoaderView = ({
  expectedResponseTime,
  delayBeforeHide,
  status,
  disableAnimations,
  ...rest
}: GlobalLoaderViewProps) => {
  const ref = useRef<GlobalLoaderViewRef['element']>(null);
  const theme = useContext(ThemeContext);
  const emotion = useContext(EmotionContext);

  const { width, startWidth, fullWidth } = useGlobalLoaderWidth(status, ref);
  const { left } = useGlobalLoaderPosition(ref);
  const animations = getAnimations(emotion);
  const styles = getStyles(emotion);

  const getAnimationClass = (status: GlobalLoaderViewProps['status']) => {
    if (!disableAnimations) {
      switch (status) {
        case 'success':
          return animations.successAnimation(delayBeforeHide, width, left);
        case 'accept':
          if (startWidth < fullWidth * 0.8) {
            return animations.acceptAnimation(theme, startWidth, expectedResponseTime, width, left);
          }
          return animations.slowAcceptAnimation(theme, startWidth, width, left);
        case 'error':
          return animations.errorAnimation(theme);
        case 'standard':
          return animations.standardAnimation(theme, expectedResponseTime);
      }
    }

    if (disableAnimations) {
      switch (status) {
        case 'success':
          return styles.successWithoutAnimation();
        case 'accept':
          return animations.acceptWithoutAnimation(startWidth);
        case 'error':
          return styles.errorWithoutAnimation();
        case 'standard':
          return styles.standardWithoutAnimation();
      }
    }
  };

  return (
    <CommonWrapper {...rest} data-status={status}>
      <ZIndex priority="GlobalLoader" className={styles.outer(theme)}>
        <div ref={ref} className={emotion.cx(styles.inner(theme), getAnimationClass(status))} />
      </ZIndex>
    </CommonWrapper>
  );
};
