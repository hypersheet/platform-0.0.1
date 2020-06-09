import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';

import { Client, t } from '../common';
import { createStore, behavior } from '../state';

/**
 * Creates an environment context.
 */
export function create(args: { env: t.IEnv }) {
  const { env } = args;
  const event$ = env.event$;
  const client = Client.env(env);
  const store = createStore({ event$ });

  const ctx = {
    client,
    getState: () => store.state,
    event$: (event$ as Subject<t.TypedSheetEvent>).pipe(share()),
    fire: (e) => event$.next(e),
  } as t.IFinderContext;

  behavior.init({ ctx, store });
  return { ctx, store };
}
