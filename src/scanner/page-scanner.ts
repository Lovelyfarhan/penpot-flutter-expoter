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

    // Collect boards and root shapes
    const children = Array.isArray(page?.children) ? page.children : [];

    children.forEach((child: any, idx: number) => {
      const scanned = HierarchyScanner.scanShape(child, undefined, idx);
      if (scanned.type === 'board') {
        boards.push(scanned);
      } else {
        shapes.push(scanned);
      }
    });

    return {
      id: pageId,
      name: pageName,
      boards,
      shapes
    };
  }
}
