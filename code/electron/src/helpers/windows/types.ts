import { Observable } from 'rxjs';

/**
 * Represents all windows.
 */
export type IWindows = {
  change$: Observable<IWindowChange>;
  refs: IWindowRef[];
  refresh: () => Promise<void>;
};

/**
 * Represents a single window.
 */
export type IWindowRef = {
  id: number;
  tags: string[];
};

/**
 * IPC Events.
 */
export type WindowsEvents = IWindowChangedEvent | IWindowsGetEvent;

export type IWindowChangedEvent = {
  type: '@platform/WINDOWS/change';
  payload: {
    change: IWindowChange;
  };
};
export type IWindowChange = {
  type: 'CREATED' | 'CLOSED';
  window: number;
  windows: IWindowRef[];
};

export type IWindowsGetEvent = {
  type: '@platform/WINDOWS/get';
  payload: {};
};
export type IWindowsGetResponse = {
  windows: IWindowRef[];
};