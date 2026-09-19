/**
 * Flex Layout Analyzer for Penpot Flutter Design Compiler.
 * Maps Penpot flex data to Flutter Row, Column, Flex, Expanded, Flexible, Spacer.
 */

import { ScannedShape } from '../scanner/types';

export interface FlutterFlexAnalysis {
  widget: 'Row' | 'Column' | 'Flex' | 'Wrap';
  direction?: 'Axis.horizontal' | 'Axis.vertical';
  mainAxisAlignment: string;
  crossAxisAlignment: string;
  mainAxisSize: string; // MainAxisSize.max or MainAxisSize.min
  spacing?: number;
  padding?: string;
  isWrap: boolean;
  wrapProperties?: {
    direction: string;
    alignment: string;
    spacing: number;
    runSpacing: number;
  };
}

export class FlexAnalyzer {
  public static analyze(shape: ScannedShape): FlutterFlexAnalysis | null {
    const flex = shape.flex;
    if (!flex) return null;

    const isRow = flex.direction === 'row';

    if (flex.wrap) {
      return {
        widget: 'Wrap',
        isWrap: true,
        direction: isRow ? 'Axis.horizontal' : 'Axis.vertical',
        mainAxisAlignment: this.mapJustify(flex.justifyContent),
        crossAxisAlignment: this.mapAlign(flex.alignItems),
        mainAxisSize: 'MainAxisSize.max',
        spacing: flex.columnGap ?? flex.gap ?? 0,
        wrapProperties: {
          direction: isRow ? 'Axis.horizontal' : 'Axis.vertical',
          alignment: 'WrapAlignment.start',
          spacing: flex.columnGap ?? flex.gap ?? 0,
          runSpacing: flex.rowGap ?? flex.gap ?? 0
        }
      };
    }

    return {
      widget: isRow ? 'Row' : 'Column',
      isWrap: false,
      direction: isRow ? 'Axis.horizontal' : 'Axis.vertical',
      mainAxisAlignment: this.mapJustify(flex.justifyContent),
      crossAxisAlignment: this.mapAlign(flex.alignItems),
      mainAxisSize: 'MainAxisSize.max',
      spacing: flex.gap || (isRow ? flex.columnGap : flex.rowGap) || undefined
    };
  }

  public static isChildExpanded(child: ScannedShape): { isExpanded: boolean; isFlexible: boolean; flex: number } {
    const lc = child.layoutChild;
    if (lc && typeof lc.flexGrow === 'number' && lc.flexGrow > 0) {
      return {
        isExpanded: true,
        isFlexible: false,
        flex: Math.round(lc.flexGrow)
      };
    }
    return { isExpanded: false, isFlexible: false, flex: 1 };
  }

  private static mapJustify(justify?: string): string {
    switch (justify) {
      case 'center': return 'MainAxisAlignment.center';
      case 'flex-end': return 'MainAxisAlignment.end';
      case 'space-between': return 'MainAxisAlignment.spaceBetween';
      case 'space-around': return 'MainAxisAlignment.spaceAround';
      case 'space-evenly': return 'MainAxisAlignment.spaceEvenly';
      case 'flex-start':
      default:
        return 'MainAxisAlignment.start';
    }
  }

  private static mapAlign(align?: string): string {
    switch (align) {
      case 'center': return 'CrossAxisAlignment.center';
      case 'flex-end': return 'CrossAxisAlignment.end';
      case 'stretch': return 'CrossAxisAlignment.stretch';
      case 'baseline': return 'CrossAxisAlignment.baseline';
      case 'flex-start':
      default:
        return 'CrossAxisAlignment.start';
    }
  }
}
