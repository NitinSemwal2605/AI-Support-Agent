import { format, isToday, isYesterday } from 'date-fns';
import type { ConversationListItem } from '../types';

interface SidebarProps {
  conversations: ConversationListItem[];
  currentSessionId: string | null;
  onNewConversation: () => void;
  onLoadConversation: (id: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

function formatConversationDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

export function Sidebar({
  conversations,
  currentSessionId,
  onNewConversation,
  onLoadConversation,
  darkMode,
  onToggleDarkMode,
}: SidebarProps) {
  return (
    <aside className="w-72 flex-shrink-0 bg-surface-950 border-r border-surface-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-surface-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-900/30">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15m-6.05-11.896a24.301 24.301 0 00-4.5 0" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-surface-100">Spur Support</h1>
              <p className="text-[10px] text-surface-500">AI Customer Agent</p>
            </div>
          </div>
          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-surface-400 hover:text-surface-200 hover:bg-surface-800 transition-all"
            aria-label="Toggle dark mode"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* New conversation button */}
        <button
          id="new-conversation-btn"
          onClick={onNewConversation}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-brand-600/10 border border-brand-600/20 text-brand-400 text-sm font-medium hover:bg-brand-600/20 hover:border-brand-500/40 hover:text-brand-300 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Conversation
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-surface-600 text-xs">No conversations yet</p>
            <p className="text-surface-700 text-[11px] mt-1">Start a chat to get help</p>
          </div>
        ) : (
          <>
            <p className="text-[11px] text-surface-600 px-2 mb-2 font-medium uppercase tracking-wider">Recent</p>
            {conversations.map((conv) => {
              const isActive = conv.id === currentSessionId;
              const preview = conv.messages?.[0]?.content;

              return (
                <button
                  key={conv.id}
                  onClick={() => onLoadConversation(conv.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 group
                    ${isActive
                      ? 'bg-brand-600/15 border border-brand-600/25 text-surface-100'
                      : 'hover:bg-surface-800 text-surface-400 hover:text-surface-200 border border-transparent'
                    }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium truncate flex-1 pr-2">
                      Conversation
                    </span>
                    <span className="text-[10px] text-surface-600 flex-shrink-0">
                      {formatConversationDate(conv.createdAt)}
                    </span>
                  </div>
                  {preview && (
                    <p className="text-[11px] text-surface-600 truncate group-hover:text-surface-500 transition-colors">
                      {preview}
                    </p>
                  )}
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-surface-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-surface-500">AI agent online</span>
        </div>
        <p className="text-[10px] text-surface-700 mt-1">Powered by Gemini 2.5 Flash</p>
      </div>
    </aside>
  );
}
