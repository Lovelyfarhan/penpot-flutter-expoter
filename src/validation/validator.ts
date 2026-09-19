/**
 * Validation Engine for Penpot Flutter Design Compiler.
 * Traverses the Flutter Design AST and applies structural and semantic rules.
 */

import { FlutterASTNode, FlutterDesignAST } from '../ast/flutter-ast';
import { VALIDATION_RULES, ValidationDiagnostic } from './rules';

export interface ValidationReport {
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  diagnostics: ValidationDiagnostic[];
}

export class Validator {
  public static validate(ast: FlutterDesignAST): ValidationReport {
    const diagnostics: ValidationDiagnostic[] = [];

    // Check TabBar / TabBarView parity across AST
    this.checkTabSystemParity(ast.root, diagnostics);

    // Run rules recursively
    const traverse = (node: FlutterASTNode, parent: FlutterASTNode | null) => {
      for (const rule of VALIDATION_RULES) {
        rule.check(node, parent, diagnostics);
      }

      for (const child of node.children) {
        traverse(child, node);
      }
    };

    traverse(ast.root, null);

    const errorCount = diagnostics.filter(d => d.severity === 'ERROR').length;
    const warningCount = diagnostics.filter(d => d.severity === 'WARNING').length;
    const infoCount = diagnostics.filter(d => d.severity === 'INFO').length;

    return {
      isValid: errorCount === 0,
      errorCount,
      warningCount,
      infoCount,
      diagnostics
    };
  }

  private static checkTabSystemParity(root: FlutterASTNode, diagnostics: ValidationDiagnostic[]): void {
    let tabBarNode: FlutterASTNode | null = null;
    let tabViewNode: FlutterASTNode | null = null;

    const findTabs = (node: FlutterASTNode) => {
      if (node.widget === 'TabBar' || node.widget === 'MediaTabBar') {
        tabBarNode = node;
      }
      if (node.widget === 'TabBarView' || node.widget === 'MediaTabView') {
        tabViewNode = node;
      }
      for (const c of node.children) {
        findTabs(c);
      }
    };

    findTabs(root);

    if (tabBarNode && tabViewNode) {
      const tabCount = Array.isArray((tabBarNode as any).properties?.tabs)
        ? (tabBarNode as any).properties.tabs.length
        : (tabBarNode as any).children.length;

      const pageCount = Array.isArray((tabViewNode as any).properties?.pages)
        ? (tabViewNode as any).properties.pages.length
        : (tabViewNode as any).children.length;

      if (tabCount !== pageCount && tabCount > 0 && pageCount > 0) {
        diagnostics.push({
          id: `diag_tab_parity_${Math.random().toString(36).substring(2, 9)}`,
          severity: 'ERROR',
          rule: 'tab-bar-tab-view-parity',
          message: `@flutter:TabBarView contains ${pageCount} pages but its associated TabBar contains ${tabCount} tabs.`,
          nodeId: (tabViewNode as any).id,
          nodeName: (tabViewNode as any).name,
          recommendation: 'Ensure the number of Tab widgets in TabBar exactly matches the number of views in TabBarView.'
        });
      }
    }
  }
}
