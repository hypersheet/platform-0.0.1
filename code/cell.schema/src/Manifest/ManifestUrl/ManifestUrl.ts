import { t } from '../common';

export const ManifestUrl = {
  parse,
  params,
};

/**
 * Parses a string into a Manifest URL.
 */
function parse(input: string): t.ManifestUrlParts {
  const { url, error } = parseUrl(input);

  const domain = url?.host ?? '';
  const protocol = url?.hostname === 'localhost' ? 'http' : 'https';
  const api: t.ManifestUrlParts = {
    ok: true,
    href: url?.href ?? '',
    protocol,
    domain,
    cell: '',
    path: '',
    dir: '',
    filename: '',
    error,
    params: {
      entry: url?.searchParams.get('entry') || '',
    },
  };

  // Parse path.
  (() => {
    const error = (detail: string) => (api.error = `Invalid manifest URL '${input}' - ${detail}`);

    let path = (url?.pathname ?? '').replace(/^\//, '');
    if (!path) return error('no path');

    // Cell URI.
    const uri = path.match(/^cell\:[\d\w]+\:[A-Z]+[1-9]+/);
    api.cell = (uri ? uri[0] : '').trim();
    const isCell = Boolean(api.cell);

    // Path.
    if (isCell) {
      path = path.substring(api.cell.length);
      if (!path.startsWith('/fs/')) return error('no filesystem path');
      path = path.substring('/fs/'.length);
      if (!path) return error('no filesystem path');
    }
    api.path = path;

    if (!path.endsWith('.json')) return error('not a ".json" file.');

    // Directory/filename.
    const index = path.lastIndexOf('/');
    if (index < 0) api.filename = path;
    if (index >= 0) {
      api.dir = path.substring(0, index);
      api.filename = path.substring(index + 1);
    }

    return;
  })();

  api.ok = !Boolean(api.error);
  return api;
}

/**
 * Modifies a manifest URL.
 */
function params(url: t.ManifestUrlParts, options: { entry?: string }) {
  const trim = (input: string) => (input || '').trim();
  const params = { ...url.params, ...options };
  params.entry = trim(params.entry);

  // Assembly URL.
  let next = `${url.protocol}://${url.domain}/${url.path}?`;

  // Append query-strings.
  const withQuery = (key: string, value: string) => `${next}entry=${params.entry}&`;
  Object.keys(params).forEach((key) => (next = withQuery(key, params[key])));

  // Finish up.
  next = next.replace(/\?$/, '').replace(/\&$/, '');
  return parse(next);
}

/**
 * [Helpers]
 */

function parseUrl(input: string): { url?: URL; error?: string } {
  const error = (detail: string) => ({ error: `Invalid manifest URL '${input}' - ${detail}` });
  try {
    if (typeof input !== 'string') return error('not a string');

    input = input.trim();
    if (!input) return error('empty');

    if (!(input.startsWith('http://') || input.startsWith('https://'))) {
      const localhost = input.startsWith('localhost');
      const protocol = localhost ? 'http' : 'https';
      input = `${protocol}://${input}`;
    }

    return {
      url: new URL(input),
    };
  } catch (err: any) {
    return error('unable to parse');
  }
}
