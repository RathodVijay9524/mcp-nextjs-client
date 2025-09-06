'use client';

import React, { useState, useEffect } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';
import Sidebar from '@/components/ui/Sidebar';
import ConfigurationDialog from '@/components/ui/ConfigurationDialog';

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

export default function Home() {
  const [theme, setTheme] = useState<'dark' | 'green' | 'light'>('dark');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('chatTheme');
    if (saved && saved in themes) {
      setTheme(saved as 'dark' | 'green' | 'light');
    }
    
    // Set initial sidebar state based on screen size
    const handleResize = () => {
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      setSidebarCollapsed(isMobile);
    };
    
    // Set initial state
    handleResize();
    
    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('chatTheme', theme);
  }, [theme]);

  const colors = themes[theme];

  const handleThemeChange = (newTheme: 'dark' | 'green' | 'light') => {
    setTheme(newTheme);
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: colors.main, color: colors.text }}>
      {/* Mobile overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleToggleSidebar}
        />
      )}
      
      <Sidebar 
        theme={theme}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={handleToggleSidebar}
        onOpenSettings={handleOpenSettings}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <ChatInterface
          theme={theme}
          onThemeChange={handleThemeChange}
          onOpenSettings={handleOpenSettings}
          onToggleSidebar={handleToggleSidebar}
        />
      </div>

      {showSettings && (
        <ConfigurationDialog 
          isOpen={showSettings} 
          onClose={handleCloseSettings}
          theme={{ colors }}
        />
      )}
    </div>
  );
}
