import { create } from 'zustand';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { loadProject, saveProject, loadUIState, saveUIState } from './storage';
import type { Widget } from '../components/GrilleCanvas';

const defaultWidget: Widget = {
  id: 'w1',
  type: 'text',
  x: 50,
  y: 60,
  width: 200,
  height: 50,
  text: 'New document',
  fill: '#000',
};

const doc = new Y.Doc();
const yWidgets = doc.getArray<Widget>('widgets');
const undoManager = new Y.UndoManager(yWidgets);

let wsProvider: WebsocketProvider | null = null;
if (typeof window !== 'undefined' && typeof window.WebSocket !== 'undefined') {
  wsProvider = new WebsocketProvider('ws://localhost:1234', 'editor', doc);
}

interface EditorStore {
  widgets: Widget[];
  selectedId: string | null;
  setWidgets: (widgets: Widget[]) => void;
  select: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
}

export const useEditorStore = create<EditorStore>((set) => {
  yWidgets.observe(() => {
    const data = yWidgets.toArray() as Widget[];
    set({ widgets: data });
    saveProject(data);
  });

  (async () => {
    const [project, ui] = await Promise.all([loadProject(), loadUIState()]);
    doc.transact(() => {
      yWidgets.delete(0, yWidgets.length);
      yWidgets.insert(0, project || [defaultWidget]);
    });
    set({ selectedId: ui?.selectedId ?? null });
  })();

  return {
    widgets: yWidgets.toArray(),
    selectedId: null,
    setWidgets: (widgets) => {
      doc.transact(() => {
        yWidgets.delete(0, yWidgets.length);
        yWidgets.insert(0, widgets);
      });
    },
    select: (id) => {
      set({ selectedId: id });
      saveUIState({ selectedId: id });
    },
    undo: () => undoManager.undo(),
    redo: () => undoManager.redo(),
  };
});
