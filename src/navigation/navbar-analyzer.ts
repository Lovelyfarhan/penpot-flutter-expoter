/**
 * Navigation Bar Analyzer for Penpot Flutter Design Compiler.
 * Analyzes standard Flutter NavigationBar, BottomNavigationBar, and custom navbars.
 */

import { ScannedShape } from '../scanner/types';
import { TagParser } from '../parser/tag-parser';
import { RouteAnalyzer } from './route-analyzer';
import { CustomWidgetRegistry } from '../widgets/custom-widget-registry';

export interface NavigationDestinationData {
  label: string;
  icon: string;
  selectedIcon?: string;
  route: string;
  routeName?: string;
  tooltip?: string;
  badge?: string;
  semanticLabel?: string;
}

export interface NavigationBarAnalysis {
  type: 'navigation_bar';
  widget: string; // NavigationBar, BottomNavigationBar, or custom class like MediaNavbar
  isCustom: boolean;
  className?: string;
  import?: string;
  package?: string;
  selectedIndex: number;
  destinations: NavigationDestinationData[];
  backgroundColor?: string;
  height?: number;
  indicatorColor?: string;
  labelBehavior?: string;
  elevation?: number;
}

export class NavbarAnalyzer {
  public static analyze(shape: ScannedShape, tagArgs?: Record<string, any>): NavigationBarAnalysis {
    const tag = TagParser.parse(shape.name);
    const widgetName = tag?.widgetName || 'NavigationBar';
    const isCustom = tag?.isCustom || widgetName === 'MediaNavbar' || widgetName.startsWith('Custom');

    let customDef = isCustom ? CustomWidgetRegistry.get(widgetName) : undefined;

    const destinations: NavigationDestinationData[] = [];
    let selectedIndex = typeof tagArgs?.selectedIndex === 'number' ? tagArgs.selectedIndex : 0;

    // Scan children to extract destination items
    if (shape.children.length > 0) {
      shape.children.forEach((child, idx) => {
        const dest = this.extractDestination(child, idx);
        destinations.push(dest);
      });
    }

    // If no children were direct destinations, create default destinations from name or args
    if (destinations.length === 0) {
      destinations.push(
        { label: 'Home', icon: 'Icons.home_outlined', selectedIcon: 'Icons.home', route: '/home' },
        { label: 'Movies', icon: 'Icons.movie_outlined', selectedIcon: 'Icons.movie', route: '/movies' },
        { label: 'Series', icon: 'Icons.tv_outlined', selectedIcon: 'Icons.tv', route: '/series' },
        { label: 'Downloads', icon: 'Icons.download_outlined', selectedIcon: 'Icons.download', route: '/downloads' },
        { label: 'Profile', icon: 'Icons.person_outline', selectedIcon: 'Icons.person', route: '/profile' }
      );
    }

    return {
      type: 'navigation_bar',
      widget: widgetName,
      isCustom,
      className: customDef?.className || widgetName,
      import: customDef?.import,
      package: customDef?.package,
      selectedIndex,
      destinations,
      height: shape.bounds.height > 0 ? shape.bounds.height : 80
    };
  }

  private static extractDestination(shape: ScannedShape, index: number): NavigationDestinationData {
    const tag = TagParser.parse(shape.name);
    const label = tag?.args?.label ? String(tag.args.label) : TagParser.cleanName(shape.name) || `Item ${index + 1}`;
    const explicitRoute = tag?.args?.route ? String(tag.args.route) : undefined;
    const route = RouteAnalyzer.extractRoute(label, explicitRoute);

    // Look for text child if present
    let finalLabel = label;
    for (const c of shape.children) {
      if (c.type === 'text' && c.textContent) {
        finalLabel = c.textContent;
        break;
      }
    }

    // Infer icon from label
    const icon = this.inferIcon(finalLabel);

    return {
      label: finalLabel,
      icon: icon.outline,
      selectedIcon: icon.filled,
      route: route.path,
      routeName: route.name,
      tooltip: finalLabel
    };
  }

  private static inferIcon(label: string): { outline: string; filled: string } {
    const l = label.toLowerCase();
    if (l.includes('home')) return { outline: 'Icons.home_outlined', filled: 'Icons.home' };
    if (l.includes('movie') || l.includes('film')) return { outline: 'Icons.movie_outlined', filled: 'Icons.movie' };
    if (l.includes('tv') || l.includes('series') || l.includes('show')) return { outline: 'Icons.tv_outlined', filled: 'Icons.tv' };
    if (l.includes('download')) return { outline: 'Icons.download_outlined', filled: 'Icons.download' };
    if (l.includes('search')) return { outline: 'Icons.search', filled: 'Icons.search' };
    if (l.includes('favorite') || l.includes('like')) return { outline: 'Icons.favorite_outline', filled: 'Icons.favorite' };
    if (l.includes('profile') || l.includes('user') || l.includes('account')) return { outline: 'Icons.person_outline', filled: 'Icons.person' };
    if (l.includes('setting')) return { outline: 'Icons.settings_outlined', filled: 'Icons.settings' };
    if (l.includes('explore')) return { outline: 'Icons.explore_outlined', filled: 'Icons.explore' };

    return { outline: 'Icons.circle_outlined', filled: 'Icons.circle' };
  }
}
