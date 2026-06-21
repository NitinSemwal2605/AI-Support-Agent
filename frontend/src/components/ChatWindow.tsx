import { useEffect, useRef, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
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
  const isEmpty = messages.length === 0 && !isRestoringSession;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = (message: string) => {
    onSendMessage(message);
    setInputValue('');
  };

  return (
    <div className="flex flex-col flex-1 h-full relative bg-white dark:bg-slate-950">
      {isEmpty ? (
        // Centered layout for empty state
        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 text-center tracking-tight">
            Engage Customers. Resolve Faster. <br className="hidden md:block"/>
            <span className="text-blue-600 dark:text-blue-500">Scale Your Support.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-10 text-center max-w-lg text-lg">
            Your all-in-one AI support companion. Deliver exceptional customer experiences 24/7.
          </p>
          <div className="w-full max-w-2xl">
            <ChatInput
              onSend={handleSend}
              disabled={isLoading || isRestoringSession}
              value={inputValue}
              onChange={setInputValue}
            />
            <SuggestedQuestions onSelect={handleSend} />
          </div>
        </div>
      ) : (
        // Normal chat layout
        <>
          <div className="flex-1 overflow-y-auto px-4 py-8">
            <div className="max-w-3xl mx-auto space-y-6">
              {isRestoringSession && (
                <div className="flex items-center justify-center py-8 text-blue-600 dark:text-blue-500">
                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}

              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {isLoading && (
                <div className="flex items-start gap-3 mb-6 animate-fade-in">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm border border-blue-200 dark:border-blue-800">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z"/>
                    </svg>
                  </div>
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 h-6">
                      <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Error banner */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-red-600 dark:text-red-400 text-sm mt-4">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                  <button onClick={onDismissError} className="ml-auto hover:text-red-800 dark:hover:text-red-200">✕</button>
                </div>
              )}
              
              <div ref={bottomRef} className="h-4" />
            </div>
          </div>
          
          <div className="w-full pb-6 bg-gradient-to-t from-white dark:from-slate-950 via-white dark:via-slate-950 to-transparent pt-6">
            <div className="max-w-3xl mx-auto px-4">
               <ChatInput
                onSend={handleSend}
                disabled={isLoading || isRestoringSession}
                value={inputValue}
                onChange={setInputValue}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
