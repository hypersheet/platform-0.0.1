import { t, server, log, util, time } from './common';
import { MongoDb } from '@platform/fsdb.mongo';
import { local } from '@platform/cell.fs';

const NOW = util.env.value('NOW_REGION');
const IS_CLOUD = NOW !== 'dev1';
const TMP = util.resolve('tmp');

const KEY = {
  DB: 'CELL_MONGO',
};

/**
 * Connection string to Mongo database.
 * See:
 *  - [.env] file when running locally.
 *  - The "env" field in [now.json] file and [zeit/now] secrets in the cloud.
 */
const uri = util.env.value<string>(KEY.DB, { throw: true }); // See [.env] file when running locally.

/**
 * File system.
 */
const fs = local.init({ root: `${TMP}/fs` }); // TODO 🐷 Make this S3

/**
 * Connection to a Mongo database.
 */
const db: t.IDb = MongoDb.create({
  uri,
  db: IS_CLOUD ? '__DB__' : 'dev',
  collection: IS_CLOUD ? `__COLLECTION__` : 'local',
});

/**
 * Initialise the HTTP server.
 */
const title = IS_CLOUD ? '__TITLE__' : 'local';
const deployedAt = IS_CLOUD ? '__DEPLOYED_AT__' : time.now.timestamp;
const app = server.init({ title, db, fs, deployedAt });
export default app.server;
