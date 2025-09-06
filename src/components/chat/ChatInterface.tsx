'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Message } from '@/types';

const themes = {
  dark: {
    sidebar: "#0a0f1c",
    main: "#0f172a",
    bubble: "#1e293b",
    input: "#1e293b",
    text: "#e5e7eb",
    border: "#1f2937",
  },
  green: {
    sidebar: "#000000",
    main: "#0f2a20",
    bubble: "#1e3d32",
    input: "#1e3d32",
    text: "#ffffff",
    border: "#1f2937",
  },
  light: {
    sidebar: "#f8f9fa",
    main: "#ffffff",
    bubble: "#f1f3f5",
    input: "#f9fafb",
    text: "#212529",
    border: "#e5e7eb",
  },
};

interface Colors {
  sidebar: string;
  main: string;
  bubble: string;
  input: string;
  text: string;
  border: string;
}

interface ChatInterfaceProps {
  theme?: 'dark' | 'green' | 'light';
  onThemeChange?: (theme: 'dark' | 'green' | 'light') => void;
  onOpenSettings?: () => void;
  onToggleSidebar?: () => void;
}

const formatMessageContent = (content: string, isUser: boolean): JSX.Element => {
  if (isUser) {
    return <span>{content}</span>;
  }

  // ChatGPT-like enhanced AI response formatting
  const lines = content.split('\n');
  const formattedLines: JSX.Element[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLanguage = '';
  
  lines.forEach((line, index) => {
    // Handle code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        formattedLines.push(
          <div key={`code-${index}`} className="my-3 rounded-lg overflow-hidden border border-gray-600">
            <div className="bg-gray-800 px-3 py-2 text-xs text-gray-300 flex items-center gap-2">
              <span>💻</span>
              <span>{codeBlockLanguage || 'code'}</span>
            </div>
            <div className="bg-gray-900 p-4 font-mono text-sm text-green-400 overflow-x-auto">
              <pre>{codeBlockContent.join('\n')}</pre>
            </div>
          </div>
        );
        codeBlockContent = [];
        codeBlockLanguage = '';
        inCodeBlock = false;
      } else {
        // Start code block
        codeBlockLanguage = line.replace('```', '').trim();
        inCodeBlock = true;
      }
      return;
    }
    
    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }
    
    // Main headers (##)
    if (line.startsWith('## ')) {
      const headerText = line.replace('## ', '');
      formattedLines.push(
        <div key={index} className="mt-4 mb-3 pb-2 border-b border-gray-600">
          <h2 className="text-lg font-bold text-blue-300 flex items-center gap-2">
            {headerText}
          </h2>
        </div>
      );
      return;
    }
    
    // Sub headers (###)
    if (line.startsWith('### ')) {
      const headerText = line.replace('### ', '');
      formattedLines.push(
        <div key={index} className="mt-3 mb-2">
          <h3 className="text-base font-semibold text-yellow-300 flex items-center gap-2">
            {headerText}
          </h3>
        </div>
      );
      return;
    }
    
    // Bold headers with icons (**text**)
    if (line.startsWith('**') && line.endsWith('**')) {
      const headerText = line.replace(/\*\*/g, '');
      let headerColor = 'text-blue-300';
      
      // Determine color based on content
      if (headerText.includes('🔍') || headerText.includes('Analysis')) {
        headerColor = 'text-blue-300';
      } else if (headerText.includes('📊') || headerText.includes('Findings')) {
        headerColor = 'text-green-300';
      } else if (headerText.includes('🗂️') || headerText.includes('Structure')) {
        headerColor = 'text-purple-300';
      } else if (headerText.includes('📦') || headerText.includes('Dependencies')) {
        headerColor = 'text-orange-300';
      } else if (headerText.includes('⚡') || headerText.includes('Insights')) {
        headerColor = 'text-yellow-300';
      }
      
      formattedLines.push(
        <div key={index} className={`font-bold ${headerColor} mb-2 mt-3 flex items-center gap-1`}>
          <span>{headerText}</span>
        </div>
      );
      return;
    }
    
    // Bullet points (• or *)
    if (line.trim().startsWith('•') || line.trim().startsWith('*')) {
      const bulletText = line.replace(/^[\s•*-]+/, '').trim();
      const bulletColor = 'text-green-400';
      const icon = '•';
      
      // Special bullet formatting for bold items
      if (bulletText.includes('**')) {
        const parts = bulletText.split('**');
        formattedLines.push(
          <div key={index} className="ml-4 mb-1 flex items-start gap-2">
            <span className={`${bulletColor} mt-1 flex-shrink-0`}>{icon}</span>
            <span>
              {parts.map((part, partIndex) => 
                partIndex % 2 === 1 ? 
                  <span key={partIndex} className="font-semibold text-white">{part}</span> : 
                  <span key={partIndex}>{part}</span>
              )}
            </span>
          </div>
        );
      } else {
        formattedLines.push(
          <div key={index} className="ml-4 mb-1 flex items-start gap-2">
            <span className={`${bulletColor} mt-1 flex-shrink-0`}>{icon}</span>
            <span>{bulletText}</span>
          </div>
        );
      }
      return;
    }
    
    // Numbered lists
    if (/^\d+\. /.test(line.trim())) {
      const listText = line.replace(/^\s*\d+\. /, '').trim();
      const number = line.match(/^\s*(\d+)\./)?.[1] || '';
      
      formattedLines.push(
        <div key={index} className="ml-4 mb-1 flex items-start gap-2">
          <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
            {number}
          </span>
          <span>{listText}</span>
        </div>
      );
      return;
    }
    
    // File paths and technical content
    if (line.includes('E:\\') || line.includes('/src/') || line.includes('.py') || line.includes('.js') || line.includes('.json') || line.includes('.tsx') || line.includes('.ts')) {
      formattedLines.push(
        <div key={index} className="bg-gray-800 bg-opacity-50 rounded px-3 py-2 my-1 font-mono text-sm flex items-center gap-2 border border-gray-700">
          <span className="text-blue-400">📁</span>
          <span className="text-green-300">{line}</span>
        </div>
      );
      return;
    }
    
    // Inline code (backticks)
    if (line.includes('`') && !line.startsWith('```')) {
      const parts = line.split('`');
      formattedLines.push(
        <div key={index} className="mb-1">
          {parts.map((part, partIndex) => 
            partIndex % 2 === 1 ? 
              <code key={partIndex} className="bg-gray-700 px-1 py-0.5 rounded text-green-300 font-mono text-sm">{part}</code> : 
              <span key={partIndex}>{part}</span>
          )}
        </div>
      );
      return;
    }
    
    // Italic text emphasis
    if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      const italicText = line.replace(/^\*(.*)\*$/, '$1');
      formattedLines.push(
        <div key={index} className="mb-2 text-gray-300 italic text-center">
          {italicText}
        </div>
      );
      return;
    }
    
    // Regular text or empty lines
    if (line.trim()) {
      formattedLines.push(
        <div key={index} className="mb-1 leading-relaxed">
          {line}
        </div>
      );
    } else {
      formattedLines.push(
        <div key={index} className="mb-2"></div>
      );
    }
  });
  
  return <div className="space-y-1">{formattedLines}</div>;
};

const MessageBubble: React.FC<{ message: Message; colors: Colors }> = ({ message, colors }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex items-start space-x-2 sm:space-x-3 ${
      isUser ? 'justify-end space-x-reverse' : 'justify-start'
    }`}>
      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0">
        <img
          src={isUser ? "https://i.pravatar.cc/40?img=3" : "https://i.pravatar.cc/40?img=5"}
          alt={isUser ? "You" : "AI Assistant"}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      <div className="flex flex-col max-w-[280px] sm:max-w-xl">
        <span className="text-xs opacity-60 mb-1" style={{ color: colors.text }}>
          {isUser ? "You" : "AI Assistant"}
        </span>
        <div
          className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-md text-sm sm:text-base ${
            isUser
              ? "bg-green-500 text-black rounded-br-sm"
              : "rounded-bl-sm"
          }`}
          style={!isUser ? {
            backgroundColor: colors.bubble,
            color: colors.text
          } : {}}
        >
          <div className="whitespace-pre-wrap">{formatMessageContent(message.content, isUser)}</div>
          <div className="flex items-center justify-between mt-2">
            {message.model && (
              <div className="text-xs opacity-70 flex items-center gap-1">
                <span>🤖</span>
                <span>{message.provider}/{message.model}</span>
              </div>
            )}
            {!isUser && (
              <div className="text-xs opacity-70 flex items-center gap-1">
                <span>🔧</span>
                <span>MCP Enhanced</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatInput: React.FC<{ colors: Colors }> = ({ colors }) => {
  const [input, setInput] = useState('');
  const [useTools, setUseTools] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { sendMessage, isLoading, availableTools } = useAppStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    
    try {
      await sendMessage(message, useTools);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  return (
    <div className="p-3 sm:p-4" style={{ background: colors.main, borderTop: `1px solid ${colors.border}` }}>
      <div className="max-w-3xl mx-auto w-full">
        {availableTools.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 p-2 rounded-lg" style={{ backgroundColor: `${colors.bubble}40`, border: `1px solid ${colors.border}` }}>
            <label className="flex items-center gap-3 text-sm cursor-pointer" style={{ color: colors.text }}>
              <input
                type="checkbox"
                checked={useTools}
                onChange={(e) => setUseTools(e.target.checked)}
                className="w-4 h-4 rounded border-2 text-green-500 focus:ring-green-500 focus:ring-2"
                style={{ accentColor: '#10b981' }}
              />
              <span className="font-medium">🔧 Use MCP Tools</span>
            </label>
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
              {availableTools.length} available
            </span>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div
            className="flex items-center border rounded-full px-3 sm:px-4 py-2 flex-1 min-h-[48px]"
            style={{ background: colors.input, borderColor: colors.border }}
          >
            <span className="text-gray-400 mr-2">🔍</span>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 resize-none bg-transparent outline-none px-2 py-1"
              style={{ color: colors.text }}
              disabled={isLoading}
            />
            <div className="flex gap-2 ml-2">
              <button
                type="button"
                onClick={() => setIsRecording(!isRecording)}
                className={`w-10 h-10 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-sm sm:text-base ${
                  isRecording ? "bg-red-600 text-white mic-pulse" : "bg-gray-700 text-white"
                }`}
              >
                🎤
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 sm:w-10 sm:h-10 flex items-center justify-center bg-green-500 text-black rounded-full hover:bg-green-600 disabled:opacity-50 text-sm sm:text-base"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatMessages: React.FC<{ colors: Colors; theme?: string }> = ({ colors, theme = 'dark' }) => {
  const { currentSession, isLoading } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);
  
  if (!currentSession) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: colors.text }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto text-sm">
            Create a new chat or select an existing conversation to start
          </p>
        </div>
      </div>
    );
  }
  
  // Get the appropriate scrollbar class based on theme
  const scrollbarClass = theme === 'green' ? 'scrollbar-thin scrollbar-green' : 
                        theme === 'light' ? 'scrollbar-thin scrollbar-light' : 
                        'scrollbar-thin';
  
  return (
    <div className={`flex-1 overflow-y-auto p-3 sm:p-6 ${scrollbarClass}`} style={{ background: colors.main }}>
      <div className="max-w-3xl mx-auto space-y-4">
        {currentSession.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[500px]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>🤖 MCP AI Assistant</h2>
              <p className="text-gray-400 mb-4 max-w-md mx-auto text-sm">
                Enhanced with <span className="text-green-400 font-semibold">42+ MCP tools</span> for intelligent project analysis and real-time operations!
              </p>
              
              <div className="mb-4 text-left max-w-full sm:max-w-lg">
                <div className="text-sm" style={{ color: colors.text, opacity: 0.9 }}>
                  <p className="mb-3 font-bold text-blue-300 flex items-center gap-2">
                    <span>🎯</span>What I Can Do For You:
                  </p>
                  <div className="space-y-2 text-xs ml-4">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1 flex-shrink-0">•</span>
                      <span><span className="font-semibold text-white">📁 Project Analysis:</span> Deep dive into code structure, dependencies, and architecture</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1 flex-shrink-0">•</span>
                      <span><span className="font-semibold text-white">📊 Data Processing:</span> Parse JSON, CSV, Excel files and perform analysis</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1 flex-shrink-0">•</span>
                      <span><span className="font-semibold text-white">🌐 Web Operations:</span> HTTP requests, web scraping, and API interactions</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1 flex-shrink-0">•</span>
                      <span><span className="font-semibold text-white">💻 System Tasks:</span> File operations, process monitoring, and system diagnostics</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-1 flex-shrink-0">•</span>
                      <span><span className="font-semibold text-white">🔧 Development Tools:</span> Git operations, Docker commands, and build processes</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30">
                  🔧 42 MCP Tools Active
                </span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs border border-blue-500/30">
                  💨 Real-time Analysis
                </span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs border border-purple-500/30">
                  🤖 Multi-LLM Support
                </span>
              </div>
              
              <div className="mt-4 p-4 rounded-lg border border-dashed" style={{ borderColor: colors.border, backgroundColor: `${colors.bubble}30` }}>
                <div className="flex items-center gap-2 mb-2">
                  <span>🚀</span>
                  <p className="text-sm font-semibold" style={{ color: colors.text }}>Try This Example:</p>
                </div>
                <div className="bg-gray-800 bg-opacity-50 rounded px-3 py-2 font-mono text-sm border border-gray-700">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-400">📁</span>
                    <span className="text-green-300">&quot;Analyze this project: E:\\ai_projects\\MCP_apps\\mcp-host&quot;</span>
                  </div>
                </div>
                <p className="text-xs mt-2 text-gray-400">
                  <span className="text-yellow-400">⚡</span> Enable &quot;Use MCP Tools&quot; for intelligent analysis with real file access!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {currentSession.messages.map((message) => (
              <MessageBubble key={message.id} message={message} colors={colors} />
            ))}
            {isLoading && (
              <div className="flex items-start space-x-3 justify-start animate-fade-in">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img src="https://i.pravatar.cc/40?img=5" alt="AI Assistant" className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="flex flex-col max-w-xl">
                  <span className="text-xs opacity-60 mb-1" style={{ color: colors.text }}>AI Assistant is typing...</span>
                  <div className="px-4 py-2 rounded-xl border border-gray-700 flex space-x-2" style={{ backgroundColor: colors.bubble }}>
                    <span className="dot-animation w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span className="dot-animation w-2 h-2 bg-gray-400 rounded-full delay-200"></span>
                    <span className="dot-animation w-2 h-2 bg-gray-400 rounded-full delay-400"></span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

const ChatHeader: React.FC<{ colors: Colors; theme: string; onThemeChange: (theme: 'dark' | 'green' | 'light') => void; onOpenSettings?: () => void; onToggleSidebar?: () => void }> = ({ 
  colors, 
  theme, 
  onThemeChange, 
  onOpenSettings,
  onToggleSidebar
}) => {
  const { availableTools, mcpServers } = useAppStore();
  
  return (
    <header
      className="flex justify-between items-center px-6 py-3"
      style={{ background: colors.main, borderBottom: `1px solid ${colors.border}` }}
    >
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Mobile hamburger menu */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-gray-700 transition-colors"
          aria-label="Toggle sidebar"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
            <span className="block w-5 h-0.5 bg-gray-300"></span>
            <span className="block w-5 h-0.5 bg-gray-300"></span>
            <span className="block w-5 h-0.5 bg-gray-300"></span>
          </div>
        </button>
        
        <div className="relative">
          <img
            src="https://i.pravatar.cc/40?img=5"
            alt="AI"
            className="w-8 h-8 rounded-full border border-gray-500"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></span>
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold" style={{ color: colors.text }}>Chat Interface</h1>
          <div className="flex items-center gap-2 sm:gap-4 text-xs" style={{ color: colors.text, opacity: 0.7 }}>
            <span>{mcpServers.length} MCP servers</span>
            <span>{availableTools.length} tools available</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={() => {
            const next = theme === "dark" ? "green" : theme === "green" ? "light" : "dark";
            onThemeChange(next as 'dark' | 'green' | 'light');
          }}
          className="px-2 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          {theme === "dark" ? "🌙" : theme === "green" ? "🌿" : "☀️"}
        </button>
        <button onClick={onOpenSettings} className="text-lg">
          ⚙️
        </button>
      </div>
    </header>
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  theme = 'dark', 
  onThemeChange = () => {},
  onOpenSettings = () => {},
  onToggleSidebar = () => {}
}) => {
  const { error, setError } = useAppStore();
  const colors = themes[theme];
  
  return (
    <>
      <div className="flex flex-col h-full w-full" style={{ background: colors.main, color: colors.text }}>
        <ChatHeader 
          colors={colors} 
          theme={theme} 
          onThemeChange={onThemeChange}
          onOpenSettings={onOpenSettings}
          onToggleSidebar={onToggleSidebar}
        />
        
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-red-800 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800 font-medium text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        <ChatMessages colors={colors} theme={theme} />
        <ChatInput colors={colors} />
      </div>
      
      <style jsx>{`
        @keyframes micPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            box-shadow: 0 0 0 12px rgba(239, 68, 68, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }
        .mic-pulse {
          animation: micPulse 1.5s infinite;
        }
        @keyframes dotPulse {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .dot-animation {
          animation: dotPulse 1.4s infinite;
        }
        .dot-animation.delay-200 {
          animation-delay: 0.2s;
        }
        .dot-animation.delay-400 {
          animation-delay: 0.4s;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default ChatInterface;
