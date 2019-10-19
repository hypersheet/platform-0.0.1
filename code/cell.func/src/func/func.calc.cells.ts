import { R, t } from '../common';
import { calculate as calculateCell } from './func.calc.cell';
import * as util from './util';

/**
 * Calculate changes across a range of cells within a table.
 */
export async function calculate(args: {
  cells: string | string[];
  refs: t.IRefs;
  getValue: t.RefGetValue;
  getFunc: t.GetFunc;
}) {
  const { refs, getValue, getFunc } = args;
  const cells = Array.isArray(args.cells) ? args.cells : [args.cells];

  // Build complete list of cell implicated in the update.
  let keys: string[] = cells;
  const addIncoming = (cells: string[]) => {
    cells.forEach(key => (refs.in[key] || []).forEach(ref => keys.push(ref.cell)));
  };
  const addOutgoing = (cells: string[]) => {
    cells.forEach(key => (refs.out[key] || []).forEach(ref => keys.push(util.path(ref.path).last)));
  };
  addIncoming(cells);
  addOutgoing(cells);

  // De-dupe and topologically sort keys.
  // Order:
  //    LEAST-dependent => MOST-dependent
  //
  keys = util.sort({ refs, keys: R.uniq(keys) }).keys;
  const isKeyOfFormula = async (key: string) => util.isFormula(await getValue(key));

  // Add the originally specified keys back in if they
  // 1) are formulas, and
  // 2) have been removed (above) because they have no refs (eg "=1+2").
  for (const key of cells) {
    if (!keys.includes(key) && (await isKeyOfFormula(key))) {
      keys.unshift(key);
    }
  }

  // Calculate each cell that is a formula.
  const list: t.IFuncResponse[] = [];
  for (const cell of keys) {
    if (await isKeyOfFormula(cell)) {
      list.push(await calculateCell({ cell, refs, getValue, getFunc }));
    }
  }

  // Finish up.
  const ok = !list.some(item => !item.ok);
  let map: t.IFuncUpdateMap;
  const res: t.IFuncUpdateResponse = {
    ok,
    list,
    get map() {
      if (!map) {
        map = list.reduce((acc, next) => {
          acc[next.cell] = next;
          return acc;
        }, {});
      }
      return map;
    },
  };
  return res;
}
