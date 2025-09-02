import widgetLoader from '../Eds/ClaudePresentation/locationVSOLD/modern/core/widget-loader.js';
import BaseWidget from '../core/base-widget.js';

describe('WidgetLoader', () => {
  afterEach(() => {
    widgetLoader.widgetRegistry.delete('json');
    widgetLoader.widgetRegistry.delete('invalid');
    widgetLoader.instanceCache.clear();
  });

  test('validateWidgetClass enforces BaseWidget inheritance', () => {
    class InvalidWidget {}
    expect(widgetLoader.validateWidgetClass(InvalidWidget)).toBe(false);
    widgetLoader.registerWidgetClass('invalid', InvalidWidget);
    expect(widgetLoader.widgetRegistry.has('invalid')).toBe(false);
  });

  test('createWidget uses fromJSON when available', async () => {
    class JsonWidget extends BaseWidget {
      constructor() {
        super({ id: 'json', styles: {} });
        this.name = 'json';
        this.category = 'test';
      }
      render(container) {
        return super.render(container);
      }
      getEditableFields() {
        return [];
      }
      fromJSON(data) {
        this.extra = data.extra;
      }
    }
    widgetLoader.registerWidgetClass('json', JsonWidget);
    const instance = await widgetLoader.createWidget('json', { extra: 42 }, false);
    expect(instance.extra).toBe(42);
  });
});
