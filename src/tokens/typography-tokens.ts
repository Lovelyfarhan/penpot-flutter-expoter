/**
 * Typography Token Extractor for Penpot Flutter Design Compiler.
 */

import { ScannedShape } from '../scanner/types';
import { PropertyParser, FlutterTextStyle } from '../parser/property-parser';

export class TypographyTokens {
  public static extract(shapes: ScannedShape[]): Record<string, FlutterTextStyle> {
    const textStyles: Map<string, FlutterTextStyle> = new Map();

    const traverse = (shape: ScannedShape) => {
      if (shape.type === 'text' && shape.typography) {
        const style = PropertyParser.extractTextStyle(shape.typography);
        if (style) {
          const key = `${style.fontFamily}_${style.fontSize}_${style.fontWeight.replace('FontWeight.', '')}`;
          if (!textStyles.has(key)) {
            textStyles.set(key, style);
          }
        }
      }

      for (const child of shape.children) {
        traverse(child);
      }
    };

    shapes.forEach(traverse);

    const result: Record<string, FlutterTextStyle> = {};
    let idx = 1;
    textStyles.forEach((val, key) => {
      result[`style_${idx++}_${key}`] = val;
    });

    return result;
  }
}
