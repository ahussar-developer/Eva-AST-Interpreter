/**
 * Enviornment: names storage
 */
class Enviornment {
    /**
     * 
     * Creates an envionment with a given record
     */
    constructor(record = {}, parent = null) {
        this.record = record;
        this.parent = parent;
    }
    /**
     * Creates a variable with the given name and value
     */
    define(name,value){
        this.record[name] = value;
        return value;
    }
    /**
     * Updates an existing variable
     */
     assign(name,value){
        this.resolve(name).record[name] = value;
        return value;
    }
    /**
     * reutrns the value of a defined variable, or throws
     * if the variable is not defined
     */
    lookup(name) {
        return this.resolve(name).record[name];
    }
    /**
     * reutrns specific enviornment in which a variable is defined, or
     * throw if a variable is not defined
     */
    resolve(name) {
        // deifned in scope already
        if (this.record.hasOwnProperty(name)) {
            return this;
        }
         //in global scope
        if (this.parent == null) {
            throw new ReferenceError(`Variable "${name}" is not defined."`);
        }

        //return variable from parent scope
        return this.parent.resolve(name);
    }
}

module.exports = Enviornment;