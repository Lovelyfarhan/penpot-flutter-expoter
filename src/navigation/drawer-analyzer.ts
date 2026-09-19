/**
 * Drawer & NavigationDrawer Analyzer for Penpot Flutter Design Compiler.
 */

import { ScannedShape } from '../scanner/types';
import { NavigationDestinationData, NavbarAnalyzer } from './navbar-analyzer';

export interface DrawerAnalysis {
  type: 'navigation_drawer' | 'drawer';
  widget: 'NavigationDrawer' | 'Drawer';
  selectedIndex: number;
  destinations: NavigationDestinationData[];
  width: number;
  elevation?: number;
}

export class DrawerAnalyzer {
  public static analyze(shape: ScannedShape, tagArgs?: Record<string, any>): DrawerAnalysis {
    const isNavigationDrawer = shape.name.includes('NavigationDrawer') || tagArgs?.widget === 'NavigationDrawer';
    const nav = NavbarAnalyzer.analyze(shape, tagArgs);

    return {
      type: isNavigationDrawer ? 'navigation_drawer' : 'drawer',
      widget: isNavigationDrawer ? 'NavigationDrawer' : 'Drawer',
      selectedIndex: nav.selectedIndex,
      destinations: nav.destinations,
      width: shape.bounds.width > 0 ? shape.bounds.width : 304
    };
  }
}
