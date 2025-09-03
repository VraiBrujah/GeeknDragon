import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { defaultMarkdownSerializer } from 'prosemirror-markdown';
import { useEffect, useState } from 'react';

interface TextWidgetProps {
  initialContent?: string;
}

export default function TextWidget({ initialContent = '' }: TextWidgetProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
  });

  const [markdown, setMarkdown] = useState('');
  const [showMarkdown, setShowMarkdown] = useState(false);

  useEffect(() => {
    if (!editor) return;
    const updateMarkdown = () => {
      setMarkdown(defaultMarkdownSerializer.serialize(editor.state.doc));
    };
    editor.on('update', updateMarkdown);
    updateMarkdown();
    return () => {
      editor.off('update', updateMarkdown);
    };
  }, [editor]);

  return (
    <div>
      <div>
        <button onClick={() => editor?.chain().focus().toggleBold().run()}>
          Gras
        </button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()}>
          Italique
        </button>
        <button onClick={() => editor?.chain().focus().undo().run()}>
          Annuler
        </button>
        <button onClick={() => editor?.chain().focus().redo().run()}>
          Refaire
        </button>
        <button onClick={() => setShowMarkdown((v) => !v)}>Markdown</button>
      </div>
      <EditorContent editor={editor} />
      {showMarkdown && <pre>{markdown}</pre>}
    </div>
  );
}
