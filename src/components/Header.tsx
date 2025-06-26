import React from 'react';
import { Settings, Code, Sparkles } from 'lucide-react';

interface HeaderProps {
  onSettingsClick: () => void;
  currentProject?: string;
}

export function Header({ onSettingsClick, currentProject }: HeaderProps) {
  return (
    <header className="bg-dark-900 border-b border-dark-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>CodeGen AI</span>
                <Sparkles className="w-5 h-5 text-secondary-400" />
              </h1>
              {currentProject && (
                <p className="text-sm text-dark-400">Projet: {currentProject}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={onSettingsClick}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-all duration-200"
            title="Paramètres"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}