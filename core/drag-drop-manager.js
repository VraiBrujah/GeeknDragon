import { DndContext } from '@dnd-kit/core';

/**
 * Generic drag & drop manager handling widget moves and enforcing
 * parent constraints like allowedParents and maxChildren.
 */
class DragDropManager {
  constructor() {
    this.widgets = new Map();
    this.containers = new Map();
  }

  registerWidget(widget) {
    this.widgets.set(widget.id, { ...widget });
  }

  registerContainer(container) {
    const normalized = {
      ...container,
      children: Array.isArray(container.children)
        ? [...container.children]
        : [],
    };
    this.containers.set(container.id, normalized);
  }

  canDrop(widgetId, containerId) {
    const widget = this.widgets.get(widgetId);
    const container = this.containers.get(containerId);
    if (!widget || !container) return false;
    if (
      Array.isArray(widget.allowedParents) &&
      widget.allowedParents.length > 0 &&
      !widget.allowedParents.includes(container.type)
    ) {
      return false;
    }
    if (
      typeof container.maxChildren === 'number' &&
      container.children.length >= container.maxChildren
    ) {
      return false;
    }
    return true;
  }

  handleDragEnd(event) {
    const { active, over } = event;
    if (!active || !over) return false;
    const widgetId = active.id;
    const containerId = over.id;
    if (!this.canDrop(widgetId, containerId)) return false;
    const widget = this.widgets.get(widgetId);
    const target = this.containers.get(containerId);
    if (widget.parentId) {
      const prev = this.containers.get(widget.parentId);
      if (prev) prev.children = prev.children.filter((id) => id !== widgetId);
    }
    target.children.push(widgetId);
    widget.parentId = containerId;
    return true;
  }
}

export { DragDropManager, DndContext };
export default DragDropManager;
