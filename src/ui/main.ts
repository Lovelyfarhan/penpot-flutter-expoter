/**
 * Plugin UI Logic (src/ui/main.ts).
 * High density developer interface running inside the Penpot Plugin iframe.
 */

import { CompilationResult } from '../compiler';
import { CustomWidgetRegistry, CustomWidgetDefinition } from '../widgets/custom-widget-registry';
import { BundleExporter } from '../export/bundle-exporter';
import { FlutterASTNode } from '../ast/flutter-ast';

// Global state
let currentResult: CompilationResult | null = null;
let currentPreviewFile: string = 'design.md';
let selectedAstNode: FlutterASTNode | null = null;
let notificationTimeout: any = null;

// DOM Elements: Header & Controls
const btnScanPage = document.getElementById('btnScanPage') as HTMLButtonElement;
const btnScanSelection = document.getElementById('btnScanSelection') as HTMLButtonElement;
const btnThemeToggle = document.getElementById('btnThemeToggle') as HTMLButtonElement;
const scanStatusBadge = document.getElementById('scanStatusBadge') as HTMLDivElement;
const scanStatusText = document.getElementById('scanStatusText') as HTMLSpanElement;

// Notification banner
const notificationBanner = document.getElementById('notificationBanner') as HTMLDivElement;
const notificationMessage = document.getElementById('notificationMessage') as HTMLSpanElement;
const notificationIcon = document.getElementById('notificationIcon') as HTMLSpanElement;
const btnCloseNotification = document.getElementById('btnCloseNotification') as HTMLButtonElement;

// Metrics Ribbon
const valNodes = document.getElementById('valNodes')!;
const valNavs = document.getElementById('valNavs')!;
const valTabs = document.getElementById('valTabs')!;
const valComponents = document.getElementById('valComponents')!;
const valTokens = document.getElementById('valTokens')!;
const valDiagnostics = document.getElementById('valDiagnostics')!;

// Tree & Inspector
const treeContainer = document.getElementById('treeContainer')!;
const inspectorDetails = document.getElementById('inspectorDetails')!;
const btnSelectInPenpot = document.getElementById('btnSelectInPenpot') as HTMLButtonElement;
const btnExpandAll = document.getElementById('btnExpandAll') as HTMLButtonElement;
const btnCollapseAll = document.getElementById('btnCollapseAll') as HTMLButtonElement;
const btnCopyAst = document.getElementById('btnCopyAst') as HTMLButtonElement;

// Navigation & Diagnostics
const navContainer = document.getElementById('navContainer')!;
const validationContainer = document.getElementById('validationContainer')!;
const registryTableBody = document.getElementById('registryTableBody')!;

// Tokens & Assets
const tokenColors = document.getElementById('tokenColors')!;
const tokenSpacing = document.getElementById('tokenSpacing')!;
const tokenAssets = document.getElementById('tokenAssets')!;

// Export & Preview
const btnDownloadZip = document.getElementById('btnDownloadZip') as HTMLButtonElement;
const exportGrid = document.getElementById('exportGrid')!;
const previewCode = document.getElementById('previewCode')!;
const previewFileName = document.getElementById('previewFileName')!;
const btnCopyPreview = document.getElementById('btnCopyPreview') as HTMLButtonElement;

// Custom Widget Modal
const btnOpenAddModal = document.getElementById('btnOpenAddModal') as HTMLButtonElement;
const btnCloseModal = document.getElementById('btnCloseModal') as HTMLButtonElement;
const btnCancelModal = document.getElementById('btnCancelModal') as HTMLButtonElement;
const modalCustomWidget = document.getElementById('modalCustomWidget') as HTMLDivElement;
const formCustomWidget = document.getElementById('formCustomWidget') as HTMLFormElement;

// Initialize Registries
CustomWidgetRegistry.initialize();
CustomWidgetRegistry.loadFromStorage();
renderRegistryTable();

// Setup tab navigation
document.querySelectorAll('.nav-tab').forEach(tabBtn => {
  tabBtn.addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

    tabBtn.classList.add('active');
    const tabName = tabBtn.getAttribute('data-tab');
    const pane = document.getElementById(`tab${tabName ? tabName.charAt(0).toUpperCase() + tabName.slice(1) : ''}`);
    if (pane) pane.classList.add('active');
  });
});

// Penpot Communication Helper
function postToPenpot(msg: any) {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(msg, '*');
  } else {
    console.warn('[Penpot Flutter Plugin] Parent window not found; message not sent:', msg);
  }
}

// Request initial theme from URL query or Penpot
const urlParams = new URLSearchParams(window.location.search);
const initialTheme = urlParams.get('theme');
if (initialTheme) {
  applyTheme(initialTheme);
} else {
  postToPenpot({ type: 'get-theme' });
}

// Theme Handling
function applyTheme(theme: string) {
  if (theme === 'light') {
    document.body.className = 'theme-light';
  } else {
    document.body.className = 'theme-dark';
  }
}

btnThemeToggle.addEventListener('click', () => {
  const isLight = document.body.classList.contains('theme-light');
  applyTheme(isLight ? 'dark' : 'light');
});

// Notifications
function showNotification(msg: string, type: 'info' | 'error' | 'success' = 'info') {
  if (notificationTimeout) clearTimeout(notificationTimeout);

  notificationBanner.className = `notification-banner ${type}`;
  notificationMessage.textContent = msg;

  if (type === 'error') {
    notificationIcon.textContent = '⚠️';
  } else if (type === 'success') {
    notificationIcon.textContent = '✅';
  } else {
    notificationIcon.textContent = 'ℹ️';
  }

  notificationBanner.classList.remove('hidden');

  notificationTimeout = setTimeout(() => {
    notificationBanner.classList.add('hidden');
  }, 6000);
}

btnCloseNotification.addEventListener('click', () => {
  notificationBanner.classList.add('hidden');
});

// Status Management
function setStatus(status: 'ready' | 'scanning' | 'success' | 'error', text?: string) {
  scanStatusBadge.className = `status-pill status-${status}`;
  if (text) {
    scanStatusText.textContent = text;
  } else {
    switch (status) {
      case 'ready': scanStatusText.textContent = 'Ready'; break;
      case 'scanning': scanStatusText.textContent = 'Scanning...'; break;
      case 'success': scanStatusText.textContent = 'Compiled'; break;
      case 'error': scanStatusText.textContent = 'Scan Error'; break;
    }
  }

  const isBusy = status === 'scanning';
  btnScanPage.disabled = isBusy;
  btnScanSelection.disabled = isBusy;
}

// Scan Action Triggers
btnScanPage.addEventListener('click', () => {
  setStatus('scanning', 'Scanning Page...');
  postToPenpot({ type: 'scan-current-page' });
});

btnScanSelection.addEventListener('click', () => {
  setStatus('scanning', 'Scanning Selection...');
  postToPenpot({ type: 'scan-selection' });
});

// Penpot Incoming Message Listener
window.addEventListener('message', (event) => {
  const msg = event.data;
  if (!msg || !msg.type) return;

  switch (msg.type) {
    case 'scan-success': {
      handleCompilationSuccess(msg.data);
      break;
    }
    case 'scan-error': {
      setStatus('error', 'Failed');
      showNotification(msg.error || 'Failed to scan Penpot design.', 'error');
      break;
    }
    case 'selection-changed': {
      if (msg.count > 0 && btnScanSelection) {
        btnScanSelection.title = `Scan ${msg.count} selected item${msg.count > 1 ? 's' : ''}`;
      }
      break;
    }
    case 'theme-changed': {
      if (msg.theme) applyTheme(msg.theme);
      break;
    }
    case 'custom-widget-registered': {
      CustomWidgetRegistry.register(msg.widget);
      renderRegistryTable();
      showNotification(`Registered custom widget ${msg.widget.name}`, 'success');
      break;
    }
  }
});

// Handle Successful Compilation
function handleCompilationSuccess(result: CompilationResult) {
  currentResult = result;
  btnDownloadZip.disabled = false;
  setStatus('success', `${result.ast.metadata.totalNodes} Nodes`);
  const timeInfo = (result.ast.metadata as any).compilationTimeMs ? ` in ${(result.ast.metadata as any).compilationTimeMs}ms` : '';
  showNotification(`Compiled ${result.ast.metadata.totalNodes} Flutter AST nodes successfully${timeInfo}`, 'success');

  // Update Metrics
  valNodes.textContent = String(result.ast.metadata.totalNodes);
  valNavs.textContent = String(result.navigation.navigationBars.length + result.navigation.navigationRails.length);
  valTabs.textContent = String(result.navigation.tabSystems.length);
  valComponents.textContent = String(result.components.length);
  valTokens.textContent = String(Object.keys(result.tokens.colors).length);

  if (result.validation.errorCount > 0) {
    valDiagnostics.textContent = `${result.validation.errorCount} Errors`;
    valDiagnostics.className = 'metric-value text-error';
  } else if (result.validation.warningCount > 0) {
    valDiagnostics.textContent = `${result.validation.warningCount} Warnings`;
    valDiagnostics.className = 'metric-value text-warning';
  } else {
    valDiagnostics.textContent = 'Passed';
    valDiagnostics.className = 'metric-value text-success';
  }

  // Render Sub-Views
  renderTree(result.ast.root);
  renderNavigation(result);
  renderValidation(result.validation);
  renderTokens(result);
  renderExportFiles(result);

  // Auto-select root node in inspector
  selectNode(result.ast.root);
}

// Widget Badge Classification
function getWidgetBadgeClass(widget: string, isCustom: boolean = false): string {
  if (isCustom) return 'badge-custom';
  const w = widget.toLowerCase();
  if (w.includes('container') || w.includes('card') || w.includes('scaffold')) return 'badge-container';
  if (w.includes('column') || w.includes('row') || w.includes('stack') || w.includes('wrap') || w.includes('grid') || w.includes('list')) return 'badge-layout';
  if (w.includes('text')) return 'badge-text';
  if (w.includes('nav') || w.includes('tab') || w.includes('bar') || w.includes('drawer')) return 'badge-nav';
  if (w.includes('image') || w.includes('svg') || w.includes('video')) return 'badge-media';
  return 'badge-container';
}

// Tree Rendering
function renderTree(root: FlutterASTNode) {
  treeContainer.innerHTML = '';
  const rootElement = createTreeNodeElement(root);
  treeContainer.appendChild(rootElement);
}

function createTreeNodeElement(node: FlutterASTNode): HTMLElement {
  const container = document.createElement('div');
  container.className = 'tree-node';

  const line = document.createElement('div');
  line.className = 'tree-node-content';
  line.setAttribute('data-shape-id', node.id);

  const hasChildren = node.children && node.children.length > 0;
  const chevron = document.createElement('span');
  chevron.className = `tree-node-chevron ${hasChildren ? 'expanded' : 'hidden'}`;
  chevron.textContent = '▶';

  const badgeClass = getWidgetBadgeClass(node.widget, node.isCustom ?? false);
  const tagStr = (node.properties && node.properties.tag) || (node.prioritySource?.includes('@flutter') ? node.prioritySource : '');
  const tagBadgeHtml = tagStr ? `<span class="node-tag-indicator" title="Tag: ${tagStr}">🏷️</span>` : '';

  line.innerHTML = `
    <span class="node-widget-badge ${badgeClass}">${node.widget}</span>
    <span class="node-name" title="${node.name}">"${node.name}"</span>
    ${tagBadgeHtml}
    <span class="node-bounds">${Math.round(node.bounds.width)}×${Math.round(node.bounds.height)}</span>
  `;
  line.prepend(chevron);

  container.appendChild(line);

  let childrenContainer: HTMLElement | null = null;
  if (hasChildren) {
    childrenContainer = document.createElement('div');
    childrenContainer.className = 'tree-children';
    childrenContainer.style.paddingLeft = '14px';
    childrenContainer.style.borderLeft = '1px solid var(--border-subtle)';
    childrenContainer.style.marginLeft = '7px';

    for (const child of node.children) {
      childrenContainer.appendChild(createTreeNodeElement(child));
    }
    container.appendChild(childrenContainer);

    chevron.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = chevron.classList.contains('expanded');
      if (isExpanded) {
        chevron.classList.remove('expanded');
        if (childrenContainer) childrenContainer.style.display = 'none';
      } else {
        chevron.classList.add('expanded');
        if (childrenContainer) childrenContainer.style.display = 'block';
      }
    });
  }

  line.addEventListener('click', (e) => {
    e.stopPropagation();
    selectNode(node);
  });

  return container;
}

// Select a node in tree and inspector
function selectNode(node: FlutterASTNode) {
  selectedAstNode = node;

  // Highlight in tree
  document.querySelectorAll('.tree-node-content').forEach(el => el.classList.remove('selected'));
  const activeEl = document.querySelector(`.tree-node-content[data-shape-id="${node.id}"]`);
  if (activeEl) activeEl.classList.add('selected');

  // Trigger canvas selection in Penpot
  postToPenpot({
    type: 'select-shape',
    shapeId: node.id
  });

  btnSelectInPenpot.disabled = false;
  renderNodeInspector(node);
}

// Manual "Select in Canvas" button handler
btnSelectInPenpot.addEventListener('click', () => {
  if (selectedAstNode) {
    postToPenpot({
      type: 'select-shape',
      shapeId: selectedAstNode.id
    });
    showNotification(`Selected shape "${selectedAstNode.name}" in Penpot canvas`, 'info');
  }
});

// Render Node Details in Inspector
function renderNodeInspector(node: FlutterASTNode) {
  const badgeClass = getWidgetBadgeClass(node.widget, node.isCustom ?? false);
  const tagStr = (node.properties && node.properties.tag) || (node.prioritySource?.includes('@flutter') ? node.prioritySource : '');

  const deco = node.decoration || {};
  const props = node.properties || {};

  let fillsHtml = '';
  if (deco.color) {
    fillsHtml = `
      <div class="color-preview-row">
        <span class="color-swatch-mini" style="background-color: ${deco.color};"></span>
        <span class="prop-val">${deco.color}</span>
      </div>
    `;
  } else if (Array.isArray(props.fills) && props.fills.length > 0) {
    fillsHtml = props.fills.map((f: any) => `
      <div class="color-preview-row">
        <span class="color-swatch-mini" style="background-color: ${f.color || '#fff'}; opacity: ${f.opacity ?? 1};"></span>
        <span class="prop-val">${f.color || 'solid'} (${Math.round((f.opacity ?? 1) * 100)}%)</span>
      </div>
    `).join('');
  } else {
    fillsHtml = '<span class="prop-val text-muted">None</span>';
  }

  let strokesHtml = '';
  if (deco.border) {
    strokesHtml = `
      <div class="color-preview-row">
        <span class="color-swatch-mini" style="border-color: ${deco.border.color || '#fff'};"></span>
        <span class="prop-val">${deco.border.color} · ${deco.border.width}px</span>
      </div>
    `;
  } else if (Array.isArray(props.strokes) && props.strokes.length > 0) {
    strokesHtml = props.strokes.map((s: any) => `
      <div class="color-preview-row">
        <span class="color-swatch-mini" style="border-color: ${s.color || '#fff'};"></span>
        <span class="prop-val">${s.color} · ${s.width}px</span>
      </div>
    `).join('');
  } else {
    strokesHtml = '<span class="prop-val text-muted">None</span>';
  }

  const radiusVal = typeof deco.borderRadius === 'number' 
    ? `${deco.borderRadius}px` 
    : (deco.borderRadius ? JSON.stringify(deco.borderRadius) : (props.borderRadius ? `${props.borderRadius}px` : '0px'));

  const opacityVal = props.opacity !== undefined ? `${Math.round(props.opacity * 100)}%` : '100%';
  const layout = props.layout || {};

  inspectorDetails.innerHTML = `
    <div class="inspector-section">
      <div class="inspector-section-title">Widget Identity</div>
      <div class="prop-row">
        <span class="prop-name">Widget</span>
        <span class="node-widget-badge ${badgeClass}">${node.widget}</span>
      </div>
      <div class="prop-row">
        <span class="prop-name">Layer Name</span>
        <span class="prop-val">"${node.name}"</span>
      </div>
      <div class="prop-row">
        <span class="prop-name">Shape ID</span>
        <span class="prop-val" style="font-size: 10px;">${node.id}</span>
      </div>
      ${tagStr ? `
      <div class="prop-row">
        <span class="prop-name">Tag / Source</span>
        <span class="tag-badge">${tagStr}</span>
      </div>` : ''}
    </div>

    <div class="inspector-section">
      <div class="inspector-section-title">Geometry & Bounds</div>
      <div class="prop-row">
        <span class="prop-name">Dimensions</span>
        <span class="prop-val">${Math.round(node.bounds.width)} × ${Math.round(node.bounds.height)} px</span>
      </div>
      <div class="prop-row">
        <span class="prop-name">Position (X, Y)</span>
        <span class="prop-val">${Math.round(node.bounds.x)}, ${Math.round(node.bounds.y)}</span>
      </div>
      <div class="prop-row">
        <span class="prop-name">Corner Radius</span>
        <span class="prop-val">${radiusVal}</span>
      </div>
      <div class="prop-row">
        <span class="prop-name">Opacity</span>
        <span class="prop-val">${opacityVal}</span>
      </div>
    </div>

    <div class="inspector-section">
      <div class="inspector-section-title">Fills & Strokes</div>
      <div class="prop-row">
        <span class="prop-name">Fills</span>
        <div style="display:flex; flex-direction:column; gap:2px; align-items:flex-end;">${fillsHtml}</div>
      </div>
      <div class="prop-row">
        <span class="prop-name">Strokes</span>
        <div style="display:flex; flex-direction:column; gap:2px; align-items:flex-end;">${strokesHtml}</div>
      </div>
    </div>

    <div class="inspector-section">
      <div class="inspector-section-title">Hierarchy & Layout</div>
      <div class="prop-row">
        <span class="prop-name">Child Count</span>
        <span class="prop-val">${node.children ? node.children.length : 0}</span>
      </div>
      ${layout.direction ? `
      <div class="prop-row">
        <span class="prop-name">Direction</span>
        <span class="prop-val">${layout.direction}</span>
      </div>` : ''}
      ${layout.mainAxisAlignment ? `
      <div class="prop-row">
        <span class="prop-name">MainAxis</span>
        <span class="prop-val">${layout.mainAxisAlignment}</span>
      </div>` : ''}
      ${layout.crossAxisAlignment ? `
      <div class="prop-row">
        <span class="prop-name">CrossAxis</span>
        <span class="prop-val">${layout.crossAxisAlignment}</span>
      </div>` : ''}
    </div>
  `;
}

// Tree Expand / Collapse All
btnExpandAll.addEventListener('click', () => {
  document.querySelectorAll('.tree-children').forEach((el: any) => { el.style.display = 'block'; });
  document.querySelectorAll('.tree-node-chevron').forEach(el => { el.classList.add('expanded'); });
});

btnCollapseAll.addEventListener('click', () => {
  document.querySelectorAll('.tree-children').forEach((el: any) => { el.style.display = 'none'; });
  document.querySelectorAll('.tree-node-chevron').forEach(el => { el.classList.remove('expanded'); });
});

// Copy AST
btnCopyAst.addEventListener('click', () => {
  if (!currentResult) {
    showNotification('No AST available to copy. Scan design first.', 'error');
    return;
  }
  const jsonStr = JSON.stringify(currentResult.ast, null, 2);
  navigator.clipboard.writeText(jsonStr);
  const originalText = btnCopyAst.textContent;
  btnCopyAst.textContent = '✅ Copied!';
  setTimeout(() => { btnCopyAst.textContent = originalText; }, 1500);
});

// Render Navigation
function renderNavigation(result: CompilationResult) {
  navContainer.innerHTML = '';

  if (result.navigation.navigationBars.length > 0) {
    const nav = result.navigation.navigationBars[0];
    const navCard = document.createElement('div');
    navCard.className = 'diagnostic-card';
    navCard.innerHTML = `
      <div class="diag-title">📱 Primary NavigationBar (${nav.widget})</div>
      <div class="diag-msg">Destinations: ${nav.destinations.map(d => `<strong>${d.label}</strong> (<code>${d.route}</code>)`).join(' • ')}</div>
    `;
    navContainer.appendChild(navCard);
  }

  if (result.navigation.tabSystems.length > 0) {
    result.navigation.tabSystems.forEach(ts => {
      const tabCard = document.createElement('div');
      tabCard.className = 'diagnostic-card';
      tabCard.innerHTML = `
        <div class="diag-title">📑 TabSystem (${ts.id})</div>
        <div class="diag-msg">Controller: <code>${ts.controller}</code> | TabBar: <code>${ts.tabBarWidget}</code> ➔ TabBarView: <code>${ts.tabViewWidget}</code></div>
        <div class="diag-rec">Tabs: ${ts.tabs.map(t => `${t.label} ➔ ${t.contentName}`).join(' | ')}</div>
      `;
      navContainer.appendChild(tabCard);
    });
  }

  if (navContainer.children.length === 0) {
    navContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📱</div>
        <div class="empty-state-title">No Navigation Components Found</div>
        <p>Use semantic tags like <code>@flutter:navigation/NavigationBar</code> or <code>@flutter:tab/TabBar</code> to declare navigation structures.</p>
      </div>
    `;
  }
}

// Render Validation
function renderValidation(validation: CompilationResult['validation']) {
  validationContainer.innerHTML = '';

  if (validation.diagnostics.length === 0) {
    validationContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✅</div>
        <div class="empty-state-title">All Rules Passed</div>
        <p>No layout conflicts, missing tags, or structural anomalies detected.</p>
      </div>
    `;
    return;
  }

  validation.diagnostics.forEach(diag => {
    const card = document.createElement('div');
    card.className = `diagnostic-card ${diag.severity.toLowerCase()}`;
    card.innerHTML = `
      <div class="diag-title">
        <span class="${diag.severity === 'ERROR' ? 'text-error' : 'text-warning'}">[${diag.severity}]</span>
        ${diag.rule}
      </div>
      <div class="diag-msg">${diag.message}</div>
      ${diag.recommendation ? `<div class="diag-rec">💡 Recommendation: ${diag.recommendation}</div>` : ''}
    `;
    validationContainer.appendChild(card);
  });
}

// Render Tokens
function renderTokens(result: CompilationResult) {
  tokenColors.innerHTML = '';
  Object.entries(result.tokens.colors).forEach(([name, val]) => {
    const chip = document.createElement('div');
    chip.className = 'color-chip';
    chip.innerHTML = `
      <span class="color-swatch-mini" style="background-color: ${val};"></span>
      <span>${name}</span>
      <span class="text-secondary" style="font-size: 10px;">${val}</span>
    `;
    tokenColors.appendChild(chip);
  });

  tokenSpacing.innerHTML = '';
  Object.entries(result.tokens.spacing).forEach(([name, val]) => {
    const pill = document.createElement('span');
    pill.className = 'tag-badge';
    pill.textContent = `${name}: ${val}px`;
    tokenSpacing.appendChild(pill);
  });

  tokenAssets.innerHTML = '';
  if (result.assets.length === 0) {
    tokenAssets.innerHTML = '<div class="empty-state-small">No external assets or SVG raw paths in this design.</div>';
  } else {
    result.assets.forEach(a => {
      const item = document.createElement('div');
      item.className = 'diagnostic-card';
      item.innerHTML = `
        <div class="diag-title">${a.name} (${a.type})</div>
        <div class="diag-msg">Format: ${a.format} · ${a.dimensions.width}×${a.dimensions.height}px</div>
      `;
      tokenAssets.appendChild(item);
    });
  }
}

// Render Export Files
function renderExportFiles(result: CompilationResult) {
  exportGrid.innerHTML = '';

  const files = Object.keys(result.bundle) as Array<keyof typeof result.bundle>;
  files.forEach(filename => {
    const card = document.createElement('div');
    card.className = `export-card ${filename === currentPreviewFile ? 'active' : ''}`;
    card.innerHTML = `
      <span class="export-file-title">${filename}</span>
      <span class="tag-badge" style="font-size: 9px;">Ready</span>
    `;
    card.addEventListener('click', () => {
      document.querySelectorAll('.export-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentPreviewFile = filename;
      updatePreview(result.bundle[filename]);
    });
    exportGrid.appendChild(card);
  });

  updatePreview(result.bundle['design.md']);
}

function updatePreview(content: string) {
  previewFileName.textContent = currentPreviewFile;
  previewCode.textContent = content;
}

btnCopyPreview.addEventListener('click', () => {
  if (previewCode.textContent) {
    navigator.clipboard.writeText(previewCode.textContent);
    btnCopyPreview.textContent = 'Copied!';
    setTimeout(() => { btnCopyPreview.textContent = 'Copy'; }, 1500);
  }
});

btnDownloadZip.addEventListener('click', async () => {
  if (!currentResult) return;
  try {
    btnDownloadZip.disabled = true;
    btnDownloadZip.innerHTML = '<span class="btn-icon">⏳</span> Packing ZIP...';
    const blob = await BundleExporter.createZip(currentResult.bundle);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flutter-design-spec-${Date.now()}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Bundle ZIP generated and downloaded successfully!', 'success');
  } catch (err: any) {
    showNotification(`ZIP Generation failed: ${err.message}`, 'error');
  } finally {
    btnDownloadZip.disabled = false;
    btnDownloadZip.innerHTML = '<span class="btn-icon">📦</span> Download Complete Bundle (.ZIP)';
  }
});

// Custom Widget Modal & Form
btnOpenAddModal.addEventListener('click', () => {
  modalCustomWidget.classList.remove('hidden');
});

[btnCloseModal, btnCancelModal].forEach(b => {
  b.addEventListener('click', () => {
    modalCustomWidget.classList.add('hidden');
  });
});

formCustomWidget.addEventListener('submit', (e) => {
  e.preventDefault();
  const def: CustomWidgetDefinition = {
    name: (document.getElementById('custName') as HTMLInputElement).value.trim(),
    className: (document.getElementById('custClass') as HTMLInputElement).value.trim(),
    package: (document.getElementById('custPackage') as HTMLInputElement).value.trim(),
    import: (document.getElementById('custImport') as HTMLInputElement).value.trim(),
    category: (document.getElementById('custCategory') as HTMLSelectElement).value,
    supportsChildren: (document.getElementById('custChildren') as HTMLSelectElement).value === 'true'
  };

  CustomWidgetRegistry.register(def);
  CustomWidgetRegistry.saveToStorage();
  postToPenpot({ type: 'register-custom-widget', widget: def });
  renderRegistryTable();
  modalCustomWidget.classList.add('hidden');
  formCustomWidget.reset();
  showNotification(`Saved custom widget ${def.name}`, 'success');
});

function renderRegistryTable() {
  const widgets = CustomWidgetRegistry.getAll();
  registryTableBody.innerHTML = '';

  widgets.forEach(w => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${w.name}</strong></td>
      <td>${w.className}</td>
      <td><span class="tag-badge">${w.package}</span></td>
      <td>${w.import}</td>
      <td>${w.category}</td>
      <td>${w.supportsChildren ? 'Yes' : 'No'}</td>
    `;
    registryTableBody.appendChild(tr);
  });
}
