import { equals } from 'ramda';
export const R = { equals };

export { css, CssValue, CssProps, color } from '@platform/css';
export { WebRuntime } from '@platform/cell.runtime.web';
export { http } from '@platform/http';
export { log } from '@platform/log/lib/client';
export { Uri, Schema } from '@platform/cell.schema';
export { StateObject } from '@platform/state';

import { id } from '@platform/util.value';
export { time, rx } from '@platform/util.value';
export const slug = id.shortid;
