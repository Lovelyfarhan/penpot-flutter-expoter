# Penpot Flutter Design Compiler

A production-grade, deterministic **Penpot Plugin** that translates actual Penpot designs into structured, typed Flutter Design AST specifications consumable directly by AI coding agents (such as **Antigravity**) to generate complete, high-fidelity Flutter applications.

---

## Key Principles

* **100% Deterministic**: No hallucinations, no guessing, no external AI dependencies during compilation.
* **8 Semantic Namespaces**: Precision control using `@flutter:`, `@flutter:material/`, `@flutter:cupertino/`, `@flutter:layout/`, `@flutter:navigation/`, `@flutter:tab/`, `@flutter:custom/`, `@flutter:media/`.
* **First-Class Tab & Navigation Subsystems**: Bidirectional binding between `TabBar` and `TabBarView` pages, app-level vs screen-level navigation distinction, and responsive breakpoints.
* **Complete Specification Suite**: Generates 9 production files (`design.json`, `design.md`, `widgets.json`, `components.json`, `navigation.json`, `tabs.json`, `tokens.json`, `assets.json`, `schema.json`).

---

## Pipeline Architecture

```text
Penpot Design
    ↓
Penpot Plugin API
    ↓
Design Scanner
    ↓
Hierarchy Analyzer
    ↓
Semantic Tag Parser
    ↓
Layout Analyzer (8-step priority engine)
    ↓
Navigation Analyzer
    ↓
Tab/TabView Analyzer
    ↓
Flutter Widget Registry
    ↓
Component Analyzer
    ↓
Custom Widget Analyzer
    ↓
Responsive Layout Analyzer
    ↓
Design Token Analyzer
    ↓
Asset Analyzer
    ↓
Flutter Design AST
    ↓
Validation Engine
    ↓
Structured Export Bundle (.ZIP)
    ↓
Antigravity / AI Coding Agent
    ↓
Flutter/Dart Application
```

---

## Semantic Tagging System

### Namespaces

| Namespace | Example | Description |
|-----------|---------|-------------|
| `@flutter:` | `@flutter:Column`, `@flutter:Stack` | Core layout and basic Flutter widgets |
| `@flutter:material/` | `@flutter:material/FilledButton` | Material 3 widgets |
| `@flutter:cupertino/` | `@flutter:cupertino/CupertinoButton` | iOS-styled widgets |
| `@flutter:layout/` | `@flutter:layout/Grid(crossAxisCount: 2)` | Explicit layout containers with parameters |
| `@flutter:navigation/` | `@flutter:navigation/NavigationBar` | App-level navigation components |
| `@flutter:tab/` | `@flutter:tab/TabBar`, `@flutter:tab/TabBarView` | Screen-level tab bars and page views |
| `@flutter:custom/` | `@flutter:custom/MediaNavbar` | Registered user-defined custom widgets |
| `@flutter:media/` | `@flutter:media/MovieCard` | Media, streaming, and entertainment widgets |

### Semantic Priority Engine

When determining the Flutter widget representation, the compiler follows this strict hierarchy:
1. **Explicit plugin metadata** (`shape.getPluginData()`)
2. **Explicit Flutter semantic tag** (`@flutter:...`)
3. **Explicit navigation/tab metadata** (semantic naming hints)
4. **Explicit layout metadata** (Penpot grid layouts)
5. **Component metadata** (master component tags)
6. **Deterministic layout inference** (flex row/column, 2D AABB bounding-box collision detection for Stack, scrollable lists)
7. **Generic Flutter representation** (`Scaffold`, `Container`, `SizedBox`, `Text`)
8. **Unresolved**

---

## Export Files Specification

The compiler outputs 9 deterministic files:

1. **`design.json`**: The complete hierarchical Flutter Design AST containing node IDs, widget names, class names, packages, imports, properties, box decorations, typography, bounds, and children.
2. **`design.md`**: Human and AI readable Markdown specification detailing navigation architecture, tab mappings, visual tree hierarchy, and implementation directives.
3. **`widgets.json`**: Catalog of all official, Material, Cupertino, and custom widgets detected in the project.
4. **`components.json`**: Penpot component definitions, variants, and instances with explicit override maps.
5. **`navigation.json`**: Dedicated application navigation topology including destinations, icons, routes, and responsive rules.
6. **`tabs.json`**: Dedicated `TabSystem` definitions linking each tab directly to its corresponding page content.
7. **`tokens.json`**: Extracted design tokens: colors, typography styles, spacing, corner radius, drop shadows, and breakpoint definitions.
8. **`assets.json`**: Metadata for all images, SVGs, and vector icons with dimensions, formats, and `pubspec.yaml` configuration snippet.
9. **`schema.json`**: JSON Schema draft 2020-12 definition validating the AST structure.

---

## Antigravity AI Workflow

1. Design your UI in Penpot.
2. Tag key containers (e.g. `@flutter:NavigationBar`, `@flutter:TabBar`, `@flutter:TabBarView`, `@flutter:custom/MediaNavbar`).
3. Run the **Penpot Flutter Design Compiler** plugin.
4. Click **Download Complete Bundle (.ZIP)**.
5. Provide the extracted export folder to **Antigravity**.
6. Antigravity reads `design.md`, `design.json`, `navigation.json`, and `tabs.json` to generate the Flutter project without needing to visually guess UI hierarchies from screenshots!

---

## Development & Testing

### Install Dependencies
```bash
npm install
```

### Run Automated Vitest Suite
```bash
npm test
```

### Build Production Plugin
```bash
npm run build
```
Builds `dist/plugin.js`, `dist/index.html`, and bundled assets ready to be served or loaded in Penpot.
