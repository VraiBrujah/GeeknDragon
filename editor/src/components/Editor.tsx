import GrilleCanvas from './GrilleCanvas';
import { useEditorStore } from '../modules/editorStore';

export default function Editor() {
  const { widgets, selectedId, setWidgets, select, undo, redo } = useEditorStore();

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <button onClick={undo}>Annuler</button>
        <button onClick={redo}>Refaire</button>
      </div>
      <GrilleCanvas
        widgets={widgets}
        selectedId={selectedId}
        onSelect={select}
        onChange={setWidgets}
      />
    </div>
  );
}

