import * as is from './utils/is';

function matcher(pattern = '*') {
  const createMatcher = (pattern === '*' ? () => () => true :
    is.func(pattern) ? pattern => input => pattern(input) :
      is.array(pattern) ? pattern => input => pattern.indexOf(input) >= 0 :
        is.string(pattern) ? pattern => (input) => input === pattern : null);

  return createMatcher(pattern);
}

export default matcher;