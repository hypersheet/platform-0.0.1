import { expect, fs, time } from '../../test/test';
import { Store } from '.';

const dir = fs.resolve('tmp/store');
const filename = fs.join(dir, 'file.db');
const removeDir = () => fs.remove(dir);

describe('Store (nedb)', () => {
  beforeEach(async () => {
    // await removeDir();
  });

  afterEach(async () => {
    // await removeDir();
  });

  it('constructs', () => {
    const db = Store.create({});
    expect(db).to.be.an.instanceof(Store);
  });

  it('inserts a single document', async () => {
    type MyDoc = { name: string; _id?: string };
    const db = Store.create<MyDoc>({});

    const res1 = await db.find({ name: 'foo' });
    expect(res1).to.eql([]);

    const res2 = await db.insert({ name: 'foo' });
    expect(res2.name).to.eql('foo');

    const res3 = await db.find({});
    expect(res3.length).to.eql(1);
    expect(res3[0].name).to.eql('foo');

    const res4 = await db.findOne({ name: 'foo' });
    expect(res4.name).to.eql('foo');
  });

  it('inserts multiple documents', async () => {
    type MyDoc = { name: string; _id?: string };
    const db = Store.create<MyDoc>({});

    const res1 = await db.insertMany([{ name: 'foo' }, { name: 'bar' }]);
    expect(res1[0].name).to.eql('foo');
    expect(res1[1].name).to.eql('bar');

    expect((await db.findOne({ name: 'foo' })).name).to.eql('foo');
    expect((await db.findOne({ name: 'bar' })).name).to.eql('bar');
    expect(await db.findOne({ name: 'boo' })).to.eql(null);
  });

  it('persists to file-system', async () => {
    await removeDir();
    expect(await fs.pathExists(filename)).to.eql(false);

    const db1 = Store.create({ filename, autoload: true });
    const res1 = await db1.insert({ name: 'foo' });
    expect(res1.name).to.eql('foo');
    expect(await fs.pathExists(filename)).to.eql(true);

    const db2 = Store.create({ filename, autoload: true });

    const res2 = await db2.findOne({ name: 'foo' });
    expect(res2.name).to.eql('foo');
  });

  it('update (multi)', async () => {
    type MyDoc = { name: string; _id?: string };
    const db = Store.create<MyDoc>({});

    await db.insertMany([{ name: 'foo' }, { name: 'zoo' }, { name: 'foo' }]);

    const res1 = await db.update(
      { name: 'foo' },
      { name: 'boo' },
      { returnUpdatedDocs: true, multi: true },
    );

    expect(res1.total).to.eql(2);
    expect(res1.upsert).to.eql(false);

    let names = res1.docs.map(doc => doc.name);
    expect(names.filter(name => name === 'boo').length).to.eql(2);
    expect(names).to.eql(['boo', 'boo']);

    const res2 = await db.find({});

    names = res2.map(doc => doc.name);
    expect(names.filter(name => name === 'zoo').length).to.eql(1);
    expect(names.filter(name => name === 'boo').length).to.eql(2);
    expect(names.filter(name => name === 'foo').length).to.eql(0); // Changed.
  });

  it('upsert', async () => {
    type MyDoc = { name: string; _id?: string };
    const db = Store.create<MyDoc>({});

    const res1 = await db.find({});
    expect(res1).to.eql([]);

    const docs = [{ name: 'foo' }, { name: 'bar' }];
    const res2 = await db.update(docs, docs, { upsert: true });

    expect(res2.total).to.eql(1);
    expect(res2.upsert).to.eql(true);
    expect(res2.docs.length).to.eql(2);

    const res3 = await db.find({});
    expect(res3.length).to.eql(2);
    const names = res3.map(doc => doc.name);
    expect(names.includes('foo')).to.eql(true);
    expect(names.includes('bar')).to.eql(true);
  });

  it('delete', async () => {
    const db = Store.create();

    await db.insertMany([{ name: 'foo' }, { name: 'bar' }, { name: 'zoo' }]);
    const res1 = await db.find({});
    expect(res1.length).to.eql(3);

    const res2 = await db.remove({ name: 'foo' });
    expect(res2.total).to.eql(1);

    const res3 = await db.remove({ name: 'NO_EXIST' });
    expect(res3.total).to.eql(0);

    const res4 = await db.remove({ name: { $in: ['bar', 'zoo', 'other'] } }, { multi: true });
    expect(res4.total).to.eql(2);

    const res5 = await db.find({});
    expect(res5).to.eql([]);
  });
});