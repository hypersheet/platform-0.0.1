import * as React from 'react';

import { css, CssValue, defaultValue, formatColor, t } from '../../common';
import { Content } from './Content';

export type HostProps = {
  items?: t.DevActionRenderSubjectItem[];
  layout?: t.IDevHostedLayout;
  orientation?: t.DevOrientation;
  background?: number | string;
  style?: CssValue;
};

/**
 * A content container providing layout options for testing.
 */
export const Host: React.FC<HostProps> = (props = {}) => {
  const orientation = defaultValue(props.orientation, 'y');

  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      boxSizing: 'border-box',
      backgroundColor: formatColor(props.background),
    }),
    body: css({
      Absolute: 0,
      Flex: `${orientation === 'y' ? 'vertical' : 'horizontal'}-center-center`,
    }),
  };

  const elContent = (props.items || []).map((item, i) => {
    const layout = { ...props.layout, ...item.layout };
    const abs = toAbsolute(layout.position);

    const style = css({
      display: 'flex',
      position: abs ? 'absolute' : 'relative',
      Absolute: abs ? [abs.top, abs.right, abs.bottom, abs.left] : undefined,
      border: layout.border ? `solid 1px ${toBorderColor(layout.border)}` : undefined,
      backgroundColor: formatColor(layout.background),
    });
    return (
      <div key={i} {...style}>
        <Content {...layout}>{item.el}</Content>
      </div>
    );
  });

  return (
    <div {...css(styles.base, props.style)} className={'dev-Host'}>
      <div {...styles.body}>{elContent}</div>
    </div>
  );
};

export default Host;

/**
 * Helpers
 */

const toAbsolute = (input: t.IDevHostedLayout['position']): t.IDevHostedAbsolute | undefined => {
  if (input === undefined) return undefined;

  if (Array.isArray(input)) {
    return { top: input[0], right: input[1], bottom: input[0], left: input[1] };
  }

  if (typeof input !== 'object') {
    return { top: input, right: input, bottom: input, left: input };
  }

  return input as t.IDevHostedAbsolute;
};

const toBorderColor = (input: t.IDevHostedLayout['border']) => {
  const border = defaultValue(input, true);
  const value = border === true ? 0.3 : border === false ? 0 : border;
  return formatColor(value);
};
