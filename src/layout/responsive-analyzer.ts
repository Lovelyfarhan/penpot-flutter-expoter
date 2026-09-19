/**
 * Responsive Layout Analyzer for Penpot Flutter Design Compiler.
 * Analyzes multi-screen breakpoints (mobile, tablet, desktop, wideDesktop)
 * and preserves responsive rules rather than flattening to static pixels.
 */

import { ScannedShape } from '../scanner/types';

export type BreakpointCategory = 'mobile' | 'tablet' | 'desktop' | 'wideDesktop';

export interface ResponsiveBreakpointRule {
  breakpoint: BreakpointCategory;
  minWidth: number;
  maxWidth?: number;
}

export const BREAKPOINT_CONFIGS: Record<BreakpointCategory, ResponsiveBreakpointRule> = {
  mobile: { breakpoint: 'mobile', minWidth: 0, maxWidth: 599 },
  tablet: { breakpoint: 'tablet', minWidth: 600, maxWidth: 1023 },
  desktop: { breakpoint: 'desktop', minWidth: 1024, maxWidth: 1439 },
  wideDesktop: { breakpoint: 'wideDesktop', minWidth: 1440 }
};

export interface ResponsiveNavigationRule {
  mobile: string; // e.g. NavigationBar
  tablet: string; // e.g. NavigationRail
  desktop: string; // e.g. CustomSidebar
}

export class ResponsiveAnalyzer {
  /**
   * Classifies a board into a responsive breakpoint based on width or explicit naming.
   */
  public static classifyBreakpoint(board: ScannedShape): BreakpointCategory {
    const name = board.name.toLowerCase();
    if (name.includes('mobile') || name.includes('phone')) return 'mobile';
    if (name.includes('tablet') || name.includes('ipad')) return 'tablet';
    if (name.includes('wide') || name.includes('4k') || name.includes('tv')) return 'wideDesktop';
    if (name.includes('desktop') || name.includes('web') || name.includes('laptop')) return 'desktop';

    const width = board.bounds.width;
    if (width < 600) return 'mobile';
    if (width < 1024) return 'tablet';
    if (width < 1440) return 'desktop';
    return 'wideDesktop';
  }

  /**
   * Generates responsive navigation configuration mapping across breakpoints.
   */
  public static generateResponsiveNavigation(detectedNavs: { [key in BreakpointCategory]?: string }): ResponsiveNavigationRule {
    return {
      mobile: detectedNavs.mobile || 'NavigationBar',
      tablet: detectedNavs.tablet || 'NavigationRail',
      desktop: detectedNavs.desktop || detectedNavs.wideDesktop || 'CustomSidebar'
    };
  }
}
