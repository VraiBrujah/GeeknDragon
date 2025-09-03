/* eslint-env browser */
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';

/**
 * Synchronization manager based on Yjs. Maintains a shared Y.Doc containing a
 * `widgets` map where each entry represents the serialized state of a widget.
 *
 * Each project/presentation should call {@link init} with a unique document
 * name to create a shared collaborative document. Widget operations are
 * reflected in the Yjs types which automatically handle real-time
 * synchronization, persistence (IndexedDB) and offline support.
 */
class SyncManager {
  constructor() {
    this.widgets = new Map();
    this.doc = null;
    this.provider = null;
    this.persistence = null;
    this.map = null;
    this.isInitialized = false;
    this.suppress = false;
  }

  /**
   * Initialise the Yjs document and providers. Subsequent calls are ignored.
   *
   * @param {string} [name='default'] Unique name for the shared document
   */
  init(name = 'default') {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.doc = new Y.Doc();
    this.map = this.doc.getMap('widgets');

    // Observe Yjs changes and hydrate local widgets accordingly
    this.map.observe((event) => {
      event.changes.keys.forEach((change, key) => {
        const widget = this.widgets.get(key);
        if (!widget) return;
        this.suppress = true;
        try {
          if (change.action === 'delete') {
            widget.hydrate({});
          } else {
            const data = this.map.get(key);
            if (data) widget.hydrate(data);
          }
        } finally {
          this.suppress = false;
        }
      });
    });

    // Persist document to IndexedDB when available
    if (typeof indexedDB !== 'undefined') {
      this.persistence = new IndexeddbPersistence(name, this.doc);
    }

    // Setup WebSocket provider (disabled during tests)
    if (
      typeof window !== 'undefined' &&
      typeof window.WebSocket !== 'undefined' &&
      process.env.NODE_ENV !== 'test'
    ) {
      const url = 'ws://localhost:1234';
      this.provider = new WebsocketProvider(url, name, this.doc);
    }
  }

  /**
   * Register a widget for synchronization and hydrate it with existing data.
   *
   * @param {import('./base-widget.js').default} widget Widget instance
   */
  subscribe(widget) {
    if (!this.isInitialized) this.init();
    this.widgets.set(widget.id, widget);
    const existing = this.loadState(widget.id);
    if (existing) widget.hydrate(existing);
  }

  /** Persist the widget state in the shared Yjs document. */
  saveState(widget) {
    if (!this.isInitialized) this.init();
    if (!this.map) return;
    if (this.suppress) return;
    this.map.set(widget.id, widget.serialize());
  }

  /** Retrieve a widget state from the Yjs document. */
  loadState(id) {
    if (!this.isInitialized) this.init();
    if (!this.map) return null;
    return this.map.get(id) || null;
  }

  /** Remove widget state from the Yjs document. */
  deleteState(id) {
    const key = typeof id === 'string' ? id : id.id;
    if (!this.isInitialized) this.init();
    if (!this.map) return;
    this.map.delete(key);
    this.widgets.delete(key);
  }

  /**
   * Broadcast a change – in Yjs this simply maps to saving the state since the
   * document handles propagation automatically.
   */
  broadcastChange(widget) {
    this.saveState(widget);
  }

  /** Connect the underlying WebSocket provider if available. */
  connect() {
    this.provider?.connect();
  }

  /** Disconnect the underlying WebSocket provider if available. */
  disconnect() {
    this.provider?.disconnect();
  }

  /** Clear all widget states (used mainly for tests). */
  clear() {
    if (!this.isInitialized) this.init();
    this.widgets.clear();
    if (this.map) {
      Array.from(this.map.keys()).forEach((key) => this.map.delete(key));
    }
  }
}

const syncManager = new SyncManager();
export default syncManager;
