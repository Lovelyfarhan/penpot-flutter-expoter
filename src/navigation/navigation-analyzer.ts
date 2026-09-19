/**
 * Master Navigation Analyzer for Penpot Flutter Design Compiler.
 * Discovers and collects application-level navigation (NavigationBar, Rails, Drawers)
 * and screen-level section tabs (TabBar, TabBarView, TabSystems).
 */

import { ScannedShape } from '../scanner/types';
import { TagParser } from '../parser/tag-parser';
import { NavbarAnalyzer, NavigationBarAnalysis } from './navbar-analyzer';
import { RailAnalyzer, NavigationRailAnalysis } from './rail-analyzer';
import { DrawerAnalyzer, DrawerAnalysis } from './drawer-analyzer';
import { TabAnalyzer, TabBarAnalysis, TabViewAnalysis, TabSystemRelationship } from './tab-analyzer';

export interface DocumentNavigationAnalysis {
  navigationBars: NavigationBarAnalysis[];
  navigationRails: NavigationRailAnalysis[];
  drawers: DrawerAnalysis[];
  tabBars: TabBarAnalysis[];
  tabViews: TabViewAnalysis[];
  tabSystems: TabSystemRelationship[];
  hasNavigation: boolean;
  hasTabs: boolean;
}

export class NavigationAnalyzer {
  public static analyzeTree(root: ScannedShape): DocumentNavigationAnalysis {
    const navigationBars: NavigationBarAnalysis[] = [];
    const navigationRails: NavigationRailAnalysis[] = [];
    const drawers: DrawerAnalysis[] = [];
    const tabBars: TabBarAnalysis[] = [];
    const tabViews: TabViewAnalysis[] = [];
    const tabSystems: TabSystemRelationship[] = [];

    // Collect candidates
    let pendingTabBarShape: ScannedShape | undefined;
    let pendingTabViewShape: ScannedShape | undefined;

    const traverse = (shape: ScannedShape) => {
      const tag = TagParser.parse(shape.name);
      const name = shape.name.toLowerCase();

      // NavigationBar / Custom Navbar
      if (
        tag?.widgetName === 'NavigationBar' ||
        tag?.widgetName === 'MediaNavbar' ||
        tag?.widgetName === 'BottomNavigationBar' ||
        name.includes('navbar') ||
        name.includes('navigationbar')
      ) {
        navigationBars.push(NavbarAnalyzer.analyze(shape, tag?.args));
      }

      // NavigationRail
      if (
        tag?.widgetName === 'NavigationRail' ||
        tag?.widgetName === 'CustomNavigationRail' ||
        name.includes('navigationrail')
      ) {
        navigationRails.push(RailAnalyzer.analyze(shape, tag?.args));
      }

      // Drawer / NavigationDrawer
      if (
        tag?.widgetName === 'Drawer' ||
        tag?.widgetName === 'NavigationDrawer' ||
        name.includes('drawer')
      ) {
        drawers.push(DrawerAnalyzer.analyze(shape, tag?.args));
      }

      // TabBarView / Custom TabView (check before TabBar)
      if (
        tag?.widgetName === 'TabBarView' ||
        tag?.widgetName === 'MediaTabView' ||
        (tag?.category === 'tab' && tag?.widgetName.includes('TabView')) ||
        name.includes('tabbarview') ||
        name.includes('tabview')
      ) {
        tabViews.push(TabAnalyzer.analyzeTabView(shape));
        pendingTabViewShape = shape;
      }
      // TabBar / Custom TabBar
      else if (
        tag?.widgetName === 'TabBar' ||
        tag?.widgetName === 'MediaTabBar' ||
        (tag?.category === 'tab' && tag?.widgetName.includes('TabBar')) ||
        name.includes('tabbar')
      ) {
        tabBars.push(TabAnalyzer.analyzeTabBar(shape, tag?.args));
        pendingTabBarShape = shape;
      }

      for (const child of shape.children) {
        traverse(child);
      }
    };

    traverse(root);

    // Pair TabBar and TabBarView into a TabSystem if both found
    if (pendingTabBarShape) {
      tabSystems.push(TabAnalyzer.linkTabSystem(pendingTabBarShape, pendingTabViewShape));
    }

    return {
      navigationBars,
      navigationRails,
      drawers,
      tabBars,
      tabViews,
      tabSystems,
      hasNavigation: navigationBars.length > 0 || navigationRails.length > 0 || drawers.length > 0,
      hasTabs: tabBars.length > 0 || tabViews.length > 0
    };
  }
}
