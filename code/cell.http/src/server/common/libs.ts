import { uniq, mergeDeepRight } from 'ramda';
export const R = { uniq, mergeDeepRight };

export { micro } from '@platform/micro';
export { log } from '@platform/log/lib/server';
export { fs } from '@platform/fs';
export { http } from '@platform/http';
export { value, id, defaultValue, time } from '@platform/util.value';

import * as cell from './libs.cell';
export { cell };

export const models = cell.models;
export const Schema = cell.Schema;