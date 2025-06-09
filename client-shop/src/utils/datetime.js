/**
 * Converts datetime-local input value to UTC+0 ISO string for API
 * @param {string} datetimeLocalValue - Value from datetime-local input (YYYY-MM-DDTHH:mm)
 * @returns {string|null} ISO string in UTC+0 timezone or null if invalid
 */
export const convertDatetimeLocalToISO = (datetimeLocalValue) => {
    if (!datetimeLocalValue) return null;

    try {
        // datetime-local gives us "YYYY-MM-DDTHH:mm" format
        // Browser interprets this as local timezone
        const localDate = new Date(datetimeLocalValue);

        // Check if date is valid
        if (isNaN(localDate.getTime())) {
            return null;
        }

        // Convert to UTC+0 and return ISO string
        // toISOString() automatically converts to UTC+0
        console.log(localDate.toISOString());
        return localDate.toISOString();
    } catch (error) {
        console.error('Error converting datetime to UTC ISO:', error);
        return null;
    }
};

/**
 * Converts datetime-local input value directly to UTC+0 ISO string (no timezone conversion)
 * Treats the input as if it's already in UTC+0 timezone
 * @param {string} datetimeLocalValue - Value from datetime-local input (YYYY-MM-DDTHH:mm)
 * @returns {string|null} ISO string treating input as UTC+0 or null if invalid
 */
export const convertDatetimeLocalToUTCDirect = (datetimeLocalValue) => {
    if (!datetimeLocalValue) return null;

    try {
        // Parse the datetime-local value as if it's in UTC+0
        // Add 'Z' to force UTC interpretation or use Date.UTC
        const [datePart, timePart] = datetimeLocalValue.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes] = timePart.split(':').map(Number);

        // Create UTC date directly
        const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));

        // Check if date is valid
        if (isNaN(utcDate.getTime())) {
            return null;
        }

        return utcDate.toISOString();
    } catch (error) {
        console.error('Error converting datetime to UTC direct:', error);
        return null;
    }
};

/**
 * Gets current datetime in UTC+0 timezone formatted for datetime-local input
 * @returns {string} Current UTC datetime in YYYY-MM-DDTHH:mm format
 */
export const getCurrentDatetimeUTC = () => {
    const now = new Date();

    // Get UTC components
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Converts UTC+0 ISO string from API to datetime-local input format (local timezone)
 * @param {string} isoString - ISO datetime string from API (UTC+0)
 * @returns {string} datetime-local format (YYYY-MM-DDTHH:mm) in local timezone
 */
export const convertISOToDatetimeLocal = (isoString) => {
    if (!isoString) return '';

    try {
        // Parse UTC+0 ISO string
        const utcDate = new Date(isoString);

        // Check if date is valid
        if (isNaN(utcDate.getTime())) {
            return '';
        }

        // Convert UTC to local timezone for display
        // JavaScript Date automatically converts to local timezone when we format it
        const year = utcDate.getFullYear();
        const month = String(utcDate.getMonth() + 1).padStart(2, '0');
        const day = String(utcDate.getDate()).padStart(2, '0');
        const hours = String(utcDate.getHours()).padStart(2, '0');
        const minutes = String(utcDate.getMinutes()).padStart(2, '0');

        // Format for datetime-local input (YYYY-MM-DDTHH:mm)
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
        console.error('Error converting UTC ISO to datetime-local:', error);
        return '';
    }
};

/**
 * Converts UTC+0 ISO string to datetime-local format without timezone conversion
 * Treats the ISO string as if it should be displayed as-is (no timezone conversion)
 * @param {string} isoString - ISO datetime string from API (UTC+0)
 * @returns {string} datetime-local format (YYYY-MM-DDTHH:mm) keeping UTC+0 time
 */
export const convertISOToDatetimeLocalDirect = (isoString) => {
    if (!isoString) return '';

    try {
        // Parse UTC+0 ISO string
        const utcDate = new Date(isoString);

        // Check if date is valid
        if (isNaN(utcDate.getTime())) {
            return '';
        }

        // Use UTC components directly (no timezone conversion)
        const year = utcDate.getUTCFullYear();
        const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(utcDate.getUTCDate()).padStart(2, '0');
        const hours = String(utcDate.getUTCHours()).padStart(2, '0');
        const minutes = String(utcDate.getUTCMinutes()).padStart(2, '0');

        // Format for datetime-local input (YYYY-MM-DDTHH:mm)
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
        console.error('Error converting UTC ISO to datetime-local direct:', error);
        return '';
    }
};

/**
 * Converts datetime-local to UTC+0 for validation purposes
 * @param {string} datetimeLocalValue - datetime-local value
 * @returns {Date|null} Date object in UTC+0 or null if invalid
 */
export const convertDatetimeLocalToUTC = (datetimeLocalValue) => {
    if (!datetimeLocalValue) return null;

    try {
        const localDate = new Date(datetimeLocalValue);

        if (isNaN(localDate.getTime())) {
            return null;
        }

        // Return as UTC Date object
        return new Date(localDate.toISOString());
    } catch (error) {
        console.error('Error converting datetime to UTC Date:', error);
        return null;
    }
};

/**
 * Validates if a datetime string is in the future (UTC+0 comparison)
 * @param {string} datetimeValue - datetime value to check
 * @returns {boolean} true if datetime is in the future
 */
export const isDatetimeInFuture = (datetimeValue) => {
    if (!datetimeValue) return false;

    try {
        const inputDate = convertDatetimeLocalToUTC(datetimeValue);
        const nowUTC = new Date(); // Current time in UTC

        return inputDate && inputDate > nowUTC;
    } catch (error) {
        console.error('Error validating future datetime:', error);
        return false;
    }
};

/**
 * Validates if end datetime is after start datetime (UTC+0 comparison)
 * @param {string} startDatetime - start datetime value
 * @param {string} endDatetime - end datetime value
 * @returns {boolean} true if end is after start
 */
export const isEndDatetimeAfterStart = (startDatetime, endDatetime) => {
    if (!startDatetime || !endDatetime) return false;

    try {
        const startUTC = convertDatetimeLocalToUTC(startDatetime);
        const endUTC = convertDatetimeLocalToUTC(endDatetime);

        return startUTC && endUTC && endUTC > startUTC;
    } catch (error) {
        console.error('Error comparing datetime values:', error);
        return false;
    }
};

/**
 * Gets current datetime in local timezone formatted for datetime-local input
 * @returns {string} Current datetime in YYYY-MM-DDTHH:mm format
 */
export const getCurrentDatetimeLocal = () => {
    const now = new Date();
    // Format current local time for datetime-local input
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Debug function to log timezone information
 * @param {string} datetimeValue - datetime value to debug
 */
export const debugTimezone = (datetimeValue) => {
    if (!datetimeValue) return;

    console.group('Timezone Debug for:', datetimeValue);

    const localDate = new Date(datetimeValue);
    const utcISO = convertDatetimeLocalToISO(datetimeValue);
    const utcDirect = convertDatetimeLocalToUTCDirect(datetimeValue);
    const backToLocal = convertISOToDatetimeLocal(utcISO);
    const backToLocalDirect = convertISOToDatetimeLocalDirect(utcDirect);

    console.log('Original input (local):', datetimeValue);
    console.log('Parsed as local Date:', localDate.toString());
    console.log('Local Date UTC string:', localDate.toUTCString());
    console.log('Converted to UTC ISO (with timezone):', utcISO);
    console.log('Converted to UTC ISO (direct):', utcDirect);
    console.log('Back to datetime-local (with timezone):', backToLocal);
    console.log('Back to datetime-local (direct):', backToLocalDirect);
    console.log('Timezone offset (minutes):', localDate.getTimezoneOffset());
    console.log('Local timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Test specific case
    if (datetimeValue === '2024-01-15T13:00') {
        console.log('--- Testing UTC+7 13:00 -> UTC 06:00 ---');
        const testDate = new Date('2024-01-15T13:00');
        console.log('Input as Date object:', testDate.toString());
        console.log('Should be UTC 06:00:', testDate.toISOString());
    }

    console.groupEnd();
};
