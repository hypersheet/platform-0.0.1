import React, { useEffect } from 'react';

import { css, CssValue, rx, t } from '../common';
import { DevEnv } from '../ui/DevEnv';
import { CodeEditor } from '../ui/CodeEditor';

type Id = string;

export type AppProps = {
  fs?: { id: Id; path: string };
  allowRubberband?: boolean; // Page rubber-band effect in Chrome (default: false).
  style?: CssValue;
};

const bus = rx.bus();

export const App: React.FC<AppProps> = (props) => {
  const { fs } = props;

  const language: t.CodeEditorLanguage = 'markdown';
  const state = CodeEditor.useState({ bus, fs });

  /**
   * Lifecycle
   */
  useEffect(() => {
    const allowRubberband = props.allowRubberband ?? false;
    document.body.style.overflow = allowRubberband ? 'auto' : 'hidden';
  }, [props.allowRubberband]);

  /**
   * [Render]
   */
  const styles = {
    base: css({ Absolute: 0, display: 'flex', overflow: 'hidden' }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <DevEnv
        style={{ flex: 1 }}
        instance={{ bus }}
        text={state.text}
        language={language}
        onReady={state.onReady}
      />
    </div>
  );
};