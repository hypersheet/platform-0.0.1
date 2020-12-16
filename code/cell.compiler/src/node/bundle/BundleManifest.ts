import { DEFAULT, fs, Model, Schema, t, deleteUndefined } from '../common';
import { FileRedirects, FileAccess } from '../config';

const REMOTE_ENTRY = DEFAULT.FILE.JS.REMOTE_ENTRY;

export const BundleManifest = {
  /**
   * The filename of the bundle.
   */
  filename: DEFAULT.FILE.JSON.MANIFEST,

  /**
   * URL to the manifest
   */
  url(host: string, uri: string, dir?: string) {
    const urls = Schema.urls(host);
    return urls.fn.bundle.manifest({ host, uri, dir });
  },

  /**
   * Generates a bundle manifest.
   */
  async create(args: { model: t.CompilerModel; bundleDir: string }) {
    const { bundleDir, model } = args;
    const data = Model(model);
    const paths = await fs.glob.find(`${args.bundleDir}/**`, { includeDirs: false });

    const toFile = (path: string) => BundleManifest.loadFile({ path, bundleDir, model });
    const files: t.FsManifestFile[] = await Promise.all(paths.map((path) => toFile(path)));

    type B = t.BundleManifest;

    const bundle: B['bundle'] = deleteUndefined({
      mode: data.mode(),
      target: data.target(),
      entry: data.entryFile,
      remoteEntry: paths.some((path) => path.endsWith(REMOTE_ENTRY)) ? REMOTE_ENTRY : undefined,
    });

    const manifest: B = {
      hash: Schema.hash.sha256(files.map((file) => file.filehash)),
      bundle,
      files,
    };

    return manifest;
  },

  /**
   * Write the bundle manifest to the file-system.
   */
  async createAndSave(args: { model: t.CompilerModel; bundleDir: string; filename?: string }) {
    const { model, bundleDir, filename } = args;
    const manifest = await BundleManifest.create({ model, bundleDir });
    return BundleManifest.write({ manifest, dir: bundleDir, filename });
  },

  /**
   * Reads from file-system.
   */
  async read(args: { dir: string; filename?: string }) {
    const { dir, filename = BundleManifest.filename } = args;
    const path = fs.join(dir, filename);
    const exists = await fs.pathExists(path);
    const manifest = exists ? ((await fs.readJson(path)) as t.BundleManifest) : undefined;
    return { path, manifest };
  },

  /**
   * Writes a manifest to the file-system.
   */
  async write(args: { manifest: t.BundleManifest; dir: string; filename?: string }) {
    const { manifest, dir, filename = BundleManifest.filename } = args;
    const path = fs.join(dir, filename);
    const json = JSON.stringify(manifest, null, '  ');
    await fs.ensureDir(fs.dirname(path));
    await fs.writeFile(path, json);
    return { path, manifest };
  },

  /**
   * Loads the file as the given path and derives [BundleManifestFile] metadata.
   */
  async loadFile(args: {
    path: string;
    bundleDir: string;
    model: t.CompilerModel;
  }): Promise<t.FsManifestFile> {
    const { model, bundleDir } = args;
    const file = await fs.readFile(args.path);
    const bytes = file.byteLength;
    const filehash = Schema.hash.sha256(file);
    const path = args.path.substring(bundleDir.length + 1);
    return deleteUndefined({
      path,
      bytes,
      filehash,
      allowRedirect: toRedirect({ model, path }).flag,
      public: toPublic({ model, path }),
    });
  },
};

/**
 * Helpers
 */

function toRedirect(args: { model: t.CompilerModel; path: string }) {
  const redirects = FileRedirects(args.model.files?.redirects);
  return redirects.path(args.path);
}

function toAccess(args: { model: t.CompilerModel; path: string }) {
  const access = FileAccess(args.model.files?.access);
  return access.path(args.path);
}

function toPublic(args: { model: t.CompilerModel; path: string }) {
  const access = toAccess(args);
  return access.public ? true : undefined;
}