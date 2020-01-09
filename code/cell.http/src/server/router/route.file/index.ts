import { t } from '../common';
import * as file from './file';

// export { postFileResponse, getFileDownloadResponse, deleteFileResponse } from './file';

export { getFileInfoResponse } from './file.info';
export { getFileDownloadResponse } from './file.download';
export { postFileResponse } from './file.post';
export { postFileVerifiedResponse } from './file.verify';
export { deleteFileResponse } from './file.delete';

/**
 * Routes for operating with files.
 */
export function init(args: { db: t.IDb; fs: t.IFileSystem; router: t.IRouter }) {
  file.init(args);
}
