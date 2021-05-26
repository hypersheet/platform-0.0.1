import { app, MenuItemConstructorOptions as M, shell, BrowserWindow } from 'electron';
import { constants, t, fs, log, ConfigFile, time } from '../../common';
import { Window } from '../../main.Window';
import { IpcNetworkBus } from '../../main.Bus';

/**
 * Menu for installing a new module.
 */
export function modulesMenu(args: {
  bus: t.ElectronRuntimeBus;
  paths: t.IElectronPaths;
  port: number;
}): M {
  const { paths, bus } = args;

  type Foo = { type: 'foo'; payload: any };
  const netbus = IpcNetworkBus<Foo>({ bus });
  const events = Window.Events({ bus });

  const item: M = {
    label: 'Modules',
    submenu: [
      {
        label: 'tmp.status',
        click: async () => {
          const res = await events.status.get();
          console.log('status', res);
        },
      },

      {
        label: 'tmp.netbus',
        click: async () => {
          netbus.fire({ type: 'foo', payload: { count: 123 } });
        },
      },

      {
        label: 'tmp.change',
        click: async () => {
          const { windows } = await events.status.get();

          const uri = windows[0]?.uri;

          events.change.fire(uri, {
            bounds: { x: 50, y: 100 },
            // isVisible: false,
          });

          // type Foo = { type: 'foo'; payload: any };
          // const netbus = IpcNetworkBus<Foo>({ bus });
          // console.log('fire');
          // netbus.fire({ type: 'foo', payload: { count: 123 } });
          // events.change.fire({

          // })
        },
      },

      { type: 'separator' },

      {
        label: 'Install...',
        click: async () => {
          console.log('install');

          const url = 'http://localhost:5050'; // app.sys (localhost)

          const res = await events.create.fire({
            url,
            devTools: true,
            props: { width: 1200, height: 900 },
          });

          console.log('create/res:', res);

          console.log('-------------------------------------------');
          const config = await ConfigFile.read();
          console.log('config file', config);
        },
      },
    ],
  };

  return item;
}
