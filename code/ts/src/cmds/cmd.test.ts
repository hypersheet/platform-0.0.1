import { exec, fs, getLog, IResult, paths, result } from '../common';

/**
 * Runs tests.
 */
export async function test(
  args: { dir?: string; silent?: boolean; watch?: boolean } = {},
): Promise<IResult> {
  const { silent, watch } = args;
  const log = getLog(silent);

  const dir = args.dir || (await paths.closestParentOf('package.json'));
  if (!dir) {
    return result.fail(`A module root with [package.json] could not be found.`);
  }

  const modules = fs.join(dir, 'node_modules');
  const mocha = fs.join(modules, 'mocha/bin/mocha');

  if (!(await fs.pathExists(mocha))) {
    log.info();
    log.info('No test runner installed.');
    log.info('Run:');
    log.info(`     yarn add -D @platform/test`);
    log.info();
    return result.success();
  }

  let flags = '';
  flags += `--require ts-node/register \\`;
  if (watch) {
    flags += `--reporter min \\`;
    flags += `--watch-extensions ts,tsx \\`;
    flags += `--watch \\`;
  }

  const cmd = `
    export NODE_ENV=test
    export TS_NODE_TRANSPILE_ONLY=true
    export TS_NODE_FAST=true
    
    ${mocha} \\
      ${flags}
      'src/**/*.{test,TEST}.ts{,x}' \\
  `;

  const done = (res: IResult) => {
    return res.code === 0 ? res : result.fail(`Tests failed.`, res.code);
  };

  try {
    // Run with interactive console.
    const res = await exec.cmd.run(cmd, { silent, dir: fs.resolve(dir) });
    return done(res);
    // if (watch) {
    // } else {
    //   // Run behind spinner.
    //   const res = await exec.cmd.runList(cmd, { silent, dir: fs.resolve(dir) });
    //   res.errors.log({ log });
    //   return done(res);
    // }
  } catch (error) {
    return result.fail(error);
  }
}