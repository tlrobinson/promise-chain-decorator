export default function chain(Klass) {
    let proxies = getAllMethodNames(Klass).map(name =>
        [name, function(...args) { return this.then(object => object[name](...args)); }]
    );
    return function (target, name, descriptor) {
        const original = descriptor.value;
        descriptor.value = function (...args) {
            const promise = original.apply(this, args);
            for (const [name, fn] of proxies) {
                if (promise[name] === undefined) {
                    promise[name] = fn;
                }
            }
            return promise;
        }
    }
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