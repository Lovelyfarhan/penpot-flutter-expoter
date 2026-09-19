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

  // Listen for Penpot theme changes
  penpot.on('themechange', (theme: string) => {
    penpot.ui.sendMessage({
      type: 'theme-changed',
      theme: theme
    });
  });

  // Listen for messages from UI
  penpot.ui.onMessage(async (msg: any) => {
    if (!msg || !msg.type) return;

    try {
      switch (msg.type) {
        case 'get-theme': {
          penpot.ui.sendMessage({
            type: 'theme-changed',
            theme: penpot.theme || 'dark'
          });
          break;
        }

        case 'select-shape': {
          if (msg.shapeId && penpot.currentPage) {
            const shape = penpot.currentPage.getShapeById(msg.shapeId);
            if (shape) {
              penpot.selection = [shape];
            }
          }
          break;
        }

        case 'scan-current-page': {
          const page = PenpotScanner.scanCurrentPage(penpot);
          const allItems = [...page.boards, ...page.shapes];

          if (allItems.length === 0) {
            penpot.ui.sendMessage({
              type: 'scan-error',
              error: 'Current page contains no boards or shapes to scan.'
            });
            return;
          }

          // If exactly one board or loose shape, compile it directly as the root
          let rootShape;
          if (allItems.length === 1) {
            rootShape = allItems[0];
          } else if (page.boards.length === 1 && page.shapes.length === 0) {
            rootShape = page.boards[0];
          } else {
            // Multiple boards or loose shapes on canvas: wrap in synthetic root page board
            const maxX = Math.max(...allItems.map(s => (s.bounds?.x || 0) + (s.bounds?.width || 0)), 800);
            const maxY = Math.max(...allItems.map(s => (s.bounds?.y || 0) + (s.bounds?.height || 0)), 600);
            rootShape = {
              id: page.id,
              name: page.name,
              type: 'board' as const,
              bounds: { x: 0, y: 0, width: maxX, height: maxY },
              relativeBounds: { x: 0, y: 0, width: maxX, height: maxY },
              zIndex: 0,
              shadows: [],
              children: allItems,
              fills: [],
              strokes: [],
              opacity: 1,
              visible: true,
              rotation: 0
            };
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
              error: 'No shapes currently selected. Select a board, container, or group in Penpot first.'
            });
            return;
          }

          let rootShape;
          if (shapes.length === 1) {
            rootShape = shapes[0];
          } else {
            const maxX = Math.max(...shapes.map(s => (s.bounds?.x || 0) + (s.bounds?.width || 0)), 400);
            const maxY = Math.max(...shapes.map(s => (s.bounds?.y || 0) + (s.bounds?.height || 0)), 400);
            rootShape = {
              id: 'selection_group',
              name: 'Selection',
              type: 'group' as const,
              bounds: { x: 0, y: 0, width: maxX, height: maxY },
              relativeBounds: { x: 0, y: 0, width: maxX, height: maxY },
              zIndex: 0,
              shadows: [],
              children: shapes,
              fills: [],
              strokes: [],
              opacity: 1,
              visible: true,
              rotation: 0
            };
          }

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
