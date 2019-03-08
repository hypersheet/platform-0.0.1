import { Command } from '../common';
import { updateWatch } from './cmd.watch';
import * as t from './types';

type P = t.ITestCommandProps;

/**
 * [put] write to the DB.
 */
export const put = Command.create<P>('put', async e => {
  const { db } = e.props;
  const [key, value] = e.args.params;
  if (key) {
    await db.put(key as any, value);
    await updateWatch({ db, addKeys: [key.toString()] });
  }
});
