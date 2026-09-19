/**
 * Plugin UI Logic (src/ui/main.ts).
 * Runs inside the Penpot Plugin iframe.
 */

import { CompilationResult } from '../compiler';
import { CustomWidgetRegistry, CustomWidgetDefinition } from '../widgets/custom-widget-registry';
import { BundleExporter } from '../export/bundle-exporter';
import { FlutterASTNode } from '../ast/flutter-ast';

// Global state
let currentResult: CompilationResult | null = null;
let currentPreviewFile: string = 'design.md';

// DOM Elements
const btnScanPage = document.getElementById('btnScanPage') as HTMLButtonElement;
const btnScanSelection = document.getElementById('btnScanSelection') as HTMLButtonElement;
const btnDownloadZip = document.getElementById('btnDownloadZip') as HTMLButtonElement;
const btnOpenAddModal = document.getElementById('btnOpenAddModal') as HTMLButtonElement;
const btnCloseModal = document.getElementById('btnCloseModal') as HTMLButtonElement;
const btnCancelModal = document.getElementById('btnCancelModal') as HTMLButtonElement;
const modalCustomWidget = document.getElementById('modalCustomWidget') as HTMLDivElement;
const formCustomWidget = document.getElementById('formCustomWidget') as HTMLFormElement;

// Metrics
const valNodes = document.getElementById('valNodes')!;
const valNavs = document.getElementById('valNavs')!;
const valTabs = document.getElementById('valTabs')!;
const valComponents = document.getElementById('valComponents')!;
const valTokens = document.getElementById('valTokens')!;
const valDiagnostics = document.getElementById('valDiagnostics')!;

// Containers
const treeContainer = document.getElementById('treeContainer')!;
const navContainer = document.getElementById('navContainer')!;
const validationContainer = document.getElementById('validationContainer')!;
const registryTableBody = document.getElementById('registryTableBody')!;
const tokenColors = document.getElementById('tokenColors')!;
const tokenSpacing = document.getElementById('tokenSpacing')!;
const tokenAssets = document.getElementById('tokenAssets')!;
const exportGrid = document.getElementById('exportGrid')!;
const previewCode = document.getElementById('previewCode')!;
const previewFileName = document.getElementById('previewFileName')!;
const btnCopyPreview = document.getElementById('btnCopyPreview') as HTMLButtonElement;

// Initialize
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

// Penpot message listener
window.addEventListener('message', (event) => {
  const msg = event.data;
  if (!msg || !msg.type) return;

  switch (msg.type) {
    case 'scan-success': {
      handleCompilationSuccess(msg.data);
      break;
    }
    case 'scan-error': {
      alert(`Scan Error: ${msg.error}`);
      break;
    }
    case 'custom-widget-registered': {
      CustomWidgetRegistry.register(msg.widget);
      renderRegistryTable();
      break;
    }
  }
});

function postToPenpot(msg: any) {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(msg, '*');
  } else {
    // If running in standalone browser test, compile demo
    console.log('Running in browser mock mode');
  }
}

// Button actions
btnScanPage.addEventListener('click', () => {
  postToPenpot({ type: 'scan-current-page' });
});

btnScanSelection.addEventListener('click', () => {
  postToPenpot({ type: 'scan-selection' });
});

// Custom widget modal
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
});

// Render Registry Table
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

// Handle compilation success
function handleCompilationSuccess(result: CompilationResult) {
  currentResult = result;
  btnDownloadZip.disabled = false;

  // Update metrics
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

  // Render tabs
  renderTree(result.ast.root);
  renderNavigation(result);
  renderValidation(result.validation);
  renderTokens(result);
  renderExportFiles(result);
}

// Render Tree
function renderTree(root: FlutterASTNode) {
  treeContainer.innerHTML = '';
  const rootDiv = createTreeNodeElement(root);
  treeContainer.appendChild(rootDiv);
}

function createTreeNodeElement(node: FlutterASTNode): HTMLElement {
  const container = document.createElement('div');
  container.className = 'tree-node';

  const line = document.createElement('div');
  line.className = 'tree-node-content';

  let typeBadge = '';
  if (node.isCustom) {
    typeBadge = `<span class="node-custom">[Custom]</span>`;
  }

  line.innerHTML = `
    <span class="node-widget">${node.widget}</span>
    <span class="node-name">"${node.name}"</span>
    ${typeBadge}
    <span class="text-secondary" style="font-size: 10px;">${node.bounds.width}×${node.bounds.height}</span>
  `;

  container.appendChild(line);

  if (node.children.length > 0) {
    const childrenContainer = document.createElement('div');
    childrenContainer.style.paddingLeft = '18px';
    childrenContainer.style.borderLeft = '1px solid rgba(255,255,255,0.06)';
    childrenContainer.style.marginLeft = '6px';

    for (const child of node.children) {
      childrenContainer.appendChild(createTreeNodeElement(child));
    }
    container.appendChild(childrenContainer);
  }

  return container;
}

// Render Navigation & Tabs
function renderNavigation(result: CompilationResult) {
  navContainer.innerHTML = '';

  // Navbars
  if (result.navigation.navigationBars.length > 0) {
    const navCard = document.createElement('div');
    navCard.className = 'diagnostic-card';
    navCard.innerHTML = `
      <div class="diag-title">📱 Primary NavigationBar (${result.navigation.navigationBars[0].widget})</div>
      <div class="diag-msg">Destinations: ${result.navigation.navigationBars[0].destinations.map(d => `<strong>${d.label}</strong> (<code>${d.route}</code>)`).join(' • ')}</div>
    `;
    navContainer.appendChild(navCard);
  }

  // Tab Systems
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
    navContainer.innerHTML = '<div class="empty-state">No navigation bars or tab systems detected.</div>';
  }
}

// Render Validation
function renderValidation(validation: CompilationResult['validation']) {
  validationContainer.innerHTML = '';

  if (validation.diagnostics.length === 0) {
    validationContainer.innerHTML = '<div class="empty-state">✅ All structural validation checks passed with zero errors or warnings!</div>';
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
    const pill = document.createElement('div');
    pill.className = 'metric-card';
    pill.style.padding = '4px 8px';
    pill.style.display = 'inline-flex';
    pill.style.margin = '3px';
    pill.innerHTML = `
      <span style="font-size:11px; font-weight:600;">${name}</span>
      <span class="text-secondary" style="font-size:10px;">${val}</span>
    `;
    tokenColors.appendChild(pill);
  });

  tokenSpacing.innerHTML = '';
  Object.entries(result.tokens.spacing).forEach(([name, val]) => {
    const pill = document.createElement('span');
    pill.className = 'tag-badge';
    pill.style.margin = '2px';
    pill.textContent = `${name}: ${val}px`;
    tokenSpacing.appendChild(pill);
  });

  tokenAssets.innerHTML = '';
  if (result.assets.length === 0) {
    tokenAssets.innerHTML = '<div class="empty-state">No assets or SVG paths detected.</div>';
  } else {
    result.assets.forEach(a => {
      const item = document.createElement('div');
      item.className = 'diagnostic-card';
      item.innerHTML = `
        <div class="diag-title">${a.name} (${a.type})</div>
        <div class="diag-msg">Format: ${a.format} | ${a.dimensions.width}×${a.dimensions.height}px</div>
      `;
      tokenAssets.appendChild(item);
    });
  }
}

// Render Export
function renderExportFiles(result: CompilationResult) {
  exportGrid.innerHTML = '';

  const files = Object.keys(result.bundle) as Array<keyof typeof result.bundle>;
  files.forEach(filename => {
    const card = document.createElement('div');
    card.className = `export-card ${filename === currentPreviewFile ? 'active' : ''}`;
    card.innerHTML = `
      <span class="export-file-title">${filename}</span>
      <button class="btn btn-xs btn-secondary">Preview</button>
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
  const blob = await BundleExporter.createZip(currentResult.bundle);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flutter-design-export-${Date.now()}.zip`;
  a.click();
  URL.revokeObjectURL(url);
});
