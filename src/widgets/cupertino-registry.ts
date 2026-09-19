/**
 * Flutter Cupertino Widget Registry.
 */

import { FlutterWidgetRegistry, WidgetRegistryEntry } from './flutter-widget-registry';

export class CupertinoRegistry {
  public static register(): void {
    const widgets: WidgetRegistryEntry[] = [
      {
        name: 'CupertinoPageScaffold',
        category: 'navigation',
        source: 'flutter_cupertino',
        library: 'cupertino',
        import: 'package:flutter/cupertino.dart',
        supportsChildren: true,
        childrenType: 'single',
        properties: [
          { name: 'navigationBar', type: 'widget' },
          { name: 'child', type: 'widget', required: true }
        ],
        events: []
      },
      {
        name: 'CupertinoTabScaffold',
        category: 'tab',
        source: 'flutter_cupertino',
        library: 'cupertino',
        import: 'package:flutter/cupertino.dart',
        supportsChildren: true,
        childrenType: 'single',
        properties: [
          { name: 'tabBar', type: 'widget', required: true },
          { name: 'tabBuilder', type: 'widget', required: true }
        ],
        events: []
      },
      {
        name: 'CupertinoTabBar',
        category: 'tab',
        source: 'flutter_cupertino',
        library: 'cupertino',
        import: 'package:flutter/cupertino.dart',
        supportsChildren: true,
        childrenType: 'multiple',
        properties: [
          { name: 'items', type: 'list', required: true },
          { name: 'currentIndex', type: 'number', defaultValue: 0 },
          { name: 'backgroundColor', type: 'color' },
          { name: 'activeColor', type: 'color' },
          { name: 'inactiveColor', type: 'color' }
        ],
        events: ['onTap']
      },
      {
        name: 'CupertinoNavigationBar',
        category: 'navigation',
        source: 'flutter_cupertino',
        library: 'cupertino',
        import: 'package:flutter/cupertino.dart',
        supportsChildren: false,
        properties: [
          { name: 'middle', type: 'widget' },
          { name: 'leading', type: 'widget' },
          { name: 'trailing', type: 'widget' },
          { name: 'backgroundColor', type: 'color' }
        ],
        events: []
      },
      {
        name: 'CupertinoButton',
        category: 'input',
        source: 'flutter_cupertino',
        library: 'cupertino',
        import: 'package:flutter/cupertino.dart',
        supportsChildren: true,
        childrenType: 'single',
        properties: [
          { name: 'child', type: 'widget', required: true },
          { name: 'color', type: 'color' },
          { name: 'disabledColor', type: 'color' }
        ],
        events: ['onPressed']
      }
    ];

    widgets.forEach(w => FlutterWidgetRegistry.register(w));
  }
}
