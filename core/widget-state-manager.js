/* eslint-env browser */
import db from './presentation-db.js';

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

    // Load existing states from IndexedDB via Dexie
    this.ready = db.widgets.toArray().then((rows) => {
      rows.forEach(({ id, data }) => {
        this.states.set(id, data);
      });
    });

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
    else
      this.ready.then(() => {
        const later = this.getState(widget.id);
        if (later) widget.hydrate(later);
      });
  }

  /**
   * Retrieve state for a widget.
   *
   * @param {string} id Widget identifier
   * @returns {Object|null} Stored state or null
   */
  getState(id) {
    if (this.states.has(id)) return this.states.get(id);
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
  async _persist(id, data) {
    try {
      await db.transaction('rw', db.widgets, db.histories, async () => {
        await db.widgets.put({ id, data });
        await db.histories.add({ widgetId: id, data, createdAt: Date.now() });
      });
    } catch (e) {
      // ignore
    }
  }

  async clear() {
    this.widgets.clear();
    this.states.clear();
    await db.transaction(
      'rw',
      db.widgets,
      db.snapshots,
      db.histories,
      async () => {
        await db.widgets.clear();
        await db.snapshots.clear();
        await db.histories.clear();
      },
    );
  }
}

const widgetStateManager = new WidgetStateManager();
export default widgetStateManager;
