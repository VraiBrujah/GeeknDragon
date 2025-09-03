import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { defaultMarkdownParser, defaultMarkdownSerializer } from 'prosemirror-markdown';
import BaseWidget from './base-widget.js';

/**
 * Rich text widget built on TipTap.
 * Exposes undo/redo hooks and markdown configuration.
 */
class RichTextWidget extends BaseWidget {
  constructor({
    content = '',
    extensions = [StarterKit],
    editable = true,
    markdown = {},
    ...rest
  } = {}) {
    super(rest);
    this.content = content;
    this.extensions = extensions;
    this.editable = editable;
    this.editor = null;
    this.markdown = {
      parser: defaultMarkdownParser,
      serializer: defaultMarkdownSerializer,
      ...markdown,
    };
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

  undo() {
    if (this.editor) {
      this.editor.chain().focus().undo().run();
    }
  }

  redo() {
    if (this.editor) {
      this.editor.chain().focus().redo().run();
    }
  }

  getMarkdown() {
    return this.editor
      ? this.markdown.serializer.serialize(this.editor.state.doc)
      : this.content;
  }

  setMarkdown(markdown) {
    if (this.editor) {
      const doc = this.markdown.parser.parse(markdown);
      this.editor.commands.setContent(doc.toJSON());
    } else {
      this.content = markdown;
    }
  }

  serialize() {
    return {
      ...super.serialize(),
      content: this.getMarkdown(),
      editable: this.editable,
    };
  }

  hydrate(data = {}) {
    super.hydrate(data);
    if (typeof data.content === 'string') this.content = data.content;
    if (typeof data.editable === 'boolean') this.editable = data.editable;
  }
}

export default RichTextWidget;
