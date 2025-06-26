import React, { useState } from 'react';
import { X, Key, Palette, Type, Save } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [formData, setFormData] = useState<AppSettings>(settings);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleChange = (key: keyof AppSettings, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-dark-800 rounded-lg shadow-xl w-full max-w-md mx-4 animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-dark-700">
          <h2 className="text-xl font-semibold text-white">Paramètres</h2>
          <button
            onClick={onClose}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Clé API OpenAI */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-white mb-2">
              <Key className="w-4 h-4 text-primary-400" />
              <span>Clé API OpenAI</span>
            </label>
            <input
              type="password"
              value={formData.openaiApiKey}
              onChange={(e) => handleChange('openaiApiKey', e.target.value)}
              placeholder="sk-..."
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-dark-400 mt-1">
              Votre clé API est stockée localement et n'est jamais partagée
            </p>
          </div>

          {/* Thème */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-white mb-2">
              <Palette className="w-4 h-4 text-secondary-400" />
              <span>Thème</span>
            </label>
            <select
              value={formData.theme}
              onChange={(e) => handleChange('theme', e.target.value as 'dark' | 'light')}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="dark">Sombre</option>
              <option value="light">Clair</option>
            </select>
          </div>

          {/* Taille de police */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-white mb-2">
              <Type className="w-4 h-4 text-secondary-400" />
              <span>Taille de police</span>
            </label>
            <input
              type="range"
              min="12"
              max="20"
              value={formData.fontSize}
              onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-dark-400 mt-1">
              <span>12px</span>
              <span className="text-white">{formData.fontSize}px</span>
              <span>20px</span>
            </div>
          </div>

          {/* Sauvegarde automatique */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm font-medium text-white">
              <Save className="w-4 h-4 text-secondary-400" />
              <span>Sauvegarde automatique</span>
            </label>
            <input
              type="checkbox"
              checked={formData.autoSave}
              onChange={(e) => handleChange('autoSave', e.target.checked)}
              className="w-4 h-4 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500 focus:ring-2"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-dark-300 bg-dark-700 hover:bg-dark-600 rounded-lg transition-all duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 transition-all duration-200"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}