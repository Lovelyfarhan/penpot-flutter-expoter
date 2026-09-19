/**
 * Flutter Material Widget Registry.
 */

import { FlutterWidgetRegistry, WidgetRegistryEntry } from './flutter-widget-registry';

export class MaterialRegistry {
  public static register(): void {
    const widgets: WidgetRegistryEntry[] = [
      // Navigation
      {
        name: 'Scaffold',
        category: 'navigation',
        source: 'flutter_material',
        library: 'material',
        import: 'package:flutter/material.dart',
        supportsChildren: true,
        childrenType: 'single',
        properties: [
          { name: 'appBar', type: 'widget' },
          { name: 'body', type: 'widget' },
          { name: 'bottomNavigationBar', type: 'widget' },
          { name: 'drawer', type: 'widget' },
          { name: 'floatingActionButton', type: 'widget' },
          { name: 'backgroundColor', type: 'color' }
        ],
        events: []
      },
      {
        name: 'NavigationBar',
        category: 'navigation',
        source: 'flutter_material',
        library: 'material',
        import: 'package:flutter/material.dart',
        supportsChildren: true,
        childrenType: 'multiple',
        properties: [
          { name: 'selectedIndex', type: 'number', defaultValue: 0 },
          { name: 'destinations', type: 'list', required: true },
          { name: 'backgroundColor', type: 'color' },
          { name: 'elevation', type: 'number' },
          { name: 'indicatorColor', type: 'color' },
          { name: 'height', type: 'number' }
        ],
        events: ['onDestinationSelected']
      },
      {
        name: 'NavigationDestination',
        category: 'navigation',
        source: 'flutter_material',
        library: 'material',
        import: 'package:flutter/material.dart',
        supportsChildren: false,
        properties: [
          { name: 'icon', type: 'widget', required: true },
          { name: 'selectedIcon', type: 'widget' },
          { name: 'label', type: 'string', required: true },
          { name: 'tooltip', type: 'string' }
        ],
        events: []
      },
      {
        name: 'NavigationRail',
        category: 'navigation',
        source: 'flutter_material',
        library: 'material',
        import: 'package:flutter/material.dart',
        supportsChildren: true,
        childrenType: 'multiple',
        properties: [
          { name: 'selectedIndex', type: 'number', defaultValue: 0 },
          { name: 'destinations', type: 'list', required: true },
          { name: 'extended', type: 'boolean', defaultValue: false },
          { name: 'minWidth', type: 'number' },
          { name: 'minExtendedWidth', type: 'number' },
          { name: 'leading', type: 'widget' },
          { name: 'trailing', type: 'widget' }
        ],
        events: ['onDestinationSelected']
      },
      {
        name: 'NavigationDrawer',
        category: 'navigation',
        source: 'flutter_material',
        library: 'material',
        import: 'package:flutter/material.dart',
        supportsChildren: true,
        childrenType: 'multiple',
        properties: [
          { name: 'selectedIndex', type: 'number', defaultValue: 0 },
          { name: 'children', type: 'list', required: true },
          { name: 'backgroundColor', type: 'color' },
          { name: 'elevation', type: 'number' }
        ],
        events: ['onDestinationSelected']
      },
      {
        name: 'Drawer',
        category: 'navigation',
        source: 'flutter_material',
        library: 'material',
        import: 'package:flutter/material.dart',
        supportsChildren: true,
        childrenType: 'single',
        properties: [
          { name: 'child', type: 'widget' },
          { name: 'backgroundColor', type: 'color' },
          { name: 'elevation', type: 'number' },
          { name: 'width', type: 'number' }
        ],
        events: []
      },
      {
        name: 'BottomNavigationBar',
        category: 'navigation',
        source: 'flutter_material',
        library: 'material',
        import: 'package:flutter/material.dart',
        supportsChildren: true,
        childrenType: 'multiple',
        properties: [
          { name: 'currentIndex', type: 'number', defaultValue: 0 },
          { name: 'items', type: 'list', required: true },
          { name: 'backgroundColor', type: 'color' }
        ],
        events: ['onTap']
      },
      {
        name: 'AppBar',
        category: 'navigation',
        source: 'flutter_material',
        library: 'material',
        import: 'package:flutter/material.dart',
        supportsChildren: false,
        properties: [
          { name: 'title', type: 'widget' },
          { name: 'leading', type: 'widget' },
          { name: 'actions', type: 'list' },
          { name: 'bottom', type: 'widget' },
          { name: 'backgroundColor', type: 'color' },
          { name: 'elevation', type: 'number' },
          { name: 'centerTitle', type: 'boolean' }
        ],
        events: []
      },
      {
        name: 'SliverAppBar',
        category: 'navigation',
        source: 'flutter_material',
        library: 'material',
        import: 'package:flutter/material.dart',
        supportsChildren: false,
        properties: [
          { name: 'title', type: 'widget' },
          { name: 'expandedHeight', type: 'number' },
          { name: 'floating', type: 'boolean', defaultValue: false },
          { name: 'pinned', type: 'boolean', defaultValue: false },
          { name: 'snap', type: 'boolean', defaultValue: false },
          { name: 'flexibleSpace', type: 'widget' }
        ],
        events: []
      },

      // Tabs (Sections 22-26)
      {
        name: 'TabBar',
        category: 'tab',
        source: 'flutter_material',
        library: 'material',
        import: 'package:flutter/material.dart',
        supportsChildren: true,
        childrenType: 'multiple',
        properties: [
          { name: 'tabs', type: 'list', required: true },
          { name: 'isScrollable', type: 'boolean', defaultValue: false },
          { name: 'indicatorColor', type: 'color' },
          { name: 'indicatorWeight', type: 'number', defaultValue: 2 },
          { name: 'labelColor', type: 'color' },
          { name: 'unselectedLabelColor', type: 'color' }
        ],
        events: ['onTap']
      },
      {
        name: 'TabBarView',
        category: 'tab',
        source: 'flutter_material',
        library: 'material',
        import: 'package:flutter/material.dart',
        supportsChildren: true,
        childrenType: 'multiple',
        properties: [
          { name: 'children', type: 'list', required: true },
          { name: 'physics', type: 'enum' }
        ],
        events: []
      },
      {
        name: 'Tab',
        category: 'tab',
        source: 'flutter_material',
        library: 'material',
        import: 'package:flutter/material.dart',
        supportsChildren: false,
        properties: [
          { name: 'text', type: 'string' },
          { name: 'icon', type: 'widget' },
          { name: 'child', type: 'widget' }
        ],
        events: []
      },
      {
        name: 'DefaultTabController',
        category: 'tab',
        source: 'flutter_material',
        library: 'material',
        import: 'package:flutter/material.dart',
        supportsChildren: true,
        childrenType: 'single',
        properties: [
          { name: 'length', type: 'number', required: true },
          { name: 'initialIndex', type: 'number', defaultValue: 0 },
          { name: 'child', type: 'widget', required: true }
        ],
        events: []
      },

      // Buttons & Controls
      { name: 'FilledButton', category: 'input', source: 'flutter_material', library: 'material', import: 'package:flutter/material.dart', supportsChildren: true, childrenType: 'single', properties: [], events: ['onPressed'] },
      { name: 'ElevatedButton', category: 'input', source: 'flutter_material', library: 'material', import: 'package:flutter/material.dart', supportsChildren: true, childrenType: 'single', properties: [], events: ['onPressed'] },
      { name: 'TextButton', category: 'input', source: 'flutter_material', library: 'material', import: 'package:flutter/material.dart', supportsChildren: true, childrenType: 'single', properties: [], events: ['onPressed'] },
      { name: 'OutlinedButton', category: 'input', source: 'flutter_material', library: 'material', import: 'package:flutter/material.dart', supportsChildren: true, childrenType: 'single', properties: [], events: ['onPressed'] },
      { name: 'IconButton', category: 'input', source: 'flutter_material', library: 'material', import: 'package:flutter/material.dart', supportsChildren: false, properties: [], events: ['onPressed'] },
      { name: 'FloatingActionButton', category: 'input', source: 'flutter_material', library: 'material', import: 'package:flutter/material.dart', supportsChildren: true, childrenType: 'single', properties: [], events: ['onPressed'] },
      { name: 'Card', category: 'display', source: 'flutter_material', library: 'material', import: 'package:flutter/material.dart', supportsChildren: true, childrenType: 'single', properties: [], events: [] },
      { name: 'Chip', category: 'display', source: 'flutter_material', library: 'material', import: 'package:flutter/material.dart', supportsChildren: false, properties: [], events: [] },
      { name: 'ListTile', category: 'display', source: 'flutter_material', library: 'material', import: 'package:flutter/material.dart', supportsChildren: false, properties: [], events: ['onTap'] },
      { name: 'Badge', category: 'display', source: 'flutter_material', library: 'material', import: 'package:flutter/material.dart', supportsChildren: true, childrenType: 'single', properties: [], events: [] }
    ];

    widgets.forEach(w => FlutterWidgetRegistry.register(w));
  }
}
