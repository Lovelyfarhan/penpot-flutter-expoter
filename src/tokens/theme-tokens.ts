/**
 * Master Theme Tokens Extractor for Penpot Flutter Design Compiler.
 * Produces the complete tokens.json payload.
 */

import { ScannedShape } from '../scanner/types';
import { ColorTokens } from './color-tokens';
import { TypographyTokens } from './typography-tokens';
import { SpacingTokens } from './spacing-tokens';
import { BREAKPOINT_CONFIGS } from '../layout/responsive-analyzer';

export interface DesignTokensExport {
  colors: Record<string, string>;
  typography: Record<string, any>;
  spacing: Record<string, number>;
  radius: Record<string, number>;
  shadows: Record<string, any>;
  breakpoints: Record<string, any>;
}

export class ThemeTokens {
  public static extract(shapes: ScannedShape[]): DesignTokensExport {
    const colors = ColorTokens.extract(shapes);
    const typography = TypographyTokens.extract(shapes);
    const spacing = SpacingTokens.extractSpacing(shapes);
    const radius = SpacingTokens.extractRadius(shapes);

    // Extract shadows
    const shadows: Record<string, any> = {};
    shapes.forEach(shape => {
      if (shape.shadows && shape.shadows.length > 0) {
        shape.shadows.forEach((s, idx) => {
          shadows[`shadow_${idx + 1}`] = {
            offsetX: s.offsetX,
            offsetY: s.offsetY,
            blurRadius: s.blur,
            spreadRadius: s.spread,
            color: s.color
          };
        });
      }
    });

    return {
      colors,
      typography,
      spacing,
      radius,
      shadows,
      breakpoints: BREAKPOINT_CONFIGS
    };
  }
}
