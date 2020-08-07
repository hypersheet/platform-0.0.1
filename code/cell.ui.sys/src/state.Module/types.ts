import * as React from 'react';

import { Observable } from 'rxjs';

import * as t from '../common/types';

type O = Record<string, unknown>;
type N = t.ITreeNode;
type E = t.ModuleEvent;

export type ModuleArgs<D extends O> = t.ITreeStateArgs<IModuleTreeNode<D>> & {
  event$?: Observable<t.Event>; // Global event bus/
};

export type Module = {
  identity: t.TreeIdentity;
  Context: React.Context<any>;

  create<D extends O>(args?: ModuleArgs<D>): IModule<D>;

  register<T extends IModule = IModule, D extends O = any>(
    parent: IModule,
    args: ModuleRegisterArgs<D>,
  ): ModuleRegistration<T>;

  publish(args: ModulePublishArgs): ModulePublishResponse;

  subscribe<T extends N = N>(args: ModuleSubscribeArgs<T>): ModuleSubscribeResponse<T>;

  isModuleEvent(event: t.Event): boolean;
  filter(event: t.ModuleEvent, filter?: t.ModuleFilter): boolean;
  events: ModuleEvents;
  fire<T extends N = N>(next: t.FireEvent<any>): IModuleFire<T>;
  provider<P extends O>(context: P): React.FunctionComponent;
};

/**
 * Registration
 */
export type ModuleRegisterArgs<D extends O = any> = {
  id: string;
  label?: string;
  view?: string;
  data?: D;
};
export type ModuleRegistration<T extends IModule = IModule> = { id: string; module: T };

/**
 * A module state-tree.
 */
export type IModuleTreeSelection = { id: string; props: t.ITreeViewNodeProps };

export type IModule<D extends O = any> = t.ITreeState<IModuleTreeNode<D>, t.ModuleEvent>;

/**
 * A tree-node that contains details about a module.
 */
export type IModuleTreeNode<D extends O> = t.ITreeNode<IModuleTreeNodeProps<D>>;
export type IModuleTreeNodeProps<D extends O> = t.ITreeNodePropsTreeView & t.IModuleNodeProps<D>;

/**
 * The way a module is expressed as props within a tree-node.
 */
export type IModuleNodeProps<D extends O = O> = {
  kind?: 'MODULE';
  data?: D;
  view?: string;
};

/**
 * Filter
 */
export type ModuleFilter = (args: ModuleFilterArgs) => boolean;
export type ModuleFilterArgs = {
  id: string;
  namespace: string;
  key: string;
  event: t.ModuleEvent;
};

/**
 * Event Broadcasting
 */

export type ModulePublishArgs = {
  until$?: Observable<any>;
  module: IModule;
  fire: t.FireEvent<any>;
  filter?: t.ModuleFilter;
};
export type ModulePublishResponse = t.IDisposable;

export type ModuleSubscribeArgs<T extends N = N> = {
  until$?: Observable<any>;
  event$: Observable<t.Event>;
  tree: t.ITreeState<T, E>;
  filter?: t.ModuleFilter;
};
export type ModuleSubscribeResponse<T extends N = N> = t.IDisposable & {
  tree: t.ITreeState<T, E>;
};

/**
 * Event Bus (fire)
 */

export type IModuleFire<T extends N> = {
  render: ModuleFireRender;
  selection: ModuleFireSelection;
  request: ModuleRequest<T>;
};

export type ModuleFireRender = (args: ModuleFireRenderArgs) => JSX.Element | null | undefined;
export type ModuleFireRenderArgs = {
  module: string;
  tree: { current?: string; selection?: t.IModuleTreeSelection };
  data?: O;
  view?: string;
};

export type ModuleFireSelection = (args: ModuleFireSelectionArgs) => void;
export type ModuleFireSelectionArgs = {
  root: t.ITreeNode;
  current?: string;
  selected?: string;
};

export type ModuleRequest<T extends N = N> = (id: string) => ModuleRequestResponse<T>;
export type ModuleRequestResponse<T extends N = N> = {
  module?: IModule<T>;
  path: string;
};

/**
 * [Events]
 */

export type ModuleEvents = (
  subject: Observable<t.Event> | IModule,
  dispose$?: Observable<any>,
) => IModuleEvents;

export type IModuleEvents = {
  $: Observable<ModuleEvent>;
  registered$: Observable<IModuleChildRegistered>;
  childDisposed$: Observable<IModuleChildDisposed>;
  changed$: Observable<IModuleChanged>;
  patched$: Observable<IModulePatched>;
  selection$: Observable<IModuleSelection>;
  render$: Observable<IModuleRender>;
  rendered$: Observable<IModuleRendered>;
  filter(fn: ModuleFilter): IModuleEvents;
};

export type ModuleEvent =
  | IModuleChildRegisteredEvent
  | IModuleChildDisposedEvent
  | IModuleSelectionEvent
  | IModuleRenderEvent
  | IModuleRenderedEvent
  | IModuleChangedEvent
  | IModulePatchedEvent
  | IModuleRequestEvent;

export type IModuleChildRegisteredEvent = {
  type: 'Module/child/registered';
  payload: IModuleChildRegistered;
};
export type IModuleChildRegistered = {
  module: string;
  path: string;
};

export type IModuleChildDisposedEvent = {
  type: 'Module/child/disposed';
  payload: IModuleChildDisposed;
};
export type IModuleChildDisposed = { module: string; path: string };

export type IModuleSelectionEvent<D extends O = any> = {
  type: 'Module/selection';
  payload: IModuleSelection<D>;
};
export type IModuleSelection<D extends O = any> = {
  module: string;
  tree: { current?: string; selection?: IModuleTreeSelection };
  data?: D;
  view?: string;
};

export type IModuleRenderEvent<D extends O = any> = {
  type: 'Module/render';
  payload: IModuleRender<D>;
};
export type IModuleRender<D extends O = any> = {
  module: string;
  tree: { current?: string; selection?: IModuleTreeSelection };
  data: D;
  view: string;
  render(el: JSX.Element | null): void;
};
export type IModuleRenderedEvent = {
  type: 'Module/rendered';
  payload: IModuleRendered;
};
export type IModuleRendered = { module: string; el: JSX.Element | null };

export type IModuleChangedEvent = {
  type: 'Module/changed';
  payload: IModuleChanged;
};
export type IModuleChanged = { module: string; change: t.ITreeStateChanged };

export type IModulePatchedEvent = {
  type: 'Module/patched';
  payload: IModulePatched;
};
export type IModulePatched = { module: string; patch: t.ITreeStatePatched };

export type IModuleRequestEvent = {
  type: 'Module/request';
  payload: IModuleRequest;
};
export type IModuleRequest = {
  module: string;
  response(args: { module: t.IModule; path: string }): void;
};
