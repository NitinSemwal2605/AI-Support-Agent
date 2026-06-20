import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import type { OptimisticMessage } from '../types';

interface ChatMessageProps {
  message: OptimisticMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const time = format(new Date(message.createdAt), 'h:mm a');

  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-2 animate-fade-in group">
        <div className="flex flex-col items-end max-w-[75%]">
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-lg shadow-brand-900/20">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
          <span className="text-[11px] text-surface-400 mt-1 mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {time}
          </span>
        </div>
        {/* User avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-600 border border-surface-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-surface-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>
      </div>
    );
  }

  // AI message
  return (
    <div className="flex items-start gap-3 animate-fade-in group">
      {/* AI avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-900/30 mt-0.5">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15m-6.05-11.896a24.301 24.301 0 00-4.5 0" />
        </svg>
      </div>

      {/* Bubble + timestamp */}
      <div className="flex flex-col items-start max-w-[75%]">
        <div className="bg-surface-800 border border-surface-700/50 text-surface-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          {/* Markdown rendering */}
          <div className="prose prose-sm prose-invert max-w-none
            prose-p:my-1 prose-p:leading-relaxed
            prose-ul:my-1 prose-ul:pl-4
            prose-ol:my-1 prose-ol:pl-4
            prose-li:my-0.5
            prose-strong:text-white prose-strong:font-semibold
            prose-code:bg-surface-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-brand-300 prose-code:text-xs
            prose-pre:bg-surface-900 prose-pre:border prose-pre:border-surface-700 prose-pre:rounded-lg prose-pre:my-2
            prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        <span className="text-[11px] text-surface-400 mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {time}
        </span>
      </div>
    </div>
  );
}
