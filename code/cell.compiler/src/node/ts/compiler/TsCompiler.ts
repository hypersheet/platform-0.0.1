import { fs, t } from '../../common';
import { compileDeclarations } from '../__compiler.declarations';
import { transpile } from './TsCompiler.transpile';

/**
 * Create the typescript compiler.
 */
export function create(tsconfigPath?: string) {
  const tsconfig: t.TsCompilerConfig = {
    path: fs.resolve(tsconfigPath || 'tsconfig.json'),
    async json() {
      const path = compiler.tsconfig.path;
      if (!(await fs.pathExists(path))) throw new Error(`tsconfig file not found at: ${path}`);
      return (await fs.readJson(path)) as t.TsConfigFile;
    },
  };

  const compiler: t.TsCompiler = {
    tsconfig,

    /**
     * Compile typescript [.d.ts] declarations.
     */
    async declarations(args) {
      return compileDeclarations({ ...args, tsconfig });
    },

    /**
     * Wrapper for running the `tsc` typescript compiler
     * with a programmatic API.
     *
     * NOTE:
     *    Uses [exec] child_process under the hood.
     *
     */
    async transpile(args) {
      return transpile({ ...args, tsconfig });
    },
  };

  return compiler;
}
