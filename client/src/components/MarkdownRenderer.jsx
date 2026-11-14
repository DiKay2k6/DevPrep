import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Check, Copy, Terminal } from 'lucide-react';

function CodeBlock({ className, children }) {
  const [copied, setCopied] = useState(false);
  const rawText = String(children).replace(/\n$/, '');
  const match = /language-(\w+)/.exec(className || '');
  const isBlock = Boolean(match) || rawText.includes('\n');

  if (!isBlock) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200/80 font-mono text-[0.875em]">
        {children}
      </code>
    );
  }

  const language = match ? match[1] : 'code';

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(rawText);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="my-4 rounded-xl border border-slate-200 bg-slate-900 text-slate-100 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/90 border-b border-slate-700 text-xs text-slate-300">
        <span className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
          <span>{language}</span>
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Sao chép đoạn code mẫu"
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-700/70 hover:bg-slate-700 text-slate-200 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span className="text-emerald-300">Đã chép</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sao chép</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
        <code>{rawText}</code>
      </pre>
    </div>
  );
}

/**
 * Component hiển thị tài liệu Markdown an toàn (ReactMarkdown mặc định thoát HTML thô, chống XSS).
 */
export default function MarkdownRenderer({ content }) {
  return (
    <div className="max-w-[68ch] text-slate-800 leading-relaxed space-y-4">
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 pt-6 pb-2 border-b border-slate-200 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-slate-900 pt-4 pb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-base text-slate-700 leading-7">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 space-y-2 text-slate-700">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-2 text-slate-700">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-600 bg-blue-50/60 px-4 py-3 rounded-r-lg text-slate-700 italic">
              {children}
            </blockquote>
          ),
          code: CodeBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
