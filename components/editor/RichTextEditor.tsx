"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  AlignLeft,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder = "Start writing…", className = "" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef<string>("");

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
      el.innerHTML = value;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    lastValueRef.current = html;
    onChange(html);
  }, [onChange]);

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  };

  const formatBlock = (tag: string) => {
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, tag);
    handleInput();
  };

  return (
    <div className={`rounded-lg border border-border bg-background ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-border px-2 py-1.5">
        <ToolbarBtn title="Bold" onClick={() => exec("bold")}>
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Italic" onClick={() => exec("italic")}>
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <div className="mx-1.5 h-4 w-px bg-border" />
        <ToolbarBtn title="Heading 2" onClick={() => formatBlock("h2")}>
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Heading 3" onClick={() => formatBlock("h3")}>
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Paragraph" onClick={() => formatBlock("p")}>
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarBtn>
        <ToolbarBtn title="Blockquote" onClick={() => formatBlock("blockquote")}>
          <Quote className="h-3.5 w-3.5" />
        </ToolbarBtn>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className="prose prose-sm prose-neutral dark:prose-invert min-h-[120px] max-w-none px-4 py-3 text-sm text-foreground focus:outline-none [&:empty]:before:text-muted-foreground/50 [&:empty]:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}
