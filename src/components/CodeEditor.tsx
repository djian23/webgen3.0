import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { FileItem } from '../types';
import { File, Plus, X } from 'lucide-react';

interface CodeEditorProps {
  files: FileItem[];
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
  onFileChange: (fileId: string, content: string) => void;
  onFileCreate: () => void;
  onFileDelete: (fileId: string) => void;
}

export function CodeEditor({
  files,
  activeFileId,
  onFileSelect,
  onFileChange,
  onFileCreate,
  onFileDelete
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);
  const activeFile = files.find(f => f.id === activeFileId);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Configuration de l'éditeur
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
      lineHeight: 1.6,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
    });
  };

  const getLanguageFromType = (type: string) => {
    switch (type) {
      case 'html': return 'html';
      case 'css': return 'css';
      case 'javascript': return 'javascript';
      case 'typescript': return 'typescript';
      default: return 'plaintext';
    }
  };

  const getFileIcon = (type: string) => {
    const iconClass = "w-4 h-4";
    switch (type) {
      case 'html': return <File className={`${iconClass} text-orange-400`} />;
      case 'css': return <File className={`${iconClass} text-blue-400`} />;
      case 'javascript': return <File className={`${iconClass} text-yellow-400`} />;
      case 'typescript': return <File className={`${iconClass} text-blue-500`} />;
      default: return <File className={`${iconClass} text-gray-400`} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-900">
      <div className="flex items-center justify-between p-4 border-b border-dark-700">
        <h2 className="text-lg font-semibold text-white">Éditeur de Code</h2>
        <button
          onClick={onFileCreate}
          className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-all duration-200"
          title="Nouveau fichier"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Onglets des fichiers */}
      <div className="flex overflow-x-auto bg-dark-800 border-b border-dark-700">
        {files.map((file) => (
          <div
            key={file.id}
            className={`flex items-center space-x-2 px-4 py-2 border-r border-dark-700 cursor-pointer transition-all duration-200 ${
              activeFileId === file.id
                ? 'bg-dark-900 text-white'
                : 'text-dark-400 hover:text-white hover:bg-dark-700'
            }`}
            onClick={() => onFileSelect(file.id)}
          >
            {getFileIcon(file.type)}
            <span className="text-sm font-medium whitespace-nowrap">{file.name}</span>
            {files.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileDelete(file.id);
                }}
                className="p-1 text-dark-500 hover:text-red-400 rounded transition-colors duration-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Éditeur */}
      <div className="flex-1">
        {activeFile ? (
          <Editor
            height="100%"
            language={getLanguageFromType(activeFile.type)}
            value={activeFile.content}
            onChange={(value) => onFileChange(activeFile.id, value || '')}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
              lineHeight: 1.6,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              parameterHints: { enabled: true },
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-dark-400">
            <div className="text-center">
              <File className="w-16 h-16 mx-auto mb-4 text-dark-600" />
              <p className="text-lg font-medium mb-2">Aucun fichier sélectionné</p>
              <p className="text-sm">Créez un nouveau fichier pour commencer</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}