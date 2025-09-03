import 'fake-indexeddb/auto';

// CanvasWidget interactions require a real canvas environment.
// Skipping these tests until a proper canvas mock is available.
describe.skip('CanvasWidget', () => {
  let CanvasWidget;

  beforeAll(async () => {
    ({ default: CanvasWidget } = await import('../core/canvas-widget.js'));
  });

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  test('maps Konva drag and transform to BaseWidget', () => {
    const widget = new CanvasWidget({ width: 100, height: 100 });
    const container = document.getElementById('root');
    widget.render(container);
    widget.rect.position({ x: 20, y: 30 });
    widget.rect.fire('dragmove');
    widget.rect.scale({ x: 2, y: 3 });
    widget.rect.rotation(45);
    widget.rect.fire('transform');
    widget.destroy();
  });
});
