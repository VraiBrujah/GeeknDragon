import { create } from 'zustand';
import { produce } from 'immer';
import {
  loadProject,
  saveProject,
  loadUIState,
  saveUIState,
  loadHistory,
  saveHistory,
} from './storage';
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

interface EditorStore {
  widgets: Widget[];
  history: Widget[][];
  pointer: number;
  selectedId: string | null;
  setWidgets: (widgets: Widget[]) => void;
  select: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  widgets: [defaultWidget],
  history: [[defaultWidget]],
  pointer: 0,
  selectedId: null,

  setWidgets: (widgets) => {
    set((state) => {
      const newWidgets = produce(state.widgets, (draft) => {
        draft.splice(0, draft.length, ...widgets);
      });
      const history = state.history.slice(0, state.pointer + 1);
      history.push(newWidgets);
      saveProject(newWidgets);
      saveHistory({ stack: history, pointer: history.length - 1 });
      return {
        widgets: newWidgets,
        history,
        pointer: history.length - 1,
      };
    });
  },

  select: (id) => {
    set({ selectedId: id });
    saveUIState({ selectedId: id });
  },

  undo: () => {
    const { pointer, history } = get();
    if (pointer > 0) {
      const newPointer = pointer - 1;
      const widgets = history[newPointer];
      set({ widgets, pointer: newPointer });
      saveProject(widgets);
      saveHistory({ stack: history, pointer: newPointer });
    }
  },

  redo: () => {
    const { pointer, history } = get();
    if (pointer < history.length - 1) {
      const newPointer = pointer + 1;
      const widgets = history[newPointer];
      set({ widgets, pointer: newPointer });
      saveProject(widgets);
      saveHistory({ stack: history, pointer: newPointer });
    }
  },
}));

(async () => {
  const [project, history, ui] = await Promise.all([
    loadProject(),
    loadHistory(),
    loadUIState(),
  ]);

  let widgets = project ?? [defaultWidget];
  let histStack = history?.stack ?? [widgets];
  let pointer = history?.pointer ?? histStack.length - 1;

  useEditorStore.setState({
    widgets,
    history: histStack,
    pointer,
    selectedId: ui?.selectedId ?? null,
  });
})();

