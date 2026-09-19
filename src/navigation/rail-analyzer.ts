/**
 * Navigation Rail Analyzer for Penpot Flutter Design Compiler.
 * Analyzes NavigationRail (typically for tablets or desktop layouts).
 */

import { ScannedShape } from '../scanner/types';
import { NavigationDestinationData, NavbarAnalyzer } from './navbar-analyzer';

export interface NavigationRailAnalysis {
  type: 'navigation_rail';
  widget: string;
  selectedIndex: number;
  destinations: NavigationDestinationData[];
  extended: boolean;
  minWidth?: number;
  minExtendedWidth?: number;
  labelType: 'NavigationRailLabelType.none' | 'NavigationRailLabelType.selected' | 'NavigationRailLabelType.all';
}

export class RailAnalyzer {
  public static analyze(shape: ScannedShape, tagArgs?: Record<string, any>): NavigationRailAnalysis {
    const navbarAnalysis = NavbarAnalyzer.analyze(shape, tagArgs);

    const isExtended = Boolean(tagArgs?.extended || shape.bounds.width > 120);

    return {
      type: 'navigation_rail',
      widget: 'NavigationRail',
      selectedIndex: navbarAnalysis.selectedIndex,
      destinations: navbarAnalysis.destinations,
      extended: isExtended,
      minWidth: 72,
      minExtendedWidth: 200,
      labelType: isExtended ? 'NavigationRailLabelType.all' : 'NavigationRailLabelType.selected'
    };
  }
}
