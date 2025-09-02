import BaseWidget from '../../../../../../core/base-widget.js';

class TextSimpleWidget extends BaseWidget {
  constructor() {
    const defaultConfig = {
      id: 'text-simple',
      styles: {}
    };
    super(defaultConfig);
    this.data = {
      text: 'Votre texte ici...'
    };
  }

  render() {
    const el = document.createElement('div');
    el.textContent = this.data.text;
    this.el = el;
    this.updateStyles({});
    return el;
  }
}

export default TextSimpleWidget;
