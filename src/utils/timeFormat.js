/**
 * Indian Standard Time (IST, UTC+5:30) Formatting Utilities
 * Enforces clean 12-hour AM/PM formatting with unambiguous IST designation.
 */

export const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Format a Date or date string to 12-hour IST time with AM/PM
 * Example output: "07:35:13 PM IST" (or "07:35 PM IST" if includeSeconds is false)
 */
export function formatISTTime(dateOrStr, includeSeconds = true) {
  if (!dateOrStr) return '--';
  const d = new Date(dateOrStr);
  if (isNaN(d.getTime())) return String(dateOrStr);

  const options = {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  if (includeSeconds) {
    options.second = '2-digit';
  }

  try {
    const formatted = d.toLocaleTimeString('en-US', options);
    return `${formatted} IST`;
  } catch (e) {
    return `${d.toLocaleTimeString()} IST`;
  }
}

/**
 * Format a Date or date string to full IST Date & Time with AM/PM
 * Example output: "23 Sep 2026, 07:35:13 PM IST"
 */
export function formatISTDateTime(dateOrStr, includeSeconds = true) {
  if (!dateOrStr) return '--';
  const d = new Date(dateOrStr);
  if (isNaN(d.getTime())) return String(dateOrStr);

  const dateOptions = {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  };

  const timeOptions = {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  if (includeSeconds) {
    timeOptions.second = '2-digit';
  }

  try {
    const datePart = d.toLocaleDateString('en-US', dateOptions);
    const timePart = d.toLocaleTimeString('en-US', timeOptions);
    return `${datePart}, ${timePart} IST`;
  } catch (e) {
    return `${d.toLocaleString()} IST`;
  }
}

/**
 * Format a Date or date string to short IST Date
 * Example output: "23 Sep 2026"
 */
export function formatISTDate(dateOrStr) {
  if (!dateOrStr) return '--';
  const d = new Date(dateOrStr);
  if (isNaN(d.getTime())) return String(dateOrStr);

  const dateOptions = {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  };

  try {
    return d.toLocaleDateString('en-US', dateOptions);
  } catch (e) {
    return d.toLocaleDateString();
  }
}

/**
 * Get current system time formatted as full IST Date and Time
 */
export function getNowISTDateTime(includeSeconds = true) {
  return formatISTDateTime(new Date(), includeSeconds);
}

/**
 * Get current system time formatted as 12-hour IST time
 */
export function getNowISTTime(includeSeconds = true) {
  return formatISTTime(new Date(), includeSeconds);
}
