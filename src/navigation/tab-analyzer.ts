/**
 * Tab System Analyzer for Penpot Flutter Design Compiler.
 * First-class compiler subsystem analyzing TabBar, Tab, TabBarView, and cohesive
 * TabSystem bidirectional bindings.
 */

import { ScannedShape } from '../scanner/types';
import { TagParser } from '../parser/tag-parser';
import { CustomWidgetRegistry } from '../widgets/custom-widget-registry';

export interface TabItemData {
  id: string;
  label: string;
  icon?: string;
  selectedIcon?: string;
  badge?: string;
  tooltip?: string;
  contentId?: string;
  contentName?: string;
}

export interface TabBarAnalysis {
  type: 'tab_bar';
  widget: string; // TabBar, MediaTabBar, etc.
  isCustom: boolean;
  className?: string;
  import?: string;
  selectedIndex: number;
  isScrollable: boolean;
  tabs: TabItemData[];
}

export interface TabViewAnalysis {
  type: 'tab_view';
  widget: string; // TabBarView, MediaTabView, etc.
  isCustom: boolean;
  className?: string;
  import?: string;
  tabs: Array<{
    id: string;
    label: string;
    content: string;
    index: number;
  }>;
}

export interface TabSystemRelationship {
  id: string;
  controller: 'TabController' | 'DefaultTabController';
  tabBarId?: string;
  tabViewId?: string;
  tabBarWidget: string;
  tabViewWidget: string;
  tabs: TabItemData[];
}

export class TabAnalyzer {
  public static analyzeTabBar(shape: ScannedShape, tagArgs?: Record<string, any>): TabBarAnalysis {
    const tag = TagParser.parse(shape.name);
    const widgetName = tag?.widgetName || 'TabBar';
    const isCustom = tag?.isCustom || widgetName === 'MediaTabBar' || widgetName.startsWith('Custom');
    const customDef = isCustom ? CustomWidgetRegistry.get(widgetName) : undefined;

    const tabs: TabItemData[] = [];
    const selectedIndex = typeof tagArgs?.selectedIndex === 'number' ? tagArgs.selectedIndex : 0;
    const isScrollable = Boolean(tagArgs?.isScrollable || shape.flex?.wrap === false && shape.bounds.width > 360);

    // Scan children as Tab widgets
    if (shape.children.length > 0) {
      shape.children.forEach((child, idx) => {
        const tab = this.extractTabItem(child, idx);
        tabs.push(tab);
      });
    }

    if (tabs.length === 0) {
      // Default tabs if none found
      tabs.push(
        { id: 'tab_0', label: 'Overview', icon: 'Icons.info_outline' },
        { id: 'tab_1', label: 'Episodes', icon: 'Icons.list' },
        { id: 'tab_2', label: 'Reviews', icon: 'Icons.star_outline' }
      );
    }

    return {
      type: 'tab_bar',
      widget: widgetName,
      isCustom,
      className: customDef?.className || widgetName,
      import: customDef?.import,
      selectedIndex,
      isScrollable,
      tabs
    };
  }

  public static analyzeTabView(shape: ScannedShape, associatedTabBar?: TabBarAnalysis): TabViewAnalysis {
    const tag = TagParser.parse(shape.name);
    const widgetName = tag?.widgetName || 'TabBarView';
    const isCustom = tag?.isCustom || widgetName === 'MediaTabView' || widgetName.startsWith('Custom');
    const customDef = isCustom ? CustomWidgetRegistry.get(widgetName) : undefined;

    const pages: Array<{ id: string; label: string; content: string; index: number }> = [];

    shape.children.forEach((child, idx) => {
      const label = associatedTabBar?.tabs[idx]?.label || TagParser.cleanName(child.name) || `Page ${idx + 1}`;
      const id = associatedTabBar?.tabs[idx]?.id || `tab_${idx}`;
      pages.push({
        id,
        label,
        content: child.name,
        index: idx
      });
    });

    // If no children in TabBarView, match with TabBar
    if (pages.length === 0 && associatedTabBar) {
      associatedTabBar.tabs.forEach((t, idx) => {
        pages.push({
          id: t.id,
          label: t.label,
          content: `${t.label.toLowerCase()}_page`,
          index: idx
        });
      });
    }

    return {
      type: 'tab_view',
      widget: widgetName,
      isCustom,
      className: customDef?.className || widgetName,
      import: customDef?.import,
      tabs: pages
    };
  }

  public static linkTabSystem(
    tabBarShape: ScannedShape,
    tabViewShape?: ScannedShape,
    id: string = 'mediaTabSystem'
  ): TabSystemRelationship {
    const tabBarAnalysis = this.analyzeTabBar(tabBarShape);
    const tabViewAnalysis = tabViewShape ? this.analyzeTabView(tabViewShape, tabBarAnalysis) : undefined;

    // Link tabs
    const tabs: TabItemData[] = tabBarAnalysis.tabs.map((tab, idx) => {
      const page = tabViewAnalysis?.tabs[idx];
      return {
        ...tab,
        contentId: page?.id || tab.id,
        contentName: page?.content || `${tab.label.toLowerCase()}_content`
      };
    });

    return {
      id,
      controller: 'DefaultTabController',
      tabBarId: tabBarShape.id,
      tabViewId: tabViewShape?.id,
      tabBarWidget: tabBarAnalysis.widget,
      tabViewWidget: tabViewAnalysis?.widget || 'TabBarView',
      tabs
    };
  }

  private static extractTabItem(shape: ScannedShape, index: number): TabItemData {
    let label = TagParser.cleanName(shape.name) || `Tab ${index + 1}`;

    // Look for text child
    for (const c of shape.children) {
      if (c.type === 'text' && c.textContent) {
        label = c.textContent;
        break;
      }
    }

    const id = `tab_${label.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    return {
      id,
      label
    };
  }
}
