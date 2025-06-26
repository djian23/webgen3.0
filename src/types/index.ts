export interface FileItem {
  id: string;
  name: string;
  content: string;
  language: string;
  type: 'html' | 'css' | 'javascript' | 'typescript';
}

export interface Project {
  id: string;
  name: string;
  files: FileItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
}

export interface AppSettings {
  openaiApiKey: string;
  theme: 'dark' | 'light';
  fontSize: number;
  autoSave: boolean;
}