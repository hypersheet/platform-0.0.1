import { IRouterMock, RouterMock } from '@platform/cell.router/lib/test/RouterMock';

import { FsBus } from '.';
import { expect, rx, t, TestFs } from '../test';
import { Format } from './Format';

export const TestPrep = async (options: { id?: string; dir?: string } = {}) => {
  const bus = rx.bus<t.SysFsEvent>();
  const id = options.id ?? 'foo';
  const fs = !options.dir
    ? TestFs.local
    : TestFs.FsDriverLocal({
        dir: TestFs.node.join(TestFs.tmp, options.dir),
        fs: TestFs.node,
      });

  const index = TestFs.index(fs.dir);
  const controller = FsBus.Controller({ id, bus, fs, index });
  const events = FsBus.Events({ id, bus });

  let server: IRouterMock | undefined;

  const api = {
    bus,
    controller,
    events,
    dir: Format.dir.ensureTrailingSlash(fs.dir),
    fs: TestFs.node,
    readFile: TestFs.readFile,

    rootDir: TestFs.local.dir,

    fileExists(path: string) {
      return TestFs.node.pathExists(TestFs.join(fs.dir, path));
    },

    async copy(source: string, target: string) {
      const { hash, data } = await TestFs.readFile(source);
      const res = await events.io.write.fire({ path: target, hash, data });
      return res.files[0];
    },

    async server() {
      if (server) return server;
      return (server = await RouterMock.create());
    },

    async reset() {
      await TestFs.reset();
    },

    async dispose() {
      controller.dispose();
      events.dispose();
      await server?.dispose();
    },
  };

  return api;
};

describe('BusController', function () {
  const bus = rx.bus<t.SysFsEvent>();

  it('id', () => {
    const id = 'foo';
    const fs = TestFs.local;
    const index = TestFs.index(fs.dir);
    const controller = FsBus.Controller({ id, fs, bus, index });
    expect(controller.id).to.eql(id);
    controller.dispose();
  });

  it('filter (global)', async () => {
    const id = 'foo';
    const fs = TestFs.local;

    let allow = true;
    const index = TestFs.index(fs.dir);
    const controller = FsBus.Controller({ id, fs, index, bus, filter: (e) => allow });
    const events = FsBus.Events({ id, bus });

    const res1 = await events.io.info.get();
    allow = false;
    const res2 = await events.io.info.get({ timeout: 10 });
    controller.dispose();

    expect(res1.error).to.eql(undefined);
    expect(res2.error?.code).to.eql('client/timeout');
    expect(res2.error?.message).to.include('timed out');
  });

  it('distinct (by filesystem "id")', async () => {
    const one = await TestPrep({ id: 'one', dir: 'foo' });
    const two = await TestPrep({ id: 'two', dir: 'bar' });

    const info1 = await one.events.io.info.get();
    const info2 = await two.events.io.info.get();

    one.dispose();
    two.dispose();

    expect(info1.id).to.eql('one');
    expect(info2.id).to.eql('two');

    expect(info1.fs?.id).to.eql('one');
    expect(info2.fs?.id).to.eql('two');

    expect(info1.fs?.dir).to.match(/\/foo$/);
    expect(info2.fs?.dir).to.match(/\/bar$/);
  });
});
