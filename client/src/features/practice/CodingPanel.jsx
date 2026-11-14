import { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  CheckCircle2,
  Code2,
  EyeOff,
  Loader2,
  Play,
  RotateCcw,
  Send,
  Terminal,
} from 'lucide-react';
import { cn } from '../../utils/cn.js';

const LANGUAGE_LABELS = {
  javascript: 'JavaScript (Node.js)',
  python: 'Python 3',
  java: 'Java 17',
  cpp: 'C++ (GCC)',
};

export default function CodingPanel({ question }) {
  const { supportedLanguages, starterCode, testCases, functionName } =
    question.payload;

  const [language, setLanguage] = useState(supportedLanguages[0] || 'javascript');
  const [codeByLang, setCodeByLang] = useState({ ...starterCode });
  const [activeBottomTab, setActiveBottomTab] = useState('testcases');
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  const publicTestCases = testCases.filter((tc) => !tc.isHidden);
  const hiddenCount = testCases.filter((tc) => tc.isHidden).length;

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleEditorChange = (val) => {
    setCodeByLang((prev) => ({ ...prev, [language]: val || '' }));
  };

  const handleResetCode = () => {
    setCodeByLang((prev) => ({
      ...prev,
      [language]: starterCode[language] || '',
    }));
    setExecutionResult(null);
  };

  const simulateRun = (mode) => {
    setIsRunning(true);
    setActiveBottomTab('console');

    setTimeout(() => {
      const currentCode = (codeByLang[language] || '').trim();
      const hasReturn = currentCode.includes('return');

      const evaluatedCases = (
        mode === 'submit' ? testCases : publicTestCases
      ).map((tc, index) => ({
        id: tc.id,
        label: tc.isHidden ? `Hidden Test Case #${index + 1}` : `Sample Case #${index + 1}`,
        isHidden: tc.isHidden,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: hasReturn ? tc.expectedOutput : 'undefined',
        passed: hasReturn,
        runtimeMs: 12 + index * 7,
      }));

      const allPassed = evaluatedCases.every((c) => c.passed);

      setExecutionResult({
        mode,
        status: allPassed ? 'Accepted' : 'Wrong Answer',
        passedCount: evaluatedCases.filter((c) => c.passed).length,
        totalCount: evaluatedCases.length,
        totalTimeMs: 38,
        cases: evaluatedCases,
      });
      setIsRunning(false);
    }, 550);
  };

  return (
    <div className="flex flex-col h-full divide-y divide-slate-200">
      {/* Thanh công cụ chọn ngôn ngữ & thao tác code */}
      <div className="px-4 py-2.5 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-600" aria-hidden="true" />
          <label htmlFor="coding-lang-select" className="text-xs font-semibold text-slate-600">
            Ngôn ngữ:
          </label>
          <select
            id="coding-lang-select"
            name="language"
            value={language}
            onChange={handleLanguageChange}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {LANGUAGE_LABELS[lang] || lang}
              </option>
            ))}
          </select>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-500">
            fn: {functionName}()
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetCode}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Khôi phục code mẫu</span>
          </button>

          <button
            type="button"
            disabled={isRunning}
            onClick={() => simulateRun('run')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 disabled:opacity-60"
          >
            <Play className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            <span>Chạy thử (Run)</span>
          </button>

          <button
            type="button"
            disabled={isRunning}
            onClick={() => simulateRun('submit')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm disabled:opacity-60"
          >
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Nộp bài (Submit)</span>
          </button>
        </div>
      </div>

      {/* Khung soạn thảo Monaco Editor (Light Mode) */}
      <div className="h-[310px] sm:h-[340px] w-full bg-white">
        <Editor
          height="100%"
          language={language}
          theme="light"
          value={codeByLang[language] || ''}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* Khung dưới: Sample Test Cases & Console Output */}
      <div className="flex-1 flex flex-col bg-slate-50/60">
        <div
          role="tablist"
          aria-label="Kiểm thử và kết quả thực thi"
          className="flex items-center justify-between px-4 border-b border-slate-200 bg-white"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              role="tab"
              id="tab-testcases"
              aria-selected={activeBottomTab === 'testcases'}
              onClick={() => setActiveBottomTab('testcases')}
              className={cn(
                'relative py-2.5 px-3 text-xs font-semibold transition-colors',
                activeBottomTab === 'testcases'
                  ? 'text-blue-700 after:content-[""] after:absolute after:inset-x-0 after:bottom-0 after:h-[2.5px] after:bg-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Sample Test Cases ({publicTestCases.length})
            </button>
            <button
              type="button"
              role="tab"
              id="tab-console"
              aria-selected={activeBottomTab === 'console'}
              onClick={() => setActiveBottomTab('console')}
              className={cn(
                'relative py-2.5 px-3 text-xs font-semibold transition-colors inline-flex items-center gap-1.5',
                activeBottomTab === 'console'
                  ? 'text-blue-700 after:content-[""] after:absolute after:inset-x-0 after:bottom-0 after:h-[2.5px] after:bg-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Console Output</span>
            </button>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
            <EyeOff className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>+{hiddenCount} Hidden Test Case (Ẩn chống gian lận)</span>
          </span>
        </div>

        {/* Nội dung Tab Test Cases */}
        <div
          role="tabpanel"
          aria-labelledby="tab-testcases"
          hidden={activeBottomTab !== 'testcases'}
        >
          <div className="p-4 space-y-2.5">
            {publicTestCases.map((tc, idx) => (
              <div
                key={tc.id}
                className="p-3 rounded-lg bg-white border border-slate-200 text-xs font-mono space-y-1"
              >
                <div className="text-slate-500 font-sans font-semibold">
                  Test Case công khai #{idx + 1}
                </div>
                <div>
                  <span className="text-slate-500">Input: </span>
                  <span className="text-slate-900">{tc.input}</span>
                </div>
                <div>
                  <span className="text-slate-500">Expected Output: </span>
                  <span className="text-emerald-700 font-semibold">
                    {tc.expectedOutput}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nội dung Tab Console Output */}
        <div
          role="tabpanel"
          aria-labelledby="tab-console"
          hidden={activeBottomTab !== 'console'}
        >
          <div className="p-4">
            {isRunning ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-slate-600">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" aria-hidden="true" />
                <span>Đang gửi code tới Sandbox cô lập (Mock Mode)...</span>
              </div>
            ) : !executionResult ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Bấm <strong>Chạy thử (Run)</strong> hoặc <strong>Nộp bài (Submit)</strong> để xem kết quả kiểm thử tại đây.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={cn(
                        'w-4 h-4',
                        executionResult.status === 'Accepted'
                          ? 'text-emerald-600'
                          : 'text-amber-600'
                      )}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-bold text-slate-900">
                      Trạng thái: {executionResult.status} (
                      {executionResult.passedCount}/{executionResult.totalCount}{' '}
                      Test Cases)
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Thời gian: {executionResult.totalTimeMs} ms
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {executionResult.cases.map((c) => (
                    <div
                      key={c.id}
                      className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{c.label}</span>
                        <span
                          className={
                            c.passed ? 'text-emerald-700' : 'text-red-600'
                          }
                        >
                          {c.passed ? 'Passed' : 'Failed'} ({c.runtimeMs}ms)
                        </span>
                      </div>
                      {!c.isHidden ? (
                        <p className="font-mono text-[11px] text-slate-600 truncate">
                          Output: {c.actualOutput}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">
                          Đầu vào/đầu ra của Hidden Test Case được ẩn theo quy tắc Anti-Cheating.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
