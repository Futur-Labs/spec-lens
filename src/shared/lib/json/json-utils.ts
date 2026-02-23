/**
 * 유효한 JSON을 들여쓰기 2칸으로 포맷팅
 * 유효하지 않으면 원본 반환
 */
export function formatJson(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

/**
 * 일반적인 JSON 오류를 정규식으로 자동 수정 시도
 * 수정 가능하면 포맷팅된 JSON 문자열 반환, 불가능하면 null
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
    // 수정 성공 시 포맷팅까지 적용
    return JSON.stringify(JSON.parse(fixed), null, 2);
  } catch {
    return null;
  }
}

/**
 * JSON 문자열 검증 결과 반환
 * formattedJson: 유효하지만 포맷이 다른 경우 포맷팅된 버전 제공
 */
export function validateJson(value: string): {
  isValid: boolean;
  error: string | null;
  fixSuggestion: string | null;
  formattedJson: string | null;
} {
  if (!value.trim()) {
    return { isValid: true, error: null, fixSuggestion: null, formattedJson: null };
  }

  try {
    const formatted = JSON.stringify(JSON.parse(value), null, 2);
    // 포맷이 다르면 포맷팅 제안
    const formattedJson = formatted !== value ? formatted : null;
    return { isValid: true, error: null, fixSuggestion: null, formattedJson };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Invalid JSON';
    const fixSuggestion = tryFixJson(value);
    return { isValid: false, error, fixSuggestion, formattedJson: null };
  }
}
