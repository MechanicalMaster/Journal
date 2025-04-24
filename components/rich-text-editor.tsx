"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Toolbar } from './toolbar'; // We'll create this next

interface RichTextEditorProps {
  content: string;
  onChange: (richText: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({
  content,
  onChange,
  placeholder = 'Start writing your entry...',
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // You can configure the extensions here, e.g., disable some
        // heading: { levels: [1, 2, 3] },
        // bulletList: { keepMarks: true, keepAttributes: true },
        // orderedList: { keepMarks: true, keepAttributes: true },
        // Add more configurations as needed
      }),
      // TODO: Add Placeholder extension if desired
      // Placeholder.configure({ placeholder })
    ],
    content: content,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[150px] border border-input bg-background px-3 py-2 rounded-md ring-offset-background',
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="flex flex-col justify-stretch gap-2">
      {editor && <Toolbar editor={editor} />} 
      <EditorContent editor={editor} />
    </div>
  );
}; 