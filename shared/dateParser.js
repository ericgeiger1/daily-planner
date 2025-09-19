// Shared date parsers for consistent validation across the application
const { parseISO, isValid, format, parse } = require('date-fns');
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');

/**
 * Accepted date formats for the daily planner system
 */
const DATE_FORMATS = {
  ISO: 'yyyy-MM-dd',          // 2025-09-14
  ISO_DATETIME: 'yyyy-MM-dd HH:mm:ss',  // 2025-09-14 14:30:00
  US: 'MM/dd/yyyy',           // 09/14/2025
  EU: 'dd/MM/yyyy',           // 14/09/2025
  SHORT: 'MM/dd/yy',          // 09/14/25
  NATURAL: 'MMMM d, yyyy'     // September 14, 2025
};

/**
 * Parse a date string in various formats to a timezone-agnostic Date object
 * @param {string} dateString - The date string to parse
 * @param {string} timezone - Target timezone (default: UTC for consistency)
 * @returns {Object} - { success: boolean, date: Date|null, error: string|null, format: string|null }
 */
function parseDate(dateString, timezone = 'UTC') {
  if (!dateString || typeof dateString !== 'string') {
    return { success: false, date: null, error: 'Date string is required', format: null };
  }

  const trimmed = dateString.trim();
  
  // Try ISO format first (most reliable)
  try {
    const isoDate = parseISO(trimmed);
    if (isValid(isoDate)) {
      // Convert to UTC to make it timezone-agnostic
      const utcDate = zonedTimeToUtc(isoDate, timezone);
      return { success: true, date: utcDate, error: null, format: 'ISO' };
    }
  } catch (e) {
    // Continue to try other formats
  }

  // Try other formats
  const formatAttempts = [
    { format: DATE_FORMATS.ISO_DATETIME, key: 'ISO_DATETIME' },
    { format: DATE_FORMATS.US, key: 'US' },
    { format: DATE_FORMATS.EU, key: 'EU' },
    { format: DATE_FORMATS.SHORT, key: 'SHORT' },
    { format: DATE_FORMATS.NATURAL, key: 'NATURAL' }
  ];

  for (const attempt of formatAttempts) {
    try {
      const parsedDate = parse(trimmed, attempt.format, new Date());
      if (isValid(parsedDate)) {
        // Convert to UTC for consistency
        const utcDate = zonedTimeToUtc(parsedDate, timezone);
        return { success: true, date: utcDate, error: null, format: attempt.key };
      }
    } catch (e) {
      // Continue to next format
    }
  }

  return { 
    success: false, 
    date: null, 
    error: `Invalid date format. Accepted formats: ${Object.values(DATE_FORMATS).join(', ')}`,
    format: null
  };
}

/**
 * Parse a month string (YYYY-MM or similar formats)
 * @param {string} monthString - The month string to parse
 * @param {string} timezone - Target timezone (default: UTC)
 * @returns {Object} - { success: boolean, date: Date|null, error: string|null, format: string|null }
 */
function parseMonth(monthString, timezone = 'UTC') {
  if (!monthString || typeof monthString !== 'string') {
    return { success: false, date: null, error: 'Month string is required', format: null };
  }

  const trimmed = monthString.trim();
  
  // Try YYYY-MM format first
  const yearMonthRegex = /^(\d{4})-(\d{1,2})$/;
  const match = trimmed.match(yearMonthRegex);
  
  if (match) {
    const year = parseInt(match[1]);
    const month = parseInt(match[2]);
    
    if (month >= 1 && month <= 12) {
      // Create date for first day of the month
      const date = new Date(year, month - 1, 1);
      if (isValid(date)) {
        const utcDate = zonedTimeToUtc(date, timezone);
        return { success: true, date: utcDate, error: null, format: 'YYYY-MM' };
      }
    }
  }

  // Try parsing as a regular date and extract month
  const dateResult = parseDate(monthString, timezone);
  if (dateResult.success) {
    // Set to first day of the month
    const date = dateResult.date;
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const utcDate = zonedTimeToUtc(monthStart, timezone);
    return { success: true, date: utcDate, error: null, format: dateResult.format };
  }

  return {
    success: false,
    date: null,
    error: 'Invalid month format. Use YYYY-MM (e.g., 2025-09) or any valid date format',
    format: null
  };
}

/**
 * Format a Date object to a specific format
 * @param {Date} date - The date to format
 * @param {string} formatKey - Key from DATE_FORMATS
 * @param {string} timezone - Target timezone for display
 * @returns {string} - Formatted date string
 */
function formatDate(date, formatKey = 'ISO', timezone = 'UTC') {
  if (!isValid(date)) {
    throw new Error('Invalid date provided');
  }

  const targetFormat = DATE_FORMATS[formatKey] || DATE_FORMATS.ISO;
  
  // Convert from UTC to target timezone for display
  const zonedDate = utcToZonedTime(date, timezone);
  return format(zonedDate, targetFormat);
}

/**
 * Validate date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} - { valid: boolean, error: string|null }
 */
function validateDateRange(startDate, endDate) {
  if (!isValid(startDate) || !isValid(endDate)) {
    return { valid: false, error: 'Both start and end dates must be valid' };
  }

  if (startDate > endDate) {
    return { valid: false, error: 'Start date cannot be after end date' };
  }

  return { valid: true, error: null };
}

module.exports = {
  parseDate,
  parseMonth,
  formatDate,
  validateDateRange,
  DATE_FORMATS
};