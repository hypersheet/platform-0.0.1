import React from 'react';

import { color, css, CssValue, COLORS, copyToClipboard } from '../../common';
import { Icons } from '../Icons';
import { Button } from '../../ui.ref/button/Button';

type HashValue = string;

const DEFAULT = {
  LENGTH: 8,
};

export type HashChipProps = {
  text?: HashValue;
  length?: number;
  clipboard?: boolean;
  inline?: boolean;
  icon?: boolean;
  prefixColor?: string | number;
  style?: CssValue;
};

export const HashChip: React.FC<HashChipProps> = (props) => {
  const { clipboard = true, inline = true, icon, prefixColor } = props;
  const length = Math.max(5, props.length ?? DEFAULT.LENGTH);
  const hash = parseHash(props.text || '');
  const text = hash.text ? hash.text.substring(hash.text.length - length) : '';
  const algorithm = hash.algorithm.toUpperCase();

  /**
   * [Render]
   */
  const height = 14;
  const styles = {
    base: css({
      Flex: 'horizontal-stretch-stretch',
      display: inline ? 'block' : 'inline-block',
      position: 'relative',
      boxSizing: 'border-box',
      userSelect: 'none',
      fontSize: 9,
      height,
      overflow: 'hidden',
      lineHeight: 1,
    }),
    icon: css({ marginRight: 3 }),
    chip: css({
      height: height - 2, // NB: Border
      padding: 0,
      PaddingX: 4,
      backgroundColor: color.alpha(COLORS.DARK, 0.08),
      border: `solid 1px ${color.format(-0.06)}`,
      borderRadius: 2,
      Flex: 'horizontal-center-center',
    }),
    hash: {
      base: css({ paddingTop: 2, paddingBottom: 1 }),
      prefix: css({
        fontWeight: 600,
        color:
          prefixColor === undefined ? color.alpha(COLORS.DARK, 0.4) : color.format(prefixColor),
      }),
      text: css({
        marginLeft: algorithm ? 4 : undefined,
        paddingLeft: algorithm ? 4 : undefined,
        borderLeft: algorithm ? `solid 1px ${color.format(-0.12)}` : undefined,
        color: color.alpha(COLORS.DARK, 0.9),
      }),
    },
    empty: css({ opacity: 0.4 }),
  };

  const elEmpty = !text && <div {...styles.empty}>No Hash</div>;
  const elPrefix = algorithm && (
    <div {...css(styles.hash.base, styles.hash.prefix)}>{algorithm}</div>
  );

  const elText = text && (
    <div {...css(styles.hash.base, styles.hash.text)}>
      {clipboard && <Button onClick={() => copyToClipboard(hash.toString())}>{text}</Button>}
      {!clipboard && text}
    </div>
  );

  return (
    <div {...css(styles.base, props.style)} title={hash.tooltip}>
      {icon && <Icons.QRCode size={height} style={styles.icon} />}
      <div {...styles.chip}>
        {elEmpty}
        {elPrefix}
        {elText}
      </div>
    </div>
  );
};

/**
 * Helpers
 */

export function parseHash(input: string) {
  const parts = (input || '').split('-');
  const algorithm = parts.length > 1 ? parts[0] : '';
  const text = parts.length > 1 ? parts[1] : parts[0];

  let tooltip = '';
  if (text) {
    tooltip = 'Hash';
    if (algorithm) tooltip = `${tooltip} (${algorithm.toUpperCase()})`;
    tooltip = `${tooltip}:\n${text}`;
  }

  return {
    text,
    algorithm,
    tooltip,
    toString: () => input,
  };
}