import { t } from '../common';

export type INs = { id: string; props?: INsProps; hash?: string };
export type INsProps = {
  name?: string; // Display name.
  schema?: string; // The semver of the [@platform/cell.schema] the namespace was last saved as.
};

/**
 * A "namespace" is a logically related set of cells
 * (aka: a "sheet", "table" or "grid").
 */
export type INsData<
  V extends t.ICellData = t.ICellData,
  C extends t.IColumnData = t.IColumnData,
  R extends t.IRowData = t.IRowData
> = INsDataCoord<V, C, R> & { ns: INs };

export type INsDataCoord<
  V extends t.ICellData = t.ICellData,
  C extends t.IColumnData = t.IColumnData,
  R extends t.IRowData = t.IRowData
> = {
  cells: t.IMap<V>;
  columns: t.IMap<C>;
  rows: t.IMap<R>;
};