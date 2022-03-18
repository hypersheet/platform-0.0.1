import { Subject, Observable, takeUntil } from 'rxjs';

import { rx, t, UIEvent } from './common';

type S = t.ListMouseState;

/**
 * Maintains state of mouse over the set of <List> items.
 */
export function ListMouseState(args: t.ListEventArgs) {
  const { bus, instance } = args;

  const events = UIEvent.Events<t.CtxItem>({
    bus,
    instance,
    filter: (e) => e.payload.ctx.kind === 'Item',
  });
  const { dispose, dispose$, mouse } = events;
  const changed$ = new Subject<S>();

  let state: S = { over: -1, down: -1 };
  const setState = (fn: (prev: S) => S) => {
    state = fn(state);
    changed$.next(state);
  };

  /**
   * Mouse state.
   */
  mouse.event('onMouseEnter').subscribe((e) => {
    setState((prev) => ({ ...prev, over: e.ctx.index }));
  });

  mouse
    .filter(UIEvent.isLeftButton)
    .event('onMouseDown')
    .subscribe((e) => {
      setState((prev) => ({ ...prev, down: e.ctx.index }));
    });

  mouse
    .filter(UIEvent.isLeftButton)
    .event('onMouseUp')
    .subscribe((e) => {
      setState((prev) => {
        if (prev.down === e.ctx.index) prev = { ...prev, down: -1 };
        return prev;
      });
    });

  mouse.event('onMouseLeave').subscribe((e) => {
    setState((prev) => {
      const index = e.ctx.index;
      if (prev.down === index) prev = { ...prev, down: -1 }; // Clear the [down] state, cannot be down if mouse has "left the building".
      if (prev.over === index) prev = { ...prev, over: -1 };
      return prev;
    });
  });

  /**
   * API
   */
  return {
    bus: rx.bus.instance(bus),
    instance,
    dispose,
    dispose$,
    changed$: changed$.pipe(takeUntil(dispose$)),
    get state() {
      return state;
    },
  };
}
