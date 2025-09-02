import BaseWidget from './base-widget.js';

class Section extends BaseWidget {
  constructor({
    layout = 'flex',
    layoutConfig = {},
    widgets = [],
    ...rest
  } = {}) {
    super(rest);
    this.layout = layout;
    this.layoutConfig = { ...layoutConfig };
    this.widgets = widgets;
  }

  render(container) {
    const el = super.render(container);
    if (this.layout === 'flex') {
      el.style.display = 'flex';
    } else if (this.layout === 'grid') {
      el.style.display = 'grid';
    }
    Object.assign(el.style, this.layoutConfig);
    this.widgets.forEach((w) => w.render(el));
    return el;
  }

  addWidget(widget) {
    this.widgets.push(widget);
    if (this.el) widget.render(this.el);
    this.emit('change', this.serialize());
  }

  removeWidget(widget) {
    const index = this.widgets.indexOf(widget);
    if (index !== -1) {
      this.widgets.splice(index, 1);
      if (widget.el && widget.el.parentNode) widget.el.parentNode.removeChild(widget.el);
      this.emit('change', this.serialize());
    }
  }

  serialize() {
    return {
      ...super.serialize(),
      layout: this.layout,
      layoutConfig: { ...this.layoutConfig },
      widgets: this.widgets.map((w) => (w.serialize ? w.serialize() : {})),
    };
  }

  hydrate(data = {}, widgetFactory) {
    super.hydrate(data);
    if (data.layout) this.layout = data.layout;
    if (data.layoutConfig) this.layoutConfig = { ...data.layoutConfig };
    if (Array.isArray(data.widgets) && typeof widgetFactory === 'function') {
      this.widgets = data.widgets.map((d) => widgetFactory(d));
    }
  }
}

export default Section;
