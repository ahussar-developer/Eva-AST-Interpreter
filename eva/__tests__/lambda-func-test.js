const assert = require('assert');
const {test} = require('./test-util');

module.exports = eva => {

    test(eva, 
    `
        (begin
            (def onClick (callback)
                (begin
                    (var x 10)
                    (var y 20)
                    (callback (+ x y))))

            (onClick (lambda (data) (* data 10)))    
        )
    `,
    300);

    //immediately-invoked lambda expression (IILE)
    test(eva,
    `
        ((lambda (x) (* x x)) 2)
    `,
    4);

    //save lambda to var
    test(eva,
    `
        (begin
            (var sqr (lambda (x) (* x x)))
            (sqr 2))
    `,
    4);


 

};
