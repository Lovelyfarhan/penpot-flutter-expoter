/**
 * Markdown Exporter for Penpot Flutter Design Compiler.
 * Generates human and AI readable design.md documentation from the compiled design.
 */

import { FlutterDesignAST, FlutterASTNode } from '../ast/flutter-ast';
import { DocumentNavigationAnalysis } from '../navigation/navigation-analyzer';

export class MarkdownExporter {
  public static export(ast: FlutterDesignAST, nav: DocumentNavigationAnalysis): string {
    const docName = ast.metadata.documentName || 'Penpot Flutter Design';
    const lines: string[] = [];

    lines.push(`# ${docName} - Flutter Design Specification`);
    lines.push('');
    lines.push(`> Generated deterministically by **Penpot Flutter Design Compiler**.`);
    lines.push(`> Total AST Nodes: ${ast.metadata.totalNodes} | Scanned: ${ast.metadata.scannedAt}`);
    lines.push('');

    // Navigation Section
    lines.push('## 1. Navigation Architecture');
    lines.push('');
    if (nav.navigationBars.length > 0) {
      const primaryNav = nav.navigationBars[0];
      lines.push(`### Primary Navigation Bar (${primaryNav.widget})`);
      lines.push(`- **Selected Index**: ${primaryNav.selectedIndex}`);
      lines.push(`- **Destinations**:`);
      primaryNav.destinations.forEach((d, idx) => {
        lines.push(`  ${idx + 1}. **${d.label}** (${d.route}) - Icon: \`${d.icon}\``);
      });
      lines.push('');
    }

    if (nav.navigationRails.length > 0) {
      const rail = nav.navigationRails[0];
      lines.push(`### Tablet Navigation Rail (${rail.widget})`);
      lines.push(`- Extended: ${rail.extended}`);
      lines.push(`- Destinations: ${rail.destinations.map(d => d.label).join(', ')}`);
      lines.push('');
    }

    // Tab System Section
    lines.push('## 2. Tab & TabView Systems');
    lines.push('');
    if (nav.tabSystems.length > 0) {
      nav.tabSystems.forEach((ts, idx) => {
        lines.push(`### Tab System ${idx + 1}: \`${ts.id}\``);
        lines.push(`- **Controller**: \`${ts.controller}\``);
        lines.push(`- **TabBar Widget**: \`${ts.tabBarWidget}\``);
        lines.push(`- **TabBarView Widget**: \`${ts.tabViewWidget}\``);
        lines.push(`- **Tabs & Content Mapping**:`);
        ts.tabs.forEach((t, tIdx) => {
          lines.push(`  - Tab ${tIdx}: **${t.label}** ➔ Content: \`${t.contentName || 'view_' + tIdx}\``);
        });
        lines.push('');
      });
    } else {
      lines.push('_No tab systems detected in this design._');
      lines.push('');
    }

    // Main Layout Tree Diagram
    lines.push('## 3. Flutter Widget Tree Hierarchy');
    lines.push('');
    lines.push('```text');
    this.renderTree(ast.root, lines, '', true);
    lines.push('```');
    lines.push('');

    // Code Generation Recommendations for Antigravity
    lines.push('## 4. Antigravity AI Implementation Directives');
    lines.push('');
    lines.push('1. **Root Scaffolding**: Build screen root as `' + ast.root.widget + '` preserving safe areas and navigation slots.');
    if (nav.tabSystems.length > 0) {
      lines.push('2. **Tab Controller**: Wrap TabBar and TabBarView in a `DefaultTabController(length: ' + nav.tabSystems[0].tabs.length + ', child: ...)` or use `SingleTickerProviderStateMixin` with `TabController`.');
    }
    lines.push('3. **Design Tokens**: Read `tokens.json` to configure Flutter `ThemeData` and custom color schemes.');
    lines.push('4. **Navigation**: Use routes defined in `navigation.json` to bind `go_router` or `Navigator` route tables.');
    lines.push('');

    return lines.join('\n');
  }

  private static renderTree(node: FlutterASTNode, lines: string[], prefix: string, isLast: boolean): void {
    const marker = isLast ? '└── ' : '├── ';
    let nodeDesc = `${node.widget} ("${node.name}")`;
    if (node.isCustom) {
      nodeDesc += ` [Custom: ${node.import || 'custom'}]`;
    }
    lines.push(prefix + marker + nodeDesc);

    const childPrefix = prefix + (isLast ? '    ' : '│   ');
    for (let i = 0; i < node.children.length; i++) {
      this.renderTree(node.children[i], lines, childPrefix, i === node.children.length - 1);
    }
  }
}
