import 'fake-indexeddb/auto';

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}

let Section;
let stateManager;
let syncManager;

beforeAll(async () => {
  ({ default: Section } = await import('../core/section.js'));
  ({ default: stateManager } = await import('../core/widget-state-manager.js'));
  ({ default: syncManager } = await import('../core/sync-manager.js'));
});

describe('Section layout', () => {
  beforeEach(async () => {
    document.body.innerHTML = '<div id="root"></div>';
    await stateManager.clear();
    localStorage.clear();
    syncManager.clear();
  });

  test('uses grid layout and tokens', () => {
    const section = new Section({ layout: 'grid' });
    const container = document.getElementById('root');
    const el = section.render(container);
    expect(el.style.display).toBe('grid');
    expect(el.style.gap).toBe('var(--layout-grid-gap)');
    expect(el.style.gridTemplateColumns).toBe(
      'repeat(auto-fill, minmax(var(--layout-grid-min-width), 1fr))',
    );
  });

  test('setPreviewDevice applies breakpoint width', () => {
    document.documentElement.style.setProperty('--breakpoint-mobile', '375px');
    const section = new Section();
    const container = document.getElementById('root');
    const el = section.render(container);
    section.setPreviewDevice('mobile');
    expect(el.style.width).toBe('375px');
  });
});
