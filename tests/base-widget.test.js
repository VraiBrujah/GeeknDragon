import BaseWidget from '../core/base-widget.js';
import stateManager from '../core/widget-state-manager.js';
import syncManager from '../core/sync-manager.js';

describe('BaseWidget', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    stateManager.widgets.clear();
    stateManager.states.clear();
    localStorage.clear();
    syncManager.widgets.clear();
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
    const widget = new BaseWidget({ x: 5, y: 6, width: 70, height: 80 });
    widget.data = { foo: 'bar' };
    widget.custom = 42;
    widget.el = document.createElement('div');
    widget.on('test', () => {});

    const data = widget.serialize();

    expect(data.data).toEqual({ foo: 'bar' });
    expect(data.custom).toBe(42);
    expect(data.el).toBeUndefined();
    expect(data.events).toBeUndefined();

    const clone = new BaseWidget();
    clone.hydrate(data);
    expect(clone.data).toEqual({ foo: 'bar' });
    expect(clone.custom).toBe(42);
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
});
