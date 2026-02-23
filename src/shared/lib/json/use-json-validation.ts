import { useState } from 'react';

import { validateJson } from './json-utils';

/**
 * JSON 검증 + 자동 수정 제안 훅
 *
 * @returns jsonError - 에러 메시지 (없으면 null)
 * @returns fixSuggestion - 자동 수정 가능한 JSON 문자열 (없으면 null)
 * @returns validate - 값을 검증하고 상태 업데이트
 */
export function useJsonValidation() {
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [fixSuggestion, setFixSuggestion] = useState<string | null>(null);

  const validate = (value: string) => {
    const result = validateJson(value);
    setJsonError(result.error);
    setFixSuggestion(result.fixSuggestion);
  };

  const clearError = () => {
    setJsonError(null);
    setFixSuggestion(null);
  };

  return { jsonError, fixSuggestion, validate, clearError };
}
