import { MouseEvent } from './common/libs';
import { IIcon } from '@platform/ui.icon';

export { IIcon };
export * from './themes/types';

/**
 * A single node within the "tree"
 * (which is itself the root of a further branching tree).
 */
export type ITreeNode<T extends string = string, D extends object = {}> = {
  id: T;
  props?: ITreeNodeProps;
  children?: Array<ITreeNode<T, D>>;
  data?: D; // Data associated with the node - not used by the tree itself.
  version?: number | string;
};

export type TreeNodeIcon =
  | string // String is an ID passed to `renderIcon` factory.
  | null; //  Placeholder, no icon shown, but space taken up.

export type TreeNodeFactory<T extends ITreeNode> = (id: T['id']) => T | undefined;

/**
 * Properties for an individual leaf on the tree.
 */
export type ITreeNodeProps = {
  label?: string;
  icon?: TreeNodeIcon;
  title?: string; // For <Header> if different from `label`.
  description?: string;
  padding?: number | number[]; // [top, right, bottom left].
  marginTop?: number;
  marginBottom?: number;
  borderTop?: number | string | boolean; //    Color (true === theme color).
  borderBottom?: number | string | boolean; // Color (true === theme color).
  chevron?: {
    isVisible?: boolean; // Undefined means automatic, shown if child-nodes exist.
  };
  inline?: {
    // The existence of the 'inline' object indicates the
    // node's children are to be shown inline.
    isOpen?: boolean;
    isVisible?: boolean; // Undefined means automatic, shown if child-nodes exist.
  };
  header?: {
    isVisible?: boolean; // Force show (for custom panel), or hide the header. Default: true.
    parentButton?: boolean; // Hide the "back" button. Default: true.
  };
  badge?: string | number;
  isEnabled?: boolean;
  isVisible?: boolean;
  isSelected?: boolean;
  isBold?: boolean;
  isSpinning?: boolean;
};

/**
 * Function that retrieves the default node props.
 */
export type GetTreeNodeProps = (args: GetTreeNodePropsArgs) => ITreeNodeProps;
export type GetTreeNodePropsArgs = {
  index: number;
  node: ITreeNode;
  siblings: ITreeNode[];
  parent?: ITreeNode;
  isFirst: boolean;
  isLast: boolean;
};

/**
 * Factory renderer of a custom panel within the tree.
 * Return:
 *  - Element:      The component to render.
 *  - [null]:       Render nothing.
 *  - [undefined]:  Render default list.
 */
export type RenderTreePanel<T extends ITreeNode = ITreeNode> = (
  args: RenderTreePanelArgs<T>,
) => React.ReactNode | null | undefined;
export type RenderTreePanelArgs<T extends ITreeNode = ITreeNode> = {
  node: T;
  depth: number; // 0-based.
  isInline: boolean;
};

/**
 * Factory renderer of an icon.
 */
export type RenderTreeIcon<T extends ITreeNode = ITreeNode> = (
  args: RenderTreeIconArgs<T>,
) => IIcon | undefined;
export type RenderTreeIconArgs<T extends ITreeNode = ITreeNode> = {
  icon: string; // Identifier of the icon.
  node: T;
};

/**
 * EVENTS
 */
export type TreeNodeMouseEvent<T extends ITreeNode = ITreeNode> = MouseEvent & {
  target: 'NODE' | 'TWISTY' | 'DRILL_IN' | 'PARENT';
  id: T['id'];
  node: T;
  props: ITreeNodeProps;
  children: T[];
};
export type TreeNodeMouseEventHandler = (e: TreeNodeMouseEvent) => void;