import { app } from 'electron';
import { fs } from './libs';

const resolve = (path: string) =>
  app?.isPackaged ? fs.join(app.getAppPath(), path) : fs.resolve(path);

/**
 * File paths.
 */
export const paths = {
  data(args: { prod?: boolean; dirname?: string }) {
    const { prod = false, dirname = 'CellOS' } = args;
    const dir = prod ? fs.join(app.getPath('documents'), dirname) : fs.resolve('../.data');
    return {
      dir,
      db: `${dir}/local.db`,
      fs: `${dir}/local.fs`,
    };
  },
  assets: {
    icons: resolve('assets/icons'),
  },
  bundle: {
    sys: resolve('.bundle/ui.sys'),
    ide: resolve('.bundle/ui.ide'),
  },
};