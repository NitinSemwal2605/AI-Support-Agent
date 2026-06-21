import type { ConversationListItem } from '../types';

interface SidebarProps {
  conversations: ConversationListItem[];
  currentSessionId: string | null;
  onNewConversation: () => void;
  onLoadConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Sidebar({
  conversations,
  currentSessionId,
  onNewConversation,
  onLoadConversation,
  onDeleteConversation,
  darkMode,
  onToggleDarkMode,
}: SidebarProps) {
  return (
    <aside className="w-full flex flex-col h-full text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          {/* Spur Logo (Shopping Bag) */}
          <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z"/>
          </svg>
          <h1 className="text-xl font-bold tracking-tight text-blue-600">Spur</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* New Chat Button */}
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all shadow-sm active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-2">
        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2 mt-2">Recent Conversations</h3>
        {conversations.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 px-3 py-2">No recent chats</p>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === currentSessionId;
            const preview = conv.title || conv.messages?.[0]?.content || 'New conversation';

            return (
              <div
                key={conv.id}
                onClick={() => onLoadConversation(conv.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors group flex items-center cursor-pointer relative
                  ${isActive ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700' : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'}`}
              >
                <svg className={`w-4 h-4 mr-2 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className={`text-[13px] leading-5 truncate flex-1 ${isActive ? 'text-blue-900 dark:text-blue-100 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                  {preview}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete conversation"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onToggleDarkMode}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors text-slate-600 dark:text-slate-400"
        >
          {darkMode ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-sm font-medium">Light Mode</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span className="text-sm font-medium">Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
