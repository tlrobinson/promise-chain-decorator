/* @flow weak */

export default function chain(ResultKlassOrGetter) {
    let ResultKlass;
    const getResultKlass = () => {
        if (ResultKlass === undefined) {
            try {
                // @chain(() => Klass)
                ResultKlass = ResultKlassOrGetter();
            } catch (e) {
                // @chain(Klass)
                ResultKlass = ResultKlassOrGetter;
            }
            if (!ResultKlass.__pcd_methods__) {
                ResultKlass.__pcd_methods__ = getAllMethodNames(ResultKlass)
            }
        }
        return ResultKlass;
    }

    return function (target, name, descriptor) {
        const original = descriptor.value;
        descriptor.value = function(...args) {
            return wrapPromise(getResultKlass, original.apply(this, args));
        }
        descriptor.value.__pcd_get_result_class__ = getResultKlass;
    }
}

function makeProxyMethod(method, getResultKlass) {
    let proxy = function(...args) {
        return wrapPromise(getResultKlass, this.then(object => {
            return object[method](...args);
        }));
    };
    proxy.__pcd_get_result_class__ = getResultKlass;
    return proxy;
}

function wrapPromise(getPromiseKlass, promise) {
    let PromiseKlass = getPromiseKlass && getPromiseKlass();
    let methods = PromiseKlass && PromiseKlass.__pcd_methods__;
    if (methods) {
        for (const method of methods) {
            if (promise[method] === undefined) {
                let getResultKlass = getMethod(PromiseKlass, method).__pcd_get_result_class__;
                promise[method] = makeProxyMethod(method, getResultKlass);
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
