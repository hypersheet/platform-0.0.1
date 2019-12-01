import { Model, Schema, t } from '../common';
import * as rules from './rules';

const Uri = Schema.uri;
const query = Schema.query;

/**
 * Represents a logical collection of cells (aka a "sheet").
 */
export class Ns {
  public static factory: t.ModelFactory<t.IDbModelNs> = ({ db, path }) => {
    const children: t.IModelChildrenDefs<t.IDbModelNsChildren> = {
      cells: { query: query.cells, factory: Cell.factory },
      rows: { query: query.rows, factory: Row.factory },
      columns: { query: query.columns, factory: Column.factory },
      files: { query: query.files, factory: File.factory },
    };

    const uri = Schema.from.ns(path);
    const id = uri.parts.id;
    const initial: t.IDbModelNsProps = { id, props: undefined, hash: undefined };

    return Model.create<
      t.IDbModelNsProps,
      t.IDbModelNsDoc,
      t.IDbModelNsLinks,
      t.IDbModelNsChildren
    >({
      db,
      path,
      children,
      initial,
      beforeSave: rules.beforeNsSave,
    });
  };

  public static create<P extends object = {}>(args: { db: t.IDb; uri: string }) {
    const { uri, db } = args;
    const ns = Schema.ns(uri);
    const path = ns.path;
    return Ns.factory({ db, path }) as t.IDbModelNs<P>;
  }
}

/**
 * Represents a single [cell] within a namespace.
 */
export class Cell {
  public static factory: t.ModelFactory<t.IDbModelCell> = ({ path, db }) => {
    const initial: t.IDbModelCellProps = {
      value: undefined,
      props: undefined,
      hash: undefined,
      error: undefined,
      links: undefined,
    };

    const links: t.IModelLinkDefs<t.IDbModelCellLinks> = {
      namespaces: {
        relationship: '1:*',
        field: 'nsRefs',
        factory: Ns.factory,
      },
    };

    return Model.create<
      t.IDbModelCellProps,
      t.IDbModelCellDoc,
      t.IDbModelCellLinks,
      t.IDbModelCellChilden
    >({
      db,
      path,
      initial,
      links,
      beforeSave: rules.beforeCellSave,
    });
  };

  public static create<P extends object = {}>(args: { db: t.IDb; uri: string }) {
    const { db } = args;
    const uri = Uri.parse<t.ICellUri>(args.uri);
    if (uri.error) {
      throw new Error(uri.error.message);
    }
    const ns = Schema.ns(uri.parts.ns);
    const path = ns.cell(uri.parts.key).path;
    return Cell.factory({ db, path }) as t.IDbModelCell<P>;
  }
}

/**
 * Represetns a single [row] within a namespace.
 */
export class Row {
  public static factory: t.ModelFactory<t.IDbModelRow> = ({ path, db }) => {
    const initial: t.IDbModelRowProps = {
      props: undefined,
      hash: undefined,
      error: undefined,
    };
    return Model.create<t.IDbModelRowProps>({
      db,
      path,
      initial,
      beforeSave: rules.beforeRowSave,
    }) as t.IDbModelRow;
  };

  public static create<P extends object = {}>(args: { db: t.IDb; uri: string }) {
    const { db } = args;
    const uri = Uri.parse<t.IRowUri>(args.uri);
    if (uri.error) {
      throw new Error(uri.error.message);
    }
    const ns = Schema.ns(uri.parts.ns);
    const path = ns.row(uri.parts.key).path;
    return Row.factory({ db, path }) as t.IDbModelRow<P>;
  }
}

/**
 * Represetns a single [column] within a namespace.
 */
export class Column {
  public static factory: t.ModelFactory<t.IDbModelColumn> = ({ path, db }) => {
    const initial: t.IDbModelColumnProps = {
      props: undefined,
      hash: undefined,
      error: undefined,
    };
    return Model.create<t.IDbModelColumnProps>({
      db,
      path,
      initial,
      beforeSave: rules.beforeColumnSave,
    });
  };

  public static create<P extends object = {}>(args: { db: t.IDb; uri: string }) {
    const { db } = args;
    const uri = Uri.parse<t.IColumnUri>(args.uri);
    if (uri.error) {
      throw new Error(uri.error.message);
    }
    const ns = Schema.ns(uri.parts.ns);
    const path = ns.column(uri.parts.key).path;
    return Column.factory({ db, path }) as t.IDbModelColumn<P>;
  }
}

/**
 * Represetns a single [file] within a namespace.
 */
export class File {
  public static factory: t.ModelFactory<t.IDbModelFile> = ({ path, db }) => {
    const initial: t.IDbModelFileProps = {
      props: {},
      hash: undefined,
      error: undefined,
    };
    return Model.create<t.IDbModelFileProps>({
      db,
      path,
      initial,
      beforeSave: rules.beforeFileSave,
    });
  };

  public static create(args: { db: t.IDb; uri: string }) {
    const { db } = args;
    const uri = Uri.parse<t.IFileUri>(args.uri);
    if (uri.error) {
      throw new Error(uri.error.message);
    }
    const ns = Schema.ns(uri.parts.ns);
    const path = ns.file(uri.parts.file).path;
    return File.factory({ db, path }) as t.IDbModelFile;
  }
}