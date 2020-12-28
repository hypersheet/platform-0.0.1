import * as glob from 'glob';

export type IGlobFindOptions = {
  includeDirs?: boolean;
  dot?: boolean;
  cache?: { [path: string]: boolean | 'DIR' | 'FILE' | ReadonlyArray<string> };
  statCache?: { [path: string]: false | { isDirectory(): boolean } | undefined };
  realpathCache?: { [path: string]: string };
  ignore?: string | string[];
};

export const Glob = {
  /**
   * Matches the given glob pattern as a promise.
   * See:
   *    https://www.npmjs.com/package/glob
   */
  find(pattern: string, options: IGlobFindOptions = {}): Promise<string[]> {
    return new Promise<string[]>(async (resolve, reject) => {
      const { dot = false, cache, statCache, realpathCache, ignore } = options;
      const includeDirs =
        typeof options.includeDirs === 'boolean'
          ? options.includeDirs
          : pattern.endsWith('/')
          ? true
          : Boolean(options.includeDirs);
      const nodir = !includeDirs;
      const args = { dot, nodir, cache, statCache, realpathCache, ignore };
      glob(pattern, args, (err, paths) => {
        if (err) {
          reject(err);
        } else {
          resolve(paths);
        }
      });
    });
  },
};

// /**
//  * Matches the given glob pattern as a promise.
//  * See:
//  *    https://www.npmjs.com/package/glob
//  */
// export function find(pattern: string, options: IGlobFindOptions = {}): Promise<string[]> {
//   return new Promise<string[]>(async (resolve, reject) => {
//     const { dot = false, cache, statCache, realpathCache, ignore } = options;
//     const includeDirs =
//       typeof options.includeDirs === 'boolean'
//         ? options.includeDirs
//         : pattern.endsWith('/')
//         ? true
//         : Boolean(options.includeDirs);
//     const nodir = !includeDirs;
//     const args = { dot, nodir, cache, statCache, realpathCache, ignore };
//     glob(pattern, args, (err, paths) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(paths);
//       }
//     });
//   });
// }
