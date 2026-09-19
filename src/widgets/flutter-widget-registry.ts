/**
 * Extensible Flutter Widget Registry.
 * Defines widget schemas, imports, categories, and validation rules.
 */

export type WidgetSourceType =
  | 'official_flutter'
  | 'flutter_material'
  | 'flutter_cupertino'
  | 'custom'
  | 'third_party'
  | 'semantic';

export interface WidgetPropertyDef {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'color' | 'widget' | 'list' | 'map' | 'enum';
  required?: boolean;
  defaultValue?: unknown;
  description?: string;
}

export interface WidgetRegistryEntry {
  name: string;
  className?: string;
  category: string; // layout, navigation, tab, input, display, media, custom
  source: WidgetSourceType;
  library?: string; // widgets, material, cupertino, or custom package
  import: string;
  package?: string;
  supportsChildren: boolean;
  childrenType?: 'single' | 'multiple' | 'slivers';
  properties: WidgetPropertyDef[];
  events: string[];
  validation?: string[];
  description?: string;
}

export class FlutterWidgetRegistry {
  private static registry: Map<string, WidgetRegistryEntry> = new Map();
  private static initialized: boolean = false;

  public static initialize(): void {
    if (this.initialized) return;
    this.registerCoreWidgets();
    this.initialized = true;
  }

  public static register(entry: WidgetRegistryEntry): void {
    this.registry.set(entry.name.toLowerCase(), entry);
    if (entry.className && entry.className !== entry.name) {
      this.registry.set(entry.className.toLowerCase(), entry);
    }
  }

  public static find(name: string): WidgetRegistryEntry | undefined {
    this.initialize();
    return this.registry.get(name.toLowerCase());
  }

  public static getAll(): WidgetRegistryEntry[] {
    this.initialize();
    return Array.from(new Set(this.registry.values()));
  }

  public static getByCategory(category: string): WidgetRegistryEntry[] {
    return this.getAll().filter(e => e.category.toLowerCase() === category.toLowerCase());
  }

  public static getBySource(source: WidgetSourceType): WidgetRegistryEntry[] {
    return this.getAll().filter(e => e.source === source);
  }

  private static registerCoreWidgets(): void {
    // 1. Core Box & Layout Widgets (Section 8)
    const coreBoxes = [
      { name: 'Container', supportsChildren: true, childrenType: 'single' },
      { name: 'Padding', supportsChildren: true, childrenType: 'single' },
      { name: 'SizedBox', supportsChildren: true, childrenType: 'single' },
      { name: 'ConstrainedBox', supportsChildren: true, childrenType: 'single' },
      { name: 'UnconstrainedBox', supportsChildren: true, childrenType: 'single' },
      { name: 'Center', supportsChildren: true, childrenType: 'single' },
      { name: 'Align', supportsChildren: true, childrenType: 'single' },
      { name: 'FractionallySizedBox', supportsChildren: true, childrenType: 'single' },
      { name: 'AspectRatio', supportsChildren: true, childrenType: 'single' },
      { name: 'FittedBox', supportsChildren: true, childrenType: 'single' },
      { name: 'LimitedBox', supportsChildren: true, childrenType: 'single' },
      { name: 'OverflowBox', supportsChildren: true, childrenType: 'single' },
      { name: 'SafeArea', supportsChildren: true, childrenType: 'single' },
      { name: 'DecoratedBox', supportsChildren: true, childrenType: 'single' },
      { name: 'ClipRect', supportsChildren: true, childrenType: 'single' },
      { name: 'ClipRRect', supportsChildren: true, childrenType: 'single' },
      { name: 'ClipOval', supportsChildren: true, childrenType: 'single' },
      { name: 'Transform', supportsChildren: true, childrenType: 'single' },
      { name: 'Opacity', supportsChildren: true, childrenType: 'single' },
      { name: 'Visibility', supportsChildren: true, childrenType: 'single' },
      { name: 'Offstage', supportsChildren: true, childrenType: 'single' },
      { name: 'ColoredBox', supportsChildren: true, childrenType: 'single' }
    ];

    coreBoxes.forEach(w => {
      this.register({
        name: w.name,
        category: 'layout',
        source: 'official_flutter',
        library: 'widgets',
        import: 'package:flutter/widgets.dart',
        supportsChildren: w.supportsChildren,
        childrenType: w.childrenType as any,
        properties: [],
        events: []
      });
    });

    // 2. Flex & Stack & Grid & List (Sections 9-15)
    const flexAndLists = [
      { name: 'Row', childrenType: 'multiple' },
      { name: 'Column', childrenType: 'multiple' },
      { name: 'Flex', childrenType: 'multiple' },
      { name: 'Expanded', childrenType: 'single' },
      { name: 'Flexible', childrenType: 'single' },
      { name: 'Spacer', childrenType: undefined },
      { name: 'Wrap', childrenType: 'multiple' },
      { name: 'Stack', childrenType: 'multiple' },
      { name: 'Positioned', childrenType: 'single' },
      { name: 'PositionedDirectional', childrenType: 'single' },
      { name: 'GridView', childrenType: 'multiple' },
      { name: 'ListView', childrenType: 'multiple' },
      { name: 'PageView', childrenType: 'multiple' },
      { name: 'CustomScrollView', childrenType: 'slivers' },
      { name: 'SliverList', childrenType: 'multiple' },
      { name: 'SliverFixedExtentList', childrenType: 'multiple' },
      { name: 'SliverGrid', childrenType: 'multiple' },
      { name: 'SliverPadding', childrenType: 'single' },
      { name: 'SliverToBoxAdapter', childrenType: 'single' },
      { name: 'SliverFillRemaining', childrenType: 'single' },
      { name: 'SliverFillViewport', childrenType: 'single' }
    ];

    flexAndLists.forEach(w => {
      this.register({
        name: w.name,
        category: 'layout',
        source: 'official_flutter',
        library: 'widgets',
        import: 'package:flutter/widgets.dart',
        supportsChildren: Boolean(w.childrenType),
        childrenType: w.childrenType as any,
        properties: [],
        events: []
      });
    });
  }
}
