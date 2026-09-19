import { describe, it, expect } from 'vitest';
import { PenpotMockBuilder } from './mocks/penpot-mock';
import { LayoutAnalyzer } from '../src/layout/layout-analyzer';
import { StackAnalyzer } from '../src/layout/stack-analyzer';

describe('LayoutAnalyzer', () => {
  it('resolves explicit flex row layout', () => {
    const child1 = PenpotMockBuilder.createShape({ name: 'Item 1' });
    const child2 = PenpotMockBuilder.createShape({ name: 'Item 2' });
    const rowShape = PenpotMockBuilder.createFlexContainer('Items Row', 'row', [child1, child2]);

    const resolved = LayoutAnalyzer.resolve(rowShape);
    expect(resolved.widget).toBe('Row');
    expect(resolved.sourcePriority).toBe(6);
    expect(resolved.layoutType).toBe('flex');
  });

  it('resolves explicit flex column layout', () => {
    const child1 = PenpotMockBuilder.createShape({ name: 'Item 1' });
    const colShape = PenpotMockBuilder.createFlexContainer('Items Col', 'column', [child1]);

    const resolved = LayoutAnalyzer.resolve(colShape);
    expect(resolved.widget).toBe('Column');
    expect(resolved.sourcePriority).toBe(6);
  });

  it('detects overlapping children and infers Stack deterministically', () => {
    // Two overlapping shapes in 2D bounding space
    const bg = PenpotMockBuilder.createShape({
      name: 'Background',
      relativeBounds: { x: 0, y: 0, width: 200, height: 200 }
    });
    const overlay = PenpotMockBuilder.createShape({
      name: 'Overlay Icon',
      relativeBounds: { x: 50, y: 50, width: 40, height: 40 }
    });

    const container = PenpotMockBuilder.createShape({
      name: 'HeroContainer',
      children: [bg, overlay]
    });

    expect(StackAnalyzer.checkChildrenOverlap(container.children)).toBe(true);
    const resolved = LayoutAnalyzer.resolve(container);
    expect(resolved.widget).toBe('Stack');
    expect(resolved.layoutType).toBe('stack');
  });

  it('prioritizes explicit semantic tag over automatic layout inference', () => {
    // Shape has flex row layout, but user explicitly tagged @flutter:GridView
    const child1 = PenpotMockBuilder.createShape({ name: 'Item 1' });
    const rowShape = PenpotMockBuilder.createFlexContainer('@flutter:GridView MoviesGrid', 'row', [child1]);

    const resolved = LayoutAnalyzer.resolve(rowShape);
    // Explicit tag must win
    expect(resolved.widget).toBe('GridView');
    expect(resolved.sourcePriority).toBe(2);
  });
});
