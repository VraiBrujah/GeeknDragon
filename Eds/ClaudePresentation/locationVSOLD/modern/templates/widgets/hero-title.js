import BaseWidget from '../../../../../../core/base-widget.js';

class HeroTitleWidget extends BaseWidget {
  constructor() {
    const defaultConfig = {
      id: 'hero-title',
      styles: {}
    };
    super(defaultConfig);
    this.data = {
      title: 'Li-CUBE PRO™',
      subtitle: 'LOCATION INTELLIGENTE\nZÉRO RISQUE'
    };
  }

  render() {
    const container = document.createElement('div');
    const h1 = document.createElement('h1');
    h1.textContent = this.data.title;
    const p = document.createElement('p');
    p.textContent = this.data.subtitle;
    container.appendChild(h1);
    container.appendChild(p);
    this.el = container;
    this.updateStyles({});
    return container;
  }
}

export default HeroTitleWidget;
