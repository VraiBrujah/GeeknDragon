import 'fake-indexeddb/auto';

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}
let BaseWidget;
let stateManager;
let syncManager;

beforeAll(async () => {
  ({ default: BaseWidget } = await import('../core/base-widget.js'));
  ({ default: stateManager } = await import('../core/widget-state-manager.js'));
  ({ default: syncManager } = await import('../core/sync-manager.js'));
});

describe('BaseWidget', () => {
  beforeEach(async () => {
    document.body.innerHTML = '<div id="root"></div>';
    await stateManager.clear();
    localStorage.clear();
    syncManager.clear();
  });

  test('renders element and applies styles', () => {
    const widget = new BaseWidget({
      x: 10,
      y: 20,
      width: 50,
      height: 60,
      styles: { background: 'red' },
    });
    const container = document.getElementById('root');
    const el = widget.render(container);

    expect(el.style.position).toBe('absolute');
    expect(el.style.left).toBe('10px');
    expect(el.style.top).toBe('20px');
    expect(el.style.width).toBe('50px');
    expect(el.style.height).toBe('60px');
    expect(el.style.background).toBe('red');
  });

  test('serialize and hydrate maintain state', () => {
    const widget = new BaseWidget({
      x: 5,
      y: 6,
      width: 70,
      height: 80,
      rotation: 10,
    });
    widget.data = { foo: 'bar' };
    widget.custom = 42;
    widget.el = document.createElement('div');
    widget.on('test', () => {});

    const data = widget.serialize();

    expect(data.data).toEqual({ foo: 'bar' });
    expect(data.custom).toBe(42);
    expect(data.rotation).toBe(10);
    expect(data.el).toBeUndefined();
    expect(data.events).toBeUndefined();

    const clone = new BaseWidget();
    clone.hydrate(data);
    expect(clone.data).toEqual({ foo: 'bar' });
    expect(clone.custom).toBe(42);
    expect(clone.rotation).toBe(10);
    expect(clone.serialize()).toEqual(data);
  });

  test('saveState and loadState persist extended data', () => {
    const widget = new BaseWidget({ id: 'w1' });
    widget.data = { message: 'hello' };
    widget.extra = 99;
    widget.saveState();

    const clone = new BaseWidget({ id: 'w1' });
    clone.loadState();

    expect(clone.data).toEqual({ message: 'hello' });
    expect(clone.extra).toBe(99);
  });

  test('style setters delegate to updateStyles', () => {
    const widget = new BaseWidget();
    const container = document.getElementById('root');
    widget.render(container);
    widget.setBackground('blue');
    widget.setBorder('1px solid red');
    widget.setBorderRadius('5px');
    widget.setOpacity(0.5);
    widget.setBoxShadow('0 0 5px black');
    widget.setRotation(45);
    expect(widget.el.style.background).toBe('blue');
    expect(widget.el.style.border).toBe('1px solid red');
    expect(widget.el.style.borderRadius).toBe('5px');
    expect(widget.el.style.opacity).toBe('0.5');
    expect(widget.el.style.boxShadow).toBe('0 0 5px black');
    expect(widget.el.style.transform).toBe('rotate(45deg)');
  });
});
