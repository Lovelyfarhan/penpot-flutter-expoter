/**
 * Spacing and Radius Token Extractor for Penpot Flutter Design Compiler.
 */

import { ScannedShape } from '../scanner/types';

export class SpacingTokens {
  public static extractSpacing(shapes: ScannedShape[]): Record<string, number> {
    const spaces = new Set<number>([4, 8, 12, 16, 20, 24, 32, 40, 48]);

    const traverse = (shape: ScannedShape) => {
      if (shape.flex?.gap) spaces.add(shape.flex.gap);
      if (shape.grid?.columnGap) spaces.add(shape.grid.columnGap);
      if (shape.grid?.rowGap) spaces.add(shape.grid.rowGap);

      for (const child of shape.children) {
        traverse(child);
      }
    };

    shapes.forEach(traverse);

    const sorted = Array.from(spaces).sort((a, b) => a - b);
    const result: Record<string, number> = {};
    sorted.forEach(val => {
      result[`space_${val}`] = val;
    });

    return result;
  }

  public static extractRadius(shapes: ScannedShape[]): Record<string, number> {
    const radii = new Set<number>([4, 8, 12, 16, 24]);

    const traverse = (shape: ScannedShape) => {
      if (shape.borderRadius) {
        if (shape.borderRadius.topLeft > 0) radii.add(shape.borderRadius.topLeft);
      }
      for (const child of shape.children) {
        traverse(child);
      }
    };

    shapes.forEach(traverse);

    const sorted = Array.from(radii).sort((a, b) => a - b);
    const result: Record<string, number> = {};
    sorted.forEach(val => {
      result[`radius_${val}`] = val;
    });

    return result;
  }
}
