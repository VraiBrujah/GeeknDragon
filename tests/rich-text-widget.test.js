import { jest } from '@jest/globals';

jest.unstable_mockModule('../core/widget-state-manager.js', () => ({
  default: {
    register: jest.fn(),
    getState: jest.fn(),
    setState: jest.fn(),
    clear: jest.fn(),
  },
}));

jest.unstable_mockModule('../core/sync-manager.js', () => ({
  default: {
    subscribe: jest.fn(),
    broadcastChange: jest.fn(),
    saveState: jest.fn(),
    clear: jest.fn(),
  },
}));

let RichTextWidget;

beforeAll(async () => {
  ({ default: RichTextWidget } = await import('../core/rich-text-widget.js'));
});

describe('RichTextWidget', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  test('supports undo and redo', () => {
    const widget = new RichTextWidget({ content: '<p>Hello</p>' });
    widget.render(document.getElementById('root'));
    widget.editor.chain().focus('end').insertContent(' world').run();
    expect(widget.editor.getHTML()).toBe('<p>Hello world</p>');
    widget.undo();
    expect(widget.editor.getHTML()).toBe('<p>Hello</p>');
    widget.redo();
    expect(widget.editor.getHTML()).toBe('<p>Hello world</p>');
  });

  test('handles markdown conversion', () => {
    const widget = new RichTextWidget();
    widget.render(document.getElementById('root'));
    widget.setMarkdown('# Title');
    expect(widget.editor.getHTML()).toContain('<h1>Title</h1>');
    expect(widget.getMarkdown().trim()).toBe('# Title');
  });
});
