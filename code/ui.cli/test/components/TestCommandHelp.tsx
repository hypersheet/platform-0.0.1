import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue } from '../common';

export type ITestCommandHelpProps = { style?: GlamorValue };
export type ITestCommandHelpState = {};

export class TestCommandHelp extends React.PureComponent<
  ITestCommandHelpProps,
  ITestCommandHelpState
> {
  public state: ITestCommandHelpState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestCommandHelpState>>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        padding: 20,
        flex: 1,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>TestCommandList</div>
      </div>
    );
  }
}