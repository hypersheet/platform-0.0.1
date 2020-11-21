import { expect } from 'chai';
import { fs } from '@platform/fs';
import { FileCache } from '.';

const tmp = fs.resolve('./tmp');
const dir = fs.join(tmp, 'FileCache');

describe.only('FileCache', () => {
  beforeEach(() => fs.remove(tmp));

  it('create', async () => {
    const cache = FileCache.create({ fs, dir: `   ${dir}   ` });
    expect(cache.dir).to.eql(dir);
    expect(cache.ttl).to.eql(undefined);
  });

  it('put => get => exists', async () => {
    const cache = FileCache.create({ fs, dir });

    expect(await fs.pathExists(dir)).to.eql(false);

    const file = await fs.readFile(fs.resolve('tsconfig.json'));
    const path = 'foo/bar/tsconfig.json';
    const pathPadded = `  //${path}  `;
    expect(await cache.exists(path)).to.eql(false);

    await cache.put(pathPadded, file);
    expect(await cache.exists(pathPadded)).to.eql(true);
    expect(await fs.pathExists(fs.join(dir, path))).to.eql(true);

    const res = await cache.get(pathPadded);
    expect(res?.toString()).to.eql(file.toString());
  });
});
