import { parse as parseUrl } from 'url';
import { Compilation as ICompliation, Stats as IStats } from 'webpack';

import { log, Model, t } from '../common';
import { stats } from '../Config.webpack';

/**
 * Value formatters
 */
export const format = {
  url(value: string) {
    value = (value || '').trim();
    const parsed = parseUrl(value);
    const domain = log.gray(`${parsed.protocol}//${parsed.host}`);
    const path = (parsed.pathname || '')
      .replace(/cell\:/g, log.cyan('cell:'))
      .replace(/\//g, log.gray('/'))
      .replace(/\:/g, log.gray(':'));
    const suffix = parsed.search ? log.gray(parsed.search) : '';
    const url = `${domain}${path}${suffix}`;
    return log.white(url);
  },
};

/**
 * Log helpers for webpack.
 */
export const logger = {
  format,

  clear() {
    log.clear();
    return logger;
  },

  newline(length = 1) {
    Array.from({ length }).forEach(() => log.info());
    return logger;
  },

  hr(length = 60) {
    log.info.gray('━'.repeat(length));
    return logger;
  },

  stats(input?: IStats | ICompliation) {
    stats(input).log();
    return logger;
  },

  model(input: t.CompilerModel, indent?: number) {
    const prefix = typeof indent === 'number' ? ' '.repeat(indent) : '';
    const model = Model(input);

    const table = log.table({ border: false });
    const add = (key: string, value: string) => {
      const left = log.gray(`${prefix}${log.white(key)}: `);
      table.add([left, value]);
    };

    const obj = model.toObject();
    let name = '';
    if (obj.title) {
      name = log.gray(`${log.green(obj.title)}/${obj.name}`);
    } else {
      name = log.green(obj.name);
    }

    add('name', name);
    add('mode', log.green(model.mode()));
    add('target', log.green(model.target().join()));
    add('url', log.cyan(model.url()));

    table.log();

    return logger;
  },
};
