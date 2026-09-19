/**
 * JSON Exporter for Penpot Flutter Design Compiler.
 * Produces structured JSON export files.
 */

import { FlutterDesignAST } from '../ast/flutter-ast';
import { DocumentNavigationAnalysis } from '../navigation/navigation-analyzer';
import { ComponentDefinition, ComponentInstance } from '../components/component-analyzer';
import { DesignTokensExport } from '../tokens/theme-tokens';
import { AssetMetadata } from '../assets/asset-analyzer';
import { FlutterWidgetRegistry } from '../widgets/flutter-widget-registry';

export class JsonExporter {
  public static exportDesignJson(ast: FlutterDesignAST): string {
    return JSON.stringify(ast, null, 2);
  }

  public static exportWidgetsJson(): string {
    const allWidgets = FlutterWidgetRegistry.getAll();
    return JSON.stringify({
      version: '1.0.0',
      totalWidgets: allWidgets.length,
      widgets: allWidgets
    }, null, 2);
  }

  public static exportComponentsJson(components: ComponentDefinition[], instances: ComponentInstance[]): string {
    return JSON.stringify({
      version: '1.0.0',
      totalComponents: components.length,
      totalInstances: instances.length,
      components,
      instances
    }, null, 2);
  }

  public static exportNavigationJson(nav: DocumentNavigationAnalysis): string {
    return JSON.stringify({
      version: '1.0.0',
      navigationBars: nav.navigationBars,
      navigationRails: nav.navigationRails,
      drawers: nav.drawers,
      responsiveNavigation: {
        mobile: nav.navigationBars[0]?.widget || 'NavigationBar',
        tablet: nav.navigationRails[0]?.widget || 'NavigationRail',
        desktop: 'CustomSidebar'
      }
    }, null, 2);
  }

  public static exportTabsJson(nav: DocumentNavigationAnalysis): string {
    return JSON.stringify({
      version: '1.0.0',
      totalTabSystems: nav.tabSystems.length,
      tabSystems: nav.tabSystems,
      tabBars: nav.tabBars,
      tabViews: nav.tabViews
    }, null, 2);
  }

  public static exportTokensJson(tokens: DesignTokensExport): string {
    return JSON.stringify({
      version: '1.0.0',
      ...tokens
    }, null, 2);
  }

  public static exportAssetsJson(assets: AssetMetadata[]): string {
    return JSON.stringify({
      version: '1.0.0',
      totalAssets: assets.length,
      assets
    }, null, 2);
  }
}
