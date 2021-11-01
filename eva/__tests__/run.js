const Eva = require('../Eva');
const Enviornment = require('../Enviornment');

const tests = [

    require('./self-eval-test.js'),
    require('./math-test.js'),
    require('./variables-test.js'),
    require('./block-test.js'),
    require('./if-test.js'),
    require('./while-test.js'),
    require('./built-in-func-test.js'),
    require('./user-defined-test.js'),
    require('./lambda-func-test.js'),
    require('./switch-test.js'),
    require('./inc-test.js'),
    require('./dec-test.js'),
    require('./for-test.js'),
    require('./class-test.js'),
    require('./module-test.js'),
    require('./import-test.js'),
];



const eva = new Eva();

tests.forEach(test => test(eva))

//eva.eval(['print', '"Hello,"', '"World!"']);

console.log('All assertions passed!');
