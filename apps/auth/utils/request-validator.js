const validator = require('validator');

class Checker {
    constructor(body){
        this._counter = 0;
        this._errors = {};
        this._body = body;
    }

    set field (value) {
        this._field = value;
    }

    /**
     * @function addProperty
     * @param {function (...any) => Boolean} func
     * @return {Checker}
     */
    static addProperty (func){
        this.prototype[func.name] = function (message, arg) {
            if (!this._body[this._field]){
                ++ this._counter;
                this._errors[this._field] = [{exists : `You must fill the ${this._field} field`}];

                return this;
            }

            let v = func(this._body[this._field], arg);

            if (!v){
                if (!this._errors[this._field]) this._errors[this._field] = [{[func.name] : message}];
                else this._errors[this._field].push({ [func.name]: message });

                ++ this._counter;
            }

            return this;
        }
    }

    addError (key, message, field) {
        if (this._errors[field]) this._errors[field].push({ [key]: message });
        else this._errors[field] = [{ [key]: message }]
        ++this._counter;
    }

    errors () {
        if (this._counter > 0){
            return this._errors;
        }
        else return null;
    }
}

for (let p in validator){
    let f = validator[p];
    if (typeof f === 'function' && p.match(/^is|equals|contains|matches/)){
        Checker.addProperty(f);
    }
}

module.exports = function (req, _res, next) {
    let checker = new Checker(req.body);

    /**
     * @function req.check
     * @param fiels
     * @return {Checker}
     */
    req.check = function (field) {
        checker.field = field;

        return checker;
    }

    Object.defineProperty(req, 'errors', {
        get: () => checker.errors()
    });

    req.addError = (key, msg, f='globals') => checker.addError(key, msg, f);

    next();
}
