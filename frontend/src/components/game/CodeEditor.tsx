'use client';

import { useState } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  readOnly?: boolean;
  height?: string | number;
}

export default function CodeEditor({ value, onChange, language, onLanguageChange, readOnly, height }: CodeEditorProps) {
  
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080b14] border border-[#1e2535] rounded-xl overflow-hidden shadow-2xl relative">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#0d1117] border-b border-[#1e2535]">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-4 font-code text-xs font-bold text-gray-400 tracking-wider">NEURAL_TERMINAL</span>
        </div>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          title="Language"
          aria-label="Language"
          className="bg-[#121625] text-white border border-[#2a3040] rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-[#00f2ff] transition-colors"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="typescript">TypeScript</option>
          <option value="go">Go</option>
        </select>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative">
         <div className="absolute top-0 right-0 p-4 z-10 pointer-events-none opacity-10">
            <span className="text-6xl font-black italic tracking-tighter">DATA<br/>STREAM</span>
         </div>
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={value}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              scrollBeyondLastLine: false,
              roundedSelection: true,
              padding: { top: 20, bottom: 20 },
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              formatOnPaste: true,
              readOnly: readOnly || false,
            }}
          />
      </div>
    </div>
  );
}