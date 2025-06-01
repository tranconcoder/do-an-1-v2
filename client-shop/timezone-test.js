// Simple test for timezone conversion
const {
    convertDatetimeLocalToISO,
    convertDatetimeLocalToUTCDirect,
    convertISOToDatetimeLocal,
    convertISOToDatetimeLocalDirect,
    getCurrentDatetimeUTC,
    getCurrentDatetimeLocal,
    debugTimezone
} = require('./src/utils/datetime.js');

console.log('=== Testing Timezone Conversion vs Direct UTC ===');

// Test case: User inputs 13:00
const localInput = '2024-01-15T13:00';

// Method 1: Convert with timezone (UTC+7 13:00 -> UTC 06:00)
const utcOutputWithTimezone = convertDatetimeLocalToISO(localInput);

// Method 2: Direct UTC (treat 13:00 as UTC 13:00)
const utcOutputDirect = convertDatetimeLocalToUTCDirect(localInput);

console.log('Local input:', localInput);
console.log('Method 1 - With timezone conversion (UTC+7 -> UTC):', utcOutputWithTimezone);
console.log('Method 2 - Direct UTC (no conversion):', utcOutputDirect);

console.log('\n=== Reverse Conversion Test ===');

// Test reverse conversion
const serverResponseUTC6 = '2024-01-15T06:00:00.000Z';
const serverResponseUTC13 = '2024-01-15T13:00:00.000Z';

const localDisplay1 = convertISOToDatetimeLocal(serverResponseUTC6);
const localDisplay2 = convertISOToDatetimeLocal(serverResponseUTC13);
const directDisplay1 = convertISOToDatetimeLocalDirect(serverResponseUTC6);
const directDisplay2 = convertISOToDatetimeLocalDirect(serverResponseUTC13);

console.log('Server UTC 06:00 -> Local with timezone:', localDisplay1);
console.log('Server UTC 06:00 -> Direct display:', directDisplay1);
console.log('Server UTC 13:00 -> Local with timezone:', localDisplay2);
console.log('Server UTC 13:00 -> Direct display:', directDisplay2);

console.log('\n=== Current Time Comparison ===');
const currentLocal = getCurrentDatetimeLocal();
const currentUTC = getCurrentDatetimeUTC();

console.log('Current local time:', currentLocal);
console.log('Current UTC time:', currentUTC);

console.log('\n=== Detailed Debug ===');
debugTimezone(localInput);

console.log('\n=== Recommendation ===');
console.log('- Use convertDatetimeLocalToISO() if you want timezone conversion (local -> UTC)');
console.log('- Use convertDatetimeLocalToUTCDirect() if you want to treat input as UTC directly');
console.log('- Use convertISOToDatetimeLocal() if you want to display UTC time in local timezone');
console.log('- Use convertISOToDatetimeLocalDirect() if you want to display UTC time as-is');
