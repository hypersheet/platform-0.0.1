import { t } from './common';

type N = t.ITreeviewNode;

/**
 * Properties for an individual leaf on the tree.
 */
export type ITreeviewNodeProps = {
  nav?: { selected?: string; current?: string }; // NB: Used for storing top-level selection state within a root node.

  body?: string; // Key used in [renderNodeBody] factory.
  label?: string;
  icon?: t.TreeNodeIcon;
  title?: string; // For <Header> if different from `label`.
  description?: string;
  opacity?: number;
  padding?: number | number[]; // [top, right, bottom left].
  marginTop?: number;
  marginBottom?: number;

  chevron?: {
    isVisible?: boolean; // Undefined means automatic, shown if child-nodes exist.
  };
  inline?: ITreeviewNodeInline;
  header?: ITreeviewNodeHeader;
  badge?: string | number;
  isEnabled?: boolean;
  isVisible?: boolean;
  isBold?: boolean;
  isSpinning?: boolean;
  isSelected?: boolean;
  labelEditable?: boolean | 'DOUBLE_CLICK';

  colors?: ITreeviewNodeColors;
  focusColors?: ITreeviewNodeColors;
};

export type ITreeviewNodeHeader = {
  isVisible?: boolean; // Force show (for custom panel), or hide the header. Default: true.
  showParentButton?: boolean; // Hide the "back" button. Default: true.
  marginBottom?: number;
  height?: number;
};

export type ITreeviewNodeInline = {
  // The existence of the 'inline' object indicates the
  // node's children are to be shown inline.
  isOpen?: boolean;
  isVisible?: boolean; // Undefined means automatic, shown if child-nodes exist.
};

export type ITreeviewNodeColors = {
  label?: string | number;
  description?: string | number;
  icon?: string | number;
  bg?: string | number; // Explicit BG color overrides the theme's `isSelected` bg color.
  twisty?: string | number;
  chevron?: string | number;
  borderTop?: number | string | boolean; //    Color (true === theme color).
  borderBottom?: number | string | boolean; // Color (true === theme color).
};

/**
 * Function that retrieves the default node props.
 */
export type GetTreeviewNodeProps = (args: GetTreeviewNodePropsArgs) => ITreeviewNodeProps;
export type GetTreeviewNodePropsArgs = {
  index: number;
  node: N;
  siblings: N[];
  parent?: N;
  isFirst: boolean;
  isLast: boolean;
};
