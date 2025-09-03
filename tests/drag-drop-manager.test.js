import DragDropManager from '../core/drag-drop-manager.js';

describe('DragDropManager', () => {
  test('respects allowedParents constraint', () => {
    const mgr = new DragDropManager();
    mgr.registerWidget({ id: 'w1', allowedParents: ['section'] });
    mgr.registerContainer({ id: 'c1', type: 'section', children: [] });
    mgr.registerContainer({ id: 'c2', type: 'other', children: [] });
    expect(mgr.canDrop('w1', 'c1')).toBe(true);
    expect(mgr.canDrop('w1', 'c2')).toBe(false);
  });

  test('enforces maxChildren constraint', () => {
    const mgr = new DragDropManager();
    mgr.registerWidget({ id: 'w1' });
    mgr.registerWidget({ id: 'w2' });
    mgr.registerContainer({
      id: 'c1',
      type: 'section',
      maxChildren: 1,
      children: [],
    });
    expect(
      mgr.handleDragEnd({ active: { id: 'w1' }, over: { id: 'c1' } }),
    ).toBe(true);
    expect(
      mgr.handleDragEnd({ active: { id: 'w2' }, over: { id: 'c1' } }),
    ).toBe(false);
  });
});
