import { filter, map, share, takeUntil } from 'rxjs/operators';

import { TypeCache } from '../TypeCache';
import { R, Schema, t, Uri } from './common';

export type IArgs = {
  uri: t.INsUri;
  events$: t.Subject<t.TypedSheetEvent>;
  fetch: t.ISheetFetcher;
  cache?: t.IMemoryCache;
};

/**
 * State machine for a strongly-typed sheet.
 */
export class TypedSheetState<T> implements t.ITypedSheetState<T> {
  public static create<T>(args: IArgs) {
    return new TypedSheetState<T>(args);
  }

  /**
   * [Lifecycle]
   */
  private constructor(args: IArgs) {
    const fetch = TypeCache.fetch(args.fetch, { cache: args.cache });

    // INTERCEPT: Return an pending changes to cells from the fetch method.
    const getCells: t.FetchSheetCells = async args => {
      const res = await fetch.getCells(args);
      const changes = this._changes;
      const keys = Object.keys(changes);
      if (keys.length > 0) {
        res.cells = { ...res.cells };
        keys
          .filter(key => Schema.coord.cell.isCell(key) && res.cells[key])
          .forEach(key => (res.cells[key] = { ...changes[key].to }));
      }
      return res;
    };

    this.fetch = { ...fetch, getCells };
    this.uri = args.uri;
    this._events$ = args.events$;
    this.events$ = this._events$.asObservable().pipe(takeUntil(this._dispose$), share());

    this.change$ = this.events$.pipe(
      takeUntil(this.dispose$),
      filter(e => e.type === 'SHEET/change'),
      map(e => e.payload as t.ITypedSheetChange),
      filter(e => this.isWithinNamespace(e.cell)),
    );

    this.changed$ = this.events$.pipe(
      takeUntil(this.dispose$),
      filter(e => e.type === 'SHEET/changed'),
      map(e => e.payload as t.ITypedSheetChanged),
      filter(e => this.isWithinNamespace(e.ns)),
    );

    this.change$
      .pipe(
        map(({ data, cell }) => ({ to: data, uri: Uri.parse<t.ICellUri>(cell) })),
        filter(e => e.uri.ok && e.uri.type === 'CELL'),
        map(e => ({ ...e, uri: e.uri.parts })),
      )
      .subscribe(({ uri, to }) => {
        this.fireChanged({ uri, to });
      });
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private _changes: t.ITypedSheetStateChanges = {};
  private readonly _dispose$ = new t.Subject<{}>();
  private readonly _events$: t.Subject<t.TypedSheetEvent>;

  public readonly uri: t.INsUri;
  public readonly fetch: t.CachedFetcher;

  public readonly dispose$ = this._dispose$.asObservable();
  private readonly events$: t.Observable<t.TypedSheetEvent>;
  public readonly change$: t.Observable<t.ITypedSheetChange>;
  public readonly changed$: t.Observable<t.ITypedSheetChanged>;

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get changes(): t.ITypedSheetStateChanges {
    return { ...this._changes };
  }

  public get hasChanges() {
    return Object.keys(this._changes).length > 0;
  }

  /**
   * [Methods]
   */
  public async getCell(key: string) {
    if (!Schema.coord.cell.isCell(key)) {
      throw new Error(`Expected a cell key (eg "A1").`);
    }

    if (this._changes[key]) {
      return this._changes[key].to;
    }

    const ns = this.uri.id;
    const query = `${key}:${key}`;
    const res = await this.fetch.getCells({ ns, query });
    return res.cells[key];
  }

  public clearChanges(action: t.ITypedSheetChangesCleared['action']) {
    const from = { ...this._changes };
    const to = {};
    const ns = this.uri.toString();
    this._changes = {}; // NB: resetting state happens after the `from` variable is copied.
    this.fire({
      type: 'SHEET/changes/cleared',
      payload: { ns, from, to, action },
    });
  }

  public clearCache() {
    const ns = this.uri.id;
    const fetch = this.fetch;
    const cache = fetch.cache;
    const prefix = fetch.cacheKey('getCells', ns);
    cache.keys.filter(key => key.startsWith(prefix)).forEach(key => cache.delete(key));
  }

  /**
   * [INTERNAL]
   */
  private fire(e: t.TypedSheetEvent) {
    this._events$.next(e);
  }

  private async fireChanged<D>(args: { uri: t.ICellUri; to: D }) {
    const { uri, to } = args;
    const key = args.uri.key;

    const existing = this._changes[key];
    if (existing && R.equals(existing.to, to)) {
      return; // No change.
    }

    const from = (existing ? existing.from : await this.getCell(uri.key)) || {};

    const change: t.ITypedSheetStateChange = { cell: uri.toString(), from, to };
    this._changes = {
      ...this._changes,
      [key]: change,
    };

    const payload: t.ITypedSheetChanged = {
      ns: this.uri.toString(),
      change,
      changes: this.changes,
    };
    this.fire({ type: 'SHEET/changed', payload });
  }

  private isWithinNamespace(input: string) {
    input = (input || '').trim();
    const ns = this.uri;
    if (input.startsWith('ns:')) {
      return input === ns.toString();
    }
    if (input.startsWith('cell:')) {
      return input.startsWith(`cell:${ns.id}:`);
    }
    return false;
  }
}