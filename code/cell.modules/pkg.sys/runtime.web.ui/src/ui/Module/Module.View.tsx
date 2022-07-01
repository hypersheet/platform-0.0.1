import React, { useState } from 'react';

import { css, CssValue, t, FC, LoadMask, DEFAULT, ErrorBoundary } from './common';
import { Loader } from './view/Loader';
import { Info } from './view/Info';
import { ModuleApp } from '../Module.App';

export type ModuleProps = {
  instance: t.ModuleInstance;
  url?: t.ManifestUrl;
  loader?: boolean | JSX.Element;
  info?: boolean;
  theme?: t.ModuleTheme;
  style?: CssValue;
  onExportClick?: t.ModuleInfoExportClick;
};

/**
 * Component
 */
export const ModuleView: React.FC<ModuleProps> = (props) => {
  const { instance, loader = true, theme = DEFAULT.THEME } = props;
  const [loading, setLoading] = useState(false);

  const url = props.url ? new URL(props.url) : undefined;
  const entry = url?.searchParams.get('entry');

  /**
   * TODO 🐷
   * - put an [React Event Boundary] around this here.
   * - <Empty> (optional)
   */

  /**
   * Render
   */
  const styles = {
    base: css({ position: 'relative', overflow: 'hidden' }),
    errorBoundary: css({ Absolute: 0 }),
    loading: css({ Absolute: 0, pointerEvents: 'none', display: 'flex' }),
  };

  const elLoading = (() => {
    if (!loading) return null;
    if (!loader) return null;
    if (loader === true) return <LoadMask style={styles.loading} theme={theme} />;
    return <div {...styles.loading}>{loader}</div>;
  })();

  const elModule = url && (
    <Loader
      instance={instance}
      url={url.href}
      theme={theme}
      onLoading={(e) => setLoading(e.loading)}
    />
  );

  const elInfo = !elLoading && url && props.info !== false && (props.info || !entry) && (
    <Info instance={instance} url={url} theme={theme} onExportClick={props.onExportClick} />
  );

  return (
    <div {...css(styles.base, props.style)}>
      <ErrorBoundary style={styles.errorBoundary}>
        {elModule}
        {elInfo}
        {elLoading}
      </ErrorBoundary>
    </div>
  );
};
