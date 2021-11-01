/**
 * AST transformer
 */
class Transformer {
    /**
     * Translates `def`-expression into a variable
     * declaration with lambda expression
     */
    transformDeftoVarLambda(defExp){
        const [_tag, name, params, body] = defExp;
        return ['var', name, ['lambda', params, body]];
    }
    transformSwitchToIf(switchExp){
        const [_tag, ...cases] = switchExp;

        const ifExp = ['if', null, null, null];

        let current = ifExp;
        for ( let i = 0; i < cases.length -1; i++){
            const [currentCond, currentBlock] = cases[i];
            current[1] = currentCond;
            current[2] = currentBlock;

            const next = cases[i+1];
            const [nextCond, nextBlock] = next;

            current[3] = nextCond === 'else'
                ? nextBlock
                : ['if'];

                current = current[3];
        }

        return ifExp;
    }

    /**
     * 
     * //while-expression
        if ( exp[0] === 'while'){
            const [_tag, condition, body] = exp;
            let result;
            while (this.eval(condition, env)){
                result = this.eval(body, env);
            } 
            return result;
        }}
     *
     */
        //thinks while is a variable -- why?
    transformForToWhile(forExp){
        const [_tag, init, condition, modifier, exp] = forExp;
        const whileExp = ['begin', init, ['while', condition, ['begin',exp, modifier]]];
        //const whileExp = [init, ['while', condition, [exp, modifier]]];
        return whileExp;
    }

    transformIncToSet(setExp){
        const [_tag, variable] = setExp;
        return ['+', variable, 1]
    }

    transformDecToSet(setExp){
        const [_tag, variable] = setExp;
        return ['-', variable, 1]
    }
    

}

module.exports = Transformer;