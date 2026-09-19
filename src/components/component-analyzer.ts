/**
 * Component & Instance Analyzer for Penpot Flutter Design Compiler.
 * Preserves component definitions, instances, variants, and overrides
 * without duplicating instances as separate components.
 */

import { ScannedShape } from '../scanner/types';

export interface ComponentDefinition {
  id: string;
  name: string;
  variantProperties?: Record<string, string>;
  instanceCount: number;
  instances: ComponentInstance[];
}

export interface ComponentInstance {
  id: string;
  componentId: string;
  componentName: string;
  variantProperties?: Record<string, string>;
  overrides?: Record<string, unknown>;
}

export class ComponentAnalyzer {
  public static analyze(shapes: ScannedShape[]): {
    components: ComponentDefinition[];
    instances: ComponentInstance[];
  } {
    const componentMap: Map<string, ComponentDefinition> = new Map();
    const allInstances: ComponentInstance[] = [];

    const traverse = (shape: ScannedShape) => {
      if (shape.isComponentMaster) {
        const id = shape.componentId || shape.id;
        if (!componentMap.has(id)) {
          componentMap.set(id, {
            id,
            name: shape.componentName || shape.name,
            variantProperties: shape.variantProperties,
            instanceCount: 0,
            instances: []
          });
        }
      }

      if (shape.isComponentInstance) {
        const compId = shape.componentId || 'unknown_component';
        const instance: ComponentInstance = {
          id: shape.id,
          componentId: compId,
          componentName: shape.componentName || shape.name,
          variantProperties: shape.variantProperties,
          overrides: shape.instanceOverrides
        };

        allInstances.push(instance);

        let compDef = componentMap.get(compId);
        if (!compDef) {
          compDef = {
            id: compId,
            name: shape.componentName || shape.name,
            variantProperties: shape.variantProperties,
            instanceCount: 0,
            instances: []
          };
          componentMap.set(compId, compDef);
        }

        compDef.instanceCount++;
        compDef.instances.push(instance);
      }

      for (const child of shape.children) {
        traverse(child);
      }
    };

    shapes.forEach(traverse);

    return {
      components: Array.from(componentMap.values()),
      instances: allInstances
    };
  }
}
