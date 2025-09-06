import React from 'react';
import {createRoot} from 'react-dom/client';
import DndWidgetEditor from './DndWidgetEditor.js';

// Point d'entrée pour monter l'éditeur dans la page
const rootElement = document.getElementById('dnd-editor-root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(React.createElement(DndWidgetEditor));
}
