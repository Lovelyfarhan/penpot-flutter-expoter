/**
 * Bundle Exporter for Penpot Flutter Design Compiler.
 * Orchestrates generation of all 9 export files and packages them into a ZIP bundle.
 */

import JSZip from 'jszip';
import { FlutterDesignAST } from '../ast/flutter-ast';
import { DocumentNavigationAnalysis } from '../navigation/navigation-analyzer';
import { ComponentDefinition, ComponentInstance } from '../components/component-analyzer';
import { DesignTokensExport } from '../tokens/theme-tokens';
import { AssetMetadata } from '../assets/asset-analyzer';
import { JsonExporter } from './json-exporter';
import { MarkdownExporter } from './markdown-exporter';
import { SchemaExporter } from './schema-exporter';

export interface DesignExportBundle {
  'design.json': string;
  'design.md': string;
  'widgets.json': string;
  'components.json': string;
  'navigation.json': string;
  'tabs.json': string;
  'tokens.json': string;
  'assets.json': string;
  'schema.json': string;
}

export class BundleExporter {
  public static createExportFiles(params: {
    ast: FlutterDesignAST;
    nav: DocumentNavigationAnalysis;
    components: ComponentDefinition[];
    instances: ComponentInstance[];
    tokens: DesignTokensExport;
    assets: AssetMetadata[];
  }): DesignExportBundle {
    const { ast, nav, components, instances, tokens, assets } = params;

    return {
      'design.json': JsonExporter.exportDesignJson(ast),
      'design.md': MarkdownExporter.export(ast, nav),
      'widgets.json': JsonExporter.exportWidgetsJson(),
      'components.json': JsonExporter.exportComponentsJson(components, instances),
      'navigation.json': JsonExporter.exportNavigationJson(nav),
      'tabs.json': JsonExporter.exportTabsJson(nav),
      'tokens.json': JsonExporter.exportTokensJson(tokens),
      'assets.json': JsonExporter.exportAssetsJson(assets),
      'schema.json': SchemaExporter.export()
    };
  }

  public static async createZip(bundle: DesignExportBundle): Promise<Blob> {
    const zip = new JSZip();
    const folder = zip.folder('flutter-design-export');

    for (const [filename, content] of Object.entries(bundle)) {
      if (folder) {
        folder.file(filename, content);
      } else {
        zip.file(filename, content);
      }
    }

    // Create empty assets directory
    if (folder) {
      folder.folder('assets');
    }

    return await zip.generateAsync({ type: 'blob' });
  }
}
