import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil, filter } from 'rxjs/operators';

import { coord, defaultValue, log, t, Uri } from '../common';

/**
 * Monitors for changes in a sheet and saves results back to the server.
 */
export function saveMonitor(args: {
  http: t.IHttpClient;
  state: t.ITypedSheetState;
  debounce?: number;
  silent?: boolean;
  flush$: Observable<{}>;
  saved$?: Subject<{}>;
}) {
  const { http, state } = args;
  const uri = state.uri.toString();
  const ns = http.ns(uri);

  const flush$ = args.flush$.pipe(takeUntil(state.dispose$));
  const changed$ = state.changed$.pipe(debounceTime(defaultValue(args.debounce, 300)));
  const saved$ = args.saved$ || new Subject();

  /**
   * TODO 🐷
   * - move this to [TypeSystem] as write syncer.
   */

  const saveChanges = async () => {
    const changes = state.changes;
    const cells = toChangedCells(changes);
    const res = await ns.write({ cells });
    state.clearChanges('SAVED');

    if (!args.silent) {
      const { status } = res;
      Object.keys(changes).forEach(key => {
        const uri = Uri.parse<t.ICellUri>(changes[key].cell).parts;
        const cell = `${log.green('cell')}:${uri.ns}:${log.green(uri.key)}`;
        const prefix = log.gray(`[${log.blue(status)}:SAVED]`);
        log.info(`${prefix} ${cell}`);
      });

      if (!res.ok) {
        log.error('cells', cells);
        log.error('res', res);
      }

      saved$.next();
    }
  };

  changed$.subscribe(e => saveChanges());
  flush$.pipe(filter(e => state.hasChanges)).subscribe(e => saveChanges());
}

/**
 * [Helpers]
 */

const toChangedCells = (changes: t.ITypedSheetStateChanges) => {
  const cells: t.ICellMap = {};
  Object.keys(changes)
    .filter(key => coord.cell.isCell(key))
    .forEach(key => (cells[key] = changes[key].to));
  return cells;
};
