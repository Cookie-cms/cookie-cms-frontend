"use client";
import { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export const App = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello, world!</p>',
  });

  return (
    <TooltipProvider>
      <div className="editor-container">
        <EditorContent editor={editor} />
      </div>
    </TooltipProvider>
  );
};