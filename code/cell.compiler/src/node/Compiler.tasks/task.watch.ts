import { log, Logger, Model, t } from '../common';
import { onCompiled } from './task.bundle';
import { wp } from './util';

/**
 * Bundle and watch for file changes.
 */
export const watch: t.CompilerRunWatch = async (input) => {
  const { compiler, model, webpack } = wp.toCompiler(input);
  const bundleDir = Model(model).bundleDir;

  let count = 0;
  compiler.watch({}, async (err, stats) => {
    const compilation = stats?.compilation;
    if (compilation) {
      onCompiled({ model, bundleDir, compilation, webpack });
    }

    count++;
    Logger.clear().newline();
    log.info.gray(`Watching (${count})`);
    Logger.model(model, { indent: 2, url: false }).newline().hr().stats(stats);
  });
};
