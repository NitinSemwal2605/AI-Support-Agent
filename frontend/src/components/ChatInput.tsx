import { useRef, useEffect, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  value: string;
  onChange: (value: string) => void;
}

const MAX_LENGTH = 5000;

export function ChatInput({ onSend, disabled, value, onChange }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  // Focus on mount
  useEffect(() => {
    if (!disabled) textareaRef.current?.focus();
  }, [disabled]);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    onChange('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full">
      <div className={`flex items-end gap-2 bg-white dark:bg-slate-900 border shadow-sm rounded-[24px] px-3 py-2.5 transition-all
        ${disabled ? 'opacity-60 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800' : 'border-slate-300 dark:border-slate-700 focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10'}
      `}>
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type your message here..."
          maxLength={MAX_LENGTH}
          rows={1}
          className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-[15px] resize-none outline-none min-h-[24px] max-h-40 py-2 leading-6 disabled:cursor-not-allowed mx-2"
        />

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 mt-auto mb-0.5
            ${disabled || !value.trim()
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow active:scale-95'
            }
          `}
        >
          {disabled && value.trim() ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
      <div className="flex justify-between items-center mt-2 px-1">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Powered by <span className="font-medium text-slate-500 dark:text-slate-400">Intelligent Support</span>
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
          Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
