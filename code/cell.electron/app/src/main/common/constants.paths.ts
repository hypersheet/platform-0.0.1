import { app } from 'electron';
import { fs } from './libs';

const resolve = (path: string) =>
  app?.isPackaged ? fs.join(app.getAppPath(), path) : fs.resolve(path);

/**
 * File paths.
 */
export const paths = {
  resolve,

  data(args: { prod?: boolean; dirname?: string } = {}) {
    const { prod = false, dirname = 'A1' } = args;
    const dir = prod ? fs.join(app.getPath('documents'), dirname) : fs.resolve('../.data');
    return {
      dir,
      db: `${dir}/local.db`,
      fs: `${dir}/local.fs`,
      config: `${dir}/.config.json`,
    };
  },

  assets: {
    icons: resolve('assets/icons'),
  },

  bundle: {
    preload: resolve('lib/preload.js'),
    'cell.ui.sys': resolve('.bundle/cell.ui.sys'),
    'cell.ui.ide': resolve('.bundle/cell.ui.ide'),
    'cell.ui.finder': resolve('.bundle/cell.ui.finder'),
    'cell.ui.spreadsheet': resolve('.bundle/cell.ui.spreadsheet'),
  },
};
