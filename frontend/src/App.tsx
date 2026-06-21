import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { useChat } from './hooks/useChat';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

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
    deleteConversation,
    dismissError,
  } = useChat();

  // Toggle Tailwind dark mode class on the root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden selection:bg-blue-200 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-100 font-sans">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen((o) => !o)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-all shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`
        transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900
        ${sidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'}
        flex-shrink-0
      `}>
        <Sidebar
          conversations={conversations}
          currentSessionId={sessionId}
          onNewConversation={startNewConversation}
          onLoadConversation={loadConversation}
          onDeleteConversation={deleteConversation}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
      </div>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-white dark:bg-slate-950">
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
