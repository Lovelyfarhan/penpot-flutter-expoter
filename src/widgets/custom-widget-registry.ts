/**
 * User-defined Custom Widget Registry.
 * Allows developers and designers to register arbitrary Flutter widgets with
 * package names, imports, class names, categories, properties, and child support.
 */

import { FlutterWidgetRegistry, WidgetRegistryEntry, WidgetPropertyDef } from './flutter-widget-registry';

export interface CustomWidgetDefinition {
  name: string;
  className: string;
  package: string;
  import: string;
  category: string; // navigation, tab, layout, media, custom, display
  supportsChildren: boolean;
  childrenType?: 'single' | 'multiple';
  properties?: WidgetPropertyDef[];
  events?: string[];
  description?: string;
}

export class CustomWidgetRegistry {
  private static customWidgets: Map<string, CustomWidgetDefinition> = new Map();
  private static storageKey = 'penpot_flutter_custom_widgets';

  public static initialize(): void {
    // Pre-register well-known custom widgets like MediaNavbar, MediaTabBar, MediaTabView
    this.register({
      name: 'MediaNavbar',
      className: 'MediaNavbar',
      package: 'aniverz',
      import: 'package:aniverz/widgets/media_navbar.dart',
      category: 'navigation',
      supportsChildren: true,
      childrenType: 'multiple',
      properties: [
        { name: 'selectedIndex', type: 'number' },
        { name: 'destinations', type: 'list' },
        { name: 'onDestinationSelected', type: 'widget' }
      ],
      events: ['onDestinationSelected']
    });

    this.register({
      name: 'MediaTabView',
      className: 'MediaTabView',
      package: 'aniverz',
      import: 'package:aniverz/widgets/media_tab_view.dart',
      category: 'tab',
      supportsChildren: true,
      childrenType: 'multiple',
      properties: [
        { name: 'tabs', type: 'list' },
        { name: 'selectedIndex', type: 'number' }
      ],
      events: ['onTabChanged']
    });

    this.register({
      name: 'MediaTabBar',
      className: 'MediaTabBar',
      package: 'aniverz',
      import: 'package:aniverz/widgets/media_tab_bar.dart',
      category: 'tab',
      supportsChildren: true,
      childrenType: 'multiple',
      properties: [
        { name: 'tabs', type: 'list' },
        { name: 'selectedIndex', type: 'number' }
      ],
      events: ['onTabSelected']
    });

    this.register({
      name: 'CustomSidebar',
      className: 'CustomSidebar',
      package: 'aniverz',
      import: 'package:aniverz/widgets/custom_sidebar.dart',
      category: 'navigation',
      supportsChildren: true,
      childrenType: 'multiple',
      properties: [
        { name: 'destinations', type: 'list' }
      ],
      events: ['onDestinationSelected']
    });
  }

  public static register(def: CustomWidgetDefinition): void {
    this.customWidgets.set(def.name.toLowerCase(), def);

    // Register into the main FlutterWidgetRegistry
    const entry: WidgetRegistryEntry = {
      name: def.name,
      className: def.className,
      category: def.category,
      source: 'custom',
      package: def.package,
      import: def.import,
      supportsChildren: def.supportsChildren,
      childrenType: def.childrenType,
      properties: def.properties || [],
      events: def.events || [],
      description: def.description
    };
    FlutterWidgetRegistry.register(entry);
  }

  public static get(name: string): CustomWidgetDefinition | undefined {
    return this.customWidgets.get(name.toLowerCase());
  }

  public static getAll(): CustomWidgetDefinition[] {
    return Array.from(this.customWidgets.values());
  }

  public static remove(name: string): boolean {
    return this.customWidgets.delete(name.toLowerCase());
  }

  public static loadFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const list: CustomWidgetDefinition[] = JSON.parse(stored);
          list.forEach(def => this.register(def));
        }
      } catch {
        // ignore
      }
    }
  }

  public static saveToStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.getAll()));
      } catch {
        // ignore
      }
    }
  }
}
