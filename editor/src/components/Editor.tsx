import { useState } from 'react';
import GrilleCanvas, { Widget } from './GrilleCanvas';
import { getInitialContent } from '../modules/editorStore';

export default function Editor() {
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: 'w1',
      type: 'text',
      x: 50,
      y: 60,
      width: 200,
      height: 50,
      text: getInitialContent(),
      fill: '#000',
    },
  ]);

  return <GrilleCanvas widgets={widgets} onChange={setWidgets} />;
}

