export * from './libs.Handsontable';

/**
 * Util.
 */
export { css, color, GlamorValue, events, containsFocus, Keyboard } from '@platform/react';
export { value, time, defaultValue } from '@platform/util.value';
export { log } from '@platform/log/lib/client';
export { diff } from '@platform/util.diff';
export { hash } from '@platform/util.hash';
export * from '@platform/ui.datagrid.util';

/**
 * Cell coords (eg "A1", "A1:C9").
 */
import * as coord from '@platform/util.value.cell';
export { coord };

/**
 * Ramda.
 */
import { equals, clamp, uniq, flatten, uniqBy, prop } from 'ramda';
export const R = { equals, clamp, uniq, flatten, uniqBy, prop };
