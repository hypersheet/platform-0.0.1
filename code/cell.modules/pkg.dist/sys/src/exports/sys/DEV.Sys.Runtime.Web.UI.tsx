import { t, React, CommonEntry } from '../common';
import { DevHarness } from 'sys.runtime.web.ui/lib/Dev.Harness';

const entry: t.ModuleDefaultEntry = async (pump, ctx) => {
  const bus = (await CommonEntry.init(pump, ctx)).bus;
  return <DevHarness bus={bus} />;
};

export default entry;
