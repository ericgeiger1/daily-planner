// Date validation utilities for React Native
import { parseDate, parseMonth, formatDate, validateDateRange, DATE_FORMATS } from '../../shared/dateParser';

/**
 * Validate date input in React Native components
 * @param {string} input - The date input string
 * @param {string} timezone - Target timezone
 * @returns {Object} - Validation result with formatted output
 */
export function validateDateInput(input, timezone = 'UTC') {
  if (!input || input.trim() === '') {
    return {
      isValid: false,
      error: 'Date is required',
      formatted: null
    };
  }

  const result = parseDate(input.trim(), timezone);
  
  if (result.success) {
    return {
      isValid: true,
      error: null,
      formatted: {
        iso: formatDate(result.date, 'ISO', timezone),
        display: formatDate(result.date, 'NATURAL', timezone),
        us: formatDate(result.date, 'US', timezone),
        eu: formatDate(result.date, 'EU', timezone)
      },
      parsedDate: result.date,
      detectedFormat: result.format
    };
  } else {
    return {
      isValid: false,
      error: result.error,
      formatted: null,
      supportedFormats: Object.values(DATE_FORMATS)
    };
  }
}

/**
 * Validate month input in React Native components
 * @param {string} input - The month input string
 * @param {string} timezone - Target timezone
 * @returns {Object} - Validation result with formatted output
 */
export function validateMonthInput(input, timezone = 'UTC') {
  if (!input || input.trim() === '') {
    return {
      isValid: false,
      error: 'Month is required',
      formatted: null
    };
  }

  const result = parseMonth(input.trim(), timezone);
  
  if (result.success) {
    return {
      isValid: true,
      error: null,
      formatted: {
        yearMonth: `${result.date.getFullYear()}-${String(result.date.getMonth() + 1).padStart(2, '0')}`,
        display: formatDate(result.date, 'NATURAL', timezone).split(' ')[0] + ' ' + result.date.getFullYear()
      },
      parsedDate: result.date,
      detectedFormat: result.format,
      monthInfo: {
        year: result.date.getFullYear(),
        month: result.date.getMonth() + 1,
        monthName: formatDate(result.date, 'NATURAL', timezone).split(' ')[0]
      }
    };
  } else {
    return {
      isValid: false,
      error: result.error,
      formatted: null
    };
  }
}

/**
 * Get example date formats for user guidance
 * @returns {Object} - Object with format examples
 */
export function getDateFormatExamples() {
  const today = new Date();
  return {
    ISO: formatDate(today, 'ISO'),
    US: formatDate(today, 'US'),
    EU: formatDate(today, 'EU'),
    NATURAL: formatDate(today, 'NATURAL'),
    SHORT: formatDate(today, 'SHORT')
  };
}

/**
 * Debounce function for input validation
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}