import { t } from '../../common';

export async function tmp(ctx: t.IAppContext) {
  console.group('🌳 TEMP');

  // const ctx = this.context;

  const sheet = await ctx.client.sheet<t.App>('ns:sys.app');
  console.log('exists', ctx.client.pool?.exists(sheet));
  // sheet.dispose();
  // ctx.client.cache.clear();
  // console.log('exists', ctx.client.pool?.exists(sheet));
  // sheet = await ctx.client.sheet<t.App>('ns:sys.app');
  // console.log('exists', ctx.client.pool?.exists(sheet));
  const apps = sheet.data('App');

  // apps.TEMP_RESET();
  await apps.load();

  console.group('🌳 fetch.getCells');
  const f = await ctx.client.fetch.getCells({ ns: 'ns:sys.app', query: '1:500' });
  console.log('res', f);
  console.log('cells', Object.keys(f.cells || {}));
  console.groupEnd();

  // console.log("apps.", apps.)
  apps.rows.forEach((app) => {
    console.log(' > ', app.toObject());
  });

  console.groupEnd();
}
