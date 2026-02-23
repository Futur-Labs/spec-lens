/**
 * 일반적인 JSON 오류를 정규식으로 자동 수정 시도
 * 수정 가능하면 수정된 JSON 문자열 반환, 불가능하면 null
 */
export function tryFixJson(value: string): string | null {
  let fixed = value;

  // 1. trailing comma 제거: {"a": 1,} → {"a": 1}
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

  // 2. 따옴표 없는 key: {key: "value"} → {"key": "value"}
  fixed = fixed.replace(/([{,]\s*)([a-zA-Z_$][\w$]*)\s*:/g, '$1"$2":');

  // 3. single quote → double quote (문자열 값에만, 내부 escape 처리)
  fixed = fixed.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');

  if (fixed === value) return null;

  try {
    JSON.parse(fixed);
    return fixed;
  } catch {
    return null;
  }
}

/**
 * JSON 문자열 검증 결과 반환
 */
export function validateJson(value: string): {
  isValid: boolean;
  error: string | null;
  fixSuggestion: string | null;
} {
  if (!value.trim()) {
    return { isValid: true, error: null, fixSuggestion: null };
  }

  try {
    JSON.parse(value);
    return { isValid: true, error: null, fixSuggestion: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Invalid JSON';
    const fixSuggestion = tryFixJson(value);
    return { isValid: false, error, fixSuggestion };
  }
}
