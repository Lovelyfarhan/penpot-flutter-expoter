/**
 * Master Penpot Scanner for Penpot Flutter Design Compiler.
 * Interacts with the Penpot Plugin API runtime object (or mocks).
 */

import { ScannedDocument, ScannedPage, ScannedShape } from './types';
import { PageScanner } from './page-scanner';
import { SelectionScanner } from './selection-scanner';

export class PenpotScanner {
  /**
   * Scans the active page from the Penpot runtime.
   */
  public static scanCurrentPage(penpotApi?: any): ScannedPage {
    const api = penpotApi || (typeof (globalThis as any).penpot !== 'undefined' ? (globalThis as any).penpot : null);
    if (!api || !api.currentPage) {
      throw new Error('Penpot API is not available or no active page found.');
    }

    return PageScanner.scan(api.currentPage);
  }

  /**
   * Scans the current selection from the Penpot runtime.
   */
  public static scanSelection(penpotApi?: any): ScannedShape[] {
    const api = penpotApi || (typeof (globalThis as any).penpot !== 'undefined' ? (globalThis as any).penpot : null);
    if (!api) {
      throw new Error('Penpot API is not available.');
    }

    const selection = api.selection || [];
    return SelectionScanner.scan(selection);
  }

  /**
   * Scans the entire document or all pages.
   */
  public static scanDocument(penpotApi?: any): ScannedDocument {
    const api = penpotApi || (typeof (globalThis as any).penpot !== 'undefined' ? (globalThis as any).penpot : null);
    if (!api) {
      throw new Error('Penpot API is not available.');
    }

    const pages: ScannedPage[] = [];
    if (Array.isArray(api.pages)) {
      for (const p of api.pages) {
        pages.push(PageScanner.scan(p));
      }
    } else if (api.currentPage) {
      pages.push(PageScanner.scan(api.currentPage));
    }

    const selection = Array.isArray(api.selection) ? SelectionScanner.scan(api.selection) : [];

    return {
      id: api.fileId || 'penpot_file',
      name: api.fileName || 'Penpot Project',
      pages,
      activePageId: api.currentPage?.id,
      selection
    };
  }
}
