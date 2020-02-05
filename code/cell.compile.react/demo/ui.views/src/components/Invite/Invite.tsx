import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { constants, css, color, CssValue, COLORS, parseClient, t, time, log } from '../../common';

import { Button } from '@platform/ui.button';
import { Avatar } from '@platform/ui.image';
import { Log } from './components/Log';

const { URLS } = constants;

type Invitee = { email: string; avatar: string; accepted?: boolean };

export type IInviteProps = { style?: CssValue };
export type IInviteState = {
  title?: string;
  date?: string;
  invitees?: Invitee[];
};

export class Invite extends React.PureComponent<IInviteProps, IInviteState> {
  public state: IInviteState = {};
  private state$ = new Subject<Partial<IInviteState>>();
  private unmounted$ = new Subject<{}>();

  private client: t.IClient;
  private ns: string;

  /**
   * [Lifecycle]
   */
  constructor(props: IInviteProps) {
    super(props);
  }

  public componentDidMount() {
    const res = parseClient(location.href);
    this.client = res.client;
    this.ns = res.def;
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    this.load();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Methods]
   */

  private load = async () => {
    const client = this.client.ns(this.ns);
    const def = await client.read({ cells: true });
    const cells = def.body.data.cells || {};

    const toString = (input?: any) => (input || '').toString();

    const getInvittee = (row: number) => {
      const email = toString(cells[`B${row + 1}`]?.value);
      const avatar = toString(cells[`C${row + 1}`]?.value);
      const accepted = cells[`D${row + 1}`]?.value as boolean | undefined;
      const res: Invitee = { accepted, email, avatar };
      return res;
    };

    const title = toString(cells.B1?.value);
    const date = toString(cells.C6?.value);
    const invitees = [getInvittee(1), getInvittee(2), getInvittee(3)];

    this.state$.next({
      title,
      date,
      invitees,
    });

    log.group('data');
    log.info('host:', this.client.origin);
    log.info('ns:', this.ns);
    log.info('cells:', cells);
    log.info('state:', this.state);
    log.groupEnd();
  };

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        Flex: 'horizontal-stretch-stretch',
        backgroundColor: COLORS.DARK,
        color: COLORS.WHITE,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderLeft()}
        {this.renderRight()}
      </div>
    );
  }

  private renderLeft() {
    const styles = {
      base: css({
        Flex: 'vertical-stretch-stretch',
        flex: 0.5,
        minWidth: 400,
        maxWidth: 500,
        overflow: 'hidden',
      }),
      top: css({
        flex: 1,
        Flex: 'center-center',
      }),
      bottom: css({
        borderTop: `dashed 1px ${color.format(0.8)}`,
        display: 'flex',
        height: 200,
      }),
      title: css({
        fontSize: 45,
        fontWeight: 'bold',
        lineHeight: '1em',
        userSelect: 'none',
      }),
      refresh: css({
        Absolute: [10, null, null, 10],
        fontSize: 12,
      }),
    };

    const title = this.state.title || 'Title.';
    const elTitle = title.split(' ').map((value, i) => <div key={i}>{value}</div>);

    return (
      <div {...styles.base}>
        <div {...styles.top}>
          <Button onClick={this.load} style={styles.refresh} label={'Refresh'} />
          <div {...styles.title}>{elTitle}</div>
        </div>
        <div {...styles.bottom}>{this.renderBottomLeft()}</div>
      </div>
    );
  }

  private renderRight() {
    const styles = {
      base: css({
        flex: 1,
        position: 'relative',
        backgroundImage: `url(${URLS.NZ})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }),
      bevel: css({
        Absolute: [0, null, 0, 0],
        width: 10,
        backgroundColor: color.format(0.15),
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.bevel} />
        {this.renderLog()}
        {this.renderDate()}
      </div>
    );
  }

  private renderBottomLeft() {
    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
      }),
      bgMask: css({
        Absolute: 0,
        backgroundColor: COLORS.DARK,
      }),
      body: css({
        Absolute: 0,
        Flex: 'center-center',
      }),
      topShadow: css({
        Absolute: [-6, 0, null, 0],
        height: 10,
        backgroundColor: color.format(-1),
        filter: `blur(5px)`,
        opacity: 0.4,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.topShadow} />
        <div {...styles.bgMask} />
        <div {...styles.body}>{this.renderAvatars()}</div>
      </div>
    );
  }

  private renderAvatars() {
    const { invitees = [] } = this.state;
    if (invitees.length === 0) {
      return null;
    }

    const styles = {
      base: css({
        Flex: 'horizontal-center-center',
      }),
    };

    const elList = invitees.map((person, i) => {
      const isLast = i === invitees.length - 1;
      const { email, avatar } = person;
      const elAvatar = this.renderAvatar({ key: `avatar-${i}`, email, src: avatar });
      const elDivider = isLast ? undefined : this.renderAvatarDivider({ key: `div-${i}` });
      return [elAvatar, elDivider];
    });

    return <div {...styles.base}>{elList}</div>;
  }

  private renderAvatarDivider(props: { key?: string | number } = {}) {
    const styles = {
      base: css({
        Flex: 'horizontal-center-center',
      }),
      divider: css({
        width: 75,
        border: `solid 2px ${color.format(1)}`,
      }),
      dividerEdge: css({
        width: 6,
        marginRight: 4,
      }),
      dividerMain: css({}),
    };
    return (
      <div {...styles.base}>
        <div {...css(styles.divider, styles.dividerMain)} />
      </div>
    );
  }

  private renderAvatar(props: {
    key?: string | number;
    email: string;
    src: string;
    size?: number;
  }) {
    const { email, src, size = 55 } = props;
    const styles = {
      base: css({
        position: 'relative',
        MarginX: 8,
      }),
      accept: css({
        Absolute: [-26, -35, null, -35],
        fontSize: 14,
        textAlign: 'center',
      }),
      name: css({
        Absolute: [null, -35, -16, -35],
        fontSize: 11,
        textAlign: 'center',
      }),
    };
    return (
      <div {...styles.base} key={props.key}>
        <div {...styles.accept}>
          <Button label={'Accept'} />
        </div>
        <Avatar src={src} size={size} borderRadius={size / 2} borderColor={0.1} borderWidth={6} />
        <div {...styles.name}>{email}</div>
      </div>
    );
  }

  private renderLog() {
    const styles = {
      base: css({
        Absolute: [0, 0, 0, null],
        width: 300,
        backgroundColor: color.format(0.6),
      }),
      log: css({ Absolute: 0 }),
      bevel: css({
        Absolute: [0, null, 0, -10],
        width: 10,
        backgroundColor: color.format(0.15),
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.bevel} />
        <Log style={styles.log} />
      </div>
    );
  }

  private renderDate() {
    if (!this.state.date) {
      return null;
    }
    const styles = {
      base: css({
        Absolute: [null, null, 10, 28],
        fontWeight: 'bold',
        fontSize: 32,
      }),
    };
    const date = time.day(this.state.date);
    return <div {...styles.base}>{date.format('ddd D MMM, h:mma')}</div>;
  }
}
