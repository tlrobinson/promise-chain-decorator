"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = chain;
/*  weak */

function chain(ResultKlassOrGetter) {
    var ResultKlass = void 0;
    var getResultKlass = function getResultKlass() {
        if (ResultKlass === undefined) {
            try {
                // @chain(() => Klass)
                ResultKlass = ResultKlassOrGetter();
            } catch (e) {
                // @chain(Klass)
                ResultKlass = ResultKlassOrGetter;
            }
            if (!ResultKlass.__pcd_methods__) {
                ResultKlass.__pcd_methods__ = getAllMethodNames(ResultKlass);
            }
        }
        return ResultKlass;
    };

    return function (target, name, descriptor) {
        var original = descriptor.value;
        descriptor.value = function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return wrapPromise(getResultKlass, original.apply(this, args));
        };
        descriptor.value.__pcd_get_result_class__ = getResultKlass;
    };
}

function makeProxyMethod(method, getResultKlass) {
    var proxy = function proxy() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
        }

        return wrapPromise(getResultKlass, this.then(function (object) {
            return object[method].apply(object, args);
        }));
    };
    proxy.__pcd_get_result_class__ = getResultKlass;
    return proxy;
}

function wrapPromise(getPromiseKlass, promise) {
    var PromiseKlass = getPromiseKlass && getPromiseKlass();
    var methods = PromiseKlass && PromiseKlass.__pcd_methods__;
    if (methods) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = methods[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var method = _step.value;

                if (promise[method] === undefined) {
                    var getResultKlass = getMethod(PromiseKlass, method).__pcd_get_result_class__;
                    promise[method] = makeProxyMethod(method, getResultKlass);
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
    return promise;
}

function getAllMethodNames(Klass) {
    var methods = {};
    function getMethods(K) {
        if (!K.prototype) {
            return;
        }
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = Object.getOwnPropertyNames(K.prototype)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var method = _step2.value;

                if (typeof K.prototype[method] === "function" && method !== "constructor" && !method.startsWith("_")) {
                    methods[method] = true;
                }
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        getMethods(Object.getPrototypeOf(K));
    }
    getMethods(Klass);
    return Object.keys(methods);
}

function getMethod(Klass, name) {
    while (Klass.prototype) {
        if (name in Klass.prototype) {
            return Klass.prototype[name];
        }
        Klass = Object.getPrototypeOf(Klass);
    }
    return null;
}