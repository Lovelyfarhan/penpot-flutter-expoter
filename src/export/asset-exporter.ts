/**
 * Asset Exporter for Penpot Flutter Design Compiler.
 * Manages asset indexing and manifest generation.
 */

import { AssetMetadata } from '../assets/asset-analyzer';

export class AssetExporter {
  public static generateManifest(assets: AssetMetadata[]): string {
    const manifest = {
      assetsDir: 'assets/',
      flutterPubspecYamlSnippet: this.generatePubspecSnippet(assets),
      items: assets
    };
    return JSON.stringify(manifest, null, 2);
  }

  public static generatePubspecSnippet(assets: AssetMetadata[]): string {
    const lines = ['flutter:', '  assets:'];
    const paths = new Set<string>();

    for (const a of assets) {
      if (a.type === 'image') {
        paths.add('    - assets/images/');
      } else if (a.type === 'icon' || a.type === 'svg') {
        paths.add('    - assets/icons/');
      }
    }

    if (paths.size === 0) {
      paths.add('    - assets/');
    }

    paths.forEach(p => lines.push(p));
    return lines.join('\n');
  }
}
