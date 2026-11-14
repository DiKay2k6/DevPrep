import { memo, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Check, Copy, Terminal } from 'lucide-react';
import {
  cleanMarkdownHeadingText,
  extractTocFromMarkdown,
  slugifyHeading,
} from '../utils/markdownToc.js';

function legacyCopyText(text) {
  const field = Object.assign(document.createElement('textarea'), {
    value: text,
  });
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;inset-block-start:0;opacity:0';
  document.body.append(field);
  field.select();
  try {
    return document.execCommand('copy');
  } finally {
    field.remove();
  }
}

function extractNodeText(node) {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractNodeText).join('');
  }
  if (typeof node === 'object' && node.props && node.props.children !== undefined) {
    return extractNodeText(node.props.children);
  }
  return '';
}

function CodeBlock({ className, children }) {
  const [copyStatus, setCopyStatus] = useState('idle'); // 'idle' | 'copied' | 'failed'
  const timerRef = useRef(null);
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

  const handleCopy = async () => {
    if (!rawText) return;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    let ok = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(rawText);
        ok = true;
      } else {
        ok = legacyCopyText(rawText);
      }
    } catch {
      ok = legacyCopyText(rawText);
    }

    setCopyStatus(ok ? 'copied' : 'failed');
    timerRef.current = window.setTimeout(() => {
      setCopyStatus('idle');
    }, 2000);
  };

  return (
    <div className="my-4 rounded-xl border border-slate-200 bg-slate-900 text-slate-100 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/90 border-b border-slate-700 text-xs text-slate-300">
        <span className="inline-flex items-center gap-1.5 font-mono uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
          <span>{language}</span>
        </span>

        <span className="inline-flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            data-copied={copyStatus === 'copied' ? '' : undefined}
            data-failed={copyStatus === 'failed' ? '' : undefined}
            className="min-h-[28px] min-w-[28px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-100 font-semibold transition-colors"
          >
            {copyStatus === 'copied' ? (
              <>
                <Check
                  className="w-3.5 h-3.5 text-emerald-400"
                  aria-hidden="true"
                />
                <span className="text-emerald-300">Đã sao chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sao chép code</span>
              </>
            )}
          </button>

          {/* Vùng thông báo trạng thái tách biệt bên ngoài button theo Modern Web Guidance */}
          <span role="status" className="visually-hidden">
            {copyStatus === 'copied'
              ? `Đã sao chép đoạn mã ${language}`
              : copyStatus === 'failed'
                ? 'Không thể sao chép đoạn mã'
                : ''}
          </span>
        </span>
      </div>
      <pre
        tabIndex={0}
        className="p-4 overflow-x-auto text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      >
        <code>{rawText}</code>
      </pre>
    </div>
  );
}

const STATIC_COMPONENTS = {
  p: ({ children }) => (
    <p className="text-base text-slate-700 leading-7">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 space-y-2 text-slate-700">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 space-y-2 text-slate-700">{children}</ol>
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
};

/**
 * Component hiển thị tài liệu Markdown an toàn (ReactMarkdown mặc định thoát HTML thô, chống XSS),
 * đồng thời giữ ổn định tham chiếu component và gắn id neo khớp 100% với Mục lục (Table of Contents).
 */
const MarkdownRenderer = memo(function MarkdownRenderer({ content }) {
  // Tạo sẵn danh sách id từ chính chuỗi Markdown để đối chiếu ổn định ngay cả khi component re-render
  const headingIdLookup = useMemo(() => {
    const toc = extractTocFromMarkdown(content);
    const byKey = new Map();
    for (const item of toc) {
      const key = `${item.level}:${cleanMarkdownHeadingText(item.title)}`;
      if (!byKey.has(key)) {
        byKey.set(key, item.id);
      }
    }
    return byKey;
  }, [content]);

  const markdownComponents = useMemo(() => {
    const resolveId = (level, children) => {
      const plainText = cleanMarkdownHeadingText(extractNodeText(children));
      return (
        headingIdLookup.get(`${level}:${plainText}`) ||
        slugifyHeading(plainText) ||
        'muc-luc'
      );
    };

    return {
      ...STATIC_COMPONENTS,
      h2: ({ children }) => (
        <h2
          id={resolveId(2, children)}
          className="scroll-mt-24 text-xl sm:text-2xl font-bold text-slate-900 pt-6 pb-2 border-b border-slate-200 tracking-tight"
        >
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3
          id={resolveId(3, children)}
          className="scroll-mt-24 text-lg font-semibold text-slate-900 pt-4 pb-1"
        >
          {children}
        </h3>
      ),
    };
  }, [headingIdLookup]);

  return (
    <div className="max-w-[68ch] text-slate-800 leading-relaxed space-y-4">
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  );
});

export default MarkdownRenderer;
