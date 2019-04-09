import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, share, takeUntil } from 'rxjs/operators';

import { color, constants, containsFocus, css, GlamorValue, t, R } from '../../common';
import { FormulaInput, Text, TextEditor, TextInput } from '../primitives';
import { THEMES } from './themes';

const BORDER_WIDTH = 2;
const { DEFAULTS, COLORS, ROBOTO } = constants;

export type ICellEditorViewProps = {
  events$?: Subject<t.CellEditorEvent>;
  value?: string;
  row?: number;
  column?: number;
  title?: React.ReactNode;
  mode?: t.CellEditorMode;
  width?: number;
  height?: number;
  theme?: t.ICellEditorTheme | 'DEFAULT';
  style?: GlamorValue;
};

export class CellEditorView extends React.PureComponent<ICellEditorViewProps> {
  /**
   * [Static]
   */
  public static THEMES = THEMES;
  public static BORDER_WIDTH = BORDER_WIDTH;

  /**
   * [Fields]
   */
  private unmounted$ = new Subject();

  private formula$ = new Subject<t.FormulaInputEvent>();
  private formula!: FormulaInput;
  private formulaRef = (ref: FormulaInput) => (this.formula = ref);

  private markdown$ = new Subject<t.TextEditorEvent>();
  private markdown!: TextEditor;
  private markdownRef = (ref: TextEditor) => (this.markdown = ref);

  private text$ = new Subject<t.TextInputEvent>();
  private text!: TextInput;
  private textRef = (ref: TextInput) => (this.text = ref);

  private _events$ = new Subject<t.CellEditorEvent>();
  public events$ = this._events$.pipe(
    takeUntil(this.unmounted$),
    share(),
  );

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    if (this.props.events$) {
      this.events$.subscribe(this.props.events$);
    }
  }

  public componentDidMount() {
    const formula$ = this.formula$.pipe(takeUntil(this.unmounted$));
    const markdown$ = this.markdown$.pipe(takeUntil(this.unmounted$));
    const text$ = this.text$.pipe(takeUntil(this.unmounted$));

    formula$.subscribe(e => {
      // console.log('🌳 FORMULA', e);
    });

    markdown$.subscribe(e => {
      // console.log('🌼 TEXT', e);
      // // console.log("e.payload.size", e.payload.size)
    });

    // Manage cancelling manually.
    // this.context.autoCancel = false;
    // keys$.pipe(filter(e => e.isEscape)).subscribe(e => this.context.cancel());

    formula$
      .pipe(
        filter(e => e.type === 'INPUT/formula/changing'),
        map(e => e.payload as t.IFormulaInputChanging),
        filter(e => this.mode === 'FORMULA'),
      )
      .subscribe(e => {
        const { from, to } = e;
        const { isCancelled } = this.fireChanging('FORMULA', from, to);
        if (isCancelled) {
          e.cancel();
        }
      });

    formula$
      .pipe(
        filter(e => e.type === 'INPUT/formula/changed'),
        map(e => e.payload as t.IFormulaInputChanged),
        filter(e => this.mode === 'FORMULA'),
      )
      .subscribe(e => {
        const { from, to } = e;
        const value = { from, to };
        this.fireChanged({ mode: 'FORMULA', value });
      });

    text$
      .pipe(
        filter(e => e.type === 'TEXT_INPUT/changing'),
        map(e => e.payload as t.ITextInputChanging),
        filter(e => this.mode === 'TEXT'),
      )
      .subscribe(e => {
        const { from, to } = e;
        const { isCancelled } = this.fireChanging('TEXT', from, to);
        if (isCancelled) {
          e.cancel();
        }
      });

    text$
      .pipe(
        filter(e => e.type === 'TEXT_INPUT/changed'),
        map(e => e.payload as t.ITextInputChanged),
        filter(e => this.mode === 'TEXT'),
      )
      .subscribe(e => {
        const { from, to } = e;
        const value = { from, to };
        this.fireChanged({ mode: 'TEXT', value });
      });

    markdown$
      .pipe(
        filter(e => e.type === 'EDITOR/changing'),
        map(e => e.payload as t.ITextEditorChanging),
        filter(e => this.mode === 'MARKDOWN'),
        filter(e => e.value.to !== e.value.from || !R.equals(e.size.from, e.size.to)),
      )
      .subscribe(e => {
        const { from, to } = e.value;
        const { isCancelled } = this.fireChanging('MARKDOWN', from, to);
        if (isCancelled) {
          e.cancel();
        }
      });

    markdown$
      .pipe(
        filter(e => e.type === 'EDITOR/changed'),
        map(e => e.payload as t.ITextEditorChanged),
        filter(e => this.mode === 'MARKDOWN'),
        filter(e => e.value.to !== e.value.from || !R.equals(e.size.from, e.size.to)),
      )
      .subscribe(e => {
        const { from, to } = e.value;
        const value = { from, to };
        this.fireChanged({ mode: 'MARKDOWN', value });

        this.fire({
          type: 'CELL_EDITOR/size',
          payload: {
            mode: this.mode,
            from: e.size.from,
            to: {
              ...e.size.to,
              height: e.size.to.height + 4, // TEMP 🐷
            },
          },
        });
      });
  }

  public componentDidUpdate(prev: ICellEditorViewProps) {
    const mode = this.mode;
    if (mode !== prev.mode) {
      if (this.isFocused) {
        this.focus(); // Ensure focus is switched to the INPUT component for the new mode.
      }
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get value() {
    return this.props.value || '';
  }

  public get isFocused() {
    return containsFocus(this);
  }

  public get theme() {
    const { theme = 'DEFAULT' } = this.props;
    if (typeof theme === 'object') {
      return theme;
    }
    switch (theme) {
      case 'DEFAULT':
        return THEMES.DEFAULT;
    }
    throw new Error(`Theme '${theme}' not supported`);
  }

  public get mode() {
    return this.props.mode || 'MARKDOWN';
  }

  public get row() {
    return this.props.row || 0;
  }
  public get column() {
    return this.props.column || 0;
  }

  /**
   * [Methods]
   */
  public focus(options: { selectAll?: boolean } = {}) {
    const { selectAll } = options;
    if (this.mode === 'MARKDOWN' && this.markdown) {
      this.markdown.focus({ selectAll });
    }
    if (this.mode === 'FORMULA' && this.formula) {
      this.formula.focus({ selectAll });
    }
    if (this.mode === 'TEXT' && this.text) {
      this.text.focus({ selectAll });
    }
  }

  private fire(e: t.CellEditorEvent) {
    this._events$.next(e);
  }

  private fireChanging(mode: t.CellEditorMode, from: string, to: string) {
    const self = this; // tslint:disable-line
    let isCancelled = false;
    const payload = {
      mode,
      value: { from, to },
      cancel() {
        isCancelled = true;
      },
      get isCancelled() {
        return isCancelled;
      },
      get isFocused() {
        return self.isFocused;
      },
    };
    this.fire({
      type: 'CELL_EDITOR/changing',
      payload: payload as t.ICellEditorChanging,
    });
    return payload;
  }

  private fireChanged(payload: t.ICellEditorChanged) {
    this.fire({
      type: 'CELL_EDITOR/changed',
      payload: payload,
    });
    return payload;
  }

  /**
   * [Render]
   */
  public render() {
    const { width, height } = this.props;
    const theme = this.theme;
    const shadow = theme.inputShadow;

    const styles = {
      base: css({
        position: 'relative',
        boxSizing: 'border-box',
        boxShadow: `0 0px ${shadow.blur}px 0 ${color.format(shadow.color)}`,
        backgroundColor: theme.inputBackground,
        width,
        height,
        minHeight: DEFAULTS.ROW_HEIGHTS + (this.row === 0 ? -1 : 0),
      }),
      body: css({
        Absolute: 0,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)} className={constants.CSS_CLASS.CELL_EDITOR}>
        {this.renderBorder()}
        <div {...styles.body}>
          {this.renderTitle()}
          {this.renderFormula()}
          {this.renderText()}
          {this.renderMarkdown()}
        </div>
      </div>
    );
  }

  private renderBorder() {
    const BORDER = STYLES.BORDER;
    return (
      <React.Fragment>
        <div {...BORDER.left} />
        <div {...BORDER.top} />
        <div {...BORDER.right} />
        <div {...BORDER.bottom} />
      </React.Fragment>
    );
  }

  private renderTitle() {
    const { title } = this.props;
    if (!title) {
      return null;
    }
    const theme = this.theme;
    const styles = {
      base: css({
        Absolute: [-3, null, null, 0],
        userSelect: 'none',
      }),
      body: css({
        Absolute: [null, null, 0, 0],
        backgroundColor: theme.titleBackground,
        color: theme.titleColor,
        fontSize: 12,
        PaddingX: 10,
        paddingTop: 5,
        paddingBottom: 3,
      }),
    };
    return (
      <div {...styles.base}>
        <Text style={styles.body}>{title}</Text>
      </div>
    );
  }

  private renderFormula() {
    const isVisible = this.mode === 'FORMULA';
    const styles = {
      base: css({
        position: isVisible ? 'relative' : 'absolute',
        left: isVisible ? 0 : -999999,
        top: BORDER_WIDTH + (this.row === 0 ? -1 : 0),
        height: DEFAULTS.ROW_HEIGHTS - BORDER_WIDTH * 2,
        PaddingX: BORDER_WIDTH,
      }),
    };
    return (
      <div {...styles.base}>
        <FormulaInput
          ref={this.formulaRef}
          events$={this.formula$}
          multiline={false}
          value={this.value}
          fontSize={12}
        />
      </div>
    );
  }

  private renderText() {
    const isVisible = this.mode === 'TEXT';
    const styles = {
      base: css({
        position: isVisible ? 'relative' : 'absolute',
        left: isVisible ? 0 : -999999,
        top: this.row === 0 ? 0 : 1,
        height: DEFAULTS.ROW_HEIGHTS - BORDER_WIDTH * 2,
        PaddingX: BORDER_WIDTH,
      }),
      input: css({
        fontSize: 14,
        paddingTop: 2,
        paddingLeft: 3,
      }),
    };
    return (
      <div {...styles.base}>
        <TextInput
          ref={this.textRef}
          events$={this.text$}
          value={this.value}
          style={styles.input}
        />
      </div>
    );
  }

  private renderMarkdown() {
    const isVisible = this.mode === 'MARKDOWN';

    const styles = {
      editor: css({
        position: isVisible ? 'relative' : 'absolute',
        left: isVisible ? undefined : -9999999,
        top: this.row === 0 ? 0 : 1,
        margin: BORDER_WIDTH,
        fontFamily: ROBOTO.FAMILY,
        fontSize: 14,
        PaddingX: 3,
      }),
    };
    return (
      <TextEditor
        ref={this.markdownRef}
        style={styles.editor}
        events$={this.markdown$}
        value={this.value}
      />
    );
  }
}

/**
 * [Helpers]
 */
const STYLES = {
  BORDER: {
    left: css({
      backgroundColor: COLORS.BLUE,
      Absolute: [0, null, 0, 0],
      width: BORDER_WIDTH,
    }),
    top: css({
      backgroundColor: COLORS.BLUE,
      Absolute: [0, 0, null, 0],
      height: BORDER_WIDTH,
    }),
    right: css({
      backgroundColor: COLORS.BLUE,
      Absolute: [0, 0, 0, null],
      width: BORDER_WIDTH,
    }),
    bottom: css({
      backgroundColor: COLORS.BLUE,
      Absolute: [null, 0, 0, 0],
      height: BORDER_WIDTH,
    }),
  },
};