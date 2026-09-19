/**
 * Stack Layout Analyzer for Penpot Flutter Design Compiler.
 * Deterministically detects overlapping children using 2D AABB bounding-box
 * intersection calculations and extracts Positioned coordinates.
 */

import { ScannedShape, Rect2D } from '../scanner/types';

export interface FlutterStackAnalysis {
  widget: 'Stack';
  alignment?: string;
  fit?: 'StackFit.loose' | 'StackFit.expand' | 'StackFit.passthrough';
  hasOverlappingChildren: boolean;
  overlapCount: number;
}

export class StackAnalyzer {
  /**
   * Evaluates if a container should be represented as a Stack.
   * Checks for:
   * 1. Explicit tag @flutter:Stack
   * 2. Non-flex, non-grid container with overlapping children (2D AABB collision)
   */
  public static analyze(shape: ScannedShape, isExplicitStack: boolean = false): FlutterStackAnalysis | null {
    if (isExplicitStack) {
      return {
        widget: 'Stack',
        alignment: 'AlignmentDirectional.topStart',
        hasOverlappingChildren: this.checkChildrenOverlap(shape.children),
        overlapCount: this.countOverlaps(shape.children)
      };
    }

    // If already marked as flex or grid, do not infer stack unless explicitly tagged
    if (shape.layoutMode === 'flex' || shape.layoutMode === 'grid') {
      return null;
    }

    if (shape.children.length >= 2) {
      const overlaps = this.checkChildrenOverlap(shape.children);
      if (overlaps) {
        return {
          widget: 'Stack',
          alignment: 'AlignmentDirectional.topStart',
          hasOverlappingChildren: true,
          overlapCount: this.countOverlaps(shape.children)
        };
      }
    }

    return null;
  }

  /**
   * Deterministically checks if any two children intersect using AABB collision detection.
   */
  public static checkChildrenOverlap(children: ScannedShape[]): boolean {
    if (children.length < 2) return false;

    for (let i = 0; i < children.length; i++) {
      for (let j = i + 1; j < children.length; j++) {
        if (this.areRectsIntersecting(children[i].relativeBounds, children[j].relativeBounds)) {
          return true;
        }
      }
    }

    return false;
  }

  public static countOverlaps(children: ScannedShape[]): number {
    let count = 0;
    for (let i = 0; i < children.length; i++) {
      for (let j = i + 1; j < children.length; j++) {
        if (this.areRectsIntersecting(children[i].relativeBounds, children[j].relativeBounds)) {
          count++;
        }
      }
    }
    return count;
  }

  public static areRectsIntersecting(r1: Rect2D, r2: Rect2D): boolean {
    // Check 2D Axis-Aligned Bounding Box intersection with tolerance
    const tolerance = 1.0; // 1px tolerance for touching edges
    return !(
      r2.x >= r1.x + r1.width - tolerance ||
      r2.x + r2.width <= r1.x + tolerance ||
      r2.y >= r1.y + r1.height - tolerance ||
      r2.y + r2.height <= r1.y + tolerance
    );
  }
}
