import BaseWidget from '../core/base-widget.js';
import stateManager from '../core/widget-state-manager.js';

describe('BaseWidget', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    stateManager.widgets.clear();
    stateManager.states.clear();
    localStorage.clear();
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
    const data = widget.serialize();
    const clone = new BaseWidget();
    clone.hydrate(data);
    expect(clone.serialize()).toEqual(data);
  });
});
