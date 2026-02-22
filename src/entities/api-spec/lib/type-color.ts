export function getTypeColor(type?: string, isDark = true): string {
  if (isDark) {
    switch (type) {
      case 'string':
        return '#34d399';
      case 'number':
      case 'integer':
        return '#22d3ee';
      case 'boolean':
        return '#fbbf24';
      case 'array':
        return '#facc15';
      case 'object':
        return '#f472b6';
      default:
        return '#9ca3af';
    }
  }
  switch (type) {
    case 'string':
      return '#059669';
    case 'number':
    case 'integer':
      return '#1d4ed8';
    case 'boolean':
      return '#c2410c';
    case 'array':
      return '#a16207';
    case 'object':
      return '#a21caf';
    default:
      return '#6b7280';
  }
}
