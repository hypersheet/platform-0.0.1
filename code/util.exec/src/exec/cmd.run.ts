import { Observable, ReplaySubject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { resolve } from 'path';

import {
  stripAnsiColors,
  ICommandInfo,
  ICommandPromise,
  IResultInfo,
  definedPropsFor,
} from '../common';
import { spawn } from './process';

/**
 * Invokes 1..n shell command.
 */
export function run(
  command: string | string[],
  options: {
    dir?: string;
    silent?: boolean;
    env?: NodeJS.ProcessEnv;
  } = {},
): ICommandPromise {
  const { silent } = options;
  const dir = resolve(options.dir || process.cwd());
  let isComplete = false;
  let error: Error | undefined;
  const result = { code: 0 };
  const output$ = new ReplaySubject<ICommandInfo>();

  const props = {
    ok: () => result.code === 0,
    info: () => reduceAndStripColors(output$.pipe(filter(e => e.type === 'stdout'))),
    errors: () => reduceAndStripColors(output$.pipe(filter(e => e.type === 'stderr'))),
    error: () =>
      error ? error : result.code !== 0 ? new Error(`Failed with code ${result.code}.`) : undefined,
  };

  const promise = new Promise<IResultInfo>((resolve, reject) => {
    const cmd = Array.isArray(command) ? command.join('\n') : command;

    // Spawn the child process.
    const { child } = spawn(cmd, {
      cwd: dir,
      stdio: undefined, // Handle standard I/O manually.
      env: options.env,
    });

    // Pipe output to [stdout] if not suppressed.
    if (!silent && child.stdout) {
      child.stdout.pipe(process.stdout);
    }

    // Prepare the result object.
    const prop = definedPropsFor<IResultInfo>(result);
    prop('ok', props.ok);
    prop('info', props.info);
    prop('errors', props.errors);
    prop('error', props.error);

    // Monitor data coming from process.
    const next = (type: ICommandInfo['type'], chunk: Buffer) => {
      formatOutput(chunk).forEach(text => output$.next({ type, text }));
    };
    if (child.stdout) {
      child.stdout.on('data', (chunk: Buffer) => next('stdout', chunk));
      child.stderr.on('data', (chunk: Buffer) => next('stderr', chunk));
    }

    // Listen for end.
    child.on('exit', e => {
      result.code = e === null ? result.code : e;
      isComplete = true;
      output$.complete();
      resolve(result as IResultInfo);
    });
    child.once('error', err => {
      error = err;
      reject(err);
    });
  });

  // Prepare the response object.
  const response = promise as ICommandPromise;
  response.dir = dir;
  response.output$ = output$;
  response.stdout$ = output$.pipe(
    filter(e => e.type === 'stdout'),
    map(e => e.text),
  );
  response.stderr$ = output$.pipe(
    filter(e => e.type === 'stderr'),
    map(e => e.text),
  );

  // [IResult] properties.
  const prop = definedPropsFor<ICommandPromise>(response);
  prop('code', () => result.code);
  prop('ok', props.ok);
  prop('info', props.info);
  prop('errors', props.errors);
  prop('error', props.error);
  prop('stdout', () => reduce(output$.pipe(filter(e => e.type === 'stdout'))));
  prop('stderr', () => reduce(output$.pipe(filter(e => e.type === 'stderr'))));

  // Extended response properties.
  prop('isComplete', () => isComplete);

  // Finish up.
  return response;
}

/**
 * INTERNAL
 */
const formatOutput = (chunk: Buffer) => {
  return chunk
    .toString()
    .replace(/\n$/, '')
    .split('\n');
};

const reduce = (observable: Observable<ICommandInfo>) => {
  let result: string[] = [];
  observable.pipe(map(e => e.text)).subscribe(e => (result = [...result, e]));
  return result;
};

const reduceAndStripColors = (observable: Observable<ICommandInfo>) => {
  return reduce(observable).map(text => stripAnsiColors(text));
};