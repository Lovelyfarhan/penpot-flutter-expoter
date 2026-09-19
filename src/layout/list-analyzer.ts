/**
 * List & Scroll Layout Analyzer for Penpot Flutter Design Compiler.
 * Analyzes ListView, CustomScrollView, Slivers, and PageViews.
 */

import { ScannedShape } from '../scanner/types';

export interface FlutterListAnalysis {
  widget: 'ListView' | 'ListView.separated' | 'CustomScrollView' | 'PageView';
  scrollDirection: 'Axis.vertical' | 'Axis.horizontal';
  shrinkWrap?: boolean;
  itemCount?: number;
  itemExtent?: number;
  isSliverContainer?: boolean;
}

export class ListAnalyzer {
  public static analyze(shape: ScannedShape, explicitWidget?: string): FlutterListAnalysis | null {
    const isCustomScrollView = explicitWidget === 'CustomScrollView' || shape.name.includes('CustomScrollView');
    const isPageView = explicitWidget === 'PageView' || shape.name.includes('PageView');
    const isListView = explicitWidget === 'ListView' || shape.name.includes('ListView');

    if (isCustomScrollView) {
      return {
        widget: 'CustomScrollView',
        scrollDirection: 'Axis.vertical',
        isSliverContainer: true
      };
    }

    if (isPageView) {
      return {
        widget: 'PageView',
        scrollDirection: 'Axis.horizontal',
        itemCount: shape.children.length
      };
    }

    if (isListView) {
      // Determine scroll direction from dimensions or flex
      let scrollDirection: 'Axis.vertical' | 'Axis.horizontal' = 'Axis.vertical';
      if (shape.flex?.direction === 'row' || shape.bounds.width > shape.bounds.height * 2) {
        scrollDirection = 'Axis.horizontal';
      }

      return {
        widget: 'ListView',
        scrollDirection,
        shrinkWrap: true,
        itemCount: shape.children.length
      };
    }

    return null;
  }
}
