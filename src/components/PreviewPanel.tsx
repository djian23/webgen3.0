import React, { useEffect, useRef } from 'react';
import { FileItem } from '../types';
import { Eye, RefreshCw } from 'lucide-react';

interface PreviewPanelProps {
  files: FileItem[];
}

export function PreviewPanel({ files }: PreviewPanelProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const generatePreviewContent = () => {
    const htmlFile = files.find(f => f.type === 'html');
    const cssFile = files.find(f => f.type === 'css');
    const jsFile = files.find(f => f.type === 'javascript');

    let htmlContent = htmlFile?.content || '<div style="padding: 20px; text-align: center; color: #64748b;"><h2>Aucun contenu HTML</h2><p>Ajoutez du code HTML pour voir la prévisualisation</p></div>';
    
    // Injecter le CSS
    if (cssFile?.content) {
      const styleTag = `<style>${cssFile.content}</style>`;
      if (htmlContent.includes('</head>')) {
        htmlContent = htmlContent.replace('</head>', `${styleTag}</head>`);
      } else if (htmlContent.includes('<html>')) {
        htmlContent = htmlContent.replace('<html>', `<html><head>${styleTag}</head>`);
      } else {
        htmlContent = `<head>${styleTag}</head><body>${htmlContent}</body>`;
      }
    }

    // Injecter le JavaScript
    if (jsFile?.content) {
      const scriptTag = `<script>${jsFile.content}</script>`;
      if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', `${scriptTag}</body>`);
      } else {
        htmlContent += scriptTag;
      }
    }

    // Ajouter les meta tags de base si pas présents
    if (!htmlContent.includes('<!DOCTYPE html>')) {
      htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prévisualisation</title>
    ${cssFile?.content ? `<style>${cssFile.content}</style>` : ''}
</head>
<body>
    ${htmlFile?.content || '<div style="padding: 20px; text-align: center; color: #64748b;"><h2>Aucun contenu HTML</h2><p>Ajoutez du code HTML pour voir la prévisualisation</p></div>'}
    ${jsFile?.content ? `<script>${jsFile.content}</script>` : ''}
</body>
</html>`;
    }

    return htmlContent;
  };

  const updatePreview = () => {
    if (iframeRef.current) {
      const content = generatePreviewContent();
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (doc) {
        doc.open();
        doc.write(content);
        doc.close();
      }
    }
  };

  useEffect(() => {
    updatePreview();
  }, [files]);

  const handleRefresh = () => {
    updatePreview();
  };

  return (
    <div className="flex flex-col h-full bg-dark-900">
      <div className="flex items-center justify-between p-4 border-b border-dark-700">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Eye className="w-5 h-5 text-primary-400" />
          <span>Prévisualisation</span>
        </h2>
        <button
          onClick={handleRefresh}
          className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-all duration-200"
          title="Actualiser"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 bg-white">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          title="Prévisualisation du code"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}