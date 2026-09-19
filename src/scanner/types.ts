/**
 * Core type definitions for Penpot scene models, shapes, and extracted properties.
 */

export interface Point2D {
  x: number;
  y: number;
}

export interface Rect2D {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ColorFill {
  type: 'solid' | 'gradient-linear' | 'gradient-radial' | 'image';
  color?: string; // hex or rgba
  opacity?: number;
  gradientStops?: Array<{ offset: number; color: string }>;
  imageUrl?: string;
}

export interface StrokeStyle {
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
  alignment: 'inner' | 'center' | 'outer';
  opacity?: number;
}

export interface ShadowEffect {
  type: 'drop-shadow' | 'inner-shadow';
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
}

export interface TypographyStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  fontStyle?: 'normal' | 'italic';
  lineHeight?: number | string;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through';
  color?: string;
}

export interface PenpotFlexData {
  direction: 'row' | 'column';
  wrap: boolean;
  justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  gap?: number;
  rowGap?: number;
  columnGap?: number;
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface PenpotGridData {
  columnCount?: number;
  rowCount?: number;
  columnGap?: number;
  rowGap?: number;
  columns?: string[]; // e.g. ["1fr", "1fr", "200px"]
  rows?: string[];
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface PenpotLayoutChildData {
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | string;
  alignSelf?: 'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  gridColumnSpan?: number;
  gridRowSpan?: number;
}

export type PenpotShapeType =
  | 'board'
  | 'frame'
  | 'group'
  | 'rect'
  | 'circle'
  | 'path'
  | 'text'
  | 'image'
  | 'svg'
  | 'component'
  | 'boolean';

export interface ScannedShape {
  id: string;
  name: string;
  type: PenpotShapeType;
  bounds: Rect2D;
  parentBounds?: Rect2D;
  relativeBounds: Rect2D; // Relative to parent
  rotation: number;
  opacity: number;
  visible: boolean;
  zIndex: number;

  // Styling
  fills: ColorFill[];
  strokes: StrokeStyle[];
  shadows: ShadowEffect[];
  borderRadius?: {
    topLeft: number;
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
  };

  // Text specific
  textContent?: string;
  typography?: TypographyStyle;

  // Layout info
  layoutMode?: 'none' | 'flex' | 'grid';
  flex?: PenpotFlexData;
  grid?: PenpotGridData;
  layoutChild?: PenpotLayoutChildData;

  // Components & instances
  componentId?: string;
  componentName?: string;
  isComponentMaster?: boolean;
  isComponentInstance?: boolean;
  variantProperties?: Record<string, string>;
  instanceOverrides?: Record<string, unknown>;

  // Metadata
  pluginMetadata?: Record<string, unknown>;
  customAttributes?: Record<string, string>;

  // Hierarchy
  parentId?: string;
  children: ScannedShape[];
}

export interface ScannedPage {
  id: string;
  name: string;
  boards: ScannedShape[];
  shapes: ScannedShape[];
}

export interface ScannedDocument {
  id: string;
  name: string;
  pages: ScannedPage[];
  activePageId?: string;
  selection?: ScannedShape[];
}
