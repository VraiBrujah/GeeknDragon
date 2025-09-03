import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text, Transformer } from 'react-konva';

export interface Widget {
  id: string;
  type: 'rect' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  text?: string;
}

interface GrilleCanvasProps {
  widgets: Widget[];
  onChange?: (widgets: Widget[]) => void;
}

export default function GrilleCanvas({ widgets, onChange }: GrilleCanvasProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  useEffect(() => {
    if (transformerRef.current) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne(`#${selectedId}`);
      transformerRef.current.nodes(selectedNode ? [selectedNode] : []);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedId, widgets]);

  const updateWidget = (id: string, attrs: Partial<Widget>) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, ...attrs } : w));
    onChange?.(updated);
  };

  const exportPNG = () => {
    const uri = stageRef.current?.toDataURL({ mimeType: 'image/png' });
    if (!uri) return;
    const link = document.createElement('a');
    link.download = 'grille.png';
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSVG = () => {
    const svg = stageRef.current?.toSVG();
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'grille.svg';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <button onClick={exportPNG}>Export PNG</button>
        <button onClick={exportSVG}>Export SVG</button>
      </div>
      <Stage
        width={800}
        height={600}
        ref={stageRef}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            setSelectedId(null);
          }
        }}
      >
        <Layer>
          {widgets.map((w) => {
            const commonProps = {
              id: w.id,
              key: w.id,
              x: w.x,
              y: w.y,
              draggable: true,
              onDragEnd: (e: any) => updateWidget(w.id, { x: e.target.x(), y: e.target.y() }),
              onTransformEnd: (e: any) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();
                node.scaleX(1);
                node.scaleY(1);
                updateWidget(w.id, {
                  x: node.x(),
                  y: node.y(),
                  width: Math.max(5, node.width() * scaleX),
                  height: Math.max(5, node.height() * scaleY),
                });
              },
              onClick: () => setSelectedId(w.id),
            };
            if (w.type === 'rect') {
              return <Rect {...commonProps} width={w.width} height={w.height} fill={w.fill} />;
            }
            return <Text {...commonProps} width={w.width} height={w.height} text={w.text} fill={w.fill} />;
          })}
          <Transformer ref={transformerRef} rotateEnabled={false} />
        </Layer>
      </Stage>
    </div>
  );
}

