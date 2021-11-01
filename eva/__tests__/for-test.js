const assert = require('assert');
const {test} = require('./test-util');

module.exports = eva => {

    test(eva,
        `
          (begin
            (var result 0)
            (for (var i 0) (< i 5) (set i (+ i 1))
              (set result (+ result i)))
            result
          )
        `,
        10);
    test(eva,
      `
        (begin
          (var result 0)
          (for (var i 0) (< i 5) (set i (++ i))
            (set result (+ result i)))
          result
        )
      `,
      10);
    test(eva,
      `
        (begin
          (var result 0)
          (for (var i 10) (> i 0) (set i (-- i))
            (set result (++ result)))
          result
        )
      `,
      10);


 

};
