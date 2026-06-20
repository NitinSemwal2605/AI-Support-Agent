import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { useChat } from './hooks/useChat';

const DARK_MODE_KEY = 'spur_dark_mode';

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(DARK_MODE_KEY);
      if (stored !== null) return stored === 'true';
      // Default: respect system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return true;
    }
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    messages,
    isLoading,
    isRestoringSession,
    error,
    sessionId,
    conversations,
    sendMessage,
    startNewConversation,
    loadConversation,
    dismissError,
  } = useChat();

  // Persist dark mode and update document class
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(DARK_MODE_KEY, String(darkMode));
    } catch {
      // ignore
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((d) => !d);

  return (
    <div className="flex h-screen bg-surface-900 text-surface-100 overflow-hidden">
      {/* Sidebar toggle button (mobile / collapsed) */}
      <button
        onClick={() => setSidebarOpen((o) => !o)}
        className="fixed top-4 left-4 z-50 lg:hidden w-9 h-9 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-300 hover:text-surface-100 hover:bg-surface-700 transition-all"
        aria-label="Toggle sidebar"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-72 opacity-100' : 'w-0 opacity-0 overflow-hidden'}
        flex-shrink-0
      `}>
        <Sidebar
          conversations={conversations}
          currentSessionId={sessionId}
          onNewConversation={startNewConversation}
          onLoadConversation={loadConversation}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      </div>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          isRestoringSession={isRestoringSession}
          error={error}
          onSendMessage={sendMessage}
          onDismissError={dismissError}
        />
      </main>
    </div>
  );
}

export default App;
