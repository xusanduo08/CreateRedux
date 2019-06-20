import * as is from './utils/is';

function matcher(pattern = '*') {
  const createMatcher = (pattern === '*' ? () => () => true :
    is.func(pattern) ? pattern => input => pattern(input) :
      is.array(pattern) ? pattern => input => pattern.indexOf(input) >= 0 :
        is.string(pattern) ? pattern => (input) => input === pattern : null);

  return createMatcher(pattern); // 返回一个函数，该函数所处作用域拥有pattern（其实就是通过闭包保存着变量）
}

export default matcher;