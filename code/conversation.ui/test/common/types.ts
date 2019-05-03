import * as React from 'react';
import { Subject } from 'rxjs';

export * from '@platform/cli.ui/lib/types';
export * from '../../src/types';

export type ICommandProps = {
  state$: Subject<ITestState>;
  next(state: ITestState): void;
};

export type ITestState = {
  el?: React.ReactNode;
};
