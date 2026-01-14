export {
  isNullOrUndefined,
  getYears,
  sleep,
  logOnDev,
  convertToRGBA,
  detectDeviceTypeAndOS,
  scrollToTop,
  scrollToTopNoneSmooth,
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
  handleTextSelectionClear,
  devConsole,
  debounce,
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
