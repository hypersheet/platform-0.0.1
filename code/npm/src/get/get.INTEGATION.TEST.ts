import { expect } from 'chai';
import { npm } from '..';
import { log } from '../common';

describe('util.npm (integration)', function() {
  this.timeout(20000);

  it.skip('getInfo', async () => {
    const res = await npm.getInfo('create-tmpl');
    log.info(res);
  });

  it.skip('getVersion', async () => {
    const res = await npm.getVersion('create-tmpl');
    log.info(res);
  });

  it.skip('getVersions (object)', async () => {
    const deps = { react: '^x', 'react-dom': 'x' };
    const res = await npm.getVersions(deps);
    expect(res).to.not.equal(deps);
    log.info(res);
  });

  it.skip('getVersions (array)', async () => {
    const modules = ['react', 'react-dom'];
    const res = await npm.getVersions(modules);
    expect(res).to.not.equal(modules);
    log.info(res);
  });
});