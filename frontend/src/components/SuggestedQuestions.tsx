interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

const SUGGESTED_QUESTIONS = [
  { label: 'Refund policy', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', question: 'What is your refund policy?' },
  { label: 'Shipping times', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4', question: 'How long does international shipping take?' },
  { label: 'Support hours', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', question: 'What are your customer support hours?' },
];

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-3 justify-center mt-8 animate-slide-up">
      {SUGGESTED_QUESTIONS.map((item) => (
        <button
          key={item.label}
          onClick={() => onSelect(item.question)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-full hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:shadow"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
          </svg>
          {item.label}
        </button>
      ))}
    </div>
  );
}
