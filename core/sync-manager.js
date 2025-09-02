/* eslint-env browser */

/**
 * Simple synchronization manager persisting widget state to localStorage and
 * broadcasting changes through BroadcastChannel.
 *
 * The state format is a JSON object returned by `BaseWidget#serialize()`,
 * containing: {id,x,y,width,height,zIndex,styles}.
 */
class SyncManager {
  constructor() {
    this.widgets = new Map();
    this.channel = null;
    this.isInitialized = false;
  }

  /** Initialise BroadcastChannel and storage listeners. */
  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (typeof window !== 'undefined') {
      if ('BroadcastChannel' in window) {
        this.channel = new BroadcastChannel('widget-sync');
        this.channel.addEventListener('message', (event) => {
          const { id, data } = event.data || {};
          if (!id || !data) return;
          const widget = this.widgets.get(id);
          if (widget) widget.hydrate(data);
          this._persist(id, data);
        });
      }

      window.addEventListener('storage', (event) => {
        if (!event.key || !event.newValue) return;
        if (!event.key.startsWith('widget-')) return;
        try {
          const data = JSON.parse(event.newValue);
          const id = event.key.replace('widget-', '');
          const widget = this.widgets.get(id);
          if (widget) widget.hydrate(data);
        } catch (e) {
          // ignore malformed JSON
        }
      });
    }
  }

  /** Register a widget for synchronization and hydrate if data exists. */
  subscribe(widget) {
    if (!this.isInitialized) this.init();
    this.widgets.set(widget.id, widget);
    const existing = this.loadState(widget.id);
    if (existing) widget.hydrate(existing);
  }

  /** Persist widget state to localStorage. */
  saveState(widget) {
    this._persist(widget.id, widget.serialize());
  }

  /** Retrieve widget state from localStorage. */
  loadState(id) {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    try {
      const raw = localStorage.getItem(this._key(id));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /** Broadcast a widget change to other tabs. */
  broadcastChange(widget) {
    if (!this.channel) return;
    try {
      this.channel.postMessage({ id: widget.id, data: widget.serialize() });
    } catch (e) {
      // ignore broadcast errors
    }
  }

  _persist(id, data) {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(this._key(id), JSON.stringify(data));
    } catch (e) {
      // ignore persistence errors
    }
  }

  _key(id) {
    return `widget-${id}`;
  }
}

const syncManager = new SyncManager();
export default syncManager;
