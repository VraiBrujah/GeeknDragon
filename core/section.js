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
    const defaults =
      layout === 'grid'
        ? {
            gap: 'var(--layout-grid-gap)',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(var(--layout-grid-min-width), 1fr))',
          }
        : {
            gap: 'var(--layout-flex-gap)',
            flexWrap: 'wrap',
          };
    this.layoutConfig = { ...defaults, ...layoutConfig };
    this.widgets = widgets;
  }

  render(container) {
    const el = super.render(container);
    el.style.display = this.layout === 'grid' ? 'grid' : 'flex';
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
      if (widget.el && widget.el.parentNode) {
        widget.el.parentNode.removeChild(widget.el);
      }
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

  hydrate(data, widgetFactory) {
    const src = data || {};
    super.hydrate(src);
    if (src.layout) this.layout = src.layout;
    if (src.layoutConfig) this.layoutConfig = { ...src.layoutConfig };
    if (Array.isArray(src.widgets) && typeof widgetFactory === 'function') {
      this.widgets = src.widgets.map((d) => widgetFactory(d));
    }
  }

  setPreviewDevice(device) {
    if (!this.el) return;
    const varName = `--breakpoint-${device}`;
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    this.el.style.width = value || `var(${varName})`;
  }
}

export default Section;
