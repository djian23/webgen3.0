import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatPanel } from './components/ChatPanel';
import { CodeEditor } from './components/CodeEditor';
import { PreviewPanel } from './components/PreviewPanel';
import { SettingsModal } from './components/SettingsModal';
import { ProjectManager } from './components/ProjectManager';
import { useLocalStorage } from './hooks/useLocalStorage';
import { initializeOpenAI, generateCode } from './services/openai';
import { Project, FileItem, ChatMessage, AppSettings } from './types';
import SplitPane from 'react-split-pane';

const defaultSettings: AppSettings = {
  openaiApiKey: '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',
  theme: 'dark',
  fontSize: 14,
  autoSave: true,
};

const createDefaultProject = (): Project => ({
  id: 'default',
  name: 'Mon Premier Projet',
  files: [
    {
      id: 'html-1',
      name: 'index.html',
      content: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mon Projet</title>
</head>
<body>
    <div class="container">
        <h1>Bienvenue dans CodeGen AI</h1>
        <p>Commencez à créer votre code avec l'aide de l'intelligence artificielle !</p>
    </div>
</body>
</html>`,
      language: 'html',
      type: 'html'
    },
    {
      id: 'css-1',
      name: 'style.css',
      content: `body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    text-align: center;
    max-width: 500px;
}

h1 {
    color: #333;
    margin-bottom: 1rem;
}

p {
    color: #666;
    line-height: 1.6;
}`,
      language: 'css',
      type: 'css'
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
});

function App() {
  const [settings, setSettings] = useLocalStorage<AppSettings>('codegen-settings', defaultSettings);
  const [projects, setProjects] = useLocalStorage<Project[]>('codegen-projects', [createDefaultProject()]);
  const [currentProject, setCurrentProject] = useState<Project | null>(projects[0] || null);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('codegen-messages', []);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Initialiser OpenAI avec la clé API
  useEffect(() => {
    if (settings.openaiApiKey) {
      initializeOpenAI(settings.openaiApiKey);
    }
  }, [settings.openaiApiKey]);

  // Sélectionner le premier fichier du projet actuel
  useEffect(() => {
    if (currentProject && currentProject.files.length > 0) {
      setActiveFileId(currentProject.files[0].id);
    }
  }, [currentProject]);

  const handleSendMessage = async (content: string) => {
    if (!settings.openaiApiKey) {
      alert('Veuillez configurer votre clé API OpenAI dans les paramètres.');
      setShowSettings(true);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isGenerating: true,
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setIsGenerating(true);

    try {
      const context = currentProject ? `Projet: ${currentProject.name}, Fichiers: ${currentProject.files.map(f => f.name).join(', ')}` : '';
      const generatedCode = await generateCode(content, context);
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: generatedCode, isGenerating: false }
          : msg
      ));

      // Essayer d'appliquer le code généré automatiquement
      if (currentProject && generatedCode) {
        applyGeneratedCode(generatedCode);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: `❌ ${errorMessage}`, isGenerating: false }
          : msg
      ));

      // Si c'est une erreur de quota, ouvrir automatiquement les paramètres
      if (errorMessage.includes('quota') || errorMessage.includes('429')) {
        setTimeout(() => {
          setShowSettings(true);
        }, 1000);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const applyGeneratedCode = (code: string) => {
    if (!currentProject) return;

    // Détecter le type de code et l'appliquer au bon fichier
    let targetFile: FileItem | null = null;
    
    if (code.includes('<!DOCTYPE html>') || code.includes('<html>') || code.includes('<div>')) {
      targetFile = currentProject.files.find(f => f.type === 'html') || null;
    } else if (code.includes('{') && (code.includes('color:') || code.includes('background:') || code.includes('margin:'))) {
      targetFile = currentProject.files.find(f => f.type === 'css') || null;
    } else if (code.includes('function') || code.includes('const') || code.includes('let') || code.includes('var')) {
      targetFile = currentProject.files.find(f => f.type === 'javascript') || null;
    }

    if (targetFile) {
      handleFileChange(targetFile.id, code);
    }
  };

  const handleFileChange = (fileId: string, content: string) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      files: currentProject.files.map(file =>
        file.id === fileId ? { ...file, content } : file
      ),
      updatedAt: new Date(),
    };

    setCurrentProject(updatedProject);
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleFileCreate = () => {
    if (!currentProject) return;

    const fileTypes = ['html', 'css', 'javascript'] as const;
    const existingTypes = currentProject.files.map(f => f.type);
    const availableType = fileTypes.find(type => !existingTypes.includes(type)) || 'javascript';
    
    const extensions = { html: 'html', css: 'css', javascript: 'js', typescript: 'ts' };
    const newFile: FileItem = {
      id: `${availableType}-${Date.now()}`,
      name: `nouveau.${extensions[availableType]}`,
      content: '',
      language: availableType,
      type: availableType,
    };

    const updatedProject = {
      ...currentProject,
      files: [...currentProject.files, newFile],
      updatedAt: new Date(),
    };

    setCurrentProject(updatedProject);
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setActiveFileId(newFile.id);
  };

  const handleFileDelete = (fileId: string) => {
    if (!currentProject || currentProject.files.length <= 1) return;

    const updatedProject = {
      ...currentProject,
      files: currentProject.files.filter(f => f.id !== fileId),
      updatedAt: new Date(),
    };

    setCurrentProject(updatedProject);
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    
    if (activeFileId === fileId) {
      setActiveFileId(updatedProject.files[0]?.id || null);
    }
  };

  const handleProjectCreate = (name: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      files: [
        {
          id: 'html-1',
          name: 'index.html',
          content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Nouveau Projet</title>\n</head>\n<body>\n    <h1>Nouveau Projet</h1>\n</body>\n</html>',
          language: 'html',
          type: 'html'
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
  };

  const handleProjectDelete = (projectId: string) => {
    if (projects.length <= 1) return;

    setProjects(prev => prev.filter(p => p.id !== projectId));
    
    if (currentProject?.id === projectId) {
      const remainingProjects = projects.filter(p => p.id !== projectId);
      setCurrentProject(remainingProjects[0] || null);
    }
  };

  const handleSettingsSave = (newSettings: AppSettings) => {
    setSettings(newSettings);
    if (newSettings.openaiApiKey !== settings.openaiApiKey) {
      initializeOpenAI(newSettings.openaiApiKey);
    }
  };

  return (
    <div className="h-screen bg-dark-900 text-white flex flex-col">
      <Header 
        onSettingsClick={() => setShowSettings(true)}
        currentProject={currentProject?.name}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <ProjectManager
          projects={projects}
          currentProject={currentProject}
          onProjectSelect={setCurrentProject}
          onProjectCreate={handleProjectCreate}
          onProjectDelete={handleProjectDelete}
        />

        <div className="flex-1">
          <SplitPane split="vertical" defaultSize="30%" minSize={250} maxSize="50%">
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              isGenerating={isGenerating}
            />
            
            <SplitPane split="vertical" defaultSize="50%" minSize={300}>
              <CodeEditor
                files={currentProject?.files || []}
                activeFileId={activeFileId}
                onFileSelect={setActiveFileId}
                onFileChange={handleFileChange}
                onFileCreate={handleFileCreate}
                onFileDelete={handleFileDelete}
              />
              
              <PreviewPanel files={currentProject?.files || []} />
            </SplitPane>
          </SplitPane>
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSettingsSave}
      />
    </div>
  );
}

export default App;