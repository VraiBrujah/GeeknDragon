import Konva from 'konva/lib/index.js';
import BaseWidget from './base-widget.js';

/**
 * Widget encapsulating a Konva Stage.
 * Maps Konva transformations to BaseWidget properties.
 */
class CanvasWidget extends BaseWidget {
  constructor(options = {}) {
    super(options);
    this.stage = null;
    this.layer = null;
    this.rect = null;
  }

  render(container) {
    const el = super.render(container);
    if (!this.stage) {
      this.stage = new Konva.Stage({
        container: el,
        width: this.width,
        height: this.height,
      });
      this.layer = new Konva.Layer();
      this.stage.add(this.layer);
      this.rect = new Konva.Rect({
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
        draggable: true,
      });
      this.layer.add(this.rect);
      const transformer = new Konva.Transformer({
        nodes: [this.rect],
        rotateEnabled: true,
      });
      this.layer.add(transformer);
      this.rect.on('dragmove', () => {
        const { x, y } = this.rect.position();
        this.rect.position({ x: 0, y: 0 });
        this.setPosition(this.x + x, this.y + y);
      });
      this.rect.on('transform', () => {
        const width = this.rect.width() * this.rect.scaleX();
        const height = this.rect.height() * this.rect.scaleY();
        this.rect.scaleX(1);
        this.rect.scaleY(1);
        this.rect.size({ width, height });
        this.stage.size({ width, height });
        this.setSize(width, height);
        this.setRotation(this.rect.rotation());
      });
      this.layer.draw();
    } else {
      this.stage.size({ width: this.width, height: this.height });
      this.rect.size({ width: this.width, height: this.height });
      this.layer.batchDraw();
    }
    return el;
  }

  destroy() {
    if (this.stage) this.stage.destroy();
    this.stage = null;
    this.layer = null;
    this.rect = null;
  }
}

export default CanvasWidget;
