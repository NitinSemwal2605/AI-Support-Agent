interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

const SUGGESTED_QUESTIONS = [
  { label: '📦 Refund policy?', question: 'What is your refund policy?' },
  { label: '🌍 International shipping?', question: 'Do you ship internationally?' },
  { label: '⏰ Support hours?', question: 'What are your customer support hours?' },
  { label: '🚚 Delivery time?', question: 'How long does delivery take?' },
];

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="px-4 pb-2 animate-slide-up">
      <p className="text-xs text-surface-500 text-center mb-3">Common questions to get you started:</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTED_QUESTIONS.map((item) => (
          <button
            key={item.question}
            onClick={() => onSelect(item.question)}
            className="px-3 py-1.5 text-xs font-medium text-brand-300 bg-brand-950/50 border border-brand-800/50 rounded-full hover:bg-brand-900/50 hover:border-brand-600 hover:text-brand-200 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
