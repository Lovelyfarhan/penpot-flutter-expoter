/**
 * JSON Schema Exporter for Penpot Flutter Design Compiler.
 * Produces schema.json to allow AI agents and tools to validate exported specs.
 */

export class SchemaExporter {
  public static export(): string {
    const schema = {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "title": "PenpotFlutterDesignCompilerSchema",
      "description": "Validation schema for Flutter Design AST and export suite",
      "type": "object",
      "properties": {
        "version": { "type": "string" },
        "compiler": { "type": "string" },
        "metadata": {
          "type": "object",
          "properties": {
            "documentName": { "type": "string" },
            "scannedAt": { "type": "string" },
            "totalNodes": { "type": "number" }
          },
          "required": ["documentName", "scannedAt", "totalNodes"]
        },
        "root": {
          "$ref": "#/$defs/ASTNode"
        }
      },
      "required": ["version", "compiler", "metadata", "root"],
      "$defs": {
        "ASTNode": {
          "type": "object",
          "properties": {
            "id": { "type": "string" },
            "name": { "type": "string" },
            "type": {
              "type": "string",
              "enum": ["widget", "layout", "navigation", "tab_system", "custom_widget", "media_widget"]
            },
            "widget": { "type": "string" },
            "className": { "type": "string" },
            "import": { "type": "string" },
            "package": { "type": "string" },
            "isCustom": { "type": "boolean" },
            "properties": { "type": "object" },
            "bounds": {
              "type": "object",
              "properties": {
                "x": { "type": "number" },
                "y": { "type": "number" },
                "width": { "type": "number" },
                "height": { "type": "number" }
              },
              "required": ["x", "y", "width", "height"]
            },
            "children": {
              "type": "array",
              "items": { "$ref": "#/$defs/ASTNode" }
            }
          },
          "required": ["id", "name", "type", "widget", "properties", "bounds", "children"]
        }
      }
    };

    return JSON.stringify(schema, null, 2);
  }
}
