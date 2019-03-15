import { equals } from 'ramda';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, share, takeUntil } from 'rxjs/operators';

import { Argv } from '../Argv';
import { t } from '../common';
import { Command } from '../Command/Command';

type ICreateCommandState = {
  root: Command;
};

/**
 * Manages state of a CLI program.
 */
export class CommandState implements t.ICommandState {
  /**
   * [Static]
   */
  public static create(args: ICreateCommandState) {
    return new CommandState(args);
  }

  /**
   * [Constructor]
   */
  private constructor(args: ICreateCommandState) {
    const { root } = args;
    if (!root) {
      throw new Error(`A root [Command] spec must be passed to the state constructor.`);
    }
    this._.root = root;
    this.change = this.change.bind(this);
  }

  /**
   * [Fields]
   */
  private readonly _ = {
    dispose$: new Subject(),
    events$: new Subject<t.CommandStateEvent>(),
    root: (undefined as unknown) as Command,
    text: '',
    namespace: undefined as t.ICommandNamespace | undefined,
  };

  public readonly dispose$ = this._.dispose$.pipe(share());
  public readonly events$ = this._.events$.pipe(
    takeUntil(this._.dispose$),
    share(),
  );
  public readonly change$ = this.events$.pipe(
    filter(e => e.type === 'COMMAND/state/change'),
    map(e => e.payload),
    distinctUntilChanged((prev, next) => equals(prev, next) && !next.invoked),
    share(),
  );
  public readonly invoke$ = this.change$.pipe(
    filter(e => e.invoked),
    share(),
  );

  /**
   * [Properties]
   */
  public get isDisposed() {
    return this._.dispose$.isStopped;
  }

  public get root() {
    return this._.root;
  }

  public get text() {
    return this._.text;
  }

  public get args() {
    const args = Argv.parse(this.text);

    /**
     * Trim params prior to the current command.
     * For example:
     *
     *    - with the command line `create foo bar`
     *    - if the command is `create`
     *    - the params would be `foo bar` excluding `create`.
     *
     */
    const command = this.command;
    if (command) {
      const index = args.params.indexOf(command.name);
      args.params = args.params.slice(index + 1);
    }

    return args;
  }

  public get command() {
    const root = this.namespace ? this.namespace.command : this.root;
    const args = Argv.parse(this.text);
    const path = [root.name, ...args.params];

    // NB: Catch the lowest level command, leaving params intact (ie. strict:false).
    const res = Command.tree.fromPath(root, path, { strict: false });
    if (!res) {
      return undefined;
    } else {
      return res.id === root.id ? undefined : res;
    }
  }

  public get namespace() {
    return this._.namespace;
  }

  /**
   * [Methods]
   */
  public dispose() {
    this._.dispose$.next();
    this._.dispose$.complete();
  }

  public change(e: t.ICommandChangeArgs) {
    const { events$ } = this._;
    const { text, namespace } = e;

    // Update state.
    this._.text = text;

    // Set namespace if requested.
    const command = this.command;

    const setNamespace = (command: t.ICommand) => {
      const root = this.root;
      const isLeaf = command.children.length === 0;
      const ns = isLeaf ? command.tree.parent(root) : command;
      if (!ns || ns.id === root.id) {
        return;
      }

      const id = ns.id;

      const namespace: t.ICommandNamespace = {
        command: ns,
        get path() {
          return Command.tree.toPath(root, id).slice(1);
        },
        toString() {
          return namespace.path.map(c => c.name).join('.');
        },
      };
      this._.namespace = namespace;
      this._.text = isLeaf ? command.name : ''; // Reset the text as we are now witin a new namespace.
    };

    if (
      command &&
      namespace === true &&
      !(this.namespace && this.namespace.command.id === command.id) // Not the current namespace.
    ) {
      setNamespace(command);
    }

    // Clear the namespace if requested.
    if (e.namespace === false) {
      this._.namespace = undefined;
    }

    // Alert listeners.
    const props = this.toObject();
    const invoked = props.command ? Boolean(e.invoked) : false;
    const payload = { props, invoked, namespace };
    events$.next({ type: 'COMMAND/state/change', payload });

    // Finish up.
    return this;
  }

  public toString() {
    return this.text;
  }

  public toObject(): t.ICommandStateProps {
    return {
      root: this.root,
      text: this.text,
      args: this.args,
      command: this.command,
      namespace: this.namespace,
    };
  }
}