/**
 * Page Scanner for Penpot Flutter Design Compiler.
 * Scans an entire Penpot page, collecting boards and root shapes.
 */

import { ScannedPage, ScannedShape } from './types';
import { HierarchyScanner } from './hierarchy-scanner';

export class PageScanner {
  /**
   * Scans a Penpot page object.
   */
  public static scan(page: any): ScannedPage {
    const pageId = page?.id || `page_${Math.random().toString(36).substring(2, 9)}`;
    const pageName = page?.name || 'Page 1';

    const boards: ScannedShape[] = [];
    const shapes: ScannedShape[] = [];

    let rawChildren: any[] = [];

    // In Penpot Plugin API, top-level shapes/boards live under page.root.children
    if (page?.root && Array.isArray(page.root.children)) {
      rawChildren = page.root.children;
    } else if (Array.isArray(page?.children)) {
      rawChildren = page.children;
    } else if (typeof page?.findShapes === 'function') {
      const allShapes = page.findShapes() || [];
      // Top-level shapes have no parent or parent is page.root
      rawChildren = allShapes.filter((s: any) => !s.parentId || (page.root && s.parentId === page.root.id));
      if (rawChildren.length === 0 && allShapes.length > 0) {
        rawChildren = allShapes;
      }
    }

    rawChildren.forEach((child: any, idx: number) => {
      const scanned = HierarchyScanner.scanShape(child, undefined, idx);
      if (scanned.type === 'board') {
        boards.push(scanned);
      } else {
        shapes.push(scanned);
      }
    });

    // Fallback: If no top-level shapes were collected, try findShapes directly
    if (boards.length === 0 && shapes.length === 0 && typeof page?.findShapes === 'function') {
      const all = page.findShapes() || [];
      all.forEach((s: any, idx: number) => {
        const scanned = HierarchyScanner.scanShape(s, undefined, idx);
        if (scanned.type === 'board') {
          boards.push(scanned);
        } else {
          shapes.push(scanned);
        }
      });
    }

    return {
      id: pageId,
      name: pageName,
      boards,
      shapes
    };
  }
}
