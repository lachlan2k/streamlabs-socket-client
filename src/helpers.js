export const removeCommas = str => typeof str == 'string' ? Number(str.replace(/,/g, '')) : str;

export const removeNonNumeric = str => typeof str == 'string' ? Number(str.replace(/[^0-9.]/g, '')) : str;
