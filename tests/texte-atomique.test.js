import TexteAtomique from '../core/texte-atomique.js';

describe('TexteAtomique', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  test('applies bold mark from style', () => {
    const widget = new TexteAtomique({
      content: 'Hello',
      styles: { fontWeight: 'bold' },
    });
    widget.render(document.getElementById('root'));
    expect(widget.editor.getHTML()).toBe('<p><strong>Hello</strong></p>');
  });
});
