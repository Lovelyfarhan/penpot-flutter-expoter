/**
 * Master Design Compiler for Penpot Flutter Design Compiler.
 * Orchestrates the full compilation pipeline from scanned shapes to export bundle.
 */

import { ScannedShape } from './scanner/types';
import { ASTBuilder } from './ast/ast-builder';
import { FlutterDesignAST } from './ast/flutter-ast';
import { Validator, ValidationReport } from './validation/validator';
import { NavigationAnalyzer, DocumentNavigationAnalysis } from './navigation/navigation-analyzer';
import { ComponentAnalyzer, ComponentDefinition, ComponentInstance } from './components/component-analyzer';
import { ThemeTokens, DesignTokensExport } from './tokens/theme-tokens';
import { AssetAnalyzer, AssetMetadata } from './assets/asset-analyzer';
import { BundleExporter, DesignExportBundle } from './export/bundle-exporter';
import { FlutterWidgetRegistry } from './widgets/flutter-widget-registry';
import { MaterialRegistry } from './widgets/material-registry';
import { CupertinoRegistry } from './widgets/cupertino-registry';
import { MediaWidgetRegistry } from './widgets/media-widget-registry';
import { CustomWidgetRegistry } from './widgets/custom-widget-registry';

export interface CompilationResult {
  ast: FlutterDesignAST;
  validation: ValidationReport;
  navigation: DocumentNavigationAnalysis;
  components: ComponentDefinition[];
  instances: ComponentInstance[];
  tokens: DesignTokensExport;
  assets: AssetMetadata[];
  bundle: DesignExportBundle;
}

export class DesignCompiler {
  private static initialized = false;

  public static initialize(): void {
    if (this.initialized) return;
    FlutterWidgetRegistry.initialize();
    MaterialRegistry.register();
    CupertinoRegistry.register();
    MediaWidgetRegistry.register();
    CustomWidgetRegistry.initialize();
    CustomWidgetRegistry.loadFromStorage();
    this.initialized = true;
  }

  public static compile(rootShape: ScannedShape, docName: string = 'Penpot Design'): CompilationResult {
    this.initialize();

    // 1. Build AST
    const ast = ASTBuilder.build(rootShape, docName);

    // 2. Validate AST
    const validation = Validator.validate(ast);

    // 3. Analyze Navigation & Tabs
    const navigation = NavigationAnalyzer.analyzeTree(rootShape);

    // 4. Analyze Components & Instances
    const { components, instances } = ComponentAnalyzer.analyze([rootShape]);

    // 5. Extract Design Tokens
    const tokens = ThemeTokens.extract([rootShape]);

    // 6. Extract Assets
    const assets = AssetAnalyzer.extract([rootShape]);

    // 7. Generate 9 Export Files
    const bundle = BundleExporter.createExportFiles({
      ast,
      nav: navigation,
      components,
      instances,
      tokens,
      assets
    });

    return {
      ast,
      validation,
      navigation,
      components,
      instances,
      tokens,
      assets,
      bundle
    };
  }
}
