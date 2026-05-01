'use client';

 import Editor from '@monaco-editor/react';

import toast from 'react-hot-toast';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  height?: string | number;
}

export default function CodeEditor({ value, onChange, language, readOnly, height }: CodeEditorProps) {
  const handleCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    toast.error('⚠️ Copy/Paste is disabled during combat!');
  };

  return (
    <div className="w-full h-full" onCopy={handleCopyPaste} onPaste={handleCopyPaste} onCut={handleCopyPaste}>
      <Editor
        height={height || '100%'}
        language={language === 'cpp' ? 'cpp' : language}
        theme="vs-dark"
        value={value}
        onChange={v => { if (v !== undefined) onChange(v); }}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          scrollBeyondLastLine: false,
          roundedSelection: true,
          padding: { top: 16, bottom: 16 },
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          formatOnPaste: false,
          readOnly: readOnly || false,
          lineNumbers: 'on',
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 8,
          lineNumbersMinChars: 3,
        }}
      />
    </div>
  );
}
