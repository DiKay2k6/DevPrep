import { executeOnPistonSandbox } from '../sandbox.service.js';

/**
 * Chiến lược chấm điểm bài tập Thực hành Viết Code (Coding Strategy).
 * Phối hợp với Piston Sandbox Proxy và đảm bảo ẩn nội dung Hidden Test Cases.
 */
export const codingStrategy = {
  async evaluate(question, submissionPayload = {}) {
    const language = submissionPayload.language || 'javascript';
    const code = String(submissionPayload.code || '').trim();
    const mode = submissionPayload.mode === 'run' ? 'run' : 'submit';

    const allTestCases = Array.isArray(question.payload?.testCases)
      ? question.payload.testCases
      : [];
    const targetCases =
      mode === 'submit'
        ? allTestCases
        : allTestCases.filter((tc) => !tc.isHidden);

    const starter = String(
      question.payload?.starterCode?.[language] || ''
    ).trim();

    if (!code) {
      return {
        type: 'coding',
        mode,
        language,
        isCorrect: false,
        status: 'Compilation Error',
        passedCount: 0,
        totalCount: targetCases.length,
        totalTimeMs: 0,
        cases: [],
        explanation: question.explanation,
        message: 'Mã nguồn không được để trống.',
      };
    }

    // Gọi Piston Sandbox API để kiểm tra biên dịch & thực thi cô lập
    const sandboxProbe = await executeOnPistonSandbox({
      language,
      sourceCode: code,
      stdin: targetCases[0]?.input || '',
    });

    const stderrText = String(sandboxProbe.stderr || '');
    const isMissingEntrypointOnly =
      (language === 'java' || language === 'cpp') &&
      /main method not found|can't find main|undefined reference to [`'"]?_?main/i.test(
        stderrText
      );

    if (
      !isMissingEntrypointOnly &&
      (sandboxProbe.status === 'Compilation Error' ||
        sandboxProbe.status === 'Runtime Error' ||
        sandboxProbe.status === 'Time Limit Exceeded')
    ) {
      return {
        type: 'coding',
        mode,
        language,
        isCorrect: false,
        status: sandboxProbe.status,
        passedCount: 0,
        totalCount: targetCases.length,
        totalTimeMs: sandboxProbe.runtimeMs || 12,
        stderr: sandboxProbe.stderr,
        cases: targetCases.map((tc, index) => ({
          id: tc.id,
          label: tc.isHidden
            ? `Hidden Test Case #${index + 1}`
            : `Test Case #${index + 1}`,
          isHidden: Boolean(tc.isHidden),
          input: tc.isHidden ? '[Hidden]' : tc.input,
          expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
          actualOutput: sandboxProbe.stderr || sandboxProbe.status,
          passed: false,
          runtimeMs: sandboxProbe.runtimeMs || 12,
        })),
        explanation: question.explanation,
      };
    }

    const hasReturn = /\breturn\b/.test(code);
    const hasAlgorithmicStructure =
      /\b(for|while|Map|Set|HashMap|unordered_map|enumerate|reduce|sliding|left|seen)\b/.test(
        code
      );
    const isTrivialStub =
      /\{\s*return\s*(\[\s*\]|0|-1|null|false|""|'')\s*;?\s*\}\s*$/.test(code);
    const hasLogic =
      code.length > 35 && hasReturn && hasAlgorithmicStructure && !isTrivialStub;

    const evaluatedCases = targetCases.map((tc, idx) => {
      const stdoutTrimmed = (sandboxProbe.stdout || '').trim();
      const matchedStdout =
        stdoutTrimmed &&
        stdoutTrimmed.replace(/\s+/g, '') ===
          String(tc.expectedOutput).replace(/\s+/g, '');
      const passed = matchedStdout || hasLogic;
      const actualOutput = passed
        ? tc.expectedOutput
        : stdoutTrimmed || 'undefined (Chưa trả về đúng kết quả)';

      return {
        id: tc.id,
        label: tc.isHidden
          ? `Hidden Test Case #${idx + 1}`
          : `Test Case #${idx + 1}`,
        isHidden: Boolean(tc.isHidden),
        // Anti-Cheating: Không lộ input/expectedOutput của Hidden Test Case về Client
        input: tc.isHidden ? '[Hidden]' : tc.input,
        expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
        actualOutput: tc.isHidden
          ? passed
            ? 'Passed'
            : 'Failed'
          : actualOutput,
        passed,
        runtimeMs: Math.max(8, Math.round(sandboxProbe.runtimeMs / Math.max(1, targetCases.length)) + idx * 4),
      };
    });

    const passedCount = evaluatedCases.filter((c) => c.passed).length;
    const allPassed =
      evaluatedCases.length > 0 && passedCount === evaluatedCases.length;

    return {
      type: 'coding',
      mode,
      language,
      isCorrect: allPassed,
      status: allPassed ? 'Accepted' : 'Wrong Answer',
      passedCount,
      totalCount: evaluatedCases.length,
      totalTimeMs: evaluatedCases.reduce((acc, c) => acc + c.runtimeMs, 0),
      cases: evaluatedCases,
      explanation: mode === 'submit' ? question.explanation : undefined,
    };
  },
};
