import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DevTools } from '../helpers/devTools/renderer';
import { getId, init as initIpc } from '../helpers/ipc/renderer';
import { init as initLog } from '../helpers/logger/renderer';
import { init as initStore } from '../helpers/store/renderer';
import * as t from '../types';
import { Context, createProvider, ReactContext } from './Context';
import { WindowsRenderer } from '../helpers/windows/renderer';

const electron = (window as any).require('electron');
const remote = electron.remote as Electron.Remote;

export { Context, ReactContext };
export * from '../types';

type Refs = { renderer?: t.IRenderer };
const refs: Refs = {};

type GetContext<M extends t.IpcMessage = any, S extends t.StoreJson = any> = (args: {
  context: t.IRendererContext<M, S>;
}) => Promise<any>;

/**
 * Initializes [Renderer] process systems (safely).
 */
export async function init<M extends t.IpcMessage = any, S extends t.StoreJson = any>(
  args: { getContext?: GetContext<M, S> } = {},
): Promise<t.IRenderer<M, S>> {
  if (refs.renderer) {
    return refs.renderer;
  }

  // Retrieve the ID.
  const id = await getId();

  // Ipc.
  const ipc = await initIpc<M>({ id });

  // Log.
  const log = initLog({ ipc });

  // Store.
  const store = initStore<S>({ ipc });

  // Dev tools.
  const devTools = new DevTools({ ipc });

  // Windows manager.
  const windows = new WindowsRenderer({ ipc });

  // React <Provider>.
  let context: t.IRendererContext<M, S> = {
    id,
    ipc,
    store,
    log,
    devTools,
    windows,
    remote,
    ...({} as any),
  };

  // Merge in additional context props.
  context = args.getContext ? { ...context, ...(await args.getContext({ context })) } : context;

  const Provider = createProvider(context);

  // Finish up.
  refs.renderer = { ...context, Provider, devTools, windows };
  return refs.renderer;
}

/**
 * Renders the root of the application into the DOM within
 * an initialized <Provider>.
 *
 * To kick off the app:
 *
 *      import renderer from '@platform/electron/lib/renderer';
 *
 *      renderer
 *        .render(el, 'root')
 *        .then(context => {
 *          console.log('renderer loaded:', context);
 *        })
 *        .catch(err => {
 *          // Do something with the error.
 *        });
 *
 * To access the context deep within the React tree add a `contextType`:
 *
 *      import renderer from '@platform/electron/lib/renderer';
 *
 *      export class MyView extends React.PureComponent {
 *        public static contextType = renderer.Context;
 *        public context!: renderer.ReactContext
 *        public render() {
 *          return <div>window-id: {this.context.id}<div>;
 *        }
 *      }
 *
 */
export async function render(
  element: React.ReactElement<any>,
  container: Element | string,
  options: { getContext?: GetContext } = {},
) {
  // Setup initial conditions.
  const renderer = await init(options);
  const { log, Provider } = renderer;

  const throwError = (msg: string) => {
    log.error(msg);
    throw new Error(msg);
  };

  // Find the container element to render within.
  const elContainer =
    typeof container === 'object' ? container : document.getElementById(container || 'root');

  if (!elContainer) {
    const msg = `RENDERER START: Could not find the given Element container '${container}' to load the app within.`;
    throwError(msg);
  }

  // Render into the DOM.
  try {
    const el = <Provider>{element}</Provider>;
    ReactDOM.render(el, elContainer);
  } catch (error) {
    const msg = `RENDERER START: Failed while rendering DOM. ${error.message}`;
    throwError(msg);
  }

  // Finish up.
  return renderer;
}
