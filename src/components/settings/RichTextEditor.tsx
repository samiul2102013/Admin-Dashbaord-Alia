'use client';

import { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  className?: string;
}

export default function RichTextEditor({ label, value, onChange, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  function handleInput() {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
  ];

  return (
    <div className={cn('flex flex-col gap-[26px]', className)}>
      {label && (
        <label className="text-[16px] font-semibold leading-[28.13px] font-[family-name:var(--font-poppins)]">
          {label}
        </label>
      )}
      <div className="border border-secondary/80 rounded-[10px] bg-surface overflow-hidden">
        <div className="flex items-center gap-1 px-3 py-2 border-b border-secondary/40 bg-white">
          {toolbarButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.command}
                type="button"
                title={btn.title}
                onMouseDown={(e) => { e.preventDefault(); exec(btn.command); }}
                className="p-1.5 rounded hover:bg-secondary/20 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                <Icon size={16} />
              </button>
            );
          })}
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          dangerouslySetInnerHTML={{ __html: value }}
          className="px-4 py-3 min-h-[280px] max-h-[400px] overflow-y-auto text-sm font-[family-name:var(--font-poppins)] outline-none leading-relaxed"
        />
      </div>
    </div>
  );
}
