/**
 * Semantic Tag Parser for Penpot Flutter Design Compiler.
 * Supports 8 namespaces and optional inline parameter lists.
 */

export type TagNamespace =
  | 'flutter'
  | 'material'
  | 'cupertino'
  | 'layout'
  | 'navigation'
  | 'tab'
  | 'custom'
  | 'media';

export interface ParsedTag {
  raw: string;
  namespace: TagNamespace;
  widgetName: string;
  category: TagNamespace;
  args: Record<string, string | number | boolean>;
  isCustom: boolean;
}

export class TagParser {
  // Matches:
  // @flutter:Widget
  // @flutter:namespace/Widget
  // @flutter:namespace/Widget(arg: val)
  // followed optionally by trailing text (e.g. @flutter:Row MainHeader)
  private static readonly TAG_REGEX = /@flutter(?::(?:([a-zA-Z0-9_\-]+)\/)?([a-zA-Z0-9_]+)(?:\(([^)]*)\))?)/i;
  private static readonly TAG_CLEAN_REGEX = /@flutter(?::(?:[a-zA-Z0-9_\-]+\/)?([a-zA-Z0-9_]+)(?:\([^)]*\))?)/gi;

  /**
   * Parses semantic tags from a shape's name or metadata string.
   */
  public static parse(input: string): ParsedTag | null {
    if (!input || typeof input !== 'string') return null;

    const match = input.match(this.TAG_REGEX);
    if (!match) return null;

    const raw = match[0];
    const explicitNamespace = match[1]?.toLowerCase();
    const rawWidget = match[2];
    const rawArgs = match[3];

    if (!rawWidget) return null;

    // Determine namespace and category
    let namespace: TagNamespace = 'flutter';
    if (explicitNamespace) {
      switch (explicitNamespace) {
        case 'material':
        case 'cupertino':
        case 'layout':
        case 'navigation':
        case 'tab':
        case 'custom':
        case 'media':
          namespace = explicitNamespace;
          break;
        default:
          namespace = 'custom';
      }
    } else {
      // Direct @flutter:WidgetName
      // Check if widget name itself implies a specific category
      if (this.isNavigationWidget(rawWidget)) {
        namespace = 'navigation';
      } else if (this.isTabWidget(rawWidget)) {
        namespace = 'tab';
      } else if (this.isMediaWidget(rawWidget)) {
        namespace = 'media';
      } else {
        namespace = 'flutter';
      }
    }

    const args = this.parseArgs(rawArgs);

    return {
      raw,
      namespace,
      widgetName: rawWidget,
      category: namespace,
      args,
      isCustom: namespace === 'custom' || namespace === 'media'
    };
  }

  /**
   * Checks if an input string contains any @flutter tag.
   */
  public static hasTag(input: string): boolean {
    return this.TAG_REGEX.test(input);
  }

  /**
   * Cleans a shape name by removing any @flutter tags.
   */
  public static cleanName(input: string): string {
    if (!input) return '';
    return input.replace(this.TAG_CLEAN_REGEX, '').trim();
  }

  private static parseArgs(rawArgs?: string): Record<string, string | number | boolean> {
    const result: Record<string, string | number | boolean> = {};
    if (!rawArgs || !rawArgs.trim()) return result;

    const pairs = rawArgs.split(',');
    for (const pair of pairs) {
      const parts = pair.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const valueStr = parts.slice(1).join(':').trim();

        if (valueStr === 'true') {
          result[key] = true;
        } else if (valueStr === 'false') {
          result[key] = false;
        } else if (!isNaN(Number(valueStr)) && valueStr !== '') {
          result[key] = Number(valueStr);
        } else {
          // Remove surrounding quotes if present
          result[key] = valueStr.replace(/^["']|["']$/g, '');
        }
      }
    }

    return result;
  }

  private static isNavigationWidget(widgetName: string): boolean {
    const navWidgets = [
      'NavigationBar',
      'NavigationDestination',
      'NavigationRail',
      'NavigationRailDestination',
      'NavigationDrawer',
      'NavigationDrawerDestination',
      'Drawer',
      'BottomNavigationBar',
      'AppBar',
      'SliverAppBar'
    ];
    return navWidgets.includes(widgetName);
  }

  private static isTabWidget(widgetName: string): boolean {
    const tabWidgets = [
      'TabBar',
      'TabBarView',
      'Tab',
      'DefaultTabController',
      'TabController'
    ];
    return tabWidgets.includes(widgetName);
  }

  private static isMediaWidget(widgetName: string): boolean {
    const mediaWidgets = [
      'MovieCard',
      'SeriesCard',
      'EpisodeCard',
      'AnimeCard',
      'SeasonCard',
      'HeroBanner',
      'HeroCarousel',
      'MediaCarousel',
      'MediaGrid',
      'MediaList',
      'MovieGrid',
      'SeriesGrid',
      'EpisodeGrid',
      'VideoPlayer',
      'VideoControls'
    ];
    return mediaWidgets.includes(widgetName);
  }
}
