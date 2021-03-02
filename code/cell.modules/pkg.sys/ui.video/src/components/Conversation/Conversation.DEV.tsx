import React from 'react';

import { DevActions, ActionButtonHandlerArgs } from 'sys.ui.dev';

import { css, rx, t, StateObject } from './common';
import { asArray } from '@platform/util.value';
import { Conversation, ConversationProps } from './Conversation';
import { stateController } from './Conversation.controller';
import { Remote } from './Remote';

type B = t.EventBus<t.PeerEvent>;
type Ctx = {
  fire: B['fire'];
  props: ConversationProps;
};
type E = ActionButtonHandlerArgs<Ctx>;

const loadDir = (e: ActionButtonHandlerArgs<Ctx>, dir: string) => {
  const imageDir = `static/images.tmp/${dir}/`;
  e.ctx.fire({ type: 'Conversation/publish', payload: { data: { imageDir } } });
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('Conversation')
  .context((prev) => {
    if (prev) return prev;

    const bus = rx.bus<t.PeerEvent>();
    const model = StateObject.create<t.ConversationState>({ peers: {} });
    stateController({ bus, model });

    return {
      fire: bus.fire,
      props: { bus, model },
      remote: {},
    };
  })

  .items((e) => {
    e.title('Diagrams');
    e.button('load: peer-4', (e) => loadDir(e, 'peer-4'));
    e.button('load: peer-5', (e) => loadDir(e, 'peer-5'));
    e.button('load: peer-6', (e) => loadDir(e, 'peer-6'));
    e.hr();
  })

  .items((e) => {
    e.title('Load Remote');

    const load = (e: E, url: string) => {
      const namespace = 'tdb.slc';
      const entry = './MiniCanvasMouse';
      e.ctx.props.body = <Remote url={url} namespace={namespace} entry={entry} />;
    };

    e.button('load: local', (e) => load(e, 'http://localhost:3000/remoteEntry.js'));
    e.button('load: cloud', (e) =>
      load(e, 'https://dev.db.team/cell:cklrm37vp000el8et0cw7gaft:A1/fs/sample/remoteEntry.js'),
    );

    e.button('clear', (e) => (e.ctx.props.body = undefined));
    e.hr();
  })

  /**
   * Render
   */
  .subject((e) => {
    const state = e.ctx.props.model.state;

    e.settings({
      layout: {
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
        position: [80, 80, 120, 80],
        label: {
          topLeft: 'Conversation.Layout',
          topRight: `folder: ${asArray(state.imageDir).join(', ') || '<none>'}`,
        },
      },
      host: { background: -0.04 },
    });

    const el = (
      <div {...css({ Absolute: 0, overflow: 'hidden', display: 'flex' })}>
        <Conversation {...e.ctx.props} />
      </div>
    );

    e.render(el);
  });

export default actions;
