import { equals } from 'ramda';
import { Subject } from 'rxjs';
import { share, takeUntil, distinctUntilChanged } from 'rxjs/operators';

import * as t from '../types';
import {
  IWindowChange,
  IWindowChangedEvent,
  IWindowRef,
  IWindows,
  IWindowsGetEvent,
  IWindowsGetResponse,
} from './types';

/**
 * [renderer] Maintains a set of reference to all windows.
 */
export class WindowsRenderer implements IWindows {
  private ipc: t.IpcInternal;
  private _refs: IWindowRef[] = [];

  private readonly _dispose$ = new Subject();
  public readonly dispose$ = this._dispose$.pipe(share());
  public isDisposed = false;

  private readonly _change$ = new Subject<IWindowChange>();
  public readonly change$ = this._change$.pipe(
    takeUntil(this.dispose$),
    distinctUntilChanged((prev, next) => equals(prev, next)),
    share(),
  );

  // public refs

  /**
   * [Constructor]
   */
  constructor(args: { ipc: t.IpcClient }) {
    const ipc = (this.ipc = args.ipc);
    console.log('windows renderer', args);

    ipc
      .on<IWindowChangedEvent>('@platform/WINDOWS/change')
      .pipe(takeUntil(this.dispose$))
      .subscribe(e => {
        const { type, window, windows } = e.payload.change;
        this.change(type, window, windows);
      });

    this.refresh();
  }

  /**
   * [Properties]
   */
  public get refs() {
    return this._refs;
  }

  /**
   * [Methods]
   */
  public async refresh() {
    type E = IWindowsGetEvent;
    type R = IWindowsGetResponse;
    const res = await this.ipc.send<E, R>('@platform/WINDOWS/get', {}).promise;
    const data = res.dataFrom('MAIN');

    if (data) {
      const isChanged = !equals(data.windows, this._refs);
      if (isChanged) {
        const localWindows = [...this.refs];
        const remoteWindows = [...data.windows];

        // Check for new windows that do not exist locally.
        for (const window of remoteWindows) {
          const existLocally = localWindows.find(m => m.id === window.id);
          if (!existLocally) {
            this.change('CREATED', window.id, remoteWindows);
          }
        }

        // Check for windows that exist locally that have been closed.
        for (const window of localWindows) {
          const existsRemotely = remoteWindows.find(m => m.id === window.id);
          if (!existsRemotely) {
            this.change('CLOSED', window.id, remoteWindows);
          }
        }
      }
    }
  }

  /**
   * INTERNAL
   */
  private change(
    type: IWindowChange['type'],
    window: number,
    windows: IWindowRef[],
  ) {
    this._refs = [...windows];
    this._change$.next({ type, window, windows });
  }
}