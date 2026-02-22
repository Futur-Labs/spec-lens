/**
 * @ 입력 후 변수명 검색 패턴 매칭
 * 커서 앞 텍스트에서 @xxx 패턴을 찾아 검색어와 @ 위치를 반환
 */
export function parseAtMention(
  text: string,
  cursorPos: number,
): { searchTerm: string; atPosition: number } | null {
  const textBeforeCursor = text.slice(0, cursorPos);
  const atMatch = textBeforeCursor.match(/@(\w*)$/);

  if (!atMatch) return null;

  return {
    searchTerm: atMatch[1].toLowerCase(),
    atPosition: cursorPos - atMatch[0].length,
  };
}

/**
 * 변수 목록 필터링
 */
export function filterVariables<T extends { name: string }>(
  variables: T[],
  searchTerm: string,
): T[] {
  return variables.filter((v) => v.name.toLowerCase().includes(searchTerm));
}

/**
 * @xxx 를 실제 변수 값으로 치환한 텍스트와 새 커서 위치 반환
 */
export function replaceAtMention(
  text: string,
  cursorPos: number,
  varValue: string,
  atPosition: number,
): { newText: string; newCursorPos: number } {
  const textBeforeCursor = text.slice(0, cursorPos);
  const textAfterCursor = text.slice(cursorPos);
  const newText = textBeforeCursor.replace(/@\w*$/, varValue) + textAfterCursor;
  const newCursorPos = atPosition + varValue.length;

  return { newText, newCursorPos };
}
