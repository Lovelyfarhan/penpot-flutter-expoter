/**
 * Route Analyzer for Penpot Flutter Design Compiler.
 * Extracts navigation routes, destination IDs, and deep links.
 */

export interface RouteDefinition {
  path: string;
  name?: string;
  destinationId?: string;
  deepLink?: string;
}

export class RouteAnalyzer {
  /**
   * Infers or extracts a route path from label or tag arguments.
   */
  public static extractRoute(label: string, explicitRoute?: string): RouteDefinition {
    if (explicitRoute) {
      const cleanPath = explicitRoute.startsWith('/') ? explicitRoute : `/${explicitRoute}`;
      return {
        path: cleanPath,
        name: explicitRoute.replace(/^\//, '') || 'root'
      };
    }

    // Infer deterministic route from label
    const sanitized = label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');

    return {
      path: `/${sanitized}`,
      name: sanitized,
      destinationId: sanitized
    };
  }
}
