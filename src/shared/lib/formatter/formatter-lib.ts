import { format, parse, setHours, setMinutes } from 'date-fns';

export function formatPhoneNumber(phoneNumber: string | number) {
  if (!phoneNumber) return '';

  const cleaned = ('' + phoneNumber).replace(/\D/g, '');

  let match;

  if (cleaned.length === 11) {
    match = RegExp(/^(\d{3})(\d{4})(\d{4})$/).exec(cleaned);
  } else if (cleaned.length === 10) {
    match = RegExp(/^(\d{3})(\d{3})(\d{4})$/).exec(cleaned);
  }

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  return String(phoneNumber); // string으로 변환
}

export function thousandSeparator(
  number?: string | number,
  options: {
    allowNegative?: boolean;
    allowDecimal?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {},
) {
  const {
    allowNegative = false,
    allowDecimal = true,
    minimumFractionDigits,
    maximumFractionDigits,
  } = options;

  if (!number && number !== 0) return '0';

  const stringValue = number.toString().replaceAll(',', '');

  // 소숫점 허용하지 않으면 소숫점 제거
  const cleanedValue = allowDecimal ? stringValue : stringValue.replace(/\./g, '');

  // 소숫점으로 끝나는 경우 (입력 중) 보존
  const endsWithDot = allowDecimal && cleanedValue.endsWith('.');

  // 소숫점 뒤 0으로 끝나는 경우 (예: "1.50", "1.00") 보존
  const decimalMatch = allowDecimal ? cleanedValue.match(/\.(\d*)$/) : null;
  const trailingDecimal = decimalMatch ? decimalMatch[1] : '';

  const numericValue = Number(cleanedValue);

  if (Number.isNaN(numericValue)) {
    return '';
  }

  if (!allowNegative && numericValue < 0) {
    return '0';
  }

  // 소숫점으로 끝나면 정수 포맷 후 . 붙이기
  if (endsWithDot) {
    return numericValue.toLocaleString('ko-KR') + '.';
  }

  // 소숫점 이하 자릿수가 있으면 그 자릿수 유지
  if (trailingDecimal !== '') {
    const maxFraction = maximumFractionDigits ?? trailingDecimal.length;
    const minFraction = Math.min(minimumFractionDigits ?? trailingDecimal.length, maxFraction);

    return numericValue.toLocaleString('ko-KR', {
      minimumFractionDigits: minFraction,
      maximumFractionDigits: maxFraction,
    });
  }

  return numericValue.toLocaleString('ko-KR', {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

export function formatDateString(date: string | number, formatter: string = '.') {
  if (!date || !formatter) {
    return '';
  }

  const cleaned = ('' + date).replace(/\D/g, '');

  if (cleaned.length === 8) {
    return cleaned.replace(/(\d{4})(\d{2})(\d{2})/, `$1${formatter}$2${formatter}$3`);
  } else if (cleaned.length === 6) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})/, `$1${formatter}$2${formatter}$3`);
  } else {
    return '' + date;
  }
}

export function formatBusinessNumberWithRegex(input: string | number) {
  const cleanInput = ('' + input).replace(/\D/g, '').substring(0, 10);

  return cleanInput.replace(/^(\d{0,3})(\d{0,2})(\d{0,5})/, function (_match, p1, p2, p3) {
    return `${p1}${p2 ? '-' + p2 : ''}${p3 ? '-' + p3 : ''}`;
  });
}

export function formatKrDate(date: string | number) {
  const match = ('' + date).match(/^(\d{4})(\d{2})(\d{2})$/);

  if (!match) {
    return '';
  }

  const year = match[1];
  const month = match[2];
  const day = match[3];

  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 문자열로 받은 날짜에 대해 지정된 시간으로 변경하는 함수.
 *
 * @param date
 * @param targetHour 목표 시간 (0 ~ 23 사이의 값).
 * @param targetMinute 목표 분 (0 ~ 59 사이의 값).
 * @returns 변경된 날짜와 시간의 문자열 ('yyyyMMddHHmm' 형식).
 */
export function convertToSpecificTime(
  date: string | number,
  targetHour: number,
  targetMinute: number,
): string {
  const dateString = parse('' + date, 'yyyyMMddHHmm', new Date());

  const dateWithHourSet = setHours(dateString, targetHour);
  const finalDate = setMinutes(dateWithHourSet, targetMinute);

  return format(finalDate, 'yyyyMMddHHmm');
}

export function applyMiddleEllipsis(
  text: string,
  maxLength: number,
  frontLength: number,
  backLength: number,
) {
  if (text.length <= maxLength) {
    return text;
  }

  const startPart = text.substring(0, frontLength);
  const endPart = text.substring(text.length - backLength, text.length);

  return `${startPart}...${endPart}`;
}

export function formatAgriculturalBusinessCheckNumber(input: string) {
  const cleanInput = input.replace(/\D/g, '').substring(0, 13);

  return cleanInput.replace(/^(\d{1,6})(\d{1,7})$/, function (_match, p1, p2) {
    return `${p1}-${p2}`;
  });
}

export function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

export function deepCamelize<T>(input: any): T {
  if (Array.isArray(input)) {
    return input.map((item) => deepCamelize(item)) as any;
  }

  if (input !== null && typeof input === 'object') {
    const result: Record<string, any> = {};
    for (const key of Object.keys(input)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = deepCamelize(input[key]);
    }
    return result as T;
  }

  return input;
}

export function deepCamelToSnake<T>(input: any): T {
  if (Array.isArray(input)) {
    return input.map((item) => deepCamelToSnake(item)) as any;
  }

  if (input !== null && typeof input === 'object') {
    const result: Record<string, any> = {};
    for (const key of Object.keys(input)) {
      // Camel → snake: fooBarBaz → foo_bar_baz
      const snakeKey = key
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2') // 소문자/숫자 + 대문자 사이에 _
        .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2') // 연속된 대문자 처리
        .toLowerCase();

      result[snakeKey] = deepCamelToSnake(input[key]);
    }
    return result as T;
  }

  return input;
}

export function measureTextWidth(text: string, font: string): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 0;
  context.font = font;
  return context.measureText(text).width;
}