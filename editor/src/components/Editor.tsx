import GrilleCanvas from './GrilleCanvas';
import { useEditorStore } from '../modules/editorStore';
import { useTranslation } from 'react-i18next';

export default function Editor() {
  const { t } = useTranslation();
  const { widgets, selectedId, setWidgets, select, undo, redo } =
    useEditorStore();

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <button onClick={undo}>{t('editor.undo')}</button>
        <button onClick={redo}>{t('editor.redo')}</button>
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
