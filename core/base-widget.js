/* eslint-env browser */
import stateManager from './widget-state-manager.js';

class BaseWidget {
  constructor({ id = `widget-${Date.now()}`, x = 0, y = 0, width = 100, height = 100, zIndex = 1, styles = {} } = {}) {
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
  }

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

  applyStyles() {
    if (!this.el) return;
    Object.entries(this.styles).forEach(([key, value]) => {
      this.el.style[key] = value;
    });
    this.el.style.zIndex = this.zIndex;
  }

  updateStyles(partialStyles = {}) {
    this.styles = { ...this.styles, ...partialStyles };
    this.applyStyles();
    this.emit('change', this.serialize());
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    if (this.el) {
      this.el.style.left = `${x}px`;
      this.el.style.top = `${y}px`;
    }
    this.emit('change', this.serialize());
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
    if (this.el) {
      this.el.style.width = `${width}px`;
      this.el.style.height = `${height}px`;
    }
    this.emit('change', this.serialize());
  }

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

  hydrate(data = {}) {
    if (data.id) this.id = data.id;
    if (typeof data.x === 'number' && typeof data.y === 'number') this.setPosition(data.x, data.y);
    if (typeof data.width === 'number' && typeof data.height === 'number') this.setSize(data.width, data.height);
    if (typeof data.zIndex === 'number') {
      this.zIndex = data.zIndex;
      if (this.el) this.el.style.zIndex = data.zIndex;
    }
    if (data.styles) this.updateStyles(data.styles);
  }

  saveState() {
    stateManager.setState(this.id, this.serialize());
  }

  loadState() {
    const data = stateManager.getState(this.id);
    if (data) this.hydrate(data);
  }

  on(event, handler) {
    if (!this.events[event]) this.events[event] = new Set();
    this.events[event].add(handler);
  }

  off(event, handler) {
    this.events[event]?.delete(handler);
  }

  emit(event, payload) {
    this.events[event]?.forEach((cb) => cb(payload));
  }

  onChange(handler) {
    this.on('change', handler);
  }
}

export default BaseWidget;
