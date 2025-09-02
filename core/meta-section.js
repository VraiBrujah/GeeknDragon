import Section from './section.js';

class MetaSection extends Section {
  constructor({ sections = [], ...rest } = {}) {
    super(rest);
    this.sections = sections;
  }

  render(container) {
    const el = super.render(container);
    this.sections.forEach((s) => s.render(el));
    return el;
  }

  addSection(section) {
    this.sections.push(section);
    if (this.el) section.render(this.el);
    this.emit('change', this.serialize());
  }

  serialize() {
    return {
      ...super.serialize(),
      sections: this.sections.map((s) => (s.serialize ? s.serialize() : {})),
    };
  }

  hydrate(data = {}, sectionFactory, widgetFactory) {
    super.hydrate(data, widgetFactory);
    if (Array.isArray(data.sections) && typeof sectionFactory === 'function') {
      this.sections = data.sections.map((d) => {
        const sec = sectionFactory(d);
        return sec;
      });
    }
  }

  static fromTemplate(template = {}, widgetFactory) {
    const meta = new MetaSection(template);
    if (Array.isArray(template.sections)) {
      meta.sections = template.sections.map((sec) => {
        const section = new Section(sec);
        if (Array.isArray(sec.widgets)) {
          section.widgets = sec.widgets.map((w) => (widgetFactory ? widgetFactory(w) : w));
        }
        return section;
      });
    }
    return meta;
  }
}

export default MetaSection;
