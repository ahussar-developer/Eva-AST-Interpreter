const Enviornment = require('./Enviornment');
const Transformer = require('./transform/Transformer')
const evaParser = require('./parser/evaParser');

const fs = require('fs');
/**
 * Eva Interpreter
 */

class Eva {
    /**
     * Creates an Eva instances with the global enviornment
     */
    constructor(global = GlobalEnviornment){
        this.global = global;
        this._transformer = new Transformer();
    }

    /**
     * 
     * Evaluates global code wrapping into a block
     */
    evalGlobal(exp){
        return this._evalBody(exp,this.global)
    }

    /**
     * Evaluates an expression in the given enviornment
     */
    eval(exp, env = this.global) {
        if(this._isNumber(exp)) {
            return exp;
        }
        if(this._isString(exp) ){
            return exp.slice(1,-1);
        }      
        //block: sequence of expressions
        if(exp[0] === 'begin'){
            const blockEnv = new Enviornment({}, env);
            return this._evalBlock(exp, blockEnv);
        }
        //varaible declaration: (var x 10)
        if ( exp[0] === 'var'){
            const [_, name, value] = exp;
            return env.define(name, this.eval(value, env));
        }
        //varaible update (set x 20)
        if ( exp[0] === 'set'){
            const [_, ref, value] = exp;

            if (ref[0] === 'prop'){
                const [_tag, instance, propName] = ref;
                const instanceEnv = this.eval(instance, env);
                return instanceEnv.define(
                    propName,
                    this.eval(value, env),
                );
            }

            return env.assign(ref, this.eval(value, env));
        }
        //varaible access
        if ( this._isVariableName(exp)){
            return env.lookup(exp);
        }
        //if-expression
        if ( exp[0] === 'if'){
            const [_tag, condition, consequent, alternate] = exp;
            if (this.eval(condition, env)){
                return this.eval(consequent, env);
            } else {
                return this.eval(alternate, env);
            }
        }
        //while-expression
        if ( exp[0] === 'while'){
            const [_tag, condition, body] = exp;
            let result;
            while (this.eval(condition, env)){
                result = this.eval(body, env);
            } 
            return result;
        }
        //function declaration: (def name (args) (exp))
        //syntactic sugar for: (var sqr (lambda (x) (* x x)))
        if (exp[0] === 'def'){
            const [_tag, name, params, body] = exp;
            
            //JIT-transpile to var declaration
            const varExp = this._transformer.transformDeftoVarLambda(exp);
            return this.eval(varExp, env);

        }
        //switch - syntactic sugar for nested if-expressions
        if (exp[0] === 'switch'){
            const ifExp = this._transformer.transformSwitchToIf(exp);
            return this.eval(ifExp, env);
        }
        //for loop
        if (exp[0] === 'for'){
            const whileExp = this._transformer.transformForToWhile(exp);
            return this.eval(whileExp, env);
        }
        //++ => (++ foo)
        if (exp[0] === '++'){
            const setExp = this._transformer.transformIncToSet(exp);
            return this.eval(setExp, env);
        }
        //-- => (-- foo)
        if (exp[0] === '--'){
            const setExp = this._transformer.transformDecToSet(exp);
            return this.eval(setExp, env);
        }

        //lambad functions - anonymous functions with no name that dont get installed into the env
        if(exp[0] === 'lambda'){
            const [_tag, params, body] = exp;
            return{
                params,
                body,
                env, //Closure! Pull entire enviornment where func is defined
            };
        }

        //Class declaration: (class <Name> <Parent> <Body>)
        if ( exp[0] === 'class'){
            const [_tag, name, parent, body] = exp;

            //Class is simply an ennviornment -- storage methods & shared properties

            const parentEnv = this.eval(parent, env) || env;
            const classEnv = new Enviornment({}, parentEnv);

            //body evaluated in class env
            this._evalBody(body, classEnv);

            //access class by name
            return env.define(name, classEnv);
        }

        //class instantiation: (new <Class> <Arguments>...)
        if (exp[0] === 'new'){

            const classEnv = this.eval(exp[1], env);

            //An instance of a class is an enviornment
            //parent component of istance env is set to its class
            const instanceEnv = new Enviornment({}, classEnv);

            const args = exp.slice(2).map(arg => this.eval(arg,env));

            this._callUserDefinedFunction(
                classEnv.lookup('constructor'),
                [instanceEnv, ...args],
            );

            return instanceEnv;

        }

        if (exp[0] === 'prop') {
            const [_tag, instance, name] = exp;

            const instanceEnv = this.eval(instance, env);

            return instanceEnv.lookup(name);
        }

        if( exp[0] === 'super'){
            const [_tag, className] = exp;
            return this.eval(className, env).parent;
        }

        if( exp[0] === 'module'){
            const [_tag, name, body] = exp;

            const moduleEnv = new Enviornment({}, env);

            this._evalBody(body, moduleEnv);

            return env.define(name, moduleEnv);
        }
        if( exp[0] === 'import'){
            //TODO: check if module is already loaded,
            //if so, return right away

            //TODO: Support imports of a specific funcs/vars
            //from a module -> (import (abs square) Math)

            //TODO: Support Exports from Module Enviornment
            const [_tag, name] = exp;

            const moduleSrc = fs.readFileSync(
                `${__dirname}/modules/${name}.eva`,
                'utf-8'
            );

            const body = evaParser.parse(`(begin ${moduleSrc})`);

            const moduleExpression = ['module', name, body];

            return this.eval(moduleExpression, this.global);
        }

        //Function calls
        if( Array.isArray(exp)){
            const fn = this.eval(exp[0],env);
            const args = exp
            .slice(1)
            .map(arg => this.eval(arg,env));

            //1. Native function
            if (typeof fn === 'function'){
                return fn(...args);
            }
            //2. User-defined funcitons
            return this._callUserDefinedFunction(fn,args);
        }
        

        throw `Unimplemented: ${JSON.stringify(exp)}`;
    }

    _callUserDefinedFunction(fn, args){
        const activationRecord = {};

        fn.params.forEach((param, index) => {
            activationRecord[param] = args[index];
        });
        const activationEnv = new Enviornment(
            activationRecord,
            fn.env //static scope
        );

        return this._evalBody(fn.body, activationEnv);
    }

    _evalBody(body, env){
        if (body[0] === 'begin'){
            return this._evalBlock(body, env);
        }
        return this.eval(body, env);
    }

    _evalBlock(block, env){
        let result;

        const [_tag, ...expressions] = block;
        expressions.forEach(exp => {
            result = this.eval(exp, env);
        });

        return result;
    }
    _isNumber(exp){
        return typeof exp === 'number';
    }
    
    _isString(exp){
        return typeof exp === 'string' && exp[0] === '"' && exp.slice(-1) === '"';
    }
    
    _isVariableName(exp){
        return typeof exp === 'string' && /^[+\-*/<>=a-zA-Z0-9_]+$/.test(exp);
    }
}

/**
 * Default Global Enviornment
 */
const GlobalEnviornment = new Enviornment ({
    null: null,

    true: true,
    false: false,

    VERSION: '0.1',

    //math
    '+'(op1,op2){
        return op1 + op2;
    },
    '*'(op1,op2){
        return op1 * op2;
    },
    '-'(op1,op2 = null){
        if ( op2 == null){
            return -op1;
        }
        return op1 - op2;
    },
    '/'(op1,op2){
        return op1 / op2;
    },
    //comparison
    '>'(op1,op2){
        return op1 > op2;
    },
    '<'(op1,op2){
        return op1 < op2;
    },

    '>='(op1, op2) {
        return op1 >= op2;
      },    

    '<='(op1,op2){
        return op1 <= op2;
    },
    
    '='(op1,op2){
        return op1 === op2;
    },
    //print
    print(...args){
        console.log(...args);
    },
});

module.exports = Eva;