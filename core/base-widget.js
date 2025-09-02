/* eslint-env browser */
import stateManager from './widget-state-manager.js';
import syncManager from './sync-manager.js';

/**
 * Base class representing a visual widget that can be positioned and styled.
 *
 * @property {string} id          Unique identifier for the widget
 * @property {number} x           Horizontal position in pixels
 * @property {number} y           Vertical position in pixels
 * @property {number} width       Width in pixels
 * @property {number} height      Height in pixels
 * @property {number} zIndex      Stacking order for overlapping widgets
 * @property {Object} styles      CSS styles applied to the widget element
 * @property {HTMLElement|null} el  DOM element representing the widget
 * @property {Object<string, Set<Function>>} events Map of event listeners
 */
class BaseWidget {
  /**
   * Create a new BaseWidget instance.
   *
   * @param {Object} [options]
   * @param {string} [options.id]         Widget identifier
   * @param {number} [options.x=0]        Initial x position
   * @param {number} [options.y=0]        Initial y position
   * @param {number} [options.width=100]  Initial width
   * @param {number} [options.height=100] Initial height
   * @param {number} [options.zIndex=1]   Initial z-index
   * @param {Object} [options.styles]     Initial CSS styles
   */
  constructor({
    id = `widget-${Date.now()}`,
    x = 0,
    y = 0,
    width = 100,
    height = 100,
    zIndex = 1,
    styles = {},
  } = {}) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.zIndex = zIndex;
    this.styles = {
      background: 'transparent',
      border: 'none',
      borderRadius: '0px',
      boxShadow: 'none',
      opacity: 1,
      ...styles,
    };
    this.el = null;
    this.events = {};
    stateManager.register(this);
    syncManager.subscribe(this);
  }

  /**
   * Render the widget into a container element.
   *
   * @param {HTMLElement} container DOM element that will contain the widget
   * @returns {HTMLElement} The rendered element
   */
  render(container) {
    if (!container) throw new Error('Container is required');
    if (!this.el) {
      this.el = document.createElement('div');
      this.el.id = this.id;
      this.el.style.position = 'absolute';
      container.appendChild(this.el);
    } else if (!this.el.parentNode) {
      container.appendChild(this.el);
    }
    this.applyStyles();
    this.setPosition(this.x, this.y);
    this.setSize(this.width, this.height);
    return this.el;
  }

  /** Apply current styles to the DOM element. */
  applyStyles() {
    if (!this.el) return;
    Object.entries(this.styles).forEach(([key, value]) => {
      this.el.style[key] = value;
    });
    this.el.style.zIndex = this.zIndex;
  }

  /**
   * Merge new style properties and re-render the widget.
   *
   * @param {Object} [partialStyles] Styles to merge with existing ones
   */
  updateStyles(partialStyles = {}) {
    this.styles = { ...this.styles, ...partialStyles };
    this.applyStyles();
    this.emit('change', this.serialize());
    this.saveState();
    syncManager.broadcastChange(this);
  }

  /**
   * Update widget coordinates.
   *
   * @param {number} x New horizontal position
   * @param {number} y New vertical position
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    if (this.el) {
      this.el.style.left = `${x}px`;
      this.el.style.top = `${y}px`;
    }
    this.emit('change', this.serialize());
    this.saveState();
    syncManager.broadcastChange(this);
  }

  /**
   * Update widget dimensions.
   *
   * @param {number} width New width in pixels
   * @param {number} height New height in pixels
   */
  setSize(width, height) {
    this.width = width;
    this.height = height;
    if (this.el) {
      this.el.style.width = `${width}px`;
      this.el.style.height = `${height}px`;
    }
    this.emit('change', this.serialize());
    this.saveState();
    syncManager.broadcastChange(this);
  }

  /**
   * Create a plain object representation of the widget.
   *
   * @returns {Object} Serializable widget state
   */
  serialize() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      zIndex: this.zIndex,
      styles: { ...this.styles },
    };
  }

  /**
   * Rehydrate a widget from previously serialized data.
   *
   * @param {Object} [data] Serialized widget data
   */
  hydrate(data = {}) {
    if (data.id) this.id = data.id;
    if (typeof data.x === 'number' && typeof data.y === 'number')
      this.setPosition(data.x, data.y);
    if (typeof data.width === 'number' && typeof data.height === 'number')
      this.setSize(data.width, data.height);
    if (typeof data.zIndex === 'number') {
      this.zIndex = data.zIndex;
      if (this.el) this.el.style.zIndex = data.zIndex;
    }
    if (data.styles) this.updateStyles(data.styles);
  }

  /** Persist current state using the widget state manager. */
  saveState() {
    const data = this.serialize();
    stateManager.setState(this.id, data);
    syncManager.saveState(this);
  }

  /** Load state from the widget state manager if available. */
  loadState() {
    const data =
      stateManager.getState(this.id) || syncManager.loadState(this.id);
    if (data) this.hydrate(data);
  }

  /**
   * Register an event handler.
   *
   * @param {string} event Event name
   * @param {Function} handler Callback invoked on event
   */
  on(event, handler) {
    if (!this.events[event]) this.events[event] = new Set();
    this.events[event].add(handler);
  }

  /**
   * Remove a previously registered event handler.
   *
   * @param {string} event Event name
   * @param {Function} handler Handler to remove
   */
  off(event, handler) {
    this.events[event]?.delete(handler);
  }

  /**
   * Emit an event to all registered listeners.
   *
   * @param {string} event Event name
   * @param {*} payload Data passed to listeners
   */
  emit(event, payload) {
    this.events[event]?.forEach((cb) => cb(payload));
  }

  /**
   * Convenience wrapper for change event.
   *
   * @param {Function} handler Callback invoked on changes
   */
  onChange(handler) {
    this.on('change', handler);
  }
}

export default BaseWidget;
