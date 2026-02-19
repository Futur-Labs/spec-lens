const TYPE_KEYWORDS = new Set(['string', 'integer', 'number', 'boolean', 'any']);

export function stringifyTyped(value: unknown, indent = 2): string {
  function format(val: unknown, level: number): string {
    const pad = ' '.repeat(level * indent);
    const innerPad = ' '.repeat((level + 1) * indent);

    if (val === null || val === undefined) return 'null';

    if (typeof val === 'string') {
      if (TYPE_KEYWORDS.has(val) || val.startsWith('enum(') || val.startsWith('string(')) {
        return val;
      }
      return JSON.stringify(val);
    }

    if (Array.isArray(val)) {
      if (val.length === 0) return '[]';
      const items = val.map((item) => `${innerPad}${format(item, level + 1)}`);
      return `[\n${items.join(',\n')}\n${pad}]`;
    }

    if (typeof val === 'object') {
      const entries = Object.entries(val);
      if (entries.length === 0) return '{}';
      const items = entries.map(([key, v]) => `${innerPad}"${key}": ${format(v, level + 1)}`);
      return `{\n${items.join(',\n')}\n${pad}}`;
    }

    return String(val);
  }

  return format(value, 0);
}
