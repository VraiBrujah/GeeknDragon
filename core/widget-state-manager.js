/* eslint-env browser */

/**
 * Manages the state of widgets and provides persistence/synchronization.
 *
 * @property {Map<string, import('./base-widget.js').default>} widgets Registry of widgets
 * @property {Map<string, Object>} states Stored widget states
 * @property {BroadcastChannel|null} channel Communication channel across tabs
 * @property {WebSocket|null} socket Real-time synchronization socket
 */
class WidgetStateManager {
  constructor() {
    this.widgets = new Map();
    this.states = new Map();

    // Load existing states from localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      Object.keys(localStorage).forEach((key) => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && typeof data === 'object') {
            this.states.set(key, data);
          }
        } catch (e) {
          // ignore
        }
      });
    }

    // Setup BroadcastChannel for cross-tab communication
    this.channel =
      typeof BroadcastChannel !== 'undefined'
        ? new BroadcastChannel('widget-state')
        : null;
    if (this.channel) {
      this.channel.addEventListener('message', (event) => {
        const { id, data } = event.data || {};
        if (id && data) {
          this.states.set(id, data);
          this._persist(id, data);
          const widget = this.widgets.get(id);
          if (widget) widget.hydrate(data);
        }
      });
    }

    // Attempt WebSocket connection for real-time sync
    this.socket = null;
    if (typeof WebSocket !== 'undefined' && typeof window !== 'undefined') {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        this.socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
        this.socket.addEventListener('message', (event) => {
          try {
            const { id, data } = JSON.parse(event.data);
            if (id && data) {
              this.states.set(id, data);
              this._persist(id, data);
              const widget = this.widgets.get(id);
              if (widget) widget.hydrate(data);
            }
          } catch (e) {
            // ignore malformed messages
          }
        });
      } catch (e) {
        this.socket = null; // ignore connection errors
      }
    }
  }

  /**
   * Register a widget and listen to its changes.
   *
   * @param {import('./base-widget.js').default} widget Widget instance
   */
  register(widget) {
    this.widgets.set(widget.id, widget);
    widget.onChange((data) => {
      this.setState(widget.id, data);
    });
    const existing = this.getState(widget.id);
    if (existing) widget.hydrate(existing);
  }

  /**
   * Retrieve state for a widget.
   *
   * @param {string} id Widget identifier
   * @returns {Object|null} Stored state or null
   */
  getState(id) {
    if (this.states.has(id)) return this.states.get(id);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(id);
        if (raw) {
          const data = JSON.parse(raw);
          this.states.set(id, data);
          return data;
        }
      } catch (e) {
        // ignore
      }
    }
    return null;
  }

  /**
   * Persist state and broadcast changes.
   *
   * @param {string} id Widget identifier
   * @param {Object} data Serialized widget data
   */
  setState(id, data) {
    this.states.set(id, data);
    this._persist(id, data);

    if (this.channel) {
      try {
        this.channel.postMessage({ id, data });
      } catch (e) {
        // ignore
      }
    }

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify({ id, data }));
      } catch (e) {
        // ignore
      }
    }
  }

  /**
   * Persist data to localStorage.
   *
   * @param {string} id Widget identifier
   * @param {Object} data Serialized widget data
   * @private
   */
  _persist(id, data) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(id, JSON.stringify(data));
      } catch (e) {
        // ignore
      }
    }
  }
}

const widgetStateManager = new WidgetStateManager();
export default widgetStateManager;
