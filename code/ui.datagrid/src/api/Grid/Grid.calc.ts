import { coord, t, util } from '../../common';

const defaultGetFunc: t.GetFunc = async args => undefined; // NB: Empty stub.

/**
 * API for calculating updates to grid references/functions.
 */
export function calc(args: { getFunc?: t.GetFunc; grid: t.IGrid }): t.IGridCalculate {
  const { grid } = args;
  const getFunc = args.getFunc || defaultGetFunc;

  const getKeys: t.RefGetKeys = async () => Object.keys(grid.cells);

  const getCell: t.GridGetCell = async (key: string) => grid.cells[key];

  const getValue: t.RefGetValue = async key => {
    const cell = grid.cells[key];
    const value = cell ? cell.value : undefined;
    return typeof value === 'function' ? value() : value;
  };

  const table = coord.refs.table({ getKeys, getValue });
  const calculate = coord.func.calculate({ getValue, getFunc });

  /**
   * Calculate a set of changes.
   */
  const changes: t.IGridCalculate['changes'] = async (args: { cells?: string | string[] } = {}) => {
    const cells = args.cells || (await getKeys());

    // Calculate updates.
    await table.refs({ range: cells, force: true });
    const refs = await table.refs({});
    const func = await calculate.many({ refs, cells });

    // Prepare grid update set.
    const from: t.IGridCells = {};
    const to: t.IGridCells = {};
    const addChange = async (key: string, value: any, error?: t.IFuncError) => {
      const cell = await getCell(key);
      if (cell) {
        let props: t.ICellProps | undefined =
          value === undefined ? { ...cell.props } : { ...cell.props, value };
        if (error) {
          const { type, message } = error;
          props = util.setCellProp({
            props,
            defaults: {},
            section: 'status',
            field: 'error',
            value: { type, message },
          });
        }
        from[key] = cell;
        to[key] = { ...cell, props };
      }
    };
    await Promise.all(func.list.map(item => addChange(item.cell, item.data, item.error)));

    // Finish up.
    return {
      func,
      from,
      to,
      cells: func.list.map(f => f.cell),
    };
  };

  /**
   * Calculate a set of changes and update the grid.
   */
  const update: t.IGridCalculate['update'] = async (args: { cells?: string | string[] } = {}) => {
    const { cells } = args;
    const res = await changes({ cells });
    grid.changeCells(res.to);
    return res;
  };

  // Finish up.
  return { changes, update };
}
