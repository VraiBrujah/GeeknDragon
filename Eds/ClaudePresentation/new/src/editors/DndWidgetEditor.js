import React, {useState} from 'react';
import {DndContext, useDraggable, useDroppable, PointerSensor, useSensor, useSensors} from '@dnd-kit/core';
import {SortableContext, arrayMove, rectSortingStrategy} from '@dnd-kit/sortable';
import {createSnapModifier} from '@dnd-kit/modifiers';

/**
 * Éditeur de widgets avec gestion drag & drop via dnd-kit
 * Utilise les hooks useDraggable et useDroppable pour déplacer les items
 * et un capteur PointerSensor avec snapping sur une grille
 */

// Fonction composant représentant un widget draggable
function DraggableWidget({id}) {
  // Hook pour rendre l'élément draggable
  const {attributes, listeners, setNodeRef, transform} = useDraggable({id});
  // Application du déplacement via transform
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    padding: '8px',
    background: '#E5E7EB',
    margin: '4px',
    cursor: 'grab'
  };
  return React.createElement('div', {...attributes, ...listeners, ref: setNodeRef, style}, `Widget ${id}`);
}

// Zone de drop utilisant useDroppable
function DroppableZone({id, children}) {
  const {isOver, setNodeRef} = useDroppable({id});
  const style = {
    minHeight: '200px',
    border: '2px dashed #94A3B8',
    padding: '10px',
    background: isOver ? '#DBEAFE' : '#FFFFFF'
  };
  return React.createElement('div', {ref: setNodeRef, style}, children);
}

// Composant principal orchestrant le drag & drop
export default function DndWidgetEditor() {
  // État local contenant l'ordre des widgets
  const [items, setItems] = useState(['A', 'B', 'C']);
  // Capteurs utilisés par dnd-kit
  const sensors = useSensors(useSensor(PointerSensor));
  // Snap sur une grille de 20px
  const gridSize = 20;
  const snapToGrid = createSnapModifier(gridSize);

  // Déplacement final des items
  function handleDragEnd(event) {
    const {active, over} = event;
    if (active && over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  // Rendu du contexte DnD avec la zone et les widgets
  return React.createElement(
    DndContext,
    {sensors, modifiers: [snapToGrid], onDragEnd: handleDragEnd},
    React.createElement(
      SortableContext,
      {items, strategy: rectSortingStrategy},
      React.createElement(
        DroppableZone,
        {id: 'zone'},
        items.map((id) => React.createElement(DraggableWidget, {key: id, id}))
      )
    )
  );
}
