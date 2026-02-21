import { getAutoCompleteStyle } from '../lib/input-style';
import { useColors } from '@/shared/theme';
import { FuturAutocompleteSelect } from '@/shared/ui/select';

// 자주 사용되는 HTTP 헤더 목록
const COMMON_HEADERS = [
  {
    name: 'Content-Type',
    values: [
      'application/json',
      'application/xml',
      'text/plain',
      'text/html',
      'multipart/form-data',
      'application/x-www-form-urlencoded',
    ],
  },
  {
    name: 'Accept',
    values: ['application/json', 'application/xml', 'text/plain', 'text/html', '*/*'],
  },
  { name: 'Authorization', values: ['Bearer ', 'Basic '] },
  { name: 'Cache-Control', values: ['no-cache', 'no-store', 'max-age=0', 'private', 'public'] },
  { name: 'Accept-Language', values: ['en-US', 'ko-KR', 'ja-JP', '*'] },
  { name: 'Accept-Encoding', values: ['gzip', 'deflate', 'br', 'identity'] },
  { name: 'User-Agent', values: [] },
  { name: 'Origin', values: [] },
  { name: 'Referer', values: [] },
  { name: 'X-Requested-With', values: ['XMLHttpRequest'] },
  { name: 'X-API-Key', values: [] },
  { name: 'X-Correlation-ID', values: [] },
  { name: 'X-Request-ID', values: [] },
];

// Get header name options (Content-Type is managed as read-only)
const HEADER_NAME_OPTIONS = COMMON_HEADERS.filter((h) => h.name !== 'Content-Type').map((h) => ({
  label: h.name,
  value: h.name,
}));

// Get header value options for a specific header
function getHeaderValueOptions(headerName: string) {
  const header = COMMON_HEADERS.find((h) => h.name.toLowerCase() === headerName?.toLowerCase());
  if (!header || header.values.length === 0) return [];
  return header.values.map((v) => ({ label: v, value: v }));
}

export function HeaderAutocompleteInput({
  value,
  onChange,
  placeholder,
  style,
  type,
  headerName,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  type: 'name' | 'value';
  headerName?: string;
}) {
  const colors = useColors();
  const autocompleteStyle = getAutoCompleteStyle(colors);
  const options = type === 'name' ? HEADER_NAME_OPTIONS : getHeaderValueOptions(headerName || '');

  return (
    <FuturAutocompleteSelect
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        ...autocompleteStyle,
        ...style,
      }}
      allowCustomValue={true}
    />
  );
}
