/* eslint-disable import/no-extraneous-dependencies */
import { jest } from '@jest/globals';
import stateManager from '../core/widget-state-manager.js';

describe('WidgetStateManager', () => {
  beforeEach(() => {
    stateManager.widgets.clear();
    stateManager.states.clear();
    localStorage.clear();
  });

  test('setState and getState roundtrip', () => {
    const data = { foo: 'bar' };
    stateManager.setState('w1', data);
    expect(stateManager.getState('w1')).toEqual(data);
  });

  test('register hooks into widget changes', () => {
    const widget = {
      id: 'w2',
      onChange: jest.fn(),
      hydrate: jest.fn(),
    };
    stateManager.register(widget);
    expect(widget.onChange).toHaveBeenCalled();
    const changeHandler = widget.onChange.mock.calls[0][0];
    changeHandler({ value: 42 });
    expect(stateManager.getState('w2')).toEqual({ value: 42 });
  });
});
