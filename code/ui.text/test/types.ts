import { Subject } from 'rxjs';

export * from '../src/types';
export * from '@platform/ui.cli/lib/types';

export type ITestCommandProps = {
  state$: Subject<Partial<ITestState>>;
};

export type TestViewType = 'text' | 'input';
export type ITestState = {
  view?: TestViewType;
};