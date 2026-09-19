/**
 * Penpot Plugin Entry Script (src/plugin.ts).
 * Runs in the Penpot sandbox context.
 */

import { PenpotScanner } from './scanner/penpot-scanner';
import { DesignCompiler } from './compiler';
import { CustomWidgetRegistry, CustomWidgetDefinition } from './widgets/custom-widget-registry';

// Initialize registries
DesignCompiler.initialize();

// Open Plugin UI modal
if (typeof (globalThis as any).penpot !== 'undefined') {
  const penpot = (globalThis as any).penpot;

  penpot.ui.open('Penpot Flutter Design Compiler', `?theme=${penpot.theme}`, {
    width: 820,
    height: 800
  });

  // Listen for selection changes in the Penpot canvas
  penpot.on('selectionchange', () => {
    penpot.ui.sendMessage({
      type: 'selection-changed',
      count: penpot.selection ? penpot.selection.length : 0
    });
  });

  // Listen for messages from UI
  penpot.ui.onMessage(async (msg: any) => {
    if (!msg || !msg.type) return;

    try {
      switch (msg.type) {
        case 'scan-current-page': {
          const page = PenpotScanner.scanCurrentPage(penpot);
          // Pick active board or create synthetic root container if multiple boards
          const rootShape = page.boards.length > 0 ? page.boards[0] : (page.shapes.length > 0 ? page.shapes[0] : null);

          if (!rootShape) {
            penpot.ui.sendMessage({
              type: 'scan-error',
              error: 'Current page contains no boards or shapes to scan.'
            });
            return;
          }

          const result = DesignCompiler.compile(rootShape, page.name);
          penpot.ui.sendMessage({
            type: 'scan-success',
            data: result
          });
          break;
        }

        case 'scan-selection': {
          const shapes = PenpotScanner.scanSelection(penpot);
          if (shapes.length === 0) {
            penpot.ui.sendMessage({
              type: 'scan-error',
              error: 'No shapes currently selected. Select a board or group in Penpot first.'
            });
            return;
          }

          const rootShape = shapes[0];
          const result = DesignCompiler.compile(rootShape, rootShape.name);
          penpot.ui.sendMessage({
            type: 'scan-success',
            data: result
          });
          break;
        }

        case 'register-custom-widget': {
          const def: CustomWidgetDefinition = msg.widget;
          CustomWidgetRegistry.register(def);
          penpot.ui.sendMessage({
            type: 'custom-widget-registered',
            widget: def
          });
          break;
        }

        case 'get-custom-widgets': {
          penpot.ui.sendMessage({
            type: 'custom-widgets-list',
            widgets: CustomWidgetRegistry.getAll()
          });
          break;
        }
      }
    } catch (err: any) {
      penpot.ui.sendMessage({
        type: 'scan-error',
        error: err?.message || 'An unexpected error occurred during design compilation.'
      });
    }
  });
}
