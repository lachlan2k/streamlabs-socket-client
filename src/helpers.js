export const removeCommas = str => str.toString().replace(/,/g, '');

export const removeNonNumeric = str => str.toString().replace(/[^0-9.]/g, '');
