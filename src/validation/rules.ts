/**
 * Validation Rules for Penpot Flutter Design Compiler.
 */

export type DiagnosticSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface ValidationDiagnostic {
  id: string;
  severity: DiagnosticSeverity;
  rule: string;
  message: string;
  nodeId?: string;
  nodeName?: string;
  recommendation?: string;
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  check: (node: any, parent: any | null, diagnostics: ValidationDiagnostic[]) => void;
}

export const VALIDATION_RULES: ValidationRule[] = [
  // 1. Positioned must be inside Stack
  {
    id: 'positioned-in-stack',
    name: 'Positioned inside Stack',
    description: 'Verifies that Positioned widgets are direct children of a Stack widget.',
    check: (node, parent, diagnostics) => {
      if (node.widget === 'Positioned' || node.widget === 'PositionedDirectional') {
        if (!parent || parent.widget !== 'Stack') {
          diagnostics.push({
            id: `diag_${Math.random().toString(36).substring(2, 9)}`,
            severity: 'ERROR',
            rule: 'positioned-in-stack',
            message: `Positioned widget "${node.name}" is inside "${parent?.widget || 'root'}", but it must be placed directly inside a Stack.`,
            nodeId: node.id,
            nodeName: node.name,
            recommendation: 'Wrap the parent container in @flutter:Stack or move this widget under a Stack.'
          });
        }
      }
    }
  },

  // 2. Expanded/Flexible inside Row/Column/Flex
  {
    id: 'expanded-in-flex',
    name: 'Expanded / Flexible inside Flex',
    description: 'Verifies that Expanded and Flexible widgets are children of Row, Column, or Flex.',
    check: (node, parent, diagnostics) => {
      if (node.widget === 'Expanded' || node.widget === 'Flexible') {
        if (!parent || !['Row', 'Column', 'Flex'].includes(parent.widget)) {
          diagnostics.push({
            id: `diag_${Math.random().toString(36).substring(2, 9)}`,
            severity: 'ERROR',
            rule: 'expanded-in-flex',
            message: `${node.widget} widget "${node.name}" is inside "${parent?.widget || 'root'}", but must be a child of Row, Column, or Flex.`,
            nodeId: node.id,
            nodeName: node.name,
            recommendation: 'Ensure the parent container is tagged as @flutter:Row or @flutter:Column.'
          });
        }
      }
    }
  },

  // 3. Slivers inside CustomScrollView
  {
    id: 'slivers-in-custom-scroll-view',
    name: 'Slivers inside CustomScrollView',
    description: 'Verifies that Sliver widgets are children of CustomScrollView.',
    check: (node, parent, diagnostics) => {
      if (node.widget.startsWith('Sliver') && node.widget !== 'SliverAppBar') {
        if (!parent || parent.widget !== 'CustomScrollView') {
          diagnostics.push({
            id: `diag_${Math.random().toString(36).substring(2, 9)}`,
            severity: 'ERROR',
            rule: 'slivers-in-custom-scroll-view',
            message: `Sliver widget "${node.widget}" is inside "${parent?.widget || 'root'}", but slivers must be direct children of CustomScrollView.`,
            nodeId: node.id,
            nodeName: node.name,
            recommendation: 'Change the parent container to @flutter:CustomScrollView.'
          });
        }
      }
    }
  },

  // 4. Custom Widget Import Check
  {
    id: 'custom-widget-import',
    name: 'Custom Widget Import Path',
    description: 'Checks if custom widgets have a valid import path registered.',
    check: (node, _parent, diagnostics) => {
      if (node.isCustom && !node.import) {
        diagnostics.push({
          id: `diag_${Math.random().toString(36).substring(2, 9)}`,
          severity: 'WARNING',
          rule: 'custom-widget-import',
          message: `Custom widget "${node.widget}" does not have an import path configured.`,
          nodeId: node.id,
          nodeName: node.name,
          recommendation: 'Register this widget in the Custom Widget Registry with package and import path.'
        });
      }
    }
  },

  // 5. Navigation Destination Route Check
  {
    id: 'navigation-destination-route',
    name: 'Navigation Destination Route',
    description: 'Checks if navigation destinations have explicit or inferred routes.',
    check: (node, _parent, diagnostics) => {
      if (node.type === 'navigation' && Array.isArray(node.properties?.destinations)) {
        node.properties.destinations.forEach((dest: any) => {
          if (!dest.route) {
            diagnostics.push({
              id: `diag_${Math.random().toString(36).substring(2, 9)}`,
              severity: 'WARNING',
              rule: 'navigation-destination-route',
              message: `Navigation destination "${dest.label}" has no route path.`,
              nodeId: node.id,
              nodeName: node.name,
              recommendation: 'Specify route: "/path" in tag args or plugin metadata.'
            });
          }
        });
      }
    }
  }
];
