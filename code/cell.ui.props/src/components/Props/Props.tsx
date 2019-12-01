import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, GlamorValue } from '../../common';

export type IPropsProps = {
  theme?: 'DARK';
  style?: GlamorValue;
};
export type IPropsState = {};

export class Props extends React.PureComponent<IPropsProps, IPropsState> {
  public state: IPropsState = {};
  private state$ = new Subject<Partial<IPropsState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IPropsProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({}) };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>cell.ui.props</div>
      </div>
    );
  }
}