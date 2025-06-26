import React, { useState } from 'react';
import { Project } from '../types';
import { FolderPlus, Folder, Trash2, Calendar } from 'lucide-react';

interface ProjectManagerProps {
  projects: Project[];
  currentProject: Project | null;
  onProjectSelect: (project: Project) => void;
  onProjectCreate: (name: string) => void;
  onProjectDelete: (projectId: string) => void;
}

export function ProjectManager({
  projects,
  currentProject,
  onProjectSelect,
  onProjectCreate,
  onProjectDelete
}: ProjectManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onProjectCreate(newProjectName.trim());
      setNewProjectName('');
      setShowCreateForm(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="p-4 bg-dark-800 border-r border-dark-700 w-64 flex-shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Projets</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="p-2 text-dark-400 hover:text-white hover:bg-dark-700 rounded-lg transition-all duration-200"
          title="Nouveau projet"
        >
          <FolderPlus className="w-4 h-4" />
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateProject} className="mb-4 animate-slide-up">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Nom du projet"
            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-2"
            autoFocus
          />
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 transition-colors duration-200"
            >
              Créer
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewProjectName('');
              }}
              className="flex-1 px-3 py-1 bg-dark-600 text-dark-300 rounded text-sm hover:bg-dark-500 transition-colors duration-200"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
              currentProject?.id === project.id
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-dark-200 hover:bg-dark-600'
            }`}
            onClick={() => onProjectSelect(project)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <Folder className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium truncate">{project.name}</span>
              </div>
              {projects.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onProjectDelete(project.id);
                  }}
                  className="p-1 text-dark-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Supprimer le projet"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex items-center space-x-1 mt-1 text-xs opacity-75">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(project.updatedAt)}</span>
            </div>
            <div className="text-xs mt-1 opacity-75">
              {project.files.length} fichier{project.files.length > 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && !showCreateForm && (
        <div className="text-center text-dark-400 mt-8">
          <Folder className="w-12 h-12 mx-auto mb-2 text-dark-600" />
          <p className="text-sm">Aucun projet</p>
          <p className="text-xs mt-1">Créez votre premier projet</p>
        </div>
      )}
    </div>
  );
}