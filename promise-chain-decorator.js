/* @flow weak */

export default function chain(ResultKlass) {
    if (!ResultKlass.__pcd_methods__) {
        ResultKlass.__pcd_methods__ = getAllMethodNames(ResultKlass)
    }
    return function (target, name, descriptor) {
        const original = descriptor.value;
        descriptor.value = function(...args) {
            return wrapPromise(ResultKlass, original.apply(this, args));
        }
        descriptor.value.__pcd_result_class__ = ResultKlass;
    }
}

function makeProxyMethod(method, ResultKlass) {
    let proxy = function(...args) {
        return wrapPromise(ResultKlass, this.then(object => {
            return object[method](...args);
        }));
    };
    proxy.__pcd_result_class__ = ResultKlass;
    return proxy;
}

function wrapPromise(PromiseKlass, promise) {
    if (PromiseKlass) {
        for (const method of PromiseKlass.__pcd_methods__) {
            if (promise[method] === undefined) {
                let ResultKlass = getMethod(PromiseKlass, method).__pcd_result_class__;
                promise[method] = makeProxyMethod(method, ResultKlass);
            }
        }
    }
    return promise;
}

function getAllMethodNames(Klass) {
    let methods = {};
    function getMethods(K) {
        if (!K.prototype) {
            return;
        }
        for (let method of Object.getOwnPropertyNames(K.prototype)) {
            if (typeof K.prototype[method] === "function" && method !== "constructor" && !method.startsWith("_")) {
                methods[method] = true;
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
