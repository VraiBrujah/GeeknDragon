import BaseWidget from '../../../../../../core/base-widget.js';

class PricingCardWidget extends BaseWidget {
  constructor() {
    const defaultConfig = {
      id: 'pricing-card',
      styles: {}
    };
    super(defaultConfig);
    this.data = {
      planName: 'ESSENTIEL',
      price: '299',
      currency: '$',
      period: '/mois',
      ctaText: 'Choisir ce plan',
      ctaLink: '#contact',
      features: [
        'Installation gratuite',
        'Maintenance incluse',
        'Support par email',
        "Jusqu'à 50 équipements"
      ]
    };
  }

  render() {
    const d = this.data;
    const card = document.createElement('div');
    const header = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = d.planName;
    header.appendChild(title);
    const price = document.createElement('div');
    price.textContent = `${d.currency}${d.price}${d.period}`;
    header.appendChild(price);
    card.appendChild(header);
    const list = document.createElement('ul');
    d.features.forEach(f => {
      const li = document.createElement('li');
      li.textContent = f;
      list.appendChild(li);
    });
    card.appendChild(list);
    const cta = document.createElement('a');
    cta.href = d.ctaLink;
    cta.textContent = d.ctaText;
    card.appendChild(cta);
    this.el = card;
    this.updateStyles({});
    return card;
  }
}

export default PricingCardWidget;
