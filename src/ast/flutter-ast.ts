/**
 * Strongly-typed Flutter Design AST Node Definitions.
 */

export type FlutterASTNodeType =
  | 'widget'
  | 'layout'
  | 'navigation'
  | 'tab_system'
  | 'custom_widget'
  | 'media_widget';

export interface BaseASTNode {
  id: string;
  name: string;
  type: FlutterASTNodeType;
  widget: string;
  className?: string;
  package?: string;
  import?: string;
  isCustom?: boolean;
  prioritySource?: string;
  properties: Record<string, any>;
  decoration?: Record<string, any>;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  relativePosition?: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };
  children: FlutterASTNode[];
}

export interface FlutterWidgetNode extends BaseASTNode {
  type: 'widget' | 'layout';
}

export interface FlutterNavigationNode extends BaseASTNode {
  type: 'navigation';
  destinations?: any[];
  selectedIndex?: number;
}

export interface FlutterTabSystemNode extends BaseASTNode {
  type: 'tab_system';
  tabBar?: any;
  tabView?: any;
  tabs?: any[];
}

export interface FlutterCustomWidgetNode extends BaseASTNode {
  type: 'custom_widget';
  className: string;
  import: string;
  package?: string;
}

export interface FlutterMediaWidgetNode extends BaseASTNode {
  type: 'media_widget';
  className: string;
  import: string;
}

export type FlutterASTNode =
  | FlutterWidgetNode
  | FlutterNavigationNode
  | FlutterTabSystemNode
  | FlutterCustomWidgetNode
  | FlutterMediaWidgetNode;

export interface FlutterDesignAST {
  version: string;
  compiler: string;
  metadata: {
    documentName: string;
    scannedAt: string;
    totalNodes: number;
  };
  root: FlutterASTNode;
}
