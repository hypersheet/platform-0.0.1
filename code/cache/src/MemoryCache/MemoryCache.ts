import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

type CacheItem<V> = {
  value?: V;
  put$: Subject<{}>;
};

export class MemoryCache<K extends string> {
  /**
   * [Lifecycle]
   */
  public constructor(args: { ttl?: number } = {}) {
    this.ttl = args.ttl;
  }

  /**
   * [Fields]
   */
  private readonly values: { [key: string]: CacheItem<any> } = {};
  public readonly ttl: number | undefined;

  /**
   * [Methods]
   */

  public isCached(key: K) {
    return Boolean(this.values[key] && this.values[key].value);
  }

  public get<V>(key: K, defaultValue?: () => V) {
    let value = this.item<V>(key).value;
    if (value === undefined && typeof defaultValue === 'function') {
      value = defaultValue();
      this.put(key, value);
    }
    return value;
  }

  public put<V>(key: K, value: V) {
    const item = this.item(key);
    item.value = value;
    item.put$.next();
    if (typeof this.ttl === 'number') {
      timer(this.ttl)
        .pipe(takeUntil(item.put$))
        .subscribe(e => this.delete(key));
    }
    return this;
  }

  public delete(key: K) {
    delete this.values[key];
    return this;
  }

  public clear() {
    Object.keys(this.values).forEach(key => delete this.values[key]);
    return this;
  }

  /**
   * [Helpers]
   */
  private item<V>(key: K): CacheItem<V> {
    if (!this.values[key]) {
      this.values[key] = { put$: new Subject() };
    }
    return this.values[key];
  }
}