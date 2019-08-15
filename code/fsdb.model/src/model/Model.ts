import { Subject } from 'rxjs';
import { filter, share, take, takeUntil } from 'rxjs/operators';
import { R, defaultValue, t, time } from './common';

export type IModelArgs<
  P extends object,
  D extends P,
  L extends t.IModelLinksSchema,
  C extends t.IModelChildrenSchema
> = {
  db: t.IDb;
  path: string;
  initial: D;
  typename?: string;
  load?: boolean;
  events$?: Subject<t.ModelEvent>;
  links?: t.IModelLinkDefs<L>;
  children?: t.IModelChildrenDefs<C>;
};

/**
 * A strongly typed wrapper around a database representing a
 * single conceptual "model", and it's relationships.
 *
 *  - data (doc)
 *  - links (JOIN relationships)
 *  - children (path descendent relationships)
 *  - read|write (change management)
 *  - caching
 *
 */
export class Model<
  P extends object,
  D extends P = P,
  L extends t.IModelLinksSchema = any,
  C extends t.IModelChildrenSchema = any
> implements t.IModel<P, D, L, C> {
  /**
   * [Lifecycle]
   */
  public static create = <
    P extends object,
    D extends P = P,
    L extends t.IModelLinksSchema = any,
    C extends t.IModelChildrenSchema = any
  >(
    args: IModelArgs<P, D, L, C>,
  ) => new Model<P, D, L, C>(args);

  private constructor(args: IModelArgs<P, D, L, C>) {
    // Prepare path.
    const path = (args.path || '').trim();
    args = args.path === path ? args : { ...args, path };
    if (!path) {
      throw new Error(`A model must have a path.`);
    }

    // Store args.
    this._args = args;

    // Bubble events.
    const events$ = args.events$;
    if (events$) {
      this.events$.subscribe(e => events$.next(e));
    }

    // Load data from storage.
    if (defaultValue(args.load, true)) {
      this.load();
    }
  }

  public dispose() {
    this._dispose$.next();
    this._dispose$.complete();
  }

  /**
   * [Fields]
   */
  private _args: IModelArgs<P, D, L, C>;
  private _item: t.IDbValue | undefined;
  private _props: P;
  private _links: t.IModelLinks<L>;
  private _children: t.IModelChildren<C>;
  private _linkCache = {};
  private _childrenCache = {};
  private _changes: Array<t.IModelChange<P, D, L, C>> = [];
  private _typename: string;

  private readonly _dispose$ = new Subject<{}>();
  public readonly dispose$ = this._dispose$.pipe(share());

  private readonly _events$ = new Subject<t.ModelEvent>();
  public readonly events$ = this._events$.pipe(
    takeUntil(this.dispose$),
    share(),
  );

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._dispose$.isStopped;
  }

  public get isLoaded() {
    return Boolean(this._item);
  }

  public get isChanged() {
    return (this._changes || []).length > 0;
  }

  public get exists() {
    return this._item ? this._item.props.exists : undefined;
  }

  public get db() {
    return this._args.db;
  }

  public get path() {
    return this._args.path;
  }

  public get typename() {
    if (!this._typename) {
      this._typename = (this._args.typename || this.path.split('/')[0]).trim();
    }
    return this._typename;
  }

  public get ready() {
    return new Promise<t.IModel<P, D, L>>(resolve => {
      if (this.isLoaded) {
        resolve(this);
      } else {
        this.events$
          .pipe(filter(e => e.type === 'MODEL/loaded/data', take(1)))
          .subscribe(e => resolve(this));
      }
    });
  }

  public get createdAt() {
    return this._item ? this._item.props.createdAt : -1;
  }

  public get modifiedAt() {
    return this._item ? this._item.props.modifiedAt : -1;
  }

  public get changes(): t.IModelChanges<P, D, L, C> {
    this.throwIfDisposed('changes');
    const list = this._changes || [];
    const length = list.length;
    return {
      length,
      list,
      get map() {
        return list.reduce((acc, next) => {
          return { ...acc, [next.field]: next.value.to };
        }, {}) as t.IModelChanges<P, D, L, C>['map'];
      },
    };
  }

  public get doc(): D {
    const item = this._item;
    const res = item ? ((item.value as unknown) as P) : undefined;
    return (res || {}) as D;
  }

  public get props(): P {
    this.throwIfDisposed('props');
    if (!this._props) {
      const res = {} as any;
      Object.keys(this._args.initial).forEach(field => {
        Object.defineProperty(res, field, {
          get: () => this.readField(field),
          set: value => this.changeField('PROP', field, value),
        });
      });
      this._props = res;
    }
    return this._props;
  }

  public get links(): t.IModelLinks<L> {
    this.throwIfDisposed('links');
    if (!this._links) {
      this._links = {} as any;
      const defs = this._args.links || {};
      Object.keys(defs).forEach(field =>
        Object.defineProperty(this._links, field, {
          get: () => this.resolveLink(field),
        }),
      );
    }
    return this._links;
  }

  public get children(): t.IModelChildren<C> {
    this.throwIfDisposed('children');
    if (!this._children) {
      this._children = {} as any;
      const defs = this._args.children || {};
      Object.keys(defs).forEach(field =>
        Object.defineProperty(this._children, field, {
          get: () => this.resolveChildren(field),
        }),
      );
    }
    return this._children;
  }

  /**
   * [Methods]
   */

  /**
   * Loads the model's data from the DB.
   */
  public async load(
    options: {
      force?: boolean;
      withLinks?: boolean;
      withChildren?: boolean;
      silent?: boolean;
    } = {},
  ) {
    this.throwIfDisposed('load');
    let fireEvent = false;
    if (options.force) {
      this.reset();
    }

    // Retrieve model data from the DB.
    if (!this._item) {
      this._item = await this.db.get(this.path);
      fireEvent = true;
    }

    // Load links (if required).
    const withLinks = Boolean(options.withLinks);
    if (withLinks) {
      const cachedLinks = Object.keys(this._linkCache);
      const defs = this._args.links || {};
      fireEvent = cachedLinks.length < Object.keys(defs).length ? true : fireEvent;
      const wait = Object.keys(defs).map(key => this.links[key]);
      await Promise.all(wait);
    }

    // Load children (if required).
    const withChildren = Boolean(options.withChildren);
    if (withChildren) {
      const cachedChildren = Object.keys(this._childrenCache);
      const defs = this._args.children || {};
      fireEvent = cachedChildren.length < Object.keys(defs).length ? true : fireEvent;
      const wait = Object.keys(defs).map(key => this.children[key]);
      await Promise.all(wait);
    }

    // Alert listeners.
    if (fireEvent && !options.silent) {
      const typename = this.typename;
      this.fire({
        type: 'MODEL/loaded/data',
        typename,
        payload: { model: this, withLinks, withChildren },
      });
    }

    // Finish up.
    return this.props;
  }

  /**
   * Clears cached model data.
   */
  public reset() {
    this.throwIfDisposed('reset');
    this._item = undefined;
    this._linkCache = {};
    this._childrenCache = {};
  }

  /**
   * Persists changes to the underlying store.
   */
  public async save() {
    this.throwIfDisposed('save');
    if (this.exists && !this.isChanged) {
      return { saved: false };
    }

    // Save to the DB.
    const changes = this.changes;
    const doc = this.exists
      ? { ...this.doc, ...changes.map }
      : { ...this._args.initial, ...changes.map };
    await this.db.put(this.path, doc as any);

    // Update model state.
    this._changes = [];
    await this.load({ force: true, silent: true });

    // Finish up.
    const typename = this.typename;
    this.fire({ type: 'MODEL/saved', typename, payload: { model: this, changes } });
    return { saved: true };
  }

  /**
   * Convert the model props to a simple object.
   */
  public toObject(): P {
    this.throwIfDisposed('toObject');
    if (!this.isLoaded || !this.exists) {
      return ({} as any) as P;
    }
    const props = this.props;
    return Object.keys(this._args.initial).reduce((acc, key) => {
      acc[key] = props[key];
      return acc;
    }, {}) as P;
  }

  /**
   * [Helpers]
   */
  private throwIfDisposed(action: string) {
    if (this.isDisposed) {
      throw new Error(`Cannot ${action} because Model is disposed.`);
    }
  }

  private fire(e: t.ModelEvent) {
    this._events$.next(e);
  }

  private resolveLink(field: string, options: { autoLoad?: boolean } = {}) {
    const db = this.db;
    const defs = (this._args.links || {}) as t.IModelLinkDefs<L>;
    const def = defs[field];
    const { relationship } = def;

    const key = def.field || field;
    const isOne = relationship === '1:1';
    const isMany = relationship === '1:*';

    if (!def) {
      throw new Error(`A link definition for field '${field}' could not be found.`);
    }

    // Link resolver.
    const promise: any = new Promise<L[keyof L] | undefined>(async resolve => {
      const cached = this._linkCache[key];
      if (cached) {
        return resolve(cached);
      }
      if (!this.isLoaded && defaultValue(options.autoLoad, true)) {
        await this.load();
      }

      let model: any;
      if (isOne) {
        const path = this.currentValue<string>(key);
        model = path ? await def.factory({ db, path }).ready : undefined;
      }
      if (isMany) {
        const paths = this.currentValue<string[]>(key) || [];
        model = await Promise.all(paths.map(path => def.factory({ db, path }).ready));
      }
      this._linkCache[key] = model;

      this.fire({
        type: 'MODEL/loaded/link',
        typename: this.typename,
        payload: { model: this, field },
      });
      return resolve(model);
    });

    // Add and remove API for model-relationship links.
    if (isOne) {
      promise.link = (path: string) => this.changeField('LINK', key, path);
      promise.unlink = () => this.changeField('LINK', key, undefined);
    }
    if (isMany) {
      const getChanges = (field: string, paths?: string[]) => {
        const changes = this.changes;
        const changeExists = Object.keys(this.changes.map).includes(field);
        const current = this.currentValue<string[]>(field) || [];
        const isChanged =
          changeExists && Array.isArray(paths)
            ? !paths.every(path => current.includes(path))
            : true;
        return { changes, isChanged, current, paths: R.uniq([...current, ...(paths || [])]) };
      };

      promise.link = (paths: string[]) => {
        if ((paths || []).length > 0) {
          const changes = getChanges(key, paths);
          if (changes.isChanged) {
            this.changeField('LINK', key, changes.paths);
          }
        }
      };
      promise.unlink = (paths?: string[]) => {
        paths = (paths || []).length === 0 ? undefined : paths;
        const changes = getChanges(key, paths);
        if (Array.isArray(paths)) {
          if (changes.isChanged) {
            // Remove specific links.
            paths = changes.paths.filter(path => !(paths || []).includes(path));
            paths = paths.length === 0 ? undefined : paths;
            this.changeField('LINK', key, paths);
          }
        } else {
          if (changes.isChanged) {
            // Clear all links.
            this.changeField('LINK', key, undefined);
          }
        }
      };
    }

    // Finish up.
    return promise;
  }

  private resolveChildren(field: string, options: { autoLoad?: boolean } = {}) {
    const db = this.db;
    const defs = (this._args.children || {}) as t.IModelChildrenDefs<C>;
    const def = defs[field];
    if (!def) {
      throw new Error(`A children definition for field '${field}' could not be found.`);
    }

    // Prepare the child descendents query.
    let query = (def.query || '')
      .trim()
      .replace(/^\/*/, '')
      .trim();
    query = `${this.path}/${query}`;

    // Children resolver.
    const promise: any = new Promise<C[keyof C] | undefined>(async resolve => {
      const cached = this._childrenCache[field];
      if (cached) {
        return resolve(cached);
      }
      if (!this.isLoaded && defaultValue(options.autoLoad, true)) {
        await this.load();
      }

      const paths = (await db.find(query)).list.map(item => item.props.key);
      const children = await Promise.all(paths.map(path => def.factory({ db, path }).ready));
      this._childrenCache[field] = children;

      this.fire({
        type: 'MODEL/loaded/children',
        typename: this.typename,
        payload: { model: this, children, field },
      });
      resolve(children as any);
    });

    // Finish up.
    return promise;
  }

  private currentValue<T>(field: string) {
    const changes = this.changes.map;
    const isChanged = Object.keys(changes).includes(field);
    return (isChanged ? changes[field] : this.doc[field]) as T;
  }

  private readField(field: string) {
    let res = this.isChanged ? this.changes.map[field] || this.doc[field] : this.doc[field];
    const payload: t.IModelReadProp<P, D, L> = {
      model: this,
      field,
      value: res,
      doc: this.doc,
      isModified: false,
      modify(value: any) {
        res = value;
        payload.isModified = true;
      },
    };
    this.fire({ type: 'MODEL/read/prop', typename: this.typename, payload });
    return res;
  }

  private changeField(kind: t.ModelValueKind, field: string, value: any) {
    const typename = this.typename;
    const changes = this.changes.map;
    let isCancelled = false;

    if (Object.keys(changes).includes(field) && changes[field] === value) {
      // No change from current modification.
      return { isValueChanged: false, isCancelled };
    } else {
      const change = this.getChange(kind, field, value);

      // Fire BEFORE event.
      this.fire({
        type: 'MODEL/changing',
        typename,
        payload: {
          change,
          get isCancelled() {
            return isCancelled;
          },
          cancel() {
            isCancelled = true;
          },
        },
      });

      if (isCancelled) {
        return { isValueChanged: false, isCancelled: true };
      }

      // Remove from cache.
      if (Object.keys(this._linkCache).includes(field)) {
        delete this._linkCache[field];
      }

      // Store the change entry.
      this._changes = [...this._changes, change];
      this.fire({ type: 'MODEL/changed', typename, payload: change });
      return { isValueChanged: true, isCancelled };
    }
  }

  private getChange(kind: t.ModelValueKind, field: string, value: any): t.IModelChange<P, D, L, C> {
    const to = { ...this.doc, [field]: value };
    return {
      kind,
      field,
      model: this,
      doc: { from: { ...this.doc }, to },
      modifiedAt: time.now.timestamp,
      value: { from: this.doc[field], to: value },
    };
  }
}