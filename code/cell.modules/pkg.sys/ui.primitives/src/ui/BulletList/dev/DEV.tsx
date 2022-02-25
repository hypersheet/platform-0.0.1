import React from 'react';
import { DevActions } from 'sys.ui.dev';

import { BulletList, BulletListLayoutProps } from '..';
import { RenderCtx, sampleBodyRendererFactory, sampleBulletRendererFactory } from './DEV.renderers';
import { k, DEFAULTS } from '../common';

type D = { msg: string };

type Ctx = {
  props: BulletListLayoutProps;
  renderCtx: RenderCtx;
};

const CtxUtil = {
  addItem(ctx: Ctx, options: { spacing?: k.BulletSpacing } = {}) {
    const { spacing } = options;
    const items = ctx.props.items || (ctx.props.items = []);

    const id = `item-${items.length + 1}`;
    const data: D = { msg: id };
    const item: k.BulletItem<D> = { id, data, spacing };

    items.push(item);
    return item;
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
      props: {
        orientation: 'y',
        bullet: { edge: 'near', size: 60 },
        renderers: renderer,
        spacing: 10,
        debug: { border: true },
      },
      renderCtx: {
        bulletKind: 'Lines',
        // bodyKind: 'Card',
        bodyKind: 'Vanilla',
        connectorRadius: 20,
        connectorLineWidth: 5,
        virtual: true,
      },
    };

    return ctx;
  })

  .init(async (e) => {
    const { ctx } = e;
    Array.from({ length: 3 }).forEach((_, i) => {
      const item = CtxUtil.addItem(ctx);

      if (i === 0) {
        // TEMP 🐷
        item.child = {
          south: (e) => <div>Hello</div>,
        };
      }

      console.log('item', item);
    });
  })

  .items((e) => {
    e.button('redraw', (e) => e.redraw());

    e.title('Props');

    e.select((config) => {
      config
        .title('orientation')
        .items([
          { label: 'x (horizontal)', value: 'x' },
          { label: 'y (vertical)', value: 'y' },
        ])
        .initial(config.ctx.props.orientation)
        .view('buttons')
        .pipe((e) => {
          if (e.changing) e.ctx.props.orientation = e.changing?.next[0].value;
        });
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('bullet.edge')
        .initial(config.ctx.props.bullet?.edge)
        .items(['near', 'far'])
        .pipe((e) => {
          if (e.changing) {
            const bullet = e.ctx.props.bullet || (e.ctx.props.bullet = {});
            bullet.edge = e.changing?.next[0].value;
          }
        });
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('bullet.size')
        .items([15, 30, 60])
        .initial(config.ctx.props.bullet?.size)
        .pipe((e) => {
          if (e.changing) {
            const bullet = e.ctx.props.bullet || (e.ctx.props.bullet = {});
            bullet.size = e.changing?.next[0].value;
          }
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

    e.boolean('virtual (scrolling)', (e) => {
      if (e.changing) e.ctx.renderCtx.virtual = e.changing.next;
      e.boolean.current = e.ctx.renderCtx.virtual;
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('spacing')
        .items([0, 5, 10, 20])
        .initial(config.ctx.props.spacing as number)
        .pipe((e) => {
          if (e.changing) e.ctx.props.spacing = e.changing?.next[0].value;
        });
    });

    e.hr();

    e.title('Plugin Renderer: Bullet');

    e.select((config) => {
      config
        .view('buttons')
        .title('bullet <Kind>')
        .items(['Lines', 'Dot', { label: 'undefined (use default)', value: undefined }])
        .initial(config.ctx.renderCtx.bulletKind)
        .pipe((e) => {
          if (e.changing) e.ctx.renderCtx.bulletKind = e.changing?.next[0].value;
        });
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('ConnectorLines: radius')
        .items([0, 20])
        .initial(config.ctx.renderCtx.connectorRadius)
        .pipe((e) => {
          if (e.changing) e.ctx.renderCtx.connectorRadius = e.changing?.next[0].value;
        });
    });

    e.select((config) => {
      config
        .view('buttons')
        .title('ConnectorLines: lineWidth')
        .items([3, 5, 10])
        .initial(config.ctx.renderCtx.connectorLineWidth)
        .pipe((e) => {
          if (e.changing) e.ctx.renderCtx.connectorLineWidth = e.changing?.next[0].value;
        });
    });

    e.hr(1, 0.1);
    e.title('Plugin Renderer: Body');

    e.select((config) => {
      config
        .view('buttons')
        .title('body <Kind>')
        .items(['Card', 'Vanilla', { label: 'undefined (use default)', value: undefined }])
        .initial(config.ctx.renderCtx.bodyKind)
        .pipe((e) => {
          if (e.changing) e.ctx.renderCtx.bodyKind = e.changing?.next[0].value;
        });
    });

    e.hr();
  })

  .items((e) => {
    e.title('Items');

    e.button('add', (e) => CtxUtil.addItem(e.ctx));
    e.button('add (10)', (e) => new Array(10).fill(e.ctx).forEach((ctx) => CtxUtil.addItem(ctx)));
    e.button('add (spacing: { before })', (e) => {
      CtxUtil.addItem(e.ctx, { spacing: { before: 30 } });
    });
    e.button('add (spacing: { after })', (e) => {
      CtxUtil.addItem(e.ctx, { spacing: { after: 30 } });
    });
    e.button('add (spacing: { before, after })', (e) => {
      CtxUtil.addItem(e.ctx, { spacing: { before: 15, after: 30 } });
    });

    e.hr(1, 0.1);

    e.button('clear', (e) => (e.ctx.props.items = []));
    e.button('remove: first', (e) => {
      const items = e.ctx.props.items || [];
      e.ctx.props.items = items?.slice(0, items.length - 1);
    });
    e.button('remove: last', (e) => {
      const items = e.ctx.props.items || [];
      e.ctx.props.items = items?.slice(0, items.length - 1);
    });

    e.hr();
  })

  .subject((e) => {
    const { props, renderCtx } = e.ctx;
    const { items = [] } = props;
    const total = items.length;

    const orientation = props.orientation ?? DEFAULTS.orientation;
    const isHorizontal = orientation === 'x';
    const isVertical = orientation === 'y';
    const isVirtual = e.ctx.renderCtx.virtual;

    const FIXED_SIZE = 310;

    e.settings({
      host: { background: -0.04 },
      layout: total > 0 && {
        cropmarks: -0.2,
        position: !renderCtx.virtual ? undefined : isVertical ? [150, null] : [null, 150],
        width: isVirtual && isVertical ? FIXED_SIZE : undefined,
        height: isVirtual && isHorizontal ? FIXED_SIZE : undefined,
        label: {
          topLeft: '<BulletList>',
          bottomLeft: `total: ${items.length}`,
          bottomRight: `Body/Sample:"${e.ctx.renderCtx.bodyKind}"`,
        },
      },
    });

    if (items.length === 0) return;

    if (!isVirtual) {
      e.render(<BulletList.Layout {...props} />);
    }
    if (isVirtual) {
      e.render(
        <BulletList.Virtual
          {...props}
          style={{ flex: 1 }}
          getItemSize={(e) => {
            const spacing = (props.spacing || 0) as number;
            const kind = renderCtx.bodyKind;

            // NB: These are fixed sizes for testing only.
            //     Will not adjust if the card content expands.
            let size = e.is.vertical ? 84 : 250; // Debug card (default).
            if (kind === 'Card') size = e.is.vertical ? 40 : 167;
            if (kind === 'Vanilla') size = e.is.vertical ? 23 : 118;

            if (!e.is.first) size += spacing;
            return size;
          }}
        />,
      );
    }
  });

export default actions;
