/**
 * Selection Scanner for Penpot Flutter Design Compiler.
 * Scans only the currently selected shapes or boards.
 */

import { ScannedShape } from './types';
import { HierarchyScanner } from './hierarchy-scanner';

export class SelectionScanner {
  /**
   * Scans an array of selected Penpot shapes.
   */
  public static scan(selectedShapes: any[]): ScannedShape[] {
    if (!Array.isArray(selectedShapes) || selectedShapes.length === 0) {
      return [];
    }

    return selectedShapes.map((shape, idx) => {
      return HierarchyScanner.scanShape(shape, undefined, idx);
    });
  }
}
