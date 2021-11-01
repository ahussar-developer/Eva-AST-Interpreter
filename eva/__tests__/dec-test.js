const assert = require('assert');
const {test} = require('./test-util');

module.exports = eva => {

    test(eva, 
    `
        (begin
            (var x 10)
            (-- x)
        )
    `,
    9);


 

};
