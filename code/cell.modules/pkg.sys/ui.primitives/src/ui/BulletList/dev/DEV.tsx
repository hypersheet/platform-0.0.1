import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { BulletList, BulletListProps } from '..';
import { RenderCtx, sampleBodyRendererFactory, sampleBulletRendererFactory } from './DEV.renderers';
import { k } from '../common';
import { SampleGrid } from './DEV.sample.grid.tmp';

type D = { msg: string };

type Ctx = {
  props: BulletListProps;
  renderCtx: RenderCtx;
  sampleGrid: boolean; // TEMP 🐷
};

const CtxUtil = {
  addItem(ctx: Ctx, options: { spacing?: number } = {}) {
    const { spacing } = options;
    const items = ctx.props.items || (ctx.props.items = []);

    const data: D = { msg: `item-${items.length}` };
    const item: k.BulletItem<D> = { data, spacing };

    items.push(item);
  },
};

/**
 * Actions
 */
export const actions = DevActions<Ctx>()
  .namespace('ui.BulletList')
  .context((e) => {
    if (e.prev) return e.prev;

    const getRenderCtx = () => e.current?.renderCtx as RenderCtx;
    const renderer = {
      bullet: sampleBulletRendererFactory(getRenderCtx),
      body: sampleBodyRendererFactory(getRenderCtx),
    };

    const ctx: Ctx = {
      sampleGrid: false, // TEMP 🐷
      props: {
        bulletEdge: 'near',
        orientation: 'vertical',
        renderer,
        spacing: 10,
        bulletSize: 60,
        debug: { border: true },
      },
      renderCtx: {
        bulletKind: 'Lines',
        bodyKind: 'Card',
        connectorRadius: 20,
      },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx } = e;
    Array.from({ length: 3 }).forEach(() => CtxUtil.addItem(ctx));
  })

  .items((e) => {
    e.boolean('sample grid (css)', (e) => {
      if (e.changing) e.ctx.sampleGrid = e.changing.next;
      e.boolean.current = e.ctx.sampleGrid;
    });

    e.title('Props');

    e.select((config) => {
      config
        .title('orientation')
        .items(['vertical', 'horizontal'])
        .initial(config.ctx.props.orientation)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.props.orientation = e.changing?.next[0].value;
        });
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('bulletEdge')
        .initial(config.ctx.props.bulletEdge)
        .items(['near', 'far'])
        .pipe((e) => {
          if (e.changing) e.ctx.props.bulletEdge = e.changing?.next[0].value;
        });
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('bulletSize')
        .items([15, 30, 60])
        .initial(config.ctx.props.bulletSize)
        .pipe((e) => {
          if (e.changing) e.ctx.props.bulletSize = e.changing?.next[0].value;
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Debug');

    e.boolean('border', (e) => {
      if (e.changing) {
        const debug = e.ctx.props.debug || (e.ctx.props.debug = {});
        debug.border = e.changing.next;
      }
      e.boolean.current = e.ctx.props.debug?.border ?? false;
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('spacing')
        .items([0, 5, 10, 20])
        .initial(config.ctx.props.spacing)
        .pipe((e) => {
          if (e.changing) e.ctx.props.spacing = e.changing?.next[0].value;
        });
    });

    e.hr(1, 0.1);

    e.title('Bullet');

    e.select((config) => {
      config
        .view('buttons')
        .title('bullet <Kind>')
        .items(['Lines', 'Dot'])
        .initial(config.ctx.renderCtx.bulletKind)
        .pipe((e) => {
          if (e.changing) e.ctx.renderCtx.bulletKind = e.changing?.next[0].value;
        });
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('connector lines: radius')
        .items([0, 20])
        .initial(config.ctx.renderCtx.connectorRadius)
        .pipe((e) => {
          if (e.changing) e.ctx.renderCtx.connectorRadius = e.changing?.next[0].value;
        });
    });

    e.hr(1, 0.1);
    e.title('Body');

    e.select((config) => {
      config
        .view('buttons')
        .title('body <Kind>')
        .items(['Card', 'Vanilla'])
        .initial(config.ctx.renderCtx.bodyKind)
        .pipe((e) => {
          if (e.changing) e.ctx.renderCtx.bodyKind = e.changing?.next[0].value;
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Items');

    e.button('clear', (e) => (e.ctx.props.items = []));
    e.hr(1, 0.1);
    e.button('add', (e) => CtxUtil.addItem(e.ctx));
    e.button('add (with spacing)', (e) => CtxUtil.addItem(e.ctx, { spacing: 30 }));

    e.hr();
  })

  .subject((e) => {
    const { items = [] } = e.ctx.props;
    const total = items.length;

    e.settings({
      host: { background: -0.04 },
      layout: total > 0 && {
        label: {
          topLeft: '<BulletList>',
          bottomRight: `Body/Sample:"${e.ctx.renderCtx.bodyKind}"`,
        },
        cropmarks: -0.2,
      },
    });

    const sampleGrid = e.ctx.sampleGrid;

    if (sampleGrid) {
      e.render(<SampleGrid />);
    }

    if (!sampleGrid) {
      e.render(items.length > 0 && <BulletList {...e.ctx.props} style={{}} />);
    }
  });

export default actions;
