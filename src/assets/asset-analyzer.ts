/**
 * Asset Analyzer for Penpot Flutter Design Compiler.
 * Discovers and indexes images, SVGs, icons, and media files without inventing missing assets.
 */

import { ScannedShape } from '../scanner/types';

export interface AssetMetadata {
  id: string;
  name: string;
  type: 'image' | 'svg' | 'icon' | 'video' | 'illustration';
  format: 'png' | 'jpg' | 'webp' | 'svg' | 'mp4' | 'unknown';
  dimensions: {
    width: number;
    height: number;
  };
  source?: string;
  fit?: 'BoxFit.cover' | 'BoxFit.contain' | 'BoxFit.fill' | 'BoxFit.fitWidth' | 'BoxFit.fitHeight';
  shapeId: string;
}

export class AssetAnalyzer {
  public static extract(shapes: ScannedShape[]): AssetMetadata[] {
    const assets: AssetMetadata[] = [];

    const traverse = (shape: ScannedShape) => {
      // Check image fills
      for (const fill of shape.fills) {
        if (fill.type === 'image') {
          assets.push({
            id: `asset_${shape.id}`,
            name: shape.name,
            type: 'image',
            format: this.detectFormat(fill.imageUrl),
            dimensions: {
              width: Math.round(shape.bounds.width),
              height: Math.round(shape.bounds.height)
            },
            source: fill.imageUrl,
            fit: 'BoxFit.cover',
            shapeId: shape.id
          });
        }
      }

      // Check SVG or path shapes
      if (shape.type === 'svg' || shape.type === 'path') {
        const isIcon = shape.name.toLowerCase().includes('icon') || (shape.bounds.width <= 48 && shape.bounds.height <= 48);
        assets.push({
          id: `asset_${shape.id}`,
          name: shape.name,
          type: isIcon ? 'icon' : 'svg',
          format: 'svg',
          dimensions: {
            width: Math.round(shape.bounds.width),
            height: Math.round(shape.bounds.height)
          },
          shapeId: shape.id
        });
      }

      for (const child of shape.children) {
        traverse(child);
      }
    };

    shapes.forEach(traverse);

    return assets;
  }

  private static detectFormat(url?: string): 'png' | 'jpg' | 'webp' | 'svg' | 'mp4' | 'unknown' {
    if (!url) return 'png';
    const lower = url.toLowerCase();
    if (lower.endsWith('.svg')) return 'svg';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'jpg';
    if (lower.endsWith('.webp')) return 'webp';
    if (lower.endsWith('.mp4')) return 'mp4';
    if (lower.endsWith('.png')) return 'png';
    return 'png';
  }
}
