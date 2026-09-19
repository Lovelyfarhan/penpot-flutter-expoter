import { describe, it, expect } from 'vitest';
import { PenpotMockBuilder } from './mocks/penpot-mock';
import { ASTBuilder } from '../src/ast/ast-builder';
import { Validator } from '../src/validation/validator';

describe('Validator Engine', () => {
  it('detects Positioned outside Stack as an ERROR', () => {
    const positioned = PenpotMockBuilder.createShape({
      name: '@flutter:Positioned MyBadge'
    });
    const column = PenpotMockBuilder.createShape({
      name: '@flutter:Column Header',
      children: [positioned]
    });

    const ast = ASTBuilder.build(column);
    const report = Validator.validate(ast);

    expect(report.isValid).toBe(false);
    expect(report.errorCount).toBeGreaterThan(0);
    expect(report.diagnostics.some(d => d.rule === 'positioned-in-stack')).toBe(true);
  });

  it('detects TabBar and TabBarView count mismatch as an ERROR', () => {
    const tab1 = PenpotMockBuilder.createShape({ name: 'Tab 1' });
    const tab2 = PenpotMockBuilder.createShape({ name: 'Tab 2' });
    const tabBar = PenpotMockBuilder.createShape({
      name: '@flutter:TabBar',
      children: [tab1, tab2]
    });

    const p1 = PenpotMockBuilder.createShape({ name: 'Page 1' });
    const p2 = PenpotMockBuilder.createShape({ name: 'Page 2' });
    const p3 = PenpotMockBuilder.createShape({ name: 'Page 3' });
    const tabView = PenpotMockBuilder.createShape({
      name: '@flutter:TabBarView',
      children: [p1, p2, p3]
    });

    const root = PenpotMockBuilder.createShape({
      name: 'Screen',
      children: [tabBar, tabView]
    });

    const ast = ASTBuilder.build(root);
    const report = Validator.validate(ast);

    expect(report.isValid).toBe(false);
    expect(report.diagnostics.some(d => d.rule === 'tab-bar-tab-view-parity')).toBe(true);
  });

  it('passes a completely valid structural hierarchy', () => {
    const child1 = PenpotMockBuilder.createShape({ name: 'Text 1' });
    const child2 = PenpotMockBuilder.createShape({ name: 'Text 2' });
    const row = PenpotMockBuilder.createShape({
      name: '@flutter:Row MyRow',
      children: [child1, child2]
    });

    const ast = ASTBuilder.build(row);
    const report = Validator.validate(ast);

    expect(report.isValid).toBe(true);
    expect(report.errorCount).toBe(0);
  });
});
