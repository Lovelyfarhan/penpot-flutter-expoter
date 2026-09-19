/**
 * Penpot Scene Mock for Testing without a live Penpot browser session.
 */

import { ScannedShape } from '../../src/scanner/types';

export class PenpotMockBuilder {
  public static createShape(params: Partial<ScannedShape> & { name: string }): ScannedShape {
    return {
      id: params.id || `mock_${Math.random().toString(36).substring(2, 9)}`,
      name: params.name,
      type: params.type || 'rect',
      bounds: params.bounds || { x: 0, y: 0, width: 100, height: 100 },
      relativeBounds: params.relativeBounds || { x: 0, y: 0, width: 100, height: 100 },
      rotation: params.rotation || 0,
      opacity: params.opacity ?? 1,
      visible: params.visible ?? true,
      zIndex: params.zIndex || 0,
      fills: params.fills || [],
      strokes: params.strokes || [],
      shadows: params.shadows || [],
      borderRadius: params.borderRadius,
      textContent: params.textContent,
      typography: params.typography,
      layoutMode: params.layoutMode || 'none',
      flex: params.flex,
      grid: params.grid,
      layoutChild: params.layoutChild,
      componentId: params.componentId,
      componentName: params.componentName,
      isComponentMaster: params.isComponentMaster,
      isComponentInstance: params.isComponentInstance,
      variantProperties: params.variantProperties,
      instanceOverrides: params.instanceOverrides,
      pluginMetadata: params.pluginMetadata,
      customAttributes: params.customAttributes,
      parentId: params.parentId,
      children: params.children || []
    };
  }

  public static createFlexContainer(
    name: string,
    direction: 'row' | 'column',
    children: ScannedShape[],
    gap: number = 8
  ): ScannedShape {
    return this.createShape({
      name,
      type: 'frame',
      layoutMode: 'flex',
      flex: {
        direction,
        wrap: false,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        gap
      },
      children
    });
  }

  public static createGridContainer(
    name: string,
    columnCount: number,
    children: ScannedShape[],
    gap: number = 12
  ): ScannedShape {
    return this.createShape({
      name,
      type: 'frame',
      layoutMode: 'grid',
      grid: {
        columnCount,
        columnGap: gap,
        rowGap: gap
      },
      children
    });
  }
}
