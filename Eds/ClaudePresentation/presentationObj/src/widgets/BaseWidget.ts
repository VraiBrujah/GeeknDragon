export default class BaseWidget {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  render(): string {
    return `<div id="${this.id}"></div>`;
  }
}
