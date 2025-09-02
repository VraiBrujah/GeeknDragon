import BaseWidget from '../../../../../../core/base-widget.js';

class LogoWidget extends BaseWidget {
  constructor() {
    const defaultConfig = {
      id: 'logo',
      width: 60,
      height: 60,
      styles: {}
    };
    super(defaultConfig);
    this.data = {
      imagePath: '../assets/images/logo-eds.png',
      altText: 'Logo EDS Québec',
      link: '#'
    };
  }

  render() {
    const container = document.createElement('div');
    const link = document.createElement('a');
    link.href = this.data.link;
    const img = document.createElement('img');
    img.src = this.data.imagePath;
    img.alt = this.data.altText;
    link.appendChild(img);
    container.appendChild(link);
    this.el = container;
    this.updateStyles({});
    this.setSize(this.width, this.height);
    return container;
  }
}

export default LogoWidget;
