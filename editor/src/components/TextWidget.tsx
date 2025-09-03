import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { defaultMarkdownSerializer } from 'prosemirror-markdown';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TextWidgetProps {
  initialContent?: string;
}

export default function TextWidget({ initialContent = '' }: TextWidgetProps) {
  const { t } = useTranslation();
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
          {t('editor.bold')}
        </button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()}>
          {t('editor.italic')}
        </button>
        <button onClick={() => editor?.chain().focus().undo().run()}>
          {t('editor.undo')}
        </button>
        <button onClick={() => editor?.chain().focus().redo().run()}>
          {t('editor.redo')}
        </button>
        <button onClick={() => setShowMarkdown((v) => !v)}>
          {t('editor.markdown')}
        </button>
      </div>
      <EditorContent editor={editor} />
      {showMarkdown && <pre>{markdown}</pre>}
    </div>
  );
}
