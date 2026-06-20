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
    // Reset height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const remaining = MAX_LENGTH - value.length;
  const nearLimit = remaining < 200;
  const atLimit = remaining <= 0;

  return (
    <div className="border-t border-surface-700/50 bg-surface-900/80 backdrop-blur-sm p-4">
      <div className={`flex items-end gap-3 bg-surface-800 border rounded-2xl px-4 py-3 transition-all duration-200
        ${disabled ? 'border-surface-700 opacity-60' : 'border-surface-600 focus-within:border-brand-500 focus-within:shadow-lg focus-within:shadow-brand-900/20'}
      `}>
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id="chat-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? 'Agent is responding…' : 'Type your message… (Enter to send, Shift+Enter for newline)'}
          maxLength={MAX_LENGTH}
          rows={1}
          className="flex-1 bg-transparent text-surface-100 placeholder-surface-500 text-sm resize-none outline-none min-h-[24px] max-h-40 leading-6 disabled:cursor-not-allowed"
        />

        {/* Character count + send button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Character count — only show near limit */}
          {nearLimit && (
            <span className={`text-xs tabular-nums ${atLimit ? 'text-red-400' : 'text-amber-400'}`}>
              {remaining}
            </span>
          )}

          {/* Send button */}
          <button
            id="send-message-btn"
            onClick={handleSend}
            disabled={disabled || !value.trim() || atLimit}
            className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
              ${disabled || !value.trim() || atLimit
                ? 'bg-surface-700 text-surface-500 cursor-not-allowed'
                : 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-900/30 hover:shadow-brand-900/50 hover:scale-105 active:scale-95'
              }`}
            aria-label="Send message"
          >
            {disabled ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Hint */}
      <p className="text-center text-[11px] text-surface-600 mt-2">
        Press <kbd className="px-1 py-0.5 bg-surface-700 rounded text-surface-400 text-[10px]">Enter</kbd> to send ·{' '}
        <kbd className="px-1 py-0.5 bg-surface-700 rounded text-surface-400 text-[10px]">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
