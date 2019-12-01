import { t } from '../common';

export type IFileProps = {
  name?: string;
  fileHash?: string;
  mimetype?: string;
  encoding?: string;
  location?: string;
};
export type IFileData = {
  props: IFileProps;
  hash?: string;
  error?: t.IError;
};