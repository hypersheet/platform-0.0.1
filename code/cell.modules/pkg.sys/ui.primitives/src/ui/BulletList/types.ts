type Pixels = number;

export type BulletOrientation = 'vertical' | 'horizontal';
export type BulletEdge = 'near' | 'far';

export type BulletItem<T = any> = {
  data: T;
  spacing?: number;
};

export type BulletItemRenderer = (e: BulletItemProps) => JSX.Element | null;
export type BulletItemProps<T = any> = {
  kind: 'Default' | 'Spacing';
  index: number;
  total: number;
  data: T;
  orientation: BulletOrientation;
  bullet: { edge: BulletEdge; size: Pixels };
  spacing: number;
  is: {
    first: boolean;
    last: boolean;
    edge: boolean;
    vertical: boolean;
    horizontal: boolean;
    spacing: boolean;
    bullet: { near: boolean; far: boolean };
  };
};
