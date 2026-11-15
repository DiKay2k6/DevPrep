import { AppError } from './errorHandler.js';

/**
 * Middleware kiểm tra dữ liệu đầu vào bằng Zod Schema.
 * Hỗ trợ cả schema bọc { body, query, params } lẫn schema phẳng trực tiếp trên req[source].
 */
export function validateRequest(schema, source = 'body') {
  return (req, _res, next) => {
    const isEnvelopeSchema =
      schema?.shape &&
      ('body' in schema.shape ||
        'query' in schema.shape ||
        'params' in schema.shape);

    const inputTarget = isEnvelopeSchema
      ? {
          body: req.body || {},
          query: req.query || {},
          params: req.params || {},
        }
      : req[source];

    const result = schema.safeParse(inputTarget);
    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue) => ({
        field: issue.path
          .filter((segment) => !['body', 'query', 'params'].includes(String(segment)))
          .join('.'),
        message: issue.message,
      }));
      return next(
        new AppError(
          formattedErrors[0]?.message || 'Dữ liệu đầu vào không hợp lệ.',
          400,
          formattedErrors
        )
      );
    }

    if (isEnvelopeSchema) {
      if (result.data.body !== undefined) req.body = result.data.body;
      if (result.data.query !== undefined) req.query = result.data.query;
      if (result.data.params !== undefined) req.params = result.data.params;
    } else {
      req[source] = result.data;
    }
    return next();
  };
}
