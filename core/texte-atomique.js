import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import BaseWidget from './base-widget.js';

/**
 * Widget encapsulating a TipTap editor.
 * Maps widget styles to TipTap marks.
 */
class TexteAtomique extends BaseWidget {
  constructor({
    content = '',
    extensions = [StarterKit],
    editable = true,
    ...rest
  } = {}) {
    super(rest);
    this.content = content;
    this.extensions = extensions;
    this.editable = editable;
    this.editor = null;
    // Map widget CSS styles to TipTap mark commands
    this.markStyleMap = {
      fontWeight: { value: 'bold', set: 'setBold', unset: 'unsetBold' },
      fontStyle: { value: 'italic', set: 'setItalic', unset: 'unsetItalic' },
    };
  }

  render(container) {
    const el = super.render(container);
    if (!this.editor) {
      this.editor = new Editor({
        element: el,
        content: this.content,
        extensions: this.extensions,
        editable: this.editable,
      });
      this.syncMarksFromStyles();
    }
    return el;
  }

  updateStyles(partialStyles = {}) {
    super.updateStyles(partialStyles);
    this.syncMarksFromStyles();
  }

  syncMarksFromStyles() {
    if (!this.editor) return;
    Object.entries(this.markStyleMap).forEach(([styleKey, cfg]) => {
      const isActive = this.styles[styleKey] === cfg.value;
      const chain = this.editor.chain().focus().selectAll();
      chain[isActive ? cfg.set : cfg.unset]().run();
    });
  }

  serialize() {
    return {
      ...super.serialize(),
      content: this.editor ? this.editor.getHTML() : this.content,
      editable: this.editable,
    };
  }

  hydrate(data = {}) {
    super.hydrate(data);
    if (typeof data.content === 'string') this.content = data.content;
    if (typeof data.editable === 'boolean') this.editable = data.editable;
  }
}

export default TexteAtomique;
