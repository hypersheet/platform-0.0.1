import { Observable } from 'rxjs';
import * as t from '../types';

/**
 * Factory cache manager.
 */
export type IDbFactory<D extends t.IDb = t.IDb, N extends t.INetwork = t.INetwork> = {
  count: number;
  items: Array<IDbFactoryItem<D, N>>;
  events$: Observable<DbFactoryEvent>;

  isCached(args: { dir: string; version?: string }): boolean;

  reset(): IDbFactory<D, N>;

  create<P extends {} = any>(
    args: ICreateCacheableDatabaseArgs,
  ): Promise<ICreateDatabaseResponse<P>>;

  get<P extends {} = any>(args: {
    dir: string;
    version?: string;
  }): ICreateDatabaseResponse<P> | undefined;

  getOrCreate<P extends {} = any>(
    args: ICreateCacheableDatabaseArgs,
  ): Promise<ICreateDatabaseResponse<P>>;

  remove(args: { dir: string; version?: string }): IDbFactory<D, N>;
};

export type IDbFactoryItem<D extends t.IDb, N extends t.INetwork> = {
  db: D;
  network: N;
};

/**
 * Factory function that returns a new Db/Network pair.
 */
export type CreateDatabase<D extends t.IDb = any, N extends t.INetwork = any> = <
  P extends {} = any
>(
  args: ICreateDatabaseArgs,
) => Promise<ICreateDatabaseResponse<P>>;

export type ICreateDatabaseArgs = {
  dir: string;
  dbKey?: string;
  connect?: boolean;
  version?: string;
};
export type ICreateCacheableDatabaseArgs = ICreateDatabaseArgs & { cache?: boolean };

export type ICreateDatabaseResponse<P extends {} = any> = {
  db: t.IDb<P>;
  network: t.INetwork;
};

export type AfterCreate<D extends t.IDb = any, N extends t.INetwork = any> = (args: {
  args: ICreateDatabaseArgs;
  db: D;
  network: N;
}) => void;

/**
 * [Events]
 */
export type DbFactoryEvent =
  | IDbFactoryChangeEvent
  | IDbFactoryCreatedEvent
  | IDbFactoryRemovedEvent;

export type IDbFactoryChangeEvent = {
  type: 'DB_FACTORY/change';
  payload: {
    action: 'CREATED' | 'REMOVED' | 'RESET';
    count: number;
  };
};

export type IDbFactoryCreatedEvent = {
  type: 'DB_FACTORY/created';
  payload: {
    db: t.IDb;
    network: t.INetwork;
  };
};

export type IDbFactoryRemovedEvent = {
  type: 'DB_FACTORY/removed';
  payload: {
    db: t.IDb;
    network: t.INetwork;
  };
};
