/* eslint-disable import/no-extraneous-dependencies */
import { jest } from '@jest/globals';
import syncManager from '../core/sync-manager.js';

class DummyWidget {
  constructor(id) {
    this.id = id;
    this.state = {
      id,
      x: 0,
      y: 0,
      width: 10,
      height: 10,
      zIndex: 1,
      styles: {},
    };
    this.hydrate = jest.fn((data) => {
      this.state = { ...this.state, ...data };
    });
  }

  serialize() {
    return { ...this.state };
  }
}

describe('SyncManager', () => {
  beforeEach(() => {
    // reset the internal Y.Doc and maps
    syncManager.clear();
  });

  test('saveState and loadState roundtrip', () => {
    const widget = new DummyWidget('w1');
    syncManager.saveState(widget);
    expect(syncManager.loadState('w1')).toEqual(widget.serialize());
  });

  test('subscribe hydrates existing state', () => {
    const saved = {
      id: 'w2',
      x: 5,
      y: 6,
      width: 20,
      height: 30,
      zIndex: 2,
      styles: { color: 'red' },
    };
    // Directly set state in the Y.Doc map before subscribing
    syncManager.map.set('w2', saved);
    const widget = new DummyWidget('w2');
    syncManager.subscribe(widget);
    expect(widget.hydrate).toHaveBeenCalledWith(saved);
  });

  test('undo and redo apply previous widget states', () => {
    const widget = new DummyWidget('w3');
    // initial state
    syncManager.saveState(widget);

    // change x position and save
    widget.state.x = 10;
    syncManager.saveState(widget);
    expect(syncManager.loadState('w3').x).toBe(10);

    // undo should revert to previous x
    syncManager.undo();
    expect(syncManager.loadState('w3').x).toBe(0);

    // redo should re-apply x = 10
    syncManager.redo();
    expect(syncManager.loadState('w3').x).toBe(10);
  });

  test('encodeState and applyUpdate merge remote changes', () => {
    const widget = new DummyWidget('w4');
    widget.state.x = 15;
    syncManager.saveState(widget);
    const update = syncManager.encodeState();
    syncManager.clear();
    // simulate loading into a fresh document
    syncManager.isInitialized = false;
    syncManager.applyUpdate(update);
    expect(syncManager.loadState('w4').x).toBe(15);
  });

  test('getHistory exposes counts of undo and redo stacks', () => {
    const widget = new DummyWidget('w5');
    syncManager.saveState(widget);
    widget.state.x = 20;
    syncManager.saveState(widget);
    expect(syncManager.getHistory()).toEqual({ undo: 2, redo: 0 });
    syncManager.undo();
    expect(syncManager.getHistory()).toEqual({ undo: 1, redo: 1 });
  });
});
