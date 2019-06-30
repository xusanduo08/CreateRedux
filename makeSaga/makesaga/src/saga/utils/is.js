
export const func = fn => typeof fn == 'function';
export const iterator = fn => fn && func(fn.next);
export const promise = p => p && func(p.then);
export const channel = ch => ch && func(ch.take) && func(ch.put)
export const array = Array.isArray;
export const string = s => typeof s === 'string';
export const pattern = pat =>  pat && typeof pat === 'string' || func(pat) || (array(pat) && pat.every(pattern));
export const undef = arg => arg === null || arg === undefined;