/**
 * AST Builder for Penpot Flutter Design Compiler.
 * Compiles scanned shape hierarchies and layout analyses into the unified Flutter Design AST.
 */

import { ScannedShape } from '../scanner/types';
import { FlutterASTNode, FlutterDesignAST } from './flutter-ast';
import { LayoutAnalyzer, ResolvedLayout } from '../layout/layout-analyzer';
import { PropertyParser } from '../parser/property-parser';
import { NavbarAnalyzer } from '../navigation/navbar-analyzer';
import { TabAnalyzer } from '../navigation/tab-analyzer';
import { CustomWidgetRegistry } from '../widgets/custom-widget-registry';

export class ASTBuilder {
  public static build(rootShape: ScannedShape, docName: string = 'Penpot Design'): FlutterDesignAST {
    let nodeCount = 0;

    const buildNode = (shape: ScannedShape, parentLayout?: ResolvedLayout): FlutterASTNode => {
      nodeCount++;
      const layout = LayoutAnalyzer.resolve(shape);

      // Extract box decoration
      const decoration = PropertyParser.extractBoxDecoration(
        shape.fills,
        shape.strokes,
        shape.shadows,
        shape.borderRadius
      ) || undefined;

      // Extract typography if text node
      if (shape.type === 'text' && shape.typography) {
        layout.properties.textStyle = PropertyParser.extractTextStyle(shape.typography);
        layout.properties.text = shape.textContent || '';
      }

      // If parent is Stack, extract relative Positioned coordinates
      let relativePosition: any = undefined;
      if (parentLayout?.widget === 'Stack') {
        relativePosition = PropertyParser.extractPositioned(shape.relativeBounds);
      }

      // Check specific widget categories
      let astType: FlutterASTNode['type'] = 'widget';
      let className = layout.widget;
      let importPath: string | undefined;
      let packageName: string | undefined;

      if (layout.category === 'navigation') {
        astType = 'navigation';
        if (['NavigationBar', 'MediaNavbar', 'BottomNavigationBar'].includes(layout.widget)) {
          const navData = NavbarAnalyzer.analyze(shape, layout.properties);
          layout.properties.destinations = navData.destinations;
          layout.properties.selectedIndex = navData.selectedIndex;
          className = navData.className || layout.widget;
          importPath = navData.import;
          packageName = navData.package;
        }
      } else if (layout.category === 'tab') {
        if (layout.widget === 'TabBar' || layout.widget === 'MediaTabBar') {
          const tabData = TabAnalyzer.analyzeTabBar(shape, layout.properties);
          layout.properties.tabs = tabData.tabs;
          layout.properties.isScrollable = tabData.isScrollable;
          className = tabData.className || layout.widget;
          importPath = tabData.import;
        } else if (layout.widget === 'TabBarView' || layout.widget === 'MediaTabView') {
          const tabViewData = TabAnalyzer.analyzeTabView(shape);
          layout.properties.pages = tabViewData.tabs;
          className = tabViewData.className || layout.widget;
          importPath = tabViewData.import;
        }
      } else if (layout.category === 'media') {
        astType = 'media_widget';
        importPath = `package:aniverz/widgets/${this.toSnakeCase(layout.widget)}.dart`;
        packageName = 'aniverz';
      } else if (layout.isCustom) {
        astType = 'custom_widget';
        const customDef = CustomWidgetRegistry.get(layout.widget);
        if (customDef) {
          className = customDef.className;
          importPath = customDef.import;
          packageName = customDef.package;
        }
      }

      // Recursively process children
      const children: FlutterASTNode[] = [];
      for (const child of shape.children) {
        children.push(buildNode(child, layout));
      }

      return {
        id: shape.id,
        name: shape.name,
        type: astType,
        widget: layout.widget,
        className,
        import: importPath,
        package: packageName,
        isCustom: layout.isCustom,
        prioritySource: layout.priorityDescription,
        properties: layout.properties,
        decoration: decoration as any,
        bounds: {
          x: Math.round(shape.bounds.x),
          y: Math.round(shape.bounds.y),
          width: Math.round(shape.bounds.width),
          height: Math.round(shape.bounds.height)
        },
        relativePosition,
        children
      } as FlutterASTNode;
    };

    const rootNode = buildNode(rootShape);

    return {
      version: '1.0.0',
      compiler: 'Penpot Flutter Design Compiler',
      metadata: {
        documentName: docName,
        scannedAt: new Date().toISOString(),
        totalNodes: nodeCount
      },
      root: rootNode
    };
  }

  private static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }
}
