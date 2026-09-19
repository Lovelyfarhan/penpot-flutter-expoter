/**
 * Master Layout Analyzer for Penpot Flutter Design Compiler.
 * Orchestrates layout resolution using the strict 8-step semantic priority:
 * 1. Explicit plugin metadata
 * 2. Explicit Flutter semantic tag
 * 3. Explicit navigation/tab metadata
 * 4. Explicit layout metadata
 * 5. Component metadata
 * 6. Deterministic layout inference
 * 7. Generic Flutter representation
 * 8. Unresolved
 */

import { ScannedShape } from '../scanner/types';
import { TagParser, ParsedTag } from '../parser/tag-parser';
import { MetadataParser } from '../parser/metadata-parser';
import { FlexAnalyzer } from './flex-analyzer';
import { GridAnalyzer } from './grid-analyzer';
import { StackAnalyzer } from './stack-analyzer';
import { ListAnalyzer } from './list-analyzer';

export interface ResolvedLayout {
  widget: string;
  sourcePriority: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  priorityDescription: string;
  isCustom: boolean;
  category: string;
  properties: Record<string, any>;
  layoutType: 'box' | 'flex' | 'grid' | 'stack' | 'list' | 'sliver' | 'navigation' | 'tab' | 'custom' | 'media';
}

export class LayoutAnalyzer {
  public static resolve(shape: ScannedShape): ResolvedLayout {
    // 1. Explicit plugin metadata
    const metadata = MetadataParser.extract(shape.pluginMetadata, shape.customAttributes);
    if (metadata && metadata.widget) {
      return {
        widget: metadata.widget,
        sourcePriority: 1,
        priorityDescription: 'Explicit plugin metadata',
        isCustom: Boolean(metadata.importPath || metadata.className),
        category: metadata.category || 'custom',
        properties: metadata.properties || {},
        layoutType: 'custom'
      };
    }

    // 2. Explicit Flutter semantic tag in shape name
    const tag = TagParser.parse(shape.name);
    if (tag) {
      return this.resolveFromTag(tag, shape);
    }

    // 3. Explicit navigation/tab hints in naming
    const navOrTab = this.resolveNavigationOrTabHints(shape);
    if (navOrTab) {
      return navOrTab;
    }

    // 4. Explicit layout metadata / hints
    if (shape.layoutMode === 'grid') {
      const grid = GridAnalyzer.analyze(shape);
      if (grid) {
        return {
          widget: grid.widget,
          sourcePriority: 4,
          priorityDescription: 'Explicit grid layout metadata',
          isCustom: false,
          category: 'layout',
          properties: grid as any,
          layoutType: 'grid'
        };
      }
    }

    // 5. Component metadata
    if (shape.isComponentInstance && shape.componentName) {
      const compTag = TagParser.parse(shape.componentName);
      if (compTag) {
        return this.resolveFromTag(compTag, shape, 5, 'Component metadata tag');
      }
    }

    // 5b. Boards without explicit layout tag represent Scaffold
    if (shape.type === 'board') {
      return {
        widget: 'Scaffold',
        sourcePriority: 7,
        priorityDescription: 'Generic board representation',
        isCustom: false,
        category: 'navigation',
        properties: {},
        layoutType: 'navigation'
      };
    }

    // 6. Deterministic layout inference
    // 6a. Flex Layout
    if (shape.layoutMode === 'flex' && shape.flex) {
      const flex = FlexAnalyzer.analyze(shape);
      if (flex) {
        return {
          widget: flex.widget,
          sourcePriority: 6,
          priorityDescription: 'Deterministic flex layout inference',
          isCustom: false,
          category: 'layout',
          properties: flex as any,
          layoutType: flex.isWrap ? 'flex' : 'flex'
        };
      }
    }

    // 6b. Overlapping children -> Stack Layout
    const stack = StackAnalyzer.analyze(shape);
    if (stack) {
      return {
        widget: 'Stack',
        sourcePriority: 6,
        priorityDescription: 'Deterministic stack collision inference (overlapping children)',
        isCustom: false,
        category: 'layout',
        properties: stack as any,
        layoutType: 'stack'
      };
    }

    // 6c. Scroll lists
    const list = ListAnalyzer.analyze(shape);
    if (list) {
      return {
        widget: list.widget,
        sourcePriority: 6,
        priorityDescription: 'Deterministic list inference',
        isCustom: false,
        category: 'layout',
        properties: list as any,
        layoutType: 'list'
      };
    }

    // 7. Generic Flutter representation
    // Single shape with fills/strokes/radius -> Container or SizedBox or DecoratedBox
    if (shape.fills.length > 0 || shape.strokes.length > 0 || shape.shadows.length > 0 || shape.borderRadius) {
      return {
        widget: 'Container',
        sourcePriority: 7,
        priorityDescription: 'Generic container with decoration',
        isCustom: false,
        category: 'layout',
        properties: {},
        layoutType: 'box'
      };
    }

    if (shape.type === 'text') {
      return {
        widget: 'Text',
        sourcePriority: 7,
        priorityDescription: 'Text node',
        isCustom: false,
        category: 'display',
        properties: { text: shape.textContent || '' },
        layoutType: 'box'
      };
    }

    if (shape.children.length === 0) {
      return {
        widget: 'SizedBox',
        sourcePriority: 7,
        priorityDescription: 'Generic sizing box',
        isCustom: false,
        category: 'layout',
        properties: { width: shape.bounds.width, height: shape.bounds.height },
        layoutType: 'box'
      };
    }

    // Group with non-overlapping children -> Column or Container
    return {
      widget: 'Column',
      sourcePriority: 7,
      priorityDescription: 'Generic vertical container fallback',
      isCustom: false,
      category: 'layout',
      properties: {},
      layoutType: 'flex'
    };
  }

  private static resolveFromTag(
    tag: ParsedTag,
    _shape: ScannedShape,
    priority: 2 | 5 = 2,
    desc: string = 'Explicit Flutter semantic tag'
  ): ResolvedLayout {
    // Determine layout type from tag namespace and widget name
    let layoutType: ResolvedLayout['layoutType'] = 'box';

    if (['Row', 'Column', 'Flex', 'Wrap', 'Expanded', 'Flexible', 'Spacer'].includes(tag.widgetName)) {
      layoutType = 'flex';
    } else if (['Stack', 'Positioned'].includes(tag.widgetName)) {
      layoutType = 'stack';
    } else if (['GridView', 'Grid', 'ResponsiveGrid'].includes(tag.widgetName)) {
      layoutType = 'grid';
    } else if (['ListView', 'CustomScrollView', 'PageView'].includes(tag.widgetName)) {
      layoutType = 'list';
    } else if (tag.widgetName.startsWith('Sliver')) {
      layoutType = 'sliver';
    } else if (tag.category === 'navigation' || ['NavigationBar', 'NavigationRail', 'NavigationDrawer', 'Drawer', 'AppBar'].includes(tag.widgetName)) {
      layoutType = 'navigation';
    } else if (tag.category === 'tab' || ['TabBar', 'TabBarView', 'Tab'].includes(tag.widgetName)) {
      layoutType = 'tab';
    } else if (tag.category === 'media') {
      layoutType = 'media';
    } else if (tag.isCustom) {
      layoutType = 'custom';
    }

    return {
      widget: tag.widgetName,
      sourcePriority: priority,
      priorityDescription: `${desc} (${tag.raw})`,
      isCustom: tag.isCustom,
      category: tag.category,
      properties: tag.args,
      layoutType
    };
  }

  private static resolveNavigationOrTabHints(shape: ScannedShape): ResolvedLayout | null {
    const name = shape.name.toLowerCase();

    if (name === 'navbar' || name === 'navigationbar' || name === 'bottomnav' || name === 'bottomnavigationbar') {
      return {
        widget: 'NavigationBar',
        sourcePriority: 3,
        priorityDescription: 'Explicit navigation naming hint',
        isCustom: false,
        category: 'navigation',
        properties: {},
        layoutType: 'navigation'
      };
    }

    if (name === 'navigationrail' || name === 'navrail') {
      return {
        widget: 'NavigationRail',
        sourcePriority: 3,
        priorityDescription: 'Explicit navigation rail naming hint',
        isCustom: false,
        category: 'navigation',
        properties: {},
        layoutType: 'navigation'
      };
    }

    if (name === 'appbar' || name === 'topbar' || name === 'header') {
      return {
        widget: 'AppBar',
        sourcePriority: 3,
        priorityDescription: 'Explicit app bar naming hint',
        isCustom: false,
        category: 'navigation',
        properties: {},
        layoutType: 'navigation'
      };
    }

    if (name === 'tabbar' || name === 'tabs') {
      return {
        widget: 'TabBar',
        sourcePriority: 3,
        priorityDescription: 'Explicit tab bar naming hint',
        isCustom: false,
        category: 'tab',
        properties: {},
        layoutType: 'tab'
      };
    }

    if (name === 'tabbarview' || name === 'tabview' || name === 'tabcontent') {
      return {
        widget: 'TabBarView',
        sourcePriority: 3,
        priorityDescription: 'Explicit tab bar view naming hint',
        isCustom: false,
        category: 'tab',
        properties: {},
        layoutType: 'tab'
      };
    }

    return null;
  }
}
