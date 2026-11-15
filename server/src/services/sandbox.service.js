import { env } from '../config/env.js';

const PISTON_RUNTIMES = {
  javascript: { language: 'javascript', version: '18.15.0', fileName: 'solution.js' },
  python: { language: 'python', version: '3.10.0', fileName: 'solution.py' },
  java: { language: 'java', version: '15.0.2', fileName: 'Main.java' },
  cpp: { language: 'c++', version: '10.2.0', fileName: 'main.cpp' },
};

/**
 * Thực thi mã nguồn cô lập thông qua Piston Sandbox API.
 * TUYỆT ĐỐI KHÔNG dùng eval(), new Function() hay child_process trên Express Server.
 * Có áp dụng AbortController giới hạn timeout (3-5 giây).
 */
export async function executeOnPistonSandbox({ language, sourceCode, stdin = '' }) {
  const runtime = PISTON_RUNTIMES[language] || PISTON_RUNTIMES.javascript;
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    env.SANDBOX_TIMEOUT_MS
  );

  const startedAt = Date.now();
  try {
    const response = await fetch(env.PISTON_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        language: runtime.language,
        version: runtime.version,
        files: [{ name: runtime.fileName, content: String(sourceCode || '') }],
        stdin: String(stdin || ''),
        run_timeout: env.SANDBOX_TIMEOUT_MS,
      }),
    });

    if (!response.ok) {
      throw new Error(`Piston Sandbox phản hồi mã lỗi HTTP ${response.status}`);
    }

    const data = await response.json();
    const elapsedMs = Date.now() - startedAt;

    if (data.compile && data.compile.code !== 0) {
      return {
        status: 'Compilation Error',
        stdout: '',
        stderr: data.compile.stderr || data.compile.output || 'Lỗi biên dịch.',
        exitCode: data.compile.code,
        runtimeMs: elapsedMs,
      };
    }

    const runResult = data.run || {};
    if (runResult.signal === 'SIGKILL') {
      return {
        status: 'Time Limit Exceeded',
        stdout: (runResult.stdout || '').trim(),
        stderr: 'Quá thời gian thực thi cho phép (Time Limit Exceeded).',
        exitCode: runResult.code ?? -1,
        runtimeMs: elapsedMs,
      };
    }

    if (runResult.code !== 0) {
      return {
        status: 'Runtime Error',
        stdout: (runResult.stdout || '').trim(),
        stderr: runResult.stderr || runResult.output || 'Lỗi khi chạy chương trình.',
        exitCode: runResult.code,
        runtimeMs: elapsedMs,
      };
    }

    return {
      status: 'OK',
      stdout: (runResult.stdout || '').trim(),
      stderr: (runResult.stderr || '').trim(),
      exitCode: 0,
      runtimeMs: elapsedMs,
    };
  } catch (error) {
    const elapsedMs = Date.now() - startedAt;
    if (error.name === 'AbortError') {
      return {
        status: 'Time Limit Exceeded',
        stdout: '',
        stderr: `Yêu cầu thực thi vượt quá giới hạn ${env.SANDBOX_TIMEOUT_MS}ms.`,
        exitCode: -1,
        runtimeMs: elapsedMs,
      };
    }

    return {
      status: 'Sandbox Unavailable',
      stdout: '',
      stderr: error.message,
      exitCode: -1,
      runtimeMs: elapsedMs,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
