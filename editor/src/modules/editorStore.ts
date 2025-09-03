import { useCallback, useEffect, useReducer } from 'react';
import { enablePatches, produceWithPatches, applyPatches, Patch } from 'immer';
import { loadProject, saveProject, loadHistory, saveHistory, loadUIState, saveUIState } from './storage';
import type { Widget } from '../components/GrilleCanvas';

enablePatches();

interface HistoryEntry {
  patches: Patch[];
  inversePatches: Patch[];
}

interface EditorState {
  widgets: Widget[];
  past: HistoryEntry[];
  future: HistoryEntry[];
  selectedId: string | null;
}

type Action =
  | { type: 'INIT'; widgets: Widget[]; past: HistoryEntry[]; future: HistoryEntry[]; selectedId: string | null }
  | { type: 'APPLY'; widgets: Widget[] }
  | { type: 'SELECT'; id: string | null }
  | { type: 'UNDO' }
  | { type: 'REDO' };

function reducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case 'INIT':
      return {
        widgets: action.widgets,
        past: action.past,
        future: action.future,
        selectedId: action.selectedId,
      };
    case 'APPLY': {
      const [next, patches, inverse] = produceWithPatches(state.widgets, () => action.widgets);
      if (patches.length === 0 && inverse.length === 0) return state;
      return {
        ...state,
        widgets: next,
        past: [...state.past, { patches, inversePatches: inverse }],
        future: [],
      };
    }
    case 'SELECT':
      return { ...state, selectedId: action.id };
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const entry = state.past[state.past.length - 1];
      return {
        ...state,
        widgets: applyPatches(state.widgets, entry.inversePatches),
        past: state.past.slice(0, -1),
        future: [entry, ...state.future],
      };
    }
    case 'REDO': {
      if (state.future.length === 0) return state;
      const [entry, ...rest] = state.future;
      return {
        ...state,
        widgets: applyPatches(state.widgets, entry.patches),
        past: [...state.past, entry],
        future: rest,
      };
    }
    default:
      return state;
  }
}

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

const initialState: EditorState = {
  widgets: [defaultWidget],
  past: [],
  future: [],
  selectedId: null,
};

export function useEditorStore() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      const [project, history, ui] = await Promise.all([
        loadProject(),
        loadHistory(),
        loadUIState(),
      ]);
      dispatch({
        type: 'INIT',
        widgets: project || initialState.widgets,
        past: history?.past || [],
        future: history?.future || [],
        selectedId: ui?.selectedId ?? null,
      });
    })();
  }, []);

  useEffect(() => {
    saveProject(state.widgets);
  }, [state.widgets]);

  useEffect(() => {
    saveHistory({ past: state.past, future: state.future });
  }, [state.past, state.future]);

  useEffect(() => {
    saveUIState({ selectedId: state.selectedId });
  }, [state.selectedId]);

  const setWidgets = useCallback((widgets: Widget[]) => {
    dispatch({ type: 'APPLY', widgets });
  }, []);

  const select = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT', id });
  }, []);

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

  return {
    widgets: state.widgets,
    selectedId: state.selectedId,
    setWidgets,
    select,
    undo,
    redo,
  };
}
