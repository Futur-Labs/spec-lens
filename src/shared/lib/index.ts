export {
  sleep,
  logOnDev,
  detectDeviceTypeAndOS,
  generateRandomNumber,
  transformArrayToDictByKey,
  openPhoneApp,
  openSmsApp,
  openKakaoMap,
  openTMap,
  openNaverMap,
  copyToClipboard,
  isLightColor,
  getFormValues,
  deepEqual,
  openPopup,
  throttle,
  getCookie,
  webShare,
  blurElement,
} from './common/common-lib.ts';

export {
  applyMiddleEllipsis,
  convertToSpecificTime,
  formatBusinessNumberWithRegex,
  formatPhoneNumber,
  formatKrDate,
  formatDateString,
  thousandSeparator,
  formatAgriculturalBusinessCheckNumber,
  toPascalCase,
  deepCamelize,
  deepCamelToSnake,
  measureTextWidth,
  formatBytes,
} from './formatter/formatter-lib.ts';

export {
  isAllDigits,
  isValidBusinessNumber,
  isValidHomeNumber,
  isValidPhoneNumber,
  isValidEmail,
} from './validation/validator.ts';

export { createValidator } from './validation/create-validator.ts';
export { createSchema } from './validation/create-schema.ts';

export { smoothScrollTo } from './interaction/scroll.ts';
export { useVirtualSmoothScroll } from './interaction/virtual-smooth-scroll.ts';

export { koreanFuzzyMatch, createKoreanSearchRegex } from './search/korean-search.ts';
export { highlightMatches } from './search/highlight-matches.tsx';

export { formatJson, validateJson, tryFixJson } from './json/json-utils.ts';
export { useJsonValidation } from './json/use-json-validation.ts';

export { indexedDBStorage } from './storage/indexed-db-storage.ts';
