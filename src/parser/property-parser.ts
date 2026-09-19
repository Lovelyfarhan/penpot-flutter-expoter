/**
 * Property Parser for Penpot Flutter Design Compiler.
 * Extracts design properties (colors, typography, borders, shadows, constraints)
 * and formats them into Flutter-compatible representations.
 */

import { ColorFill, StrokeStyle, ShadowEffect, TypographyStyle, Rect2D } from '../scanner/types';

export interface FlutterBoxDecoration {
  color?: string; // hex or Color(0xFF...)
  border?: {
    color: string;
    width: number;
    style: string;
  };
  borderRadius?: {
    topLeft: number;
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
    isUniform: boolean;
    uniformRadius: number;
  };
  boxShadow?: Array<{
    color: string;
    offset: { dx: number; dy: number };
    blurRadius: number;
    spreadRadius: number;
  }>;
  gradient?: {
    type: 'linear' | 'radial';
    colors: string[];
    stops?: number[];
    begin?: string;
    end?: string;
  };
}

export interface FlutterTextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string; // e.g. FontWeight.w600
  fontStyle?: string; // FontStyle.italic
  letterSpacing?: number;
  height?: number; // Line-height factor in Flutter
  color?: string;
  textAlign?: string; // TextAlign.center
  decoration?: string; // TextDecoration.underline
}

export class PropertyParser {
  /**
   * Converts a color string or hex to Flutter Color(0xAARRGGBB) hex format.
   */
  public static toFlutterColor(colorStr?: string, opacity: number = 1): string {
    if (!colorStr) return 'Colors.transparent';

    let hex = colorStr.trim();
    if (hex.startsWith('#')) {
      hex = hex.substring(1);
    }

    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }

    if (hex.length === 6) {
      const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, '0').toUpperCase();
      return `Color(0x${alphaHex}${hex.toUpperCase()})`;
    }

    if (hex.length === 8) {
      // RGBA or ARGB in Penpot is often RRGGBBAA
      const rr = hex.substring(0, 2);
      const gg = hex.substring(2, 4);
      const bb = hex.substring(4, 6);
      const aa = hex.substring(6, 8);
      const effectiveAlpha = Math.round((parseInt(aa, 16) / 255) * opacity * 255)
        .toString(16).padStart(2, '0').toUpperCase();
      return `Color(0x${effectiveAlpha}${rr.toUpperCase()}${gg.toUpperCase()}${bb.toUpperCase()})`;
    }

    return `Color(0xFF${hex.toUpperCase()})`;
  }

  /**
   * Extracts Flutter BoxDecoration from fills, strokes, shadows, and borderRadius.
   */
  public static extractBoxDecoration(
    fills: ColorFill[] = [],
    strokes: StrokeStyle[] = [],
    shadows: ShadowEffect[] = [],
    borderRadius?: { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number }
  ): FlutterBoxDecoration | null {
    const hasFill = fills.length > 0;
    const hasStroke = strokes.length > 0;
    const hasShadow = shadows.length > 0;
    const hasRadius = borderRadius && (
      borderRadius.topLeft > 0 ||
      borderRadius.topRight > 0 ||
      borderRadius.bottomRight > 0 ||
      borderRadius.bottomLeft > 0
    );

    if (!hasFill && !hasStroke && !hasShadow && !hasRadius) {
      return null;
    }

    const decoration: FlutterBoxDecoration = {};

    // Primary fill
    if (fills.length > 0) {
      const primaryFill = fills[0];
      if (primaryFill.type === 'solid' && primaryFill.color) {
        decoration.color = this.toFlutterColor(primaryFill.color, primaryFill.opacity ?? 1);
      } else if (primaryFill.type === 'gradient-linear' && primaryFill.gradientStops) {
        decoration.gradient = {
          type: 'linear',
          colors: primaryFill.gradientStops.map(s => this.toFlutterColor(s.color)),
          stops: primaryFill.gradientStops.map(s => s.offset)
        };
      } else if (primaryFill.type === 'gradient-radial' && primaryFill.gradientStops) {
        decoration.gradient = {
          type: 'radial',
          colors: primaryFill.gradientStops.map(s => this.toFlutterColor(s.color)),
          stops: primaryFill.gradientStops.map(s => s.offset)
        };
      }
    }

    // Border
    if (strokes.length > 0) {
      const primaryStroke = strokes[0];
      decoration.border = {
        color: this.toFlutterColor(primaryStroke.color, primaryStroke.opacity ?? 1),
        width: primaryStroke.width,
        style: primaryStroke.style
      };
    }

    // Border Radius
    if (hasRadius && borderRadius) {
      const isUniform =
        borderRadius.topLeft === borderRadius.topRight &&
        borderRadius.topLeft === borderRadius.bottomRight &&
        borderRadius.topLeft === borderRadius.bottomLeft;

      decoration.borderRadius = {
        ...borderRadius,
        isUniform,
        uniformRadius: borderRadius.topLeft
      };
    }

    // Shadows
    if (shadows.length > 0) {
      decoration.boxShadow = shadows.map(s => ({
        color: this.toFlutterColor(s.color),
        offset: { dx: s.offsetX, dy: s.offsetY },
        blurRadius: s.blur,
        spreadRadius: s.spread
      }));
    }

    return decoration;
  }

  /**
   * Converts typography properties to Flutter TextStyle.
   */
  public static extractTextStyle(style?: TypographyStyle): FlutterTextStyle | null {
    if (!style) return null;

    const weightMap: Record<string, string> = {
      '100': 'FontWeight.w100',
      '200': 'FontWeight.w200',
      '300': 'FontWeight.w300',
      '400': 'FontWeight.w400',
      'normal': 'FontWeight.normal',
      '500': 'FontWeight.w500',
      'medium': 'FontWeight.w500',
      '600': 'FontWeight.w600',
      'semibold': 'FontWeight.w600',
      '700': 'FontWeight.w700',
      'bold': 'FontWeight.bold',
      '800': 'FontWeight.w800',
      '900': 'FontWeight.w900'
    };

    const weightKey = String(style.fontWeight).toLowerCase();
    const fontWeight = weightMap[weightKey] || 'FontWeight.normal';

    const textStyle: FlutterTextStyle = {
      fontFamily: style.fontFamily || 'Inter',
      fontSize: style.fontSize || 14,
      fontWeight
    };

    if (style.fontStyle === 'italic') {
      textStyle.fontStyle = 'FontStyle.italic';
    }

    if (style.letterSpacing !== undefined && style.letterSpacing !== 0) {
      textStyle.letterSpacing = style.letterSpacing;
    }

    if (style.lineHeight !== undefined && style.fontSize > 0) {
      if (typeof style.lineHeight === 'number') {
        textStyle.height = Number((style.lineHeight / style.fontSize).toFixed(2));
      }
    }

    if (style.color) {
      textStyle.color = this.toFlutterColor(style.color);
    }

    if (style.textAlign) {
      textStyle.textAlign = `TextAlign.${style.textAlign}`;
    }

    if (style.textDecoration && style.textDecoration !== 'none') {
      textStyle.decoration = `TextDecoration.${style.textDecoration === 'underline' ? 'underline' : 'lineThrough'}`;
    }

    return textStyle;
  }

  /**
   * Extracts padding EdgeInsets.
   */
  public static extractPadding(padding?: { top: number; right: number; bottom: number; left: number }): string | null {
    if (!padding) return null;
    const { top, right, bottom, left } = padding;

    if (top === 0 && right === 0 && bottom === 0 && left === 0) return null;

    if (top === right && top === bottom && top === left) {
      return `EdgeInsets.all(${top})`;
    }

    if (top === bottom && right === left) {
      return `EdgeInsets.symmetric(vertical: ${top}, horizontal: ${right})`;
    }

    return `EdgeInsets.only(top: ${top}, right: ${right}, bottom: ${bottom}, left: ${left})`;
  }

  /**
   * Formats relative bounds to Flutter Positioned coordinates.
   */
  public static extractPositioned(relativeBounds: Rect2D): {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    width: number;
    height: number;
  } {
    return {
      top: Math.round(relativeBounds.y),
      left: Math.round(relativeBounds.x),
      width: Math.round(relativeBounds.width),
      height: Math.round(relativeBounds.height)
    };
  }
}
