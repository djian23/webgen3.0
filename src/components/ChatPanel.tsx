import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isGenerating: boolean;
}

export function ChatPanel({ messages, onSendMessage, isGenerating }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isGenerating) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-900">
      <div className="p-4 border-b border-dark-700">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Bot className="w-5 h-5 text-primary-400" />
          <span>Assistant IA</span>
        </h2>
        <p className="text-sm text-dark-400 mt-1">
          Décrivez le code que vous souhaitez générer
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-dark-400 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-dark-600" />
            <p className="text-lg font-medium mb-2">Commencez une conversation</p>
            <p className="text-sm">
              Demandez-moi de générer du code HTML, CSS ou JavaScript !
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex space-x-3 animate-fade-in ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-800 text-dark-100 border border-dark-700'
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {message.content}
                </pre>
                {message.isGenerating && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                    <span className="text-xs text-dark-400">Génération en cours...</span>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-dark-700 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-dark-300" />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-dark-700">
        <div className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Décrivez le code que vous voulez générer..."
            className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isGenerating}
            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}