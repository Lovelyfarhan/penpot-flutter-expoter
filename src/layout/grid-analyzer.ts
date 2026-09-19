/**
 * Grid Layout Analyzer for Penpot Flutter Design Compiler.
 * Analyzes Penpot grid layouts, crossAxisCount, aspect ratios, and responsive column rules.
 */

import { ScannedShape } from '../scanner/types';

export interface FlutterGridAnalysis {
  widget: 'GridView' | 'GridView.count' | 'GridView.extent' | 'SliverGrid';
  crossAxisCount: number;
  mainAxisSpacing: number;
  crossAxisSpacing: number;
  childAspectRatio?: number;
  padding?: string;
  responsiveColumns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wideDesktop?: number;
  };
  isResponsive: boolean;
}

export class GridAnalyzer {
  public static analyze(shape: ScannedShape, tagArgs?: Record<string, any>): FlutterGridAnalysis | null {
    const grid = shape.grid;
    const hasGridTag = shape.name.includes('Grid') || (shape.customAttributes && shape.customAttributes['grid']);

    if (!grid && !hasGridTag && !tagArgs?.crossAxisCount && !tagArgs?.columns) {
      return null;
    }

    let crossAxisCount = 2;
    let mainAxisSpacing = 8;
    let crossAxisSpacing = 8;

    if (grid) {
      crossAxisCount = grid.columnCount || (grid.columns ? grid.columns.length : 2);
      mainAxisSpacing = grid.rowGap || 8;
      crossAxisSpacing = grid.columnGap || 8;
    }

    if (tagArgs) {
      if (typeof tagArgs.crossAxisCount === 'number') crossAxisCount = tagArgs.crossAxisCount;
      if (typeof tagArgs.columns === 'number') crossAxisCount = tagArgs.columns;
      if (typeof tagArgs.mainAxisSpacing === 'number') mainAxisSpacing = tagArgs.mainAxisSpacing;
      if (typeof tagArgs.crossAxisSpacing === 'number') crossAxisSpacing = tagArgs.crossAxisSpacing;
      if (typeof tagArgs.spacing === 'number') {
        mainAxisSpacing = tagArgs.spacing;
        crossAxisSpacing = tagArgs.spacing;
      }
    }

    // Check for child aspect ratio if children exist
    let childAspectRatio: number | undefined;
    if (shape.children.length > 0) {
      const firstChild = shape.children[0];
      if (firstChild.bounds.width > 0 && firstChild.bounds.height > 0) {
        childAspectRatio = Number((firstChild.bounds.width / firstChild.bounds.height).toFixed(2));
      }
    }

    // Default responsive column rules for media grids
    const responsiveColumns = {
      mobile: Math.min(crossAxisCount, 2),
      tablet: Math.max(crossAxisCount, 3),
      desktop: Math.max(crossAxisCount, 5),
      wideDesktop: Math.max(crossAxisCount + 1, 6)
    };

    return {
      widget: 'GridView.count',
      crossAxisCount,
      mainAxisSpacing,
      crossAxisSpacing,
      childAspectRatio,
      responsiveColumns,
      isResponsive: true
    };
  }
}
