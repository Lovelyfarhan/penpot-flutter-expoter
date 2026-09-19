/**
 * Hierarchy Scanner for Penpot Flutter Design Compiler.
 * Recursively scans Penpot shapes, normalizing hierarchy, computing relative
 * coordinates, bounding boxes, z-indices, styling, and layout data.
 */

import { ScannedShape, Rect2D, ColorFill, StrokeStyle, ShadowEffect, TypographyStyle } from './types';

export class HierarchyScanner {
  /**
   * Recursively normalizes a raw Penpot shape or mock shape into a clean ScannedShape.
   */
  public static scanShape(
    raw: any,
    parentBounds?: Rect2D,
    zIndex: number = 0
  ): ScannedShape {
    const bounds: Rect2D = {
      x: typeof raw.x === 'number' ? raw.x : 0,
      y: typeof raw.y === 'number' ? raw.y : 0,
      width: typeof raw.width === 'number' ? raw.width : 0,
      height: typeof raw.height === 'number' ? raw.height : 0
    };

    // Calculate bounds relative to parent
    const relativeBounds: Rect2D = {
      x: parentBounds ? bounds.x - parentBounds.x : bounds.x,
      y: parentBounds ? bounds.y - parentBounds.y : bounds.y,
      width: bounds.width,
      height: bounds.height
    };

    // Extract fills
    const fills: ColorFill[] = this.extractFills(raw);

    // Extract strokes
    const strokes: StrokeStyle[] = this.extractStrokes(raw);

    // Extract shadows
    const shadows: ShadowEffect[] = this.extractShadows(raw);

    // Extract border radius
    const borderRadius = this.extractBorderRadius(raw);

    // Extract typography
    const typography = this.extractTypography(raw);

    // Extract layout data
    const flex = this.extractFlexData(raw);
    const grid = this.extractGridData(raw);
    const layoutMode = flex ? 'flex' : grid ? 'grid' : 'none';

    // Extract layout child data
    const layoutChild = this.extractLayoutChild(raw);

    // Extract plugin metadata
    const pluginMetadata = this.extractPluginMetadata(raw);

    // Recursively scan children
    const children: ScannedShape[] = [];
    if (Array.isArray(raw.children)) {
      raw.children.forEach((child: any, idx: number) => {
        children.push(this.scanShape(child, bounds, idx));
      });
    }

    return {
      id: raw.id || `shape_${Math.random().toString(36).substring(2, 9)}`,
      name: raw.name || 'Unnamed',
      type: raw.type || 'rect',
      bounds,
      parentBounds,
      relativeBounds,
      rotation: raw.rotation || 0,
      opacity: typeof raw.opacity === 'number' ? raw.opacity : 1,
      visible: raw.visible !== false,
      zIndex,
      fills,
      strokes,
      shadows,
      borderRadius,
      textContent: raw.characters || raw.text || raw.textContent || undefined,
      typography,
      layoutMode,
      flex,
      grid,
      layoutChild,
      componentId: raw.componentId || raw.component?.id,
      componentName: raw.componentName || raw.component?.name,
      isComponentMaster: Boolean(raw.isComponentMaster || raw.isMaster),
      isComponentInstance: Boolean(raw.isComponentInstance || raw.componentId),
      variantProperties: raw.variantProperties || undefined,
      instanceOverrides: raw.instanceOverrides || undefined,
      pluginMetadata,
      customAttributes: raw.customAttributes || undefined,
      parentId: raw.parentId,
      children
    };
  }

  private static extractFills(raw: any): ColorFill[] {
    const result: ColorFill[] = [];
    const fills = raw.fills || raw.fill;
    if (!fills) return result;

    const list = Array.isArray(fills) ? fills : [fills];
    for (const f of list) {
      if (typeof f === 'string') {
        result.push({ type: 'solid', color: f });
      } else if (typeof f === 'object' && f !== null) {
        if (f.fillColor || f.color) {
          result.push({
            type: f.type || 'solid',
            color: f.fillColor || f.color,
            opacity: typeof f.fillOpacity === 'number' ? f.fillOpacity : f.opacity
          });
        } else if (f.type === 'gradient-linear' || f.type === 'gradient-radial') {
          result.push({
            type: f.type,
            gradientStops: f.stops || f.gradientStops
          });
        } else if (f.type === 'image') {
          result.push({
            type: 'image',
            imageUrl: f.imageUrl || f.url
          });
        }
      }
    }
    return result;
  }

  private static extractStrokes(raw: any): StrokeStyle[] {
    const result: StrokeStyle[] = [];
    const strokes = raw.strokes || raw.stroke;
    if (!strokes) return result;

    const list = Array.isArray(strokes) ? strokes : [strokes];
    for (const s of list) {
      if (typeof s === 'object' && s !== null && (s.strokeColor || s.color)) {
        result.push({
          color: s.strokeColor || s.color,
          width: typeof s.strokeWidth === 'number' ? s.strokeWidth : (s.width || 1),
          style: s.strokeStyle || s.style || 'solid',
          alignment: s.strokeAlignment || s.alignment || 'inner',
          opacity: typeof s.strokeOpacity === 'number' ? s.strokeOpacity : s.opacity
        });
      }
    }
    return result;
  }

  private static extractShadows(raw: any): ShadowEffect[] {
    const result: ShadowEffect[] = [];
    const shadows = raw.shadows || raw.shadow || raw.effects;
    if (!shadows) return result;

    const list = Array.isArray(shadows) ? shadows : [shadows];
    for (const s of list) {
      if (typeof s === 'object' && s !== null && (s.type === 'drop-shadow' || s.type === 'inner-shadow' || s.offsetX !== undefined)) {
        result.push({
          type: s.type || 'drop-shadow',
          offsetX: s.offsetX || s.x || 0,
          offsetY: s.offsetY || s.y || 0,
          blur: s.blur || s.blurRadius || 0,
          spread: s.spread || s.spreadRadius || 0,
          color: s.color || '#00000033'
        });
      }
    }
    return result;
  }

  private static extractBorderRadius(raw: any): { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number } | undefined {
    if (typeof raw.borderRadius === 'number') {
      const r = raw.borderRadius;
      return { topLeft: r, topRight: r, bottomRight: r, bottomLeft: r };
    }
    if (typeof raw.borderRadius === 'object' && raw.borderRadius !== null) {
      return {
        topLeft: raw.borderRadius.topLeft || raw.borderRadius.tl || 0,
        topRight: raw.borderRadius.topRight || raw.borderRadius.tr || 0,
        bottomRight: raw.borderRadius.bottomRight || raw.borderRadius.br || 0,
        bottomLeft: raw.borderRadius.bottomLeft || raw.borderRadius.bl || 0
      };
    }
    return undefined;
  }

  private static extractTypography(raw: any): TypographyStyle | undefined {
    if (raw.type !== 'text' && !raw.fontFamily && !raw.fontSize) return undefined;

    return {
      fontFamily: raw.fontFamily || 'Inter',
      fontSize: typeof raw.fontSize === 'number' ? raw.fontSize : 14,
      fontWeight: raw.fontWeight || 400,
      fontStyle: raw.fontStyle || 'normal',
      lineHeight: raw.lineHeight,
      letterSpacing: raw.letterSpacing,
      textAlign: raw.textAlign || 'left',
      textDecoration: raw.textDecoration || 'none',
      color: raw.fontColor || raw.color
    };
  }

  private static extractFlexData(raw: any): any {
    const f = raw.flex || raw.flexLayout;
    if (!f) return undefined;

    return {
      direction: f.dir === 'row' || f.direction === 'row' ? 'row' : 'column',
      wrap: Boolean(f.wrap),
      justifyContent: f.justifyContent || f.justify || 'flex-start',
      alignItems: f.alignItems || f.align || 'flex-start',
      gap: typeof f.gap === 'number' ? f.gap : (f.rowGap || f.columnGap || 0),
      rowGap: f.rowGap,
      columnGap: f.columnGap,
      padding: f.padding ? {
        top: f.padding.top || 0,
        right: f.padding.right || 0,
        bottom: f.padding.bottom || 0,
        left: f.padding.left || 0
      } : undefined
    };
  }

  private static extractGridData(raw: any): any {
    const g = raw.grid || raw.gridLayout;
    if (!g) return undefined;

    return {
      columnCount: typeof g.columnCount === 'number' ? g.columnCount : (Array.isArray(g.columns) ? g.columns.length : 2),
      rowCount: typeof g.rowCount === 'number' ? g.rowCount : (Array.isArray(g.rows) ? g.rows.length : 2),
      columnGap: g.columnGap || g.gapX || g.gap || 0,
      rowGap: g.rowGap || g.gapY || g.gap || 0,
      columns: Array.isArray(g.columns) ? g.columns : undefined,
      rows: Array.isArray(g.rows) ? g.rows : undefined,
      padding: g.padding ? {
        top: g.padding.top || 0,
        right: g.padding.right || 0,
        bottom: g.padding.bottom || 0,
        left: g.padding.left || 0
      } : undefined
    };
  }

  private static extractLayoutChild(raw: any): any {
    const lc = raw.layoutChild || raw.layoutChildProperties;
    if (!lc) return undefined;

    return {
      flexGrow: lc.flexGrow || lc.grow,
      flexShrink: lc.flexShrink || lc.shrink,
      flexBasis: lc.flexBasis || lc.basis,
      alignSelf: lc.alignSelf,
      gridColumnSpan: lc.gridColumnSpan || lc.columnSpan,
      gridRowSpan: lc.gridRowSpan || lc.rowSpan
    };
  }

  private static extractPluginMetadata(raw: any): Record<string, unknown> | undefined {
    if (typeof raw.getPluginData === 'function') {
      try {
        const rawData = raw.getPluginData('penpot_flutter_compiler');
        if (rawData) {
          return typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        }
      } catch {
        // ignore
      }
    }
    return raw.pluginMetadata || raw.pluginData || undefined;
  }
}
