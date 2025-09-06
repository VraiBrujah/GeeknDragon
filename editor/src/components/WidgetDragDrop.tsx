import { useEffect } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import DragDropManager from '../../../core/drag-drop-manager.js';

interface WidgetItem {
  id: string;
  label: string;
  allowedParents?: string[];
  parentId?: string;
}

interface ContainerItem {
  id: string;
  type: string;
  maxChildren?: number;
  children?: string[];
}

function Draggable({ id, label }: WidgetItem) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px,0)`
      : undefined,
    padding: '4px',
    border: '1px solid #ccc',
    margin: '4px',
    background: '#f3f4f6',
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {label}
    </div>
  );
}

function Droppable({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const style: React.CSSProperties = {
    minHeight: '80px',
    border: '2px dashed #94a3b8',
    padding: '8px',
    background: isOver ? '#e0f2fe' : '#fff',
  };
  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}

export default function WidgetDragDrop({
  widgets,
  containers,
}: {
  widgets: WidgetItem[];
  containers: ContainerItem[];
}) {
  useEffect(() => {
    containers.forEach((c) => DragDropManager.registerContainer(c));
    widgets.forEach((w) => DragDropManager.registerWidget(w));
  }, [widgets, containers]);

  return (
    <DndContext onDragEnd={(e) => DragDropManager.handleDragEnd(e)}>
      {containers.map((c) => (
        <Droppable key={c.id} id={c.id}>
          {widgets
            .filter((w) => w.parentId === c.id)
            .map((w) => (
              <Draggable key={w.id} {...w} />
            ))}
        </Droppable>
      ))}
    </DndContext>
  );
}
