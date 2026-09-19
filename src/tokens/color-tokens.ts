/**
 * Color Token Extractor for Penpot Flutter Design Compiler.
 */

import { ScannedShape } from '../scanner/types';
import { PropertyParser } from '../parser/property-parser';

export class ColorTokens {
  public static extract(shapes: ScannedShape[]): Record<string, string> {
    const colors: Map<string, string> = new Map();

    const traverse = (shape: ScannedShape) => {
      for (const fill of shape.fills) {
        if (fill.type === 'solid' && fill.color) {
          const flutterColor = PropertyParser.toFlutterColor(fill.color, fill.opacity ?? 1);
          if (!colors.has(fill.color)) {
            colors.set(fill.color, flutterColor);
          }
        }
      }

      for (const stroke of shape.strokes) {
        if (stroke.color && !colors.has(stroke.color)) {
          colors.set(stroke.color, PropertyParser.toFlutterColor(stroke.color, stroke.opacity ?? 1));
        }
      }

      for (const child of shape.children) {
        traverse(child);
      }
    };

    shapes.forEach(traverse);

    const result: Record<string, string> = {};
    let idx = 1;
    colors.forEach(val => {
      result[`color_${idx++}`] = val;
    });

    return result;
  }
}
