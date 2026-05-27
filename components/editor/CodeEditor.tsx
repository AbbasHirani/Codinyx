"use client";

import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  highlightLines?: number[];
  height?: string;
}

export function CodeEditor({ value, onChange, language, highlightLines = [], height = "360px" }: CodeEditorProps) {
  function handleMount(editor: unknown, monaco: unknown) {
    const m = monaco as typeof import("monaco-editor");
    const e = editor as import("monaco-editor").editor.IStandaloneCodeEditor;

    if (highlightLines.length > 0) {
      e.deltaDecorations(
        [],
        highlightLines.map((line) => ({
          range: new m.Range(line, 1, line, 1),
          options: {
            isWholeLine: true,
            className: "bg-yellow-500/20",
            glyphMarginClassName: "bg-yellow-400 w-1",
          },
        }))
      );
    }
  }

  return (
    <Editor
      height={height}
      language={language === "cpp" ? "cpp" : language}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      onMount={handleMount}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: "on",
        padding: { top: 12, bottom: 12 },
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        cursorBlinking: "smooth",
        renderLineHighlight: "gutter",
      }}
    />
  );
}
