/* eslint-env browser */
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { WebrtcProvider } from 'y-webrtc';
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
    // History manager to allow undo/redo of changes
    this.undoManager = null;
    // Which provider type is currently used (websocket or webrtc)
    this.providerType = 'websocket';
  }

  /**
   * Initialise the Yjs document and providers. Subsequent calls are ignored.
   *
   * @param {string} [name='default'] Unique name for the shared document
   */
  init(name = 'default', { provider = 'websocket' } = {}) {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.providerType = provider;
    this.doc = new Y.Doc();
    this.map = this.doc.getMap('widgets');
    // Track operations on the shared map to enable undo/redo history
    // captureTimeout=0 ensures each change is a distinct undo step
    this.undoManager = new Y.UndoManager(this.map, { captureTimeout: 0 });

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

    // Setup real-time provider (disabled during tests)
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
      if (provider === 'webrtc') {
        this.provider = new WebrtcProvider(name, this.doc);
      } else if (typeof window.WebSocket !== 'undefined') {
        const url = 'ws://localhost:1234';
        this.provider = new WebsocketProvider(url, name, this.doc);
      }
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

  /** Undo the last change recorded in the shared document. */
  undo() {
    this.undoManager?.undo();
  }

  /** Redo the previously undone change. */
  redo() {
    this.undoManager?.redo();
  }

  /** Retrieve basic information about the undo/redo history. */
  getHistory() {
    return {
      undo: this.undoManager?.undoStack.length || 0,
      redo: this.undoManager?.redoStack.length || 0,
    };
  }

  /** Export the current Yjs document as an update. */
  encodeState() {
    if (!this.isInitialized) this.init();
    return Y.encodeStateAsUpdate(this.doc);
  }

  /**
   * Merge an incoming Yjs update into the current document.
   *
   * @param {Uint8Array} update Binary update produced by Yjs
   */
  applyUpdate(update) {
    if (!this.isInitialized) this.init();
    Y.applyUpdate(this.doc, update);
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
    this.undoManager?.clear();
  }
}

const syncManager = new SyncManager();
export default syncManager;
