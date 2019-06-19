
export const func = fn => typeof fn == 'function';
export const iterator = fn => func(fn.next);
export const promise = p => p && func(p.then);
export const channel = ch => func(ch.take) && func(ch.put)
export const array = Array.isArray;
export const string = s => typeof s === 'string';
export const pattern = pat => typeof pat === 'string' || func(pat) || (array(pat) && pat.every(pattern))