/**
 * Metadata Parser for Penpot Flutter Design Compiler.
 * Extracts explicit plugin metadata stored in Penpot shapes.
 */

export interface ExplicitFlutterMetadata {
  widget?: string;
  category?: string;
  route?: string;
  routeName?: string;
  destinationId?: string;
  selectedIndex?: number;
  tabId?: string;
  tabLabel?: string;
  tabContentId?: string;
  isScrollable?: boolean;
  crossAxisCount?: number;
  columns?: number;
  importPath?: string;
  className?: string;
  packageName?: string;
  properties?: Record<string, unknown>;
  events?: string[];
  breakpoints?: Record<string, unknown>;
}

export class MetadataParser {
  private static readonly PLUGIN_METADATA_KEY = 'penpot_flutter_compiler';

  /**
   * Extracts metadata from shape's plugin data or custom attributes.
   */
  public static extract(
    pluginMetadata?: Record<string, unknown>,
    customAttributes?: Record<string, string>
  ): ExplicitFlutterMetadata | null {
    const result: ExplicitFlutterMetadata = {};
    let found = false;

    // Check plugin metadata directly
    if (pluginMetadata) {
      const data = (pluginMetadata[this.PLUGIN_METADATA_KEY] || pluginMetadata) as Record<string, unknown>;
      if (typeof data === 'object' && data !== null) {
        if (data.widget) { result.widget = String(data.widget); found = true; }
        if (data.category) { result.category = String(data.category); found = true; }
        if (data.route) { result.route = String(data.route); found = true; }
        if (data.routeName) { result.routeName = String(data.routeName); found = true; }
        if (data.destinationId) { result.destinationId = String(data.destinationId); found = true; }
        if (typeof data.selectedIndex === 'number') { result.selectedIndex = data.selectedIndex; found = true; }
        if (data.tabId) { result.tabId = String(data.tabId); found = true; }
        if (data.tabLabel) { result.tabLabel = String(data.tabLabel); found = true; }
        if (data.tabContentId) { result.tabContentId = String(data.tabContentId); found = true; }
        if (typeof data.isScrollable === 'boolean') { result.isScrollable = data.isScrollable; found = true; }
        if (typeof data.crossAxisCount === 'number') { result.crossAxisCount = data.crossAxisCount; found = true; }
        if (typeof data.columns === 'number') { result.columns = data.columns; found = true; }
        if (data.importPath) { result.importPath = String(data.importPath); found = true; }
        if (data.className) { result.className = String(data.className); found = true; }
        if (data.packageName) { result.packageName = String(data.packageName); found = true; }
        if (typeof data.properties === 'object' && data.properties !== null) {
          result.properties = data.properties as Record<string, unknown>;
          found = true;
        }
        if (Array.isArray(data.events)) { result.events = data.events.map(String); found = true; }
        if (typeof data.breakpoints === 'object' && data.breakpoints !== null) {
          result.breakpoints = data.breakpoints as Record<string, unknown>;
          found = true;
        }
      }
    }

    // Check custom attributes (data-* attributes if present)
    if (customAttributes) {
      for (const [key, value] of Object.entries(customAttributes)) {
        const lowerKey = key.toLowerCase();
        if (lowerKey === 'data-flutter-widget' || lowerKey === 'flutter-widget') {
          result.widget = value;
          found = true;
        } else if (lowerKey === 'data-route' || lowerKey === 'route') {
          result.route = value;
          found = true;
        } else if (lowerKey === 'data-tab-id' || lowerKey === 'tab-id') {
          result.tabId = value;
          found = true;
        } else if (lowerKey === 'data-tab-content' || lowerKey === 'tab-content') {
          result.tabContentId = value;
          found = true;
        }
      }
    }

    return found ? result : null;
  }
}
