import { id, ROUTES, t } from '../common';

/**
 * Helper routes.
 */
export function init(args: { router: t.IRouter; title?: string }) {
  const { router } = args;

  /**
   * GET: /uid
   *      "Collision-resistant ids optimized for horizontal scaling and performance"
   */
  router.get(ROUTES.SYS.UID, async req => {
    return {
      status: 200,
      data: { id: id.cuid(), type: 'cuid' },
    };
  });
}