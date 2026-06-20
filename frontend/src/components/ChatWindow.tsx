import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { SuggestedQuestions } from './SuggestedQuestions';
import type { OptimisticMessage } from '../types';

interface ChatWindowProps {
  messages: OptimisticMessage[];
  isLoading: boolean;
  isRestoringSession: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  onDismissError: () => void;
}

export function ChatWindow({
  messages,
  isLoading,
  isRestoringSession,
  error,
  onSendMessage,
  onDismissError,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const showSuggestions = messages.length === 0 && !isRestoringSession;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = (message: string) => {
    onSendMessage(message);
    setInputValue('');
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSend(question);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-surface-900">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-800 bg-surface-900/90 backdrop-blur-sm">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
        <div>
          <h2 className="text-sm font-semibold text-surface-100">Customer Support</h2>
          <p className="text-xs text-surface-500">Usually replies instantly</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {/* Restoring session */}
        {isRestoringSession && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-surface-500 text-sm">
              <svg className="w-4 h-4 animate-spin text-brand-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Restoring your conversation…
            </div>
          </div>
        )}

        {/* Welcome message */}
        {messages.length === 0 && !isRestoringSession && (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-xl shadow-brand-900/40 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-surface-100 mb-2">Hi there! 👋</h3>
            <p className="text-surface-400 text-sm max-w-xs leading-relaxed">
              I'm your AI support agent. I can help you with shipping, returns, refunds, and more.
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isLoading && <TypingIndicator />}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-2 flex items-center gap-2 px-4 py-2.5 bg-red-950/50 border border-red-800/50 rounded-xl text-red-300 text-sm animate-fade-in">
          <svg className="w-4 h-4 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span className="flex-1">{error}</span>
          <button
            onClick={onDismissError}
            className="text-red-400 hover:text-red-200 transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Suggested questions */}
      {showSuggestions && (
        <SuggestedQuestions onSelect={handleSuggestedQuestion} />
      )}

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={isLoading || isRestoringSession}
        value={inputValue}
        onChange={setInputValue}
      />
    </div>
  );
}
