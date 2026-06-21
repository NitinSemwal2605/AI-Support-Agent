import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { OptimisticMessage } from '../types';

interface ChatMessageProps {
  message: OptimisticMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end gap-2 group mb-6 animate-fade-in">
        <div className="max-w-[75%] bg-blue-600 text-white rounded-2xl rounded-tr-none px-5 py-3 shadow-sm border border-blue-700/20 dark:border-blue-500/20">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // AI message
  return (
    <div className="flex items-start gap-3 mb-6 animate-fade-in group">
      {/* AI avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm border border-blue-200 dark:border-blue-800 mt-1">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z"/>
        </svg>
      </div>

      {/* Bubble */}
      <div className="flex flex-col items-start max-w-[85%] text-slate-800 dark:text-slate-200">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none px-5 py-3 border border-slate-200 dark:border-slate-700 shadow-sm">
          {/* Markdown rendering */}
          <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-7 prose-p:text-[15px]
            prose-p:my-2
            prose-ul:my-2 prose-ul:pl-5
            prose-ol:my-2 prose-ol:pl-5
            prose-li:my-1
            prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-semibold
            prose-code:bg-white dark:prose-code:bg-slate-900 prose-code:border prose-code:border-slate-200 dark:prose-code:border-slate-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-blue-700 dark:prose-code:text-blue-400 prose-code:text-[13px]
            prose-pre:bg-slate-800 dark:prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 dark:prose-pre:border-slate-800 prose-pre:rounded-xl prose-pre:my-4 prose-pre:text-slate-100 prose-pre:shadow-sm
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-500 dark:hover:prose-a:text-blue-300
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
